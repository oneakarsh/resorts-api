const Resort = require('../models/Resort');
const Booking = require('../models/Booking');
const { asyncHandler, sendResponse } = require('../utils/helpers');

// @desc    Get dashboard metrics for a resort
// @route   GET /api/v1/resorts/:id/analytics
// @access  Private (Owner/Admin)
exports.getResortAnalytics = asyncHandler(async (req, res, next) => {
    const resort = await Resort.findById(req.params.id);

    if (!resort) {
        return sendResponse(res, 404, false, 'Resort not found');
    }

    // Check ownership
    if (resort.ownerId.toString() !== req.user.id && req.user.role !== 'Admin' && req.user.role !== 'SuperAdmin') {
        return sendResponse(res, 403, false, 'Not authorized');
    }

    const { timeframe } = req.query; // e.g. '30days', 'year'
    let dateFilter = {};
    
    if (timeframe === '30days') {
        const date = new Date();
        date.setDate(date.getDate() - 30);
        dateFilter = { createdAt: { $gte: date } };
    }

    const bookings = await Booking.find({ 
        resortId: req.params.id,
        ...dateFilter 
    });

    const totalRevenue = bookings.reduce((acc, b) => acc + (b.status === 'Confirmed' || b.status === 'Completed' ? b.totalPrice : 0), 0);
    const bookingStatusCount = {
        Confirmed: bookings.filter(b => b.status === 'Confirmed').length,
        Pending: bookings.filter(b => b.status === 'Pending').length,
        Cancelled: bookings.filter(b => b.status === 'Cancelled').length,
        Completed: bookings.filter(b => b.status === 'Completed').length
    };

    sendResponse(res, 200, true, 'Resort analytics fetched', {
        resortName: resort.name,
        totalRevenue,
        bookingCount: bookings.length,
        statusBreakdown: bookingStatusCount
    });
});

// @desc    Export resort bookings as JSON (can be expanded to CSV later)
// @route   GET /api/v1/resorts/:id/export
// @access  Private (Owner/Admin)
exports.exportResortData = asyncHandler(async (req, res, next) => {
    const resortId = req.params.id;
    const bookings = await Booking.find({ resortId }).populate('userId', 'name email');
    
    // Setting header for file download
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename=resort_${resortId}_bookings.json`);
    
    res.status(200).json(bookings);
});
