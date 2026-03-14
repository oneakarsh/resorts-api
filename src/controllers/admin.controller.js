const Resort = require('../models/Resort');
const Booking = require('../models/Booking');
const Room = require('../models/Room');
const { asyncHandler, sendResponse } = require('../utils/helpers');

// @desc    Get dashboard stats for Resort Manager
// @route   GET /api/admin/stats
// @access  Private (ResortOwner, Admin)
exports.getManagerStats = asyncHandler(async (req, res, next) => {
    // If Admin, they see global stats? Or maybe they are also managers. 
    // Usually, ResortOwner only sees their own.
    
    const ownerId = req.user.id;
    
    // Find all resorts owned by this manager
    const resorts = await Resort.find({ ownerId });
    const resortIds = resorts.map(r => r._id);

    const totalResorts = resorts.length;
    const totalRooms = await Room.countDocuments({ resortId: { $in: resortIds } });
    const totalBookings = await Booking.countDocuments({ resortId: { $in: resortIds } });
    
    // Calculate total revenue from completed/confirmed bookings
    const bookings = await Booking.find({ 
        resortId: { $in: resortIds },
        status: 'Confirmed' 
    });
    const totalRevenue = bookings.reduce((acc, curr) => acc + curr.totalPrice, 0);

    // Recent bookings for their resorts
    const recentBookings = await Booking.find({ resortId: { $in: resortIds } })
        .sort('-createdAt')
        .limit(5)
        .populate('roomId', 'roomNumber type')
        .populate('userId', 'name email');

    sendResponse(res, 200, true, 'Manager stats fetched successfully', {
        stats: {
            totalResorts,
            totalRooms,
            totalBookings,
            totalRevenue
        },
        recentBookings
    });
});

// @desc    Get all bookings for manager's resorts
// @route   GET /api/admin/bookings
// @access  Private (ResortOwner, Admin)
exports.getManagerBookings = asyncHandler(async (req, res, next) => {
    const ownerId = req.user.id;
    const resorts = await Resort.find({ ownerId });
    const resortIds = resorts.map(r => r._id);

    const bookings = await Booking.find({ resortId: { $in: resortIds } })
        .populate('resortId', 'name')
        .populate('roomId', 'roomNumber type')
        .populate('userId', 'name email');

    sendResponse(res, 200, true, 'Manager bookings fetched successfully', {
        count: bookings.length,
        data: bookings
    });
});

// @desc    Update booking status (Confirm/Cancel)
// @route   PUT /api/admin/bookings/:id/status
// @access  Private (ResortOwner, Admin)
exports.updateBookingStatus = asyncHandler(async (req, res, next) => {
    const { status } = req.body;
    
    let booking = await Booking.findById(req.params.id).populate('resortId');

    if (!booking) {
        return sendResponse(res, 404, false, `Booking not found with id of ${req.params.id}`);
    }

    // Check ownership
    if (booking.resortId.ownerId.toString() !== req.user.id && req.user.role !== 'Admin') {
        return sendResponse(res, 401, false, `User is not authorized to update this booking`);
    }

    booking = await Booking.findByIdAndUpdate(req.params.id, { status }, {
        new: true,
        runValidators: true
    });

    sendResponse(res, 200, true, 'Booking status updated successfully', { booking });
});

// @desc    Get manager's resorts
// @route   GET /api/admin/resorts
// @access  Private (ResortOwner, Admin)
exports.getManagerResorts = asyncHandler(async (req, res, next) => {
    const resorts = await Resort.find({ ownerId: req.user.id }).populate('rooms');

    sendResponse(res, 200, true, 'Manager resorts fetched successfully', {
        count: resorts.length,
        data: resorts
    });
});
