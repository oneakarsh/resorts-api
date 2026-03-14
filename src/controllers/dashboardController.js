const prisma = require('../lib/prisma');

const getSuperAdminStats = async (req, res) => {
  try {
    const totalResortsPromise = prisma.resort.count();
    const totalBookingsPromise = prisma.booking.count();
    const totalUsersPromise = prisma.user.count();

    const usersByRolePromise = prisma.user.groupBy({
      by: ['role'],
      _count: { _all: true },
    });

    const bookingsByStatusPromise = prisma.booking.groupBy({
      by: ['status'],
      _count: { _all: true },
    });

    const totalRevenuePromise = prisma.booking.aggregate({
      where: { status: 'CONFIRMED' },
      _sum: { totalPrice: true },
    });

    const [totalResorts, totalBookings, totalUsers, usersByRole, bookingsByStatus, totalRevenueAgg] = await Promise.all([
      totalResortsPromise,
      totalBookingsPromise,
      totalUsersPromise,
      usersByRolePromise,
      bookingsByStatusPromise,
      totalRevenuePromise,
    ]);

    res.json({
      resorts: totalResorts,
      bookings: totalBookings,
      users: totalUsers,
      usersByRole: usersByRole.map(r => ({ _id: r.role.toLowerCase(), count: r._count._all })),
      bookingsByStatus: bookingsByStatus.map(s => ({ _id: s.status.toLowerCase(), count: s._count._all })),
      totalRevenue: totalRevenueAgg._sum.totalPrice || 0
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching super admin stats', error: error.message });
  }
};

const getPropertyOwnerStats = async (req, res) => {
  try {
    const ownerId = req.userId;
    
    const ownerResorts = await prisma.resort.findMany({
      where: { ownerId },
      select: { id: true }
    });
    const resortIds = ownerResorts.map(r => r.id);

    const totalResorts = ownerResorts.length;
    const totalBookings = await prisma.booking.count({
      where: { resortId: { in: resortIds } }
    });

    const bookingsByStatus = await prisma.booking.groupBy({
      by: ['status'],
      where: { resortId: { in: resortIds } },
      _count: { _all: true },
    });

    const totalRevenueAgg = await prisma.booking.aggregate({
      where: { 
        resortId: { in: resortIds },
        status: 'CONFIRMED' 
      },
      _sum: { totalPrice: true },
    });

    res.json({
      resorts: totalResorts,
      bookings: totalBookings,
      bookingsByStatus: bookingsByStatus.map(s => ({ _id: s.status.toLowerCase(), count: s._count._all })),
      totalRevenue: totalRevenueAgg._sum.totalPrice || 0
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching property owner stats', error: error.message });
  }
};

module.exports = {
  getSuperAdminStats,
  getPropertyOwnerStats
};
