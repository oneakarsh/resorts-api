const Resort = require('../models/Resort');
const Booking = require('../models/Booking');
const User = require('../models/User');

const getSuperAdminStats = async (req, res) => {
  try {
    const totalResorts = await Resort.countDocuments();
    const totalBookings = await Booking.countDocuments();
    const totalUsers = await User.countDocuments();
    const usersByRole = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } }
    ]);

    const bookingsByStatus = await Booking.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const totalRevenue = await Booking.aggregate([
      { $match: { status: 'confirmed' } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } }
    ]);

    res.json({
      resorts: totalResorts,
      bookings: totalBookings,
      users: totalUsers,
      usersByRole,
      bookingsByStatus,
      totalRevenue: totalRevenue.length > 0 ? totalRevenue[0].total : 0
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching super admin stats', error: error.message });
  }
};

const getPropertyOwnerStats = async (req, res) => {
  try {
    // If superadmin provides an ID in query, use that. Otherwise use current user's ID.
    let ownerId = req.userId;
    
    if (req.userRole === 'superadmin' && req.query.propertyOwnerId) {
      ownerId = req.query.propertyOwnerId;
    }
    
    // Find resorts owned by this person (only active ones)
    const ownerResorts = await Resort.find({ owner: ownerId, isActive: true });
    
    // Get the IDs of those resorts
    const resortIds = ownerResorts.map(resort => resort._id);

    // If no resorts, return zeros immediately
    if (resortIds.length === 0) {
      return res.json({
        ownerId,
        resorts: 0,
        bookings: 0,
        bookingsByStatus: [],
        totalRevenue: 0,
        resortList: []
      });
    }

    // Direct count for bookings
    const totalBookings = await Booking.countDocuments({ resortId: { $in: resortIds } });

    // Aggregations must match the IDs
    const bookingsByStatus = await Booking.aggregate([
      { $match: { resortId: { $in: resortIds } } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const totalRevenue = await Booking.aggregate([
      { $match: { resortId: { $in: resortIds }, status: 'confirmed' } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } }
    ]);

    res.json({
      ownerId,
      resorts: ownerResorts.length,
      bookings: totalBookings,
      bookingsByStatus,
      totalRevenue: totalRevenue.length > 0 ? totalRevenue[0].total : 0,
      resortList: ownerResorts.map(r => ({ id: r._id, name: r.name }))
    });
  } catch (error) {
    console.error('Property Owner Stats Error:', error);
    res.status(500).json({ message: 'Error fetching property owner stats', error: error.message });
  }
};

module.exports = {
  getSuperAdminStats,
  getPropertyOwnerStats
};
