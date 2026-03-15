const express = require('express');
const { 
  getAllUsers, 
  getUserById, 
  createUser, 
  updateUser, 
  deleteUser 
} = require('../controllers/userController');
const { getAllBookings } = require('../controllers/bookingController');
const { authMiddleware, superadminMiddleware } = require('../middleware/auth');

const router = express.Router();

// All routes here are restricted to Super Admin
router.use(authMiddleware);
router.use(superadminMiddleware);

// User Management (Includes Property Owners)
/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     summary: Get all users (Super Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of users retrieved successfully
 */
router.get('/users', getAllUsers);

/**
 * @swagger
 * /api/admin/users/{id}:
 *   get:
 *     summary: Get user by ID (Super Admin only)
 *     tags: [Admin]
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
router.get('/users/:id', getUserById);

/**
 * @swagger
 * /api/admin/users:
 *   post:
 *     summary: Create a user (Super Admin only)
 *     tags: [Admin]
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
 *     responses:
 *       201:
 *         description: User created successfully
 */
router.post('/users', createUser);

/**
 * @swagger
 * /api/admin/users/{id}:
 *   put:
 *     summary: Update a user (Super Admin only)
 *     tags: [Admin]
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
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [user, resort_owner, resort_manager, superadmin]
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: User updated successfully
 */
router.put('/users/:id', updateUser);

/**
 * @swagger
 * /api/admin/users/{id}:
 *   delete:
 *     summary: Delete a user (Super Admin only)
 *     tags: [Admin]
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
router.delete('/users/:id', deleteUser);

// Booking Management
/**
 * @swagger
 * /api/admin/bookings:
 *   get:
 *     summary: Get all bookings (Super Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all bookings retrieved successfully
 */
router.get('/bookings', getAllBookings);

module.exports = router;
