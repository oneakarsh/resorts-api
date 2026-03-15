const Booking = require('../models/Booking');
const Resort = require('../models/Resort');

// Helper function to format booking response
const formatBooking = (booking) => {
  const bookingObj = booking.toObject ? booking.toObject() : booking;
  return {
    id: bookingObj._id,
    userId: bookingObj.userId._id || bookingObj.userId,
    resortId: bookingObj.resortId._id || bookingObj.resortId,
    resort: bookingObj.resortId, // For UI compatibility
    checkInDate: bookingObj.checkInDate,
    checkOutDate: bookingObj.checkOutDate,
    numberOfGuests: bookingObj.numberOfGuests,
    totalPrice: bookingObj.totalPrice,
    status: bookingObj.status,
    specialRequests: bookingObj.specialRequests,
    paymentMethod: bookingObj.paymentMethod,
    createdAt: bookingObj.createdAt,
  };
};

exports.createBooking = async (req, res) => {
  try {
    const { resortId, checkInDate, checkOutDate, numberOfGuests, specialRequests, paymentMethod } =
      req.body;

    if (!resortId || !checkInDate || !checkOutDate || !numberOfGuests) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Get resort details
    const resort = await Resort.findById(resortId);
    if (!resort) {
      return res.status(404).json({ message: 'Resort not found' });
    }

    // Validate guest count
    if (numberOfGuests > resort.maxGuests) {
      return res
        .status(400)
        .json({ message: `Maximum guests allowed: ${resort.maxGuests}` });
    }

    // Calculate total price
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));

    if (nights <= 0) {
      return res
        .status(400)
        .json({ message: 'Check-out date must be after check-in date' });
    }

    const totalPrice = nights * resort.pricePerNight;

    // Check for overlapping bookings to ensure room availability
    const overlappingBookingsCount = await Booking.countDocuments({
      resortId,
      status: { $in: ['pending', 'confirmed'] },
      $or: [
        {
          checkInDate: { $lt: checkOut },
          checkOutDate: { $gt: checkIn },
        },
      ],
    });

    if (overlappingBookingsCount >= resort.rooms) {
      return res.status(400).json({
        message: 'No rooms available for the selected dates. Please try different dates.',
      });
    }

    const booking = new Booking({
      userId: req.userId,
      resortId,
      checkInDate,
      checkOutDate,
      numberOfGuests,
      totalPrice,
      specialRequests,
      paymentMethod,
    });

    await booking.save();
    res.status(201).json({ message: 'Booking created successfully', data: booking });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create booking', error: error.message });
  }
};

exports.getUserBookings = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const bookings = await Booking.find({ userId: req.userId })
      .populate('resortId')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Booking.countDocuments({ userId: req.userId });
    const formattedBookings = bookings.map(formatBooking);

    res.json({
      message: 'Bookings fetched successfully',
      count: formattedBookings.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: formattedBookings,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch bookings', error: error.message });
  }
};

exports.getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('userId').populate('resortId');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Allow booking owner, property owner, manager or superadmin to view
    if (
      booking.userId._id.toString() !== req.userId &&
      req.userRole !== 'resort_owner' &&
      req.userRole !== 'resort_manager' &&
      req.userRole !== 'superadmin'
    ) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    res.json({ data: formatBooking(booking) });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch booking', error: error.message });
  }
};

exports.updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!['pending', 'confirmed', 'cancelled', 'completed'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const booking = await Booking.findById(req.params.id).populate('resortId');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Ownership check for resort owners
    if (req.userRole === 'resort_owner' && booking.resortId.owner.toString() !== req.userId) {
      return res.status(403).json({ message: 'You can only update bookings for your own resorts' });
    }

    booking.status = status;
    await booking.save();

    res.json({ message: 'Booking status updated', data: formatBooking(booking) });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update booking', error: error.message });
  }
};

exports.cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('resortId');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (
      booking.userId.toString() !== req.userId &&
      req.userRole !== 'resort_owner' &&
      req.userRole !== 'resort_manager' &&
      req.userRole !== 'superadmin'
    ) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    booking.status = 'cancelled';
    await booking.save();

    res.json({ message: 'Booking cancelled successfully', data: formatBooking(booking) });
  } catch (error) {
    res.status(500).json({ message: 'Failed to cancel booking', error: error.message });
  }
};

exports.getAllBookings = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = {};
    
    // If resort owner, only show bookings for their resorts
    if (req.userRole === 'resort_owner') {
      const ownerResorts = await Resort.find({ owner: req.userId }).select('_id');
      const resortIds = ownerResorts.map(r => r._id);
      filter.resortId = { $in: resortIds };
    }

    const bookings = await Booking.find(filter)
      .populate('userId')
      .populate('resortId')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Booking.countDocuments(filter);
    const formattedBookings = bookings.map(formatBooking);

    res.json({
      message: 'All bookings fetched',
      count: formattedBookings.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: formattedBookings,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch bookings', error: error.message });
  }
};
