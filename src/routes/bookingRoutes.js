const express = require('express');
const {
  createBooking,
  getUserBookings,
  getBookingById,
  updateBookingStatus,
  cancelBooking,
  getAllBookings,
} = require('../controllers/bookingController');
const { authMiddleware, resortOwnerMiddleware, permissionMiddleware } = require('../middleware/auth');
const { check } = require('express-validator');
const { validate } = require('../middleware/validate');

const router = express.Router();

const bookingValidation = [
  check('resortId', 'Resort ID is required').not().isEmpty(),
  check('checkInDate', 'Check-in date is required').isISO8601(),
  check('checkOutDate', 'Check-out date is required').isISO8601(),
  check('numberOfGuests', 'Number of guests must be a number').isNumeric(),
];

/**
 * @swagger
 * /api/bookings:
 *   post:
 *     summary: Create a new booking
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - resortId
 *               - checkInDate
 *               - checkOutDate
 *               - numberOfGuests
 *             properties:
 *               resortId:
 *                 type: string
 *               checkInDate:
 *                 type: string
 *                 format: date
 *               checkOutDate:
 *                 type: string
 *                 format: date
 *               numberOfGuests:
 *                 type: integer
 *               specialRequests:
 *                 type: string
 *     responses:
 *       201:
 *         description: Booking created successfully
 */
router.post('/', authMiddleware, permissionMiddleware('create_booking'), bookingValidation, validate, createBooking);

/**
 * @swagger
 * /api/bookings:
 *   get:
 *     summary: Get user bookings
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user bookings retrieved successfully
 */
router.get('/', authMiddleware, permissionMiddleware('view_own_booking'), getUserBookings);

/**
 * @swagger
 * /api/bookings/resort-owner/all:
 *   get:
 *     summary: Get all bookings for resort owner's resorts
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all bookings retrieved successfully
 */
router.get('/resort-owner/all', authMiddleware, resortOwnerMiddleware, permissionMiddleware('view_all_bookings'), getAllBookings);

/**
 * @swagger
 * /api/bookings/{id}:
 *   get:
 *     summary: Get booking by ID
 *     tags: [Bookings]
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
 *         description: Booking details retrieved successfully
 */
router.get('/:id', authMiddleware, getBookingById);

/**
 * @swagger
 * /api/bookings/{id}/status:
 *   patch:
 *     summary: Update booking status (Resort Owner/Super Admin only)
 *     tags: [Bookings]
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
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, confirmed, cancelled, completed]
 *     responses:
 *       200:
 *         description: Booking status updated successfully
 */
router.patch('/:id/status', authMiddleware, resortOwnerMiddleware, permissionMiddleware('update_booking_status'), updateBookingStatus);

/**
 * @swagger
 * /api/bookings/{id}/cancel:
 *   patch:
 *     summary: Cancel a booking
 *     tags: [Bookings]
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
 *         description: Booking cancelled successfully
 */
router.patch('/:id/cancel', authMiddleware, permissionMiddleware('cancel_own_booking'), cancelBooking);

module.exports = router;
