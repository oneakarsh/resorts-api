const Booking = require('../models/Booking');
const Room = require('../models/Room');
const { asyncHandler, sendResponse } = require('../utils/helpers');

// @desc    Get all bookings
// @route   GET /api/bookings
// @access  Private (Owner, Admin)
exports.getBookings = asyncHandler(async (req, res, next) => {
    let query;

    // If the user is Admin or SuperAdmin, they can see all bookings
    if (req.user.role === 'Admin' || req.user.role === 'SuperAdmin') {
        query = Booking.find().populate('resortId roomId userId');
    } else {
        query = Booking.find({ userId: req.user.id }).populate('resortId roomId');
    }

    const bookings = await query;

    sendResponse(res, 200, true, 'Bookings fetched successfully', { count: bookings.length, data: bookings });
});

// @desc    Get single booking
// @route   GET /api/bookings/:id
// @access  Private
exports.getBooking = asyncHandler(async (req, res, next) => {
    const booking = await Booking.findById(req.params.id).populate('resortId roomId userId');

    if (!booking) {
        return sendResponse(res, 404, false, `Booking not found with id of ${req.params.id}`);
    }

    // Only owner of booking, Admin, or SuperAdmin can see it
    if (booking.userId._id.toString() !== req.user.id && req.user.role !== 'Admin' && req.user.role !== 'SuperAdmin') {
        return sendResponse(res, 401, false, `User is not authorized to view this booking`);
    }

    sendResponse(res, 200, true, 'Booking fetched successfully', { booking });
});

// @desc    Create new booking
// @route   POST /api/bookings
// @access  Private
exports.createBooking = asyncHandler(async (req, res, next) => {
    let { resortId, roomId, checkIn, checkOut, guests, checkInDate, checkOutDate, numberOfGuests } = req.body;

    // Map frontend field names to backend field names
    checkIn = checkIn || checkInDate;
    checkOut = checkOut || checkOutDate;
    guests = guests || numberOfGuests;

    // Update req.body for later use if needed
    req.body.checkIn = checkIn;
    req.body.checkOut = checkOut;
    req.body.guests = guests;

    // Add user to body
    req.body.userId = req.user.id;

    // If roomId is missing, pick the first room from the resort
    if (!roomId && resortId) {
        const firstRoom = await Room.findOne({ resortId });
        if (firstRoom) {
            roomId = firstRoom._id;
            req.body.roomId = roomId;
        }
    }

    // Validate if room exists
    const room = await Room.findById(roomId);
    if (!room) {
        return sendResponse(res, 404, false, `Room not found. Please provide a valid roomId or resortId with rooms.`);
    }

    // Check for double booking
    const existingBookings = await Booking.find({
        roomId: roomId,
        status: { $ne: 'Cancelled' },
        $or: [
            { checkIn: { $lt: new Date(checkOut) }, checkOut: { $gt: new Date(checkIn) } }
        ]
    });

    if (existingBookings.length > 0) {
        return sendResponse(res, 400, false, 'The room is already booked for these dates');
    }

    // Calculate total price
    const days = Math.ceil((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24));
    req.body.totalPrice = room.pricePerNight * days;

    const booking = await Booking.create(req.body);

    sendResponse(res, 201, true, 'Booking created successfully', { booking });
});

// @desc    Cancel/Delete booking
// @route   DELETE /api/bookings/:id
// @access  Private
exports.deleteBooking = asyncHandler(async (req, res, next) => {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
        return sendResponse(res, 404, false, `Booking not found with id of ${req.params.id}`);
    }

    // Only user, Admin, or SuperAdmin can cancel/delete
    if (booking.userId.toString() !== req.user.id && req.user.role !== 'Admin' && req.user.role !== 'SuperAdmin') {
        return sendResponse(res, 401, false, `User is not authorized to delete this booking`);
    }

    // Status could be changed to 'Cancelled' instead of actual delete
    await booking.deleteOne();

    sendResponse(res, 200, true, 'Booking deleted successfully');
});

// @desc    Check availability for a room and dates
// @route   GET /api/bookings/check-availability
// @access  Public
exports.checkAvailability = asyncHandler(async (req, res, next) => {
    const { roomId, checkIn, checkOut } = req.query;

    if (!roomId || !checkIn || !checkOut) {
        return sendResponse(res, 400, false, 'Please provide roomId, checkIn, and checkOut dates');
    }

    const conflicts = await Booking.find({
        roomId: roomId,
        status: { $ne: 'Cancelled' },
        $or: [
            { checkIn: { $lt: new Date(checkOut) }, checkOut: { $gt: new Date(checkIn) } }
        ]
    });

    const isAvailable = conflicts.length === 0;

    sendResponse(res, 200, true, 'Availability checked', {
        isAvailable,
        conflictsCount: conflicts.length
    });
});

// @desc    Get booked dates for a specific room
// @route   GET /api/bookings/room/:roomId/dates
// @access  Public
exports.getBookedDates = asyncHandler(async (req, res, next) => {
    const { roomId } = req.params;

    const bookings = await Booking.find({
        roomId: roomId,
        status: { $ne: 'Cancelled' },
        checkOut: { $gte: new Date() } // Only future/current booked dates
    }).select('checkIn checkOut');

    const bookedDates = bookings.map(b => ({
        from: b.checkIn,
        to: b.checkOut
    }));

    sendResponse(res, 200, true, 'Booked dates fetched', { count: bookedDates.length, data: bookedDates });
});
