const express = require('express');
const { getSuperAdminStats, getPropertyOwnerStats } = require('../controllers/dashboardController');
const { authMiddleware, superadminMiddleware, propertyOwnerMiddleware } = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * /api/dashboard/super-admin:
 *   get:
 *     summary: Get dashboard statistics for Super Admin
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Super Admin statistics retrieved successfully
 *       403:
 *         description: Forbidden - Super Admin access required
 */
router.get('/super-admin', authMiddleware, superadminMiddleware, getSuperAdminStats);

/**
 * @swagger
 * /api/dashboard/property-owner:
 *   get:
 *     summary: Get dashboard statistics for Property Owner
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: propertyOwnerId
 *         schema:
 *           type: string
 *         description: "Optional: ID of the property owner to view stats for (Super Admin only). Defaults to current user."
 *     responses:
 *       200:
 *         description: Property Owner statistics retrieved successfully
 *       403:
 *         description: Forbidden - Property Owner access required
 */
router.get('/property-owner', authMiddleware, propertyOwnerMiddleware, getPropertyOwnerStats);

module.exports = router;
