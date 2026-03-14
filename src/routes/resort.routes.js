const express = require('express');
const {
    getResorts,
    getResort,
    createResort,
    updateResort,
    deleteResort,
    searchResorts
} = require('../controllers/resort.controller');
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Resorts
 *   description: Resort management
 */

/**
 * @swagger
 * /resorts/search:
 *   get:
 *     summary: Search for resorts
 *     tags: [Resorts]
 *     parameters:
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *       - in: query
 *         name: location
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Success
 */
router.get('/search', searchResorts);

router
    .route('/')
    /**
     * @swagger
     * /resorts:
     *   get:
     *     summary: Get all resorts
     *     tags: [Resorts]
     *     responses:
     *       200:
     *         description: Success
     */
    .get(getResorts)
    /**
     * @swagger
     * /resorts:
     *   post:
     *     summary: Create a new resort
     *     tags: [Resorts]
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         multipart/form-data:
     *           schema:
     *             type: object
     *             properties:
     *               name:
     *                 type: string
     *               location:
     *                 type: string
     *               description:
     *                 type: string
     *               amenities:
     *                 type: array
     *                 items:
     *                   type: string
     *               images:
     *                 type: array
     *                 items:
     *                   type: string
     *                   format: binary
     *     responses:
     *       201:
     *         description: Resort created successfully
     */
    .post(protect, authorize('ResortOwner', 'Admin', 'SuperAdmin'), upload.array('images', 5), createResort);

router
    .route('/:id')
    /**
     * @swagger
     * /resorts/{id}:
     *   get:
     *     summary: Get a single resort
     *     tags: [Resorts]
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
    .get(getResort)
    /**
     * @swagger
     * /resorts/{id}:
     *   put:
     *     summary: Update a resort
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
     *         multipart/form-data:
     *           schema:
     *             type: object
     *             properties:
     *               name:
     *                 type: string
     *               location:
     *                 type: string
     *               description:
     *                 type: string
     *               images:
     *                 type: array
     *                 items:
     *                   type: string
     *                   format: binary
     *     responses:
     *       200:
     *         description: Resort updated successfully
     */
    .put(protect, authorize('ResortOwner', 'Admin', 'SuperAdmin'), upload.array('images', 5), updateResort)
    /**
     * @swagger
     * /resorts/{id}:
     *   delete:
     *     summary: Delete a resort
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
    .delete(protect, authorize('ResortOwner', 'Admin', 'SuperAdmin'), deleteResort);

module.exports = router;
