const express = require('express');
const {
  register,
  login,
  getProfile,
  createResortOwner,
  createResortManager,
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
  check('phone', 'Phone number is required').not().isEmpty(),
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
 *               - phone
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
 *                 example: superadmin@resort.com
 *               password:
 *                 type: string
 *                 example: password123
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
 * /api/auth/resort-owner/create:
 *   post:
 *     summary: Create a resort owner (Super Admin only)
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Resort owner created successfully
 */
router.post('/resort-owner/create', authMiddleware, superadminMiddleware, permissionMiddleware('manage_resort_owners'), createResortOwner);

// Role-based middleware to allow both SuperAdmin and ResortOwner
const managerCreationMiddleware = (req, res, next) => {
  if (req.userRole === 'superadmin' || req.userRole === 'resort_owner') {
    return next();
  }
  return res.status(403).json({ message: 'Access denied. Managers can only be created by SuperAdmins or Resort Owners.' });
};

/**
 * @swagger
 * /api/auth/resort-manager/create:
 *   post:
 *     summary: Create a resort manager (Super Admin/Resort Owner only)
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Resort manager created successfully
 */
router.post('/resort-manager/create', authMiddleware, managerCreationMiddleware, createResortManager);

/**
 * @swagger
 * /api/auth/resort-owner/users:
 *   get:
 *     summary: Get all resort owners/managers (Super Admin only)
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of users retrieved successfully
 */
router.get('/resort-owner/users', authMiddleware, superadminMiddleware, permissionMiddleware('manage_users'), getAllUsers);

module.exports = router;
