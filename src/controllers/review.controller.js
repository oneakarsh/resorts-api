const Review = require('../models/Review');
const Resort = require('../models/Resort');
const { asyncHandler, sendResponse } = require('../utils/helpers');

// @desc    Get reviews for a resort
// @route   GET /api/resorts/:id/reviews
// @access  Public
exports.getReviews = asyncHandler(async (req, res, next) => {
    const reviews = await Review.find({ resortId: req.params.id }).populate('userId');

    sendResponse(res, 200, true, 'Reviews fetched successfully', { count: reviews.length, data: reviews });
});

// @desc    Add review
// @route   POST /api/reviews
// @access  Private
exports.addReview = asyncHandler(async (req, res, next) => {
    const { resortId, rating, comment } = req.body;

    // Check if resort exists
    const resort = await Resort.findById(resortId);
    if (!resort) {
        return sendResponse(res, 404, false, `Resort not found with id of ${resortId}`);
    }

    // Add user and resort to body
    req.body.userId = req.user.id;
    req.body.resortId = resortId;

    // Check if user already reviewed
    const existingReview = await Review.findOne({ userId: req.user.id, resortId: resortId });
    if (existingReview) {
        return sendResponse(res, 400, false, 'User already reviewed this resort');
    }

    const review = await Review.create(req.body);

    sendResponse(res, 201, true, 'Review added successfully', { review });
});

// @desc    Delete review
// @route   DELETE /api/reviews/:id
// @access  Private
exports.deleteReview = asyncHandler(async (req, res, next) => {
    const review = await Review.findById(req.params.id);

    if (!review) {
        return sendResponse(res, 404, false, `Review not found with id of ${req.params.id}`);
    }

    // Only owner of review, Admin, or SuperAdmin can delete
    if (review.userId.toString() !== req.user.id && req.user.role !== 'Admin' && req.user.role !== 'SuperAdmin') {
        return sendResponse(res, 401, false, `User is not authorized to delete this review`);
    }

    await review.deleteOne();

    sendResponse(res, 200, true, 'Review deleted successfully');
});
