const express = require('express');
const { addReview, getReviews, deleteReview } = require('../controllers/review.controller');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Reviews
 *   description: Review management
 */

router.route('/')
    /**
     * @swagger
     * /reviews:
     *   post:
     *     summary: Add a review
     *     tags: [Reviews]
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - resort
     *               - rating
     *               - comment
     *             properties:
     *               resort:
     *                 type: string
     *               rating:
     *                 type: number
     *               comment:
     *                 type: string
     *     responses:
     *       201:
     *         description: Review added successfully
     */
    .post(protect, addReview);

router.route('/:id')
    /**
     * @swagger
     * /reviews/{id}:
     *   delete:
     *     summary: Delete a review
     *     tags: [Reviews]
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
     *         description: Review deleted successfully
     */
    .delete(protect, deleteReview);

/**
 * @swagger
 * /reviews/resort/{id}:
 *   get:
 *     summary: Get reviews for a resort
 *     tags: [Reviews]
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
router.route('/resort/:id').get(getReviews);

module.exports = router;
