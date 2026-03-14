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
/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users (Super Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of users retrieved successfully
 */
router.get('/', authMiddleware, superadminMiddleware, permissionMiddleware('manage_users'), getAllUsers);

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Get user by ID (Super Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User details retrieved successfully
 */
router.get('/:id', authMiddleware, superadminMiddleware, permissionMiddleware('manage_users'), getUserById);

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Create a user (Super Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: User created successfully
 */
router.post('/', authMiddleware, superadminMiddleware, permissionMiddleware('manage_users'), createUser);

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Update a user (Super Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User updated successfully
 */
router.put('/:id', authMiddleware, superadminMiddleware, permissionMiddleware('manage_users'), updateUser);

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Delete a user (Super Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User deleted successfully
 */
router.delete('/:id', authMiddleware, superadminMiddleware, permissionMiddleware('manage_users'), deleteUser);

module.exports = router;
