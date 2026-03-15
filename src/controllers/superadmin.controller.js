const User = require('../models/User');
const Resort = require('../models/Resort');
const Booking = require('../models/Booking');
const { asyncHandler, sendResponse } = require('../utils/helpers');

// @desc    Get dashboard stats for Super Admin
// @route   GET /api/superadmin/stats
// @access  Private (SuperAdmin)
exports.getSuperAdminStats = asyncHandler(async (req, res, next) => {
    const totalUsers = await User.countDocuments();
    const totalResorts = await Resort.countDocuments();
    const totalBookings = await Booking.countDocuments();
    const pendingResorts = await Resort.countDocuments({ verified: false });

    // Get recent bookings with populated data
    const recentBookings = await Booking.find()
        .sort('-createdAt')
        .limit(5)
        .populate('resortId', 'name')
        .populate('userId', 'name email');

    sendResponse(res, 200, true, 'Super Admin stats fetched successfully', {
        stats: {
            totalUsers,
            totalResorts,
            totalBookings,
            pendingResorts
        },
        recentBookings
    });
});

// @desc    Get all resorts for review (verified or not)
// @route   GET /api/superadmin/resorts
// @access  Private (SuperAdmin)
exports.getAllResorts = asyncHandler(async (req, res, next) => {
    const resorts = await Resort.find().populate('ownerId', 'name email');

    sendResponse(res, 200, true, 'All resorts fetched successfully', {
        count: resorts.length,
        data: resorts
    });
});

// @desc    Verify or Unverify a resort
// @route   PUT /api/superadmin/resorts/:id/verify
// @access  Private (SuperAdmin)
exports.verifyResort = asyncHandler(async (req, res, next) => {
    const { verified } = req.body;

    let resort = await Resort.findById(req.params.id);

    if (!resort) {
        return sendResponse(res, 404, false, `Resort not found with id of ${req.params.id}`);
    }

    resort = await Resort.findByIdAndUpdate(req.params.id, { verified }, {
        new: true,
        runValidators: true
    });

    sendResponse(res, 200, true, `Resort ${verified ? 'verified' : 'unverified'} successfully`, { resort });
});

// @desc    Get all users
// @route   GET /api/superadmin/users
// @access  Private (SuperAdmin)
exports.getAllUsers = asyncHandler(async (req, res, next) => {
    const users = await User.find();

    sendResponse(res, 200, true, 'All users fetched successfully', {
        count: users.length,
        data: users
    });
});

// @desc    Update user details including role
// @route   PUT /api/superadmin/users/:id
// @access  Private (SuperAdmin)
exports.updateUser = asyncHandler(async (req, res, next) => {
    const { name, email, role, phone } = req.body;

    let user = await User.findById(req.params.id);

    if (!user) {
        return sendResponse(res, 404, false, `User found with id of ${req.params.id}`);
    }

    // Role safety check - prevent accidental SuperAdmin demotion of self
    if (user._id.toString() === req.user.id && role && role !== 'SuperAdmin') {
        return sendResponse(res, 400, false, "You cannot demote yourself from SuperAdmin");
    }

    user = await User.findByIdAndUpdate(req.params.id, { name, email, role, phone }, {
        new: true,
        runValidators: true
    });

    sendResponse(res, 200, true, 'User updated successfully', { user });
});
