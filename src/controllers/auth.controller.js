const User = require('../models/User');
const { asyncHandler, sendResponse } = require('../utils/helpers');
const { generateToken } = require('../utils/jwt');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = asyncHandler(async (req, res, next) => {
    const { name, email, password, role, phone } = req.body;

    // Check if role is allowed
    if (role === 'SuperAdmin') {
        return sendResponse(res, 403, false, 'Cannot register as SuperAdmin');
    }

    // Create user
    const user = await User.create({
        name,
        email,
        password,
        role,
        phone
    });

    // Create token
    const token = generateToken(user._id);

    sendResponse(res, 201, true, 'User registered successfully', {
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role
        },
        token
    });
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = asyncHandler(async (req, res, next) => {
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
        return sendResponse(res, 400, false, 'Please provide an email and password');
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
        return sendResponse(res, 401, false, 'Invalid credentials');
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
        return sendResponse(res, 401, false, 'Invalid credentials');
    }

    // Create token
    const token = generateToken(user._id);

    sendResponse(res, 200, true, 'User logged in successfully', {
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role
        },
        token
    });
});

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.user.id);

    sendResponse(res, 200, true, 'User data fetched successfully', { user });
});
