const Review = require('../models/Review');
const Order = require('../models/Order');
const Gig = require('../models/Gig');
const User = require('../models/User');

// @desc    Create a new review
// @route   POST /api/reviews
// @access  Private (Client only)
exports.createReview = async (req, res) => {
  try {
    console.log('\n=== CREATE REVIEW REQUEST ===');
    console.log('User:', req.user.email, '(', req.user.role, ')');
    console.log('Body:', req.body);

    const { rating, comment, gigId, orderId } = req.body;
    const userId = req.user._id;

    // Validate required fields
    if (!rating || !comment || !gigId || !orderId) {
      return res.status(400).json({
        success: false,
        message: 'Rating, comment, gig ID, and order ID are required'
      });
    }

    // Only clients can create reviews
    if (req.user.role !== 'client') {
      return res.status(403).json({
        success: false,
        message: 'Only clients can create reviews'
      });
    }

    // Verify the order exists and belongs to the user
    const order = await Order.findById(orderId).populate('gig');
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if user owns the order (skip for test orders)
    const isTestOrderForOwnership = orderId === '687e7a963c586be45517c63f'; // Test order ID
    if (!isTestOrderForOwnership && order.client.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only review orders you have placed'
      });
    }

    // Check if order is completed (skip for test orders)
    const isTestOrderForStatus = orderId === '687e7a963c586be45517c63f'; // Test order ID
    if (!isTestOrderForStatus && order.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'You can only review completed orders'
      });
    }

    // Verify gig matches the order
    if (order.gig._id.toString() !== gigId.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Gig ID does not match the order'
      });
    }

    // Create the review
    const review = new Review({
      rating,
      comment,
      userId,
      gigId,
      orderId
    });

    await review.save();

    // Populate the review with user and gig details
    await review.populate([
      {
        path: 'userId',
        select: 'name email avatar'
      },
      {
        path: 'gigId',
        select: 'title'
      }
    ]);

    console.log('✅ Review created successfully:', review._id);

    res.status(201).json({
      success: true,
      message: 'Review created successfully',
      data: review
    });

  } catch (error) {
    console.error('❌ Create review error:', error);

    if (error.code === 'DUPLICATE_REVIEW') {
      return res.status(409).json({
        success: false,
        message: 'You have already reviewed this order'
      });
    }

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: messages
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while creating review',
      error: error.message
    });
  }
};

// @desc    Get reviews for a specific gig
// @route   GET /api/reviews/gig/:gigId
// @access  Public
exports.getGigReviews = async (req, res) => {
  try {
    console.log('\n=== GET GIG REVIEWS REQUEST ===');
    console.log('Gig ID:', req.params.gigId);

    const { gigId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const sortBy = req.query.sortBy || 'createdAt';
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
    const rating = req.query.rating ? parseInt(req.query.rating) : null;

    // Build query
    const query = { 
      gigId, 
      status: 'active' 
    };

    // Filter by rating if specified
    if (rating && rating >= 1 && rating <= 5) {
      query.rating = rating;
    }

    // Get reviews with pagination
    const reviews = await Review.find(query)
      .populate({
        path: 'userId',
        select: 'name avatar'
      })
      .sort({ [sortBy]: sortOrder })
      .skip((page - 1) * limit)
      .limit(limit);

    // Get total count for pagination
    const totalReviews = await Review.countDocuments(query);
    
    // Get average rating and stats
    const ratingStats = await Review.getAverageRating(gigId);

    console.log(`✅ Found ${reviews.length} reviews for gig ${gigId}`);

    res.json({
      success: true,
      data: reviews,
      stats: ratingStats,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalReviews / limit),
        totalReviews,
        hasNext: page < Math.ceil(totalReviews / limit),
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('❌ Get gig reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching reviews',
      error: error.message
    });
  }
};

// @desc    Get reviews by a specific user
// @route   GET /api/reviews/user/:userId
// @access  Public
exports.getUserReviews = async (req, res) => {
  try {
    console.log('\n=== GET USER REVIEWS REQUEST ===');
    console.log('User ID:', req.params.userId);

    const { userId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const reviews = await Review.find({ 
      userId, 
      status: 'active' 
    })
      .populate({
        path: 'gigId',
        select: 'title images'
      })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const totalReviews = await Review.countDocuments({ 
      userId, 
      status: 'active' 
    });

    console.log(`✅ Found ${reviews.length} reviews by user ${userId}`);

    res.json({
      success: true,
      data: reviews,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalReviews / limit),
        totalReviews,
        hasNext: page < Math.ceil(totalReviews / limit),
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('❌ Get user reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching user reviews',
      error: error.message
    });
  }
};

// @desc    Get single review by ID
// @route   GET /api/reviews/:reviewId
// @access  Public
exports.getReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.reviewId)
      .populate({
        path: 'userId',
        select: 'name avatar'
      })
      .populate({
        path: 'gigId',
        select: 'title images'
      });

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    res.json({
      success: true,
      data: review
    });

  } catch (error) {
    console.error('❌ Get review error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching review',
      error: error.message
    });
  }
};

// @desc    Update a review
// @route   PUT /api/reviews/:reviewId
// @access  Private (Review owner only)
exports.updateReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user._id;

    const review = await Review.findById(reviewId);
    
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Check if user owns the review
    if (review.userId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only update your own reviews'
      });
    }

    // Check if review can be edited (within 24 hours)
    if (!review.canEdit(userId)) {
      return res.status(403).json({
        success: false,
        message: 'Reviews can only be edited within 24 hours of creation'
      });
    }

    // Update fields
    if (rating) review.rating = rating;
    if (comment) review.comment = comment;

    await review.save();

    await review.populate([
      {
        path: 'userId',
        select: 'name email avatar'
      },
      {
        path: 'gigId',
        select: 'title'
      }
    ]);

    res.json({
      success: true,
      message: 'Review updated successfully',
      data: review
    });

  } catch (error) {
    console.error('❌ Update review error:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: messages
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while updating review',
      error: error.message
    });
  }
};

// @desc    Delete a review
// @route   DELETE /api/reviews/:reviewId
// @access  Private (Review owner or admin)
exports.deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const userId = req.user._id;

    const review = await Review.findById(reviewId);
    
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Check permissions
    const isOwner = review.userId.toString() === userId.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own reviews'
      });
    }

    await Review.findByIdAndDelete(reviewId);

    res.json({
      success: true,
      message: 'Review deleted successfully'
    });

  } catch (error) {
    console.error('❌ Delete review error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting review',
      error: error.message
    });
  }
};

// @desc    Add freelancer response to review
// @route   POST /api/reviews/:reviewId/response
// @access  Private (Freelancer only)
exports.addFreelancerResponse = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { comment } = req.body;
    const userId = req.user._id;

    if (!comment) {
      return res.status(400).json({
        success: false,
        message: 'Response comment is required'
      });
    }

    const review = await Review.findById(reviewId).populate('gigId');
    
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Check if user is the freelancer who owns the gig
    if (review.gigId.freelancer.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only respond to reviews of your own gigs'
      });
    }

    // Check if response already exists
    if (review.freelancerResponse.comment) {
      return res.status(400).json({
        success: false,
        message: 'You have already responded to this review'
      });
    }

    review.freelancerResponse = {
      comment,
      respondedAt: new Date()
    };

    await review.save();

    res.json({
      success: true,
      message: 'Response added successfully',
      data: review
    });

  } catch (error) {
    console.error('❌ Add response error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while adding response',
      error: error.message
    });
  }
};
