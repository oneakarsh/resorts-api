const express = require('express');
const {
    getUsers,
    getAdminResorts,
    getAdminBookings,
    verifyResort,
    deleteUser
} = require('../controllers/user.controller');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Administrative operations
 */

// Admin/SuperAdmin protection
router.use(protect);
router.use(authorize('Admin', 'SuperAdmin'));

/**
 * @swagger
 * /admin/users:
 *   get:
 *     summary: Get all users
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 */
router.get('/users', getUsers);

/**
 * @swagger
 * /admin/users/{id}:
 *   delete:
 *     summary: Delete a user
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

/**
 * @swagger
 * /admin/resorts:
 *   get:
 *     summary: Get all resorts for admin
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 */
router.get('/resorts', getAdminResorts);

/**
 * @swagger
 * /admin/resorts/{id}/verify:
 *   put:
 *     summary: Verify a resort
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
 *         description: Resort verified successfully
 */
router.put('/resorts/:id/verify', verifyResort);

/**
 * @swagger
 * /admin/bookings:
 *   get:
 *     summary: Get all bookings for admin
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 */
router.get('/bookings', getAdminBookings);

module.exports = router;
