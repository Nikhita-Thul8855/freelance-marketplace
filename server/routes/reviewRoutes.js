const express = require('express');
const router = express.Router();
const {
  createReview,
  getGigReviews,
  getUserReviews,
  getReview,
  updateReview,
  deleteReview,
  addFreelancerResponse
} = require('../controllers/reviewController');
const { protect } = require('../middleware/auth');

// @route   POST /api/reviews
// @desc    Create a new review
// @access  Private (Client only)
router.post('/', protect, createReview);

// @route   GET /api/reviews/gig/:gigId
// @desc    Get all reviews for a specific gig
// @access  Public
router.get('/gig/:gigId', getGigReviews);

// @route   GET /api/reviews/user/:userId
// @desc    Get all reviews by a specific user
// @access  Public
router.get('/user/:userId', getUserReviews);

// @route   GET /api/reviews/:reviewId
// @desc    Get single review by ID
// @access  Public
router.get('/:reviewId', getReview);

// @route   PUT /api/reviews/:reviewId
// @desc    Update a review
// @access  Private (Review owner only)
router.put('/:reviewId', protect, updateReview);

// @route   DELETE /api/reviews/:reviewId
// @desc    Delete a review
// @access  Private (Review owner or admin)
router.delete('/:reviewId', protect, deleteReview);

// @route   POST /api/reviews/:reviewId/response
// @desc    Add freelancer response to review
// @access  Private (Freelancer only)
router.post('/:reviewId/response', protect, addFreelancerResponse);

module.exports = router;
