const jwt = require('jsonwebtoken');
const { asyncHandler, sendResponse } = require('../utils/helpers');
const User = require('../models/User');

// Protect routes
const protect = asyncHandler(async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return sendResponse(res, 401, false, 'Not authorized to access this route');
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.id);

        if (!req.user) {
            return sendResponse(res, 401, false, 'The user belonging to this token no longer exists');
        }

        next();
    } catch (error) {
        return sendResponse(res, 401, false, 'Not authorized to access this route');
    }
});

// Grant access to specific roles
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return sendResponse(res, 403, false, `User role '${req.user.role}' is not authorized to access this route`);
        }
        next();
    };
};

module.exports = {
    protect,
    authorize
};
