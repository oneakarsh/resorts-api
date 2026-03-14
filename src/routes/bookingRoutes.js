const express = require('express');
const {
  createBooking,
  getUserBookings,
  getBookingById,
  updateBookingStatus,
  cancelBooking,
  getAllBookings,
} = require('../controllers/bookingController');
const { authMiddleware, propertyOwnerMiddleware, permissionMiddleware } = require('../middleware/auth');

const router = express.Router();

router.post('/', authMiddleware, permissionMiddleware('create_booking'), createBooking);
router.get('/', authMiddleware, permissionMiddleware('view_own_booking'), getUserBookings);
router.get('/property-owner/all', authMiddleware, propertyOwnerMiddleware, permissionMiddleware('view_all_bookings'), getAllBookings);
router.get('/:id', authMiddleware, getBookingById);
router.patch('/:id/status', authMiddleware, propertyOwnerMiddleware, permissionMiddleware('update_booking_status'), updateBookingStatus);
router.patch('/:id/cancel', authMiddleware, permissionMiddleware('cancel_own_booking'), cancelBooking);

module.exports = router;
