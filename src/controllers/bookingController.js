const prisma = require('../lib/prisma');

const formatBooking = (booking) => {
  return {
    id: booking.id,
    userId: booking.userId,
    resortId: booking.resortId,
    resort: booking.resort,
    checkInDate: booking.checkInDate,
    checkOutDate: booking.checkOutDate,
    numberOfGuests: booking.numberOfGuests,
    totalPrice: booking.totalPrice,
    status: booking.status,
    specialRequests: booking.specialRequests,
    paymentMethod: booking.paymentMethod,
    createdAt: booking.createdAt,
  };
};

exports.createBooking = async (req, res) => {
  try {
    const { resortId, checkInDate, checkOutDate, numberOfGuests, specialRequests, paymentMethod } = req.body;

    const resort = await prisma.resort.findUnique({ where: { id: resortId } });
    if (!resort) return res.status(404).json({ message: 'Resort not found' });

    if (numberOfGuests > resort.maxGuests) {
      return res.status(400).json({ message: `Maximum guests allowed: ${resort.maxGuests}` });
    }

    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));

    if (nights <= 0) return res.status(400).json({ message: 'Check-out date must be after check-in date' });

    // Conflict check
    const overlapping = await prisma.booking.count({
      where: {
        resortId,
        status: { in: ['PENDING', 'CONFIRMED'] },
        OR: [
          { checkInDate: { lt: checkOut }, checkOutDate: { gt: checkIn } }
        ]
      }
    });

    if (overlapping >= resort.rooms) {
      return res.status(400).json({ message: 'No rooms available for the selected dates.' });
    }

    const booking = await prisma.booking.create({
      data: {
        userId: req.userId,
        resortId,
        checkInDate: checkIn,
        checkOutDate: checkOut,
        numberOfGuests: parseInt(numberOfGuests),
        totalPrice: nights * resort.pricePerNight,
        specialRequests,
        paymentMethod: paymentMethod || 'credit_card',
        status: 'PENDING'
      },
      include: { resort: true }
    });

    res.status(201).json({ message: 'Booking created successfully', data: formatBooking(booking) });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create booking', error: error.message });
  }
};

exports.getUserBookings = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const bookings = await prisma.booking.findMany({
      where: { userId: req.userId },
      include: { resort: true },
      orderBy: { createdAt: 'desc' },
      skip,
      take: parseInt(limit)
    });

    const total = await prisma.booking.count({ where: { userId: req.userId } });

    res.json({
      message: 'Bookings fetched successfully',
      count: bookings.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: bookings.map(formatBooking)
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch bookings' });
  }
};

exports.getBookingById = async (req, res) => {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: req.params.id },
      include: { user: true, resort: true }
    });

    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    if (booking.userId !== req.userId && !['PROPERTY_OWNER', 'MANAGER', 'SUPERADMIN'].includes(req.userRole)) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    res.json({ data: formatBooking(booking) });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch booking' });
  }
};

exports.updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const booking = await prisma.booking.findUnique({
      where: { id: req.params.id },
      include: { resort: true }
    });

    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    if (req.userRole === 'PROPERTY_OWNER' && booking.resort.ownerId !== req.userId) {
      return res.status(403).json({ message: 'Unauthorized access to this resort booking' });
    }

    const updated = await prisma.booking.update({
      where: { id: req.params.id },
      data: { status: status.toUpperCase() },
      include: { resort: true }
    });

    res.json({ message: 'Booking status updated', data: formatBooking(updated) });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update booking' });
  }
};

exports.cancelBooking = async (req, res) => {
  try {
    const booking = await prisma.booking.findUnique({ where: { id: req.params.id } });
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    if (booking.userId !== req.userId && !['PROPERTY_OWNER', 'MANAGER', 'SUPERADMIN'].includes(req.userRole)) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const updated = await prisma.booking.update({
      where: { id: req.params.id },
      data: { status: 'CANCELLED' },
      include: { resort: true }
    });

    res.json({ message: 'Booking cancelled successfully', data: formatBooking(updated) });
  } catch (error) {
    res.status(500).json({ message: 'Failed to cancel booking' });
  }
};

exports.getAllBookings = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const bookings = await prisma.booking.findMany({
      include: { user: true, resort: true },
      orderBy: { createdAt: 'desc' },
      skip,
      take: parseInt(limit)
    });

    const total = await prisma.booking.count();

    res.json({
      message: 'All bookings fetched',
      count: bookings.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: bookings.map(formatBooking)
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch bookings' });
  }
};
