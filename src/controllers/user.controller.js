const User = require('../models/User');
const Resort = require('../models/Resort');
const Booking = require('../models/Booking');
const { asyncHandler, sendResponse } = require('../utils/helpers');

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
exports.getUsers = asyncHandler(async (req, res, next) => {
    // Determine which users to show based on role
    let query = {};
    if (req.user.role === 'Admin') {
        // Admin can see Guests and ResortOwners but maybe not other Admins or SuperAdmins
        query = { role: { $in: ['Guest', 'ResortOwner'] } };
    }
    
    const users = await User.find(query);
    sendResponse(res, 200, true, 'Users fetched successfully', { count: users.length, data: users });
});

// @desc    Get all resorts
// @route   GET /api/admin/resorts
// @access  Private/Admin
exports.getAdminResorts = asyncHandler(async (req, res, next) => {
    const resorts = await Resort.find().populate('ownerId');
    sendResponse(res, 200, true, 'Resorts fetched successfully', { count: resorts.length, data: resorts });
});

// @desc    Get all bookings
// @route   GET /api/admin/bookings
// @access  Private/Admin
exports.getAdminBookings = asyncHandler(async (req, res, next) => {
    const bookings = await Booking.find().populate('userId resortId roomId');
    sendResponse(res, 200, true, 'Bookings fetched successfully', { count: bookings.length, data: bookings });
});

// @desc    Approve/Verify resort
// @route   PUT /api/admin/resorts/:id/verify
// @access  Private/Admin
exports.verifyResort = asyncHandler(async (req, res, next) => {
    const resort = await Resort.findByIdAndUpdate(req.params.id, { verified: true }, { new: true, runValidators: true });

    if (!resort) {
        return sendResponse(res, 404, false, `Resort not found with id of ${req.params.id}`);
    }

    sendResponse(res, 200, true, 'Resort verified successfully', { resort });
});

// @desc    Ban/Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
exports.deleteUser = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        return sendResponse(res, 404, false, `User not found with id of ${req.params.id}`);
    }

    // Don't allow admin to delete themselves
    // Prevent deleting higher roles
    if (req.user.role === 'Admin' && (user.role === 'Admin' || user.role === 'SuperAdmin')) {
        return sendResponse(res, 403, false, 'Admins cannot delete other Admins or SuperAdmins');
    }

    await user.deleteOne();

    sendResponse(res, 200, true, 'User deleted successfully');
});
