const express = require('express');
const {
    getManagerStats,
    getManagerBookings,
    updateBookingStatus,
    getManagerResorts
} = require('../controllers/admin.controller');

const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// All routes here are protected and only for ResortOwner and Admin (Staff)
router.use(protect);
router.use(authorize('ResortOwner', 'Admin', 'SuperAdmin'));

router.get('/stats', getManagerStats);
router.get('/bookings', getManagerBookings);
router.put('/bookings/:id/status', updateBookingStatus);
router.get('/resorts', getManagerResorts);

module.exports = router;
