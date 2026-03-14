const express = require('express');
const {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
} = require('../controllers/userController');
const { authMiddleware, superadminMiddleware, permissionMiddleware } = require('../middleware/auth');

const router = express.Router();

// Get all users - SuperAdmin only
router.get('/', authMiddleware, superadminMiddleware, permissionMiddleware('manage_users'), getAllUsers);

// Get user by ID - SuperAdmin only
router.get('/:id', authMiddleware, superadminMiddleware, permissionMiddleware('manage_users'), getUserById);

// Create user - SuperAdmin only
router.post('/', authMiddleware, superadminMiddleware, permissionMiddleware('manage_users'), createUser);

// Update user - SuperAdmin only
router.put('/:id', authMiddleware, superadminMiddleware, permissionMiddleware('manage_users'), updateUser);

// Delete user - SuperAdmin only
router.delete('/:id', authMiddleware, superadminMiddleware, permissionMiddleware('manage_users'), deleteUser);

module.exports = router;
