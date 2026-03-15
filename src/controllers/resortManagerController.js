const Resort = require('../models/Resort');
const Booking = require('../models/Booking');

/**
 * Get all resorts managed by the authenticated manager
 */
exports.getManagedResorts = async (req, res) => {
  try {
    const filter = { isActive: true };
    
    if (req.userRole === 'resort_manager') {
      filter.managers = req.userId;
    } else if (req.userRole === 'resort_owner') {
      filter.owner = req.userId;
    }

    const resorts = await Resort.find(filter);
    res.json({
      success: true,
      count: resorts.length,
      data: resorts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch managed resorts',
      error: error.message,
    });
  }
};

/**
 * Get rooms and facilities for a specific managed resort
 */
exports.getResortInventory = async (req, res) => {
  try {
    const resort = await Resort.findById(req.params.resortId);
    
    if (!resort) {
      return res.status(404).json({ success: false, message: 'Resort not found' });
    }

    // Role check
    if (req.userRole === 'resort_manager' && !resort.managers.includes(req.userId)) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    
    if (req.userRole === 'resort_owner' && resort.owner.toString() !== req.userId) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    res.json({
      success: true,
      data: {
        totalRooms: resort.rooms,
        availableRooms: resort.availableRooms,
        amenities: resort.amenities,
        otherDetails: resort.otherDetails,
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch resort inventory',
      error: error.message,
    });
  }
};

/**
 * Get all bookings (orders) with check-in/out info for managed resorts
 */
exports.getManagedBookings = async (req, res) => {
  try {
    const { resortId, status, startDate, endDate } = req.query;
    
    // Find resorts managed by this user
    const managedResortFilter = { isActive: true };
    if (req.userRole === 'resort_manager') {
      managedResortFilter.managers = req.userId;
    } else if (req.userRole === 'resort_owner') {
      managedResortFilter.owner = req.userId;
    }
    
    if (resortId) {
      managedResortFilter._id = resortId;
    }

    const managedResorts = await Resort.find(managedResortFilter).select('_id');
    const resortIds = managedResorts.map(r => r._id);

    const bookingFilter = { resortId: { $in: resortIds } };
    
    if (status) {
      bookingFilter.status = status;
    }
    
    if (startDate || endDate) {
      bookingFilter.checkInDate = {};
      if (startDate) bookingFilter.checkInDate.$gte = new Date(startDate);
      if (endDate) bookingFilter.checkInDate.$lte = new Date(endDate);
    }

    const bookings = await Booking.find(bookingFilter)
      .populate('userId', 'name email phone')
      .populate('resortId', 'name location')
      .sort({ checkInDate: 1 });

    res.json({
      success: true,
      count: bookings.length,
      data: bookings.map(b => ({
        id: b._id,
        customer: b.userId,
        resort: b.resortId,
        checkIn: b.checkInDate,
        checkOut: b.checkOutDate,
        status: b.status,
        guests: b.numberOfGuests,
        totalPrice: b.totalPrice,
        specialRequests: b.specialRequests,
        createdAt: b.createdAt
      }))
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch bookings',
      error: error.message,
    });
  }
};
