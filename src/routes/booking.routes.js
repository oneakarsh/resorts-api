const express = require('express');
const { getBookings, getBooking, createBooking, deleteBooking, checkAvailability, getBookedDates } = require('../controllers/booking.controller');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Bookings
 *   description: Booking management
 */

/**
 * @swagger
 * /bookings/check-availability:
 *   get:
 *     summary: Check availability
 *     tags: [Bookings]
 *     parameters:
 *       - in: query
 *         name: roomId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: startDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Success
 */
router.get('/check-availability', checkAvailability);

/**
 * @swagger
 * /bookings/room/{roomId}/dates:
 *   get:
 *     summary: Get booked dates for a room
 *     tags: [Bookings]
 *     parameters:
 *       - in: path
 *         name: roomId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Success
 */
router.get('/room/:roomId/dates', getBookedDates);

router.use(protect);

router
    .route('/')
    /**
     * @swagger
     * /bookings:
     *   get:
     *     summary: Get all bookings for the current user
     *     tags: [Bookings]
     *     security:
     *       - bearerAuth: []
     *     responses:
     *       200:
     *         description: Success
     */
    .get(getBookings)
    /**
     * @swagger
     * /bookings:
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
     *               - room
     *               - startDate
     *               - endDate
     *               - totalAmount
     *             properties:
     *               room:
     *                 type: string
     *               startDate:
     *                 type: string
     *                 format: date
     *               endDate:
     *                 type: string
     *                 format: date
     *               totalAmount:
     *                 type: number
     *     responses:
     *       201:
     *         description: Booking created successfully
     */
    .post(createBooking);

router
    .route('/:id')
    /**
     * @swagger
     * /bookings/{id}:
     *   get:
     *     summary: Get a single booking
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
     *         description: Success
     */
    .get(getBooking)
    /**
     * @swagger
     * /bookings/{id}:
     *   delete:
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
    .delete(deleteBooking);

module.exports = router;
