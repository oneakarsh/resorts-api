const express = require('express');
const {
  register,
  login,
  getProfile,
  createPropertyOwner,
  createManager,
  getAllUsers,
  refreshToken,
  forgotPassword,
  resetPassword,
} = require('../controllers/authController');
const { authMiddleware, superadminMiddleware, permissionMiddleware } = require('../middleware/auth');

const { check } = require('express-validator');
const { validate } = require('../middleware/validate');

const router = express.Router();

const registerValidation = [
  check('name', 'Name is required').not().isEmpty(),
  check('email', 'Please include a valid email').isEmail(),
  check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 }),
  check('confirmPassword', 'Passwords do not match').custom((value, { req }) => value === req.body.password),
];

const loginValidation = [
  check('email', 'Please include a valid email').isEmail(),
  check('password', 'Password is required').exists(),
];

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
router.post('/register', registerValidation, validate, register);

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
router.post('/login', loginValidation, validate, login);

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     summary: Refresh access token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *             properties:
 *               token:
 *                 type: string
 *     responses:
 *       200:
 *         description: New access token generated
 *       403:
 *         description: Invalid refresh token
 */
router.post('/refresh', refreshToken);

/**
 * @swagger
 * /api/auth/forgot-password:
 *   post:
 *     summary: Request password reset link
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Reset link generated
 */
router.post('/forgot-password', forgotPassword);

/**
 * @swagger
 * /api/auth/reset-password/{token}:
 *   post:
 *     summary: Reset password using token
 *     tags: [Auth]
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - password
 *             properties:
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password reset successful
 */
router.post('/reset-password/:token', resetPassword);

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

// Role-based middleware to allow both SuperAdmin and PropertyOwner
const managerCreationMiddleware = (req, res, next) => {
  if (req.userRole === 'superadmin' || req.userRole === 'property_owner') {
    return next();
  }
  return res.status(403).json({ message: 'Access denied. Managers can only be created by SuperAdmins or Property Owners.' });
};

/**
 * @swagger
 * /api/auth/manager/create:
 *   post:
 *     summary: Create a manager (Super Admin/Property Owner only)
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Manager created successfully
 */
router.post('/manager/create', authMiddleware, managerCreationMiddleware, createManager);

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
