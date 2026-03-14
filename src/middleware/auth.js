const jwt = require('jsonwebtoken');

// Role-based permissions mapping (Lowercased roles from Prisma enum)
const rolePermissions = {
  USER: ['view_resorts', 'create_booking', 'view_own_booking', 'cancel_own_booking'],
  PROPERTY_OWNER: [
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
  ],
  MANAGER: [
    'view_resorts',
    'view_all_bookings',
    'manage_bookings',
    'update_booking_status',
    'chat_with_customers',
  ],
  SUPERADMIN: [
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

    const role = req.userRole;
    if (role !== 'PROPERTY_OWNER' && role !== 'SUPERADMIN') {
      return res
        .status(403)
        .json({ message: 'Property owner access required. Your role: ' + role });
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

    if (req.userRole !== 'SUPERADMIN') {
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
