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
      totalResorts,
      totalBookings,
      totalUsers,
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
        totalResorts: 0,
        totalBookings: 0,
        bookingsByStatus: [],
        totalRevenue: 0,
        resortList: [],
        recentBookings: []
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

    // Fetch recent bookings with resort and user info
    const recentBookings = await Booking.find({ resortId: { $in: resortIds } })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('userId', 'name')
      .populate('resortId', 'name');

    res.json({
      ownerId,
      totalResorts: ownerResorts.length,
      totalBookings,
      bookingsByStatus,
      totalRevenue: totalRevenue.length > 0 ? totalRevenue[0].total : 0,
      resortList: ownerResorts.map(r => ({ id: r._id, name: r.name })),
      recentBookings: recentBookings.map(b => ({
        id: b._id,
        resortName: b.resortId?.name || 'Deleted Resort',
        userName: b.userId?.name || 'Unknown User',
        totalPrice: b.totalPrice,
        status: b.status,
        checkInDate: b.checkInDate,
        checkOutDate: b.checkOutDate
      }))
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
