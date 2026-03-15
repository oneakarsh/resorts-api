const express = require('express');
const {
  getAllResorts,
  getResortById,
  createResort,
  updateResort,
  deleteResort,
} = require('../controllers/resortController');
const { authMiddleware, resortOwnerMiddleware, permissionMiddleware } = require('../middleware/auth');
const { check } = require('express-validator');
const { validate } = require('../middleware/validate');

const router = express.Router();

const resortValidation = [
  check('name', 'Name is required').not().isEmpty(),
  check('description', 'Description is required').not().isEmpty(),
  check('location', 'Location is required').not().isEmpty(),
  check('address', 'Address is required').not().isEmpty(),
  check('area', 'Area is required').not().isEmpty(),
  check('pricePerNight', 'Price per night must be a number').isNumeric(),
  check('maxGuests', 'Max guests must be a number').isNumeric(),
  check('rooms', 'Rooms must be a number').isNumeric(),
];

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
 *     summary: Create a new resort (Resort Owner/Super Admin only)
 *     tags: [Resorts]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Resort created successfully
 */
router.post('/', authMiddleware, resortOwnerMiddleware, permissionMiddleware('create_resort'), resortValidation, validate, createResort);

/**
 * @swagger
 * /api/resorts/{id}:
 *   put:
 *     summary: Update a resort (Resort Owner/Super Admin only)
 *     tags: [Resorts]
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
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               location:
 *                 type: string
 *               address:
 *                 type: string
 *               area:
 *                 type: string
 *               pricePerNight:
 *                 type: number
 *               maxGuests:
 *                 type: number
 *               rooms:
 *                 type: number
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *               amenities:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Resort updated successfully
 */
router.put('/:id', authMiddleware, resortOwnerMiddleware, permissionMiddleware('update_resort'), resortValidation, validate, updateResort);

/**
 * @swagger
 * /api/resorts/{id}:
 *   delete:
 *     summary: Delete a resort (Resort Owner/Super Admin only)
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
router.delete('/:id', authMiddleware, resortOwnerMiddleware, permissionMiddleware('delete_resort'), deleteResort);

module.exports = router;
