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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               phone:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [user, resort_owner, resort_manager, superadmin]
 *                 default: user
 *     responses:
 *       201:
 *         description: User created successfully
 */
router.post('/', authMiddleware, superadminMiddleware, permissionMiddleware('manage_users'), createUser);

// Middleware to allow SuperAdmin or PropertyOwner for update/delete
const adminOrOwnerMiddleware = (req, res, next) => {
  if (req.userRole === 'superadmin' || req.userRole === 'resort_owner') {
    return next();
  }
  return res.status(403).json({ message: 'Access denied.' });
};

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Update a user (Super Admin/Resort Owner only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: John Doe
 *               email:
 *                 type: string
 *                 example: john@example.com
 *               phone:
 *                 type: string
 *                 example: "+1234567890"
 *               role:
 *                 type: string
 *                 enum: [user, resort_owner, resort_manager, superadmin]
 *                 example: resort_manager
 *               isActive:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: User updated successfully
 */
router.put('/:id', authMiddleware, adminOrOwnerMiddleware, updateUser);

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Delete a user (Super Admin/Resort Owner only)
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
router.delete('/:id', authMiddleware, adminOrOwnerMiddleware, deleteUser);

module.exports = router;
