const express = require('express');
const { register, login, getProfile, createPropertyOwner, createManager, getAllUsers } = require('../controllers/authController');
const { authMiddleware, superadminMiddleware, permissionMiddleware } = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
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
 *               - confirmPassword
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               confirmPassword:
 *                 type: string
 *               phone:
 *                 type: string
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Bad request
 */
router.post('/register', register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login a user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 */
router.post('/login', login);

/**
 * @swagger
 * /api/auth/profile:
 *   get:
 *     summary: Get user profile
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/profile', authMiddleware, getProfile);

/**
 * @swagger
 * /api/auth/property-owner/create:
 *   post:
 *     summary: Create a property owner (Super Admin only)
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Property owner created successfully
 */
router.post('/property-owner/create', authMiddleware, superadminMiddleware, permissionMiddleware('manage_property_owners'), createPropertyOwner);

/**
 * @swagger
 * /api/auth/manager/create:
 *   post:
 *     summary: Create a manager (Super Admin only)
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Manager created successfully
 */
router.post('/manager/create', authMiddleware, superadminMiddleware, permissionMiddleware('manage_property_owners'), createManager);

/**
 * @swagger
 * /api/auth/property-owner/users:
 *   get:
 *     summary: Get all property owners/managers (Super Admin only)
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of users retrieved successfully
 */
router.get('/property-owner/users', authMiddleware, superadminMiddleware, permissionMiddleware('manage_users'), getAllUsers);

module.exports = router;
