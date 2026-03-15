const jwt = require('jsonwebtoken');

// Role-based permissions mapping
const rolePermissions = {
  user: ['view_resorts', 'create_booking', 'view_own_booking', 'cancel_own_booking', 'send_message', 'view_own_messages'],
  property_owner: [
    'view_resorts',
    'create_resort',
    'update_resort',
    'delete_resort',
    'view_own_resort_bookings',
    'update_booking_status',
    'send_message',
    'view_own_messages',
    'manage_users',
  ],
  manager: [
    'view_resorts',
    'view_all_bookings',
    'manage_bookings',
    'update_booking_status',
    'chat_with_customers',
    'send_message',
    'view_own_messages',
  ],
  superadmin: [
    'view_resorts',
    'create_resort',
    'update_resort',
    'delete_resort',
    'create_booking',
    'view_own_booking',
    'cancel_own_booking',
    'view_all_bookings',
    'update_booking_status',
    'manage_users',
    'manage_admins',
    'manage_property_owners',
    'system_settings',
    'view_analytics',
    'send_message',
    'view_all_messages',
  ],
};

const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'Invalid token format' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded.userId || !decoded.role) {
      return res.status(401).json({ message: 'Invalid token structure' });
    }

    req.userId = decoded.userId;
    req.userRole = decoded.role;
    req.userPermissions = rolePermissions[decoded.role] || [];

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token has expired' });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }
    return res.status(401).json({ message: 'Authentication failed', error: error.message });
  }
};

const propertyOwnerMiddleware = (req, res, next) => {
  try {
    if (!req.userRole) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    if (req.userRole !== 'property_owner' && req.userRole !== 'superadmin') {
      return res
        .status(403)
        .json({ message: 'Property owner access required. Your role: ' + req.userRole });
    }

    next();
  } catch (error) {
    return res
      .status(500)
      .json({ message: 'Authorization error', error: error.message });
  }
};

const superadminMiddleware = (req, res, next) => {
  try {
    if (!req.userRole) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    if (req.userRole !== 'superadmin') {
      return res.status(403).json({
        message: 'Super admin access required. Your role: ' + req.userRole,
      });
    }

    next();
  } catch (error) {
    return res
      .status(500)
      .json({ message: 'Authorization error', error: error.message });
  }
};

const permissionMiddleware = (requiredPermission) => {
  return (req, res, next) => {
    try {
      if (!req.userPermissions) {
        return res.status(401).json({ message: 'Authentication required' });
      }

      if (!req.userPermissions.includes(requiredPermission)) {
        return res.status(403).json({
          message: `Permission denied. Required permission: ${requiredPermission}`,
          userRole: req.userRole,
        });
      }

      next();
    } catch (error) {
      return res
        .status(500)
        .json({ message: 'Permission check error', error: error.message });
    }
  };
};

module.exports = {
  authMiddleware,
  propertyOwnerMiddleware,
  superadminMiddleware,
  permissionMiddleware,
  rolePermissions,
};
