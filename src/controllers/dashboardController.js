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
    const ownerId = req.userId;
    
    // Resorts owned by this owner
    const ownerResorts = await Resort.find({ owner: ownerId });
    const resortIds = ownerResorts.map(r => r._id);

    const totalResorts = ownerResorts.length;
    const totalBookings = await Booking.countDocuments({ resortId: { $in: resortIds } });

    const bookingsByStatus = await Booking.aggregate([
      { $match: { resortId: { $in: resortIds } } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const totalRevenue = await Booking.aggregate([
      { $match: { resortId: { $in: resortIds }, status: 'confirmed' } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } }
    ]);

    res.json({
      resorts: totalResorts,
      bookings: totalBookings,
      bookingsByStatus,
      totalRevenue: totalRevenue.length > 0 ? totalRevenue[0].total : 0
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching property owner stats', error: error.message });
  }
};

module.exports = {
  getSuperAdminStats,
  getPropertyOwnerStats
};
