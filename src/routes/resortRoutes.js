const express = require('express');
const {
  getAllResorts,
  getResortById,
  createResort,
  updateResort,
  deleteResort,
} = require('../controllers/resortController');
const { authMiddleware, propertyOwnerMiddleware, permissionMiddleware } = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * /api/resorts:
 *   get:
 *     summary: Get all resorts
 *     tags: [Resorts]
 *     responses:
 *       200:
 *         description: List of resorts retrieved successfully
 */
router.get('/', getAllResorts);

/**
 * @swagger
 * /api/resorts/{id}:
 *   get:
 *     summary: Get resort by ID
 *     tags: [Resorts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Resort details retrieved successfully
 */
router.get('/:id', getResortById);

/**
 * @swagger
 * /api/resorts:
 *   post:
 *     summary: Create a new resort (Property Owner/Super Admin only)
 *     tags: [Resorts]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Resort created successfully
 */
router.post('/', authMiddleware, propertyOwnerMiddleware, permissionMiddleware('create_resort'), createResort);

/**
 * @swagger
 * /api/resorts/{id}:
 *   put:
 *     summary: Update a resort (Property Owner/Super Admin only)
 *     tags: [Resorts]
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
 *         description: Resort updated successfully
 */
router.put('/:id', authMiddleware, propertyOwnerMiddleware, permissionMiddleware('update_resort'), updateResort);

/**
 * @swagger
 * /api/resorts/{id}:
 *   delete:
 *     summary: Delete a resort (Property Owner/Super Admin only)
 *     tags: [Resorts]
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
 *         description: Resort deleted successfully
 */
router.delete('/:id', authMiddleware, propertyOwnerMiddleware, permissionMiddleware('delete_resort'), deleteResort);

module.exports = router;
