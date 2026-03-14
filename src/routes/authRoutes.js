const express = require('express');
const { register, login, getProfile, createPropertyOwner, createManager, getAllUsers } = require('../controllers/authController');
const { authMiddleware, superadminMiddleware, permissionMiddleware } = require('../middleware/auth');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/profile', authMiddleware, getProfile);
router.post('/property-owner/create', authMiddleware, superadminMiddleware, permissionMiddleware('manage_property_owners'), createPropertyOwner);
router.post('/manager/create', authMiddleware, superadminMiddleware, permissionMiddleware('manage_property_owners'), createManager);
router.get('/property-owner/users', authMiddleware, superadminMiddleware, permissionMiddleware('manage_users'), getAllUsers);

module.exports = router;
