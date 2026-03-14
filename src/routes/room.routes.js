const express = require('express');
const {
    getRoomsByResort,
    createRoom,
    updateRoom,
    deleteRoom
} = require('../controllers/room.controller');
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Rooms
 *   description: Room management
 */

router
    .route('/')
    /**
     * @swagger
     * /rooms:
     *   post:
     *     summary: Create a new room
     *     tags: [Rooms]
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         multipart/form-data:
     *           schema:
     *             type: object
     *             properties:
     *               resort:
     *                 type: string
     *               type:
     *                 type: string
     *               price:
     *                 type: number
     *               capacity:
     *                 type: number
     *               description:
     *                 type: string
     *               images:
     *                 type: array
     *                 items:
     *                   type: string
     *                   format: binary
     *     responses:
     *       201:
     *         description: Room created successfully
     */
    .post(protect, authorize('ResortOwner', 'Admin', 'SuperAdmin'), upload.array('images', 5), createRoom);

router
    .route('/:id')
    /**
     * @swagger
     * /rooms/{id}:
     *   put:
     *     summary: Update a room
     *     tags: [Rooms]
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
     *               price:
     *                 type: number
     *               capacity:
     *                 type: number
     *               description:
     *                 type: string
     *     responses:
     *       200:
     *         description: Room updated successfully
     */
    .put(protect, authorize('ResortOwner', 'Admin', 'SuperAdmin'), upload.array('images', 5), updateRoom)
    /**
     * @swagger
     * /rooms/{id}:
     *   delete:
     *     summary: Delete a room
     *     tags: [Rooms]
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
     *         description: Room deleted successfully
     */
    .delete(protect, authorize('ResortOwner', 'Admin', 'SuperAdmin'), deleteRoom);

/**
 * @swagger
 * /rooms/resort/{id}:
 *   get:
 *     summary: Get rooms by resort ID
 *     tags: [Rooms]
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
router.route('/resort/:id').get(getRoomsByResort);

module.exports = router;
