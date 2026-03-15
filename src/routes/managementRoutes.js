const express = require('express');
const {
  getManagedResorts,
  getResortInventory,
  getManagedBookings,
} = require('../controllers/resortManagerController');
const { authMiddleware, resortManagerMiddleware } = require('../middleware/auth');

const router = express.Router();

// All management routes require authentication and at least resort manager role
router.use(authMiddleware);
router.use(resortManagerMiddleware);

/**
 * @swagger
 * /api/management/resorts:
 *   get:
 *     summary: Get all resorts managed by the user
 *     tags: [Management]
 */
router.get('/resorts', getManagedResorts);

/**
 * @swagger
 * /api/management/resorts/{resortId}/inventory:
 *   get:
 *     summary: Get rooms and facilities for a managed resort
 *     tags: [Management]
 */
router.get('/resorts/:resortId/inventory', getResortInventory);

/**
 * @swagger
 * /api/management/bookings:
 *   get:
 *     summary: Get all bookings for managed resorts (with check-in/out info)
 *     tags: [Management]
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 */
router.get('/bookings', getManagedBookings);

module.exports = router;
