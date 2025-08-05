const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  // Rating from 1 to 5 stars
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot exceed 5'],
    validate: {
      validator: function(value) {
        return Number.isInteger(value);
      },
      message: 'Rating must be a whole number'
    }
  },

  // Review comment/text
  comment: {
    type: String,
    required: [true, 'Review comment is required'],
    trim: true,
    minlength: [10, 'Review must be at least 10 characters long'],
    maxlength: [1000, 'Review cannot exceed 1000 characters']
  },

  // User who wrote the review (client)
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },

  // Gig being reviewed
  gigId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Gig',
    required: [true, 'Gig ID is required']
  },

  // Order associated with this review
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: [true, 'Order ID is required'],
    unique: true // One review per order
  },

  // Review status
  status: {
    type: String,
    enum: ['active', 'hidden', 'reported'],
    default: 'active'
  },

  // Helpful votes (for future feature)
  helpfulVotes: {
    type: Number,
    default: 0,
    min: 0
  },

  // Review metadata
  isVerified: {
    type: Boolean,
    default: true // Since review is based on completed order
  },

  // Response from freelancer (optional)
  freelancerResponse: {
    comment: {
      type: String,
      trim: true,
      maxlength: [500, 'Response cannot exceed 500 characters']
    },
    respondedAt: {
      type: Date
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Compound indexes for efficient queries
reviewSchema.index({ gigId: 1, rating: 1 });
reviewSchema.index({ userId: 1, createdAt: -1 });
reviewSchema.index({ gigId: 1, createdAt: -1 });

// Virtual for review age
reviewSchema.virtual('reviewAge').get(function() {
  const now = new Date();
  const diffTime = Math.abs(now - this.createdAt);
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) {
    return 'Today';
  } else if (diffDays === 1) {
    return 'Yesterday';
  } else if (diffDays < 7) {
    return `${diffDays} days ago`;
  } else if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return weeks === 1 ? '1 week ago' : `${weeks} weeks ago`;
  } else {
    const months = Math.floor(diffDays / 30);
    return months === 1 ? '1 month ago' : `${months} months ago`;
  }
});

// Prevent duplicate reviews for the same order
reviewSchema.pre('save', async function(next) {
  if (this.isNew) {
    const existingReview = await this.constructor.findOne({ 
      orderId: this.orderId 
    });
    
    if (existingReview) {
      const error = new Error('A review already exists for this order');
      error.code = 'DUPLICATE_REVIEW';
      return next(error);
    }
  }
  next();
});

// Static method to get average rating for a gig
reviewSchema.statics.getAverageRating = async function(gigId) {
  const result = await this.aggregate([
    {
      $match: { 
        gigId: new mongoose.Types.ObjectId(gigId),
        status: 'active'
      }
    },
    {
      $group: {
        _id: '$gigId',
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 },
        ratingDistribution: {
          $push: '$rating'
        }
      }
    }
  ]);

  if (result.length > 0) {
    const stats = result[0];
    
    // Calculate rating distribution
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    stats.ratingDistribution.forEach(rating => {
      distribution[rating]++;
    });

    return {
      averageRating: Math.round(stats.averageRating * 10) / 10, // Round to 1 decimal
      totalReviews: stats.totalReviews,
      distribution
    };
  }

  return {
    averageRating: 0,
    totalReviews: 0,
    distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  };
};

// Instance method to check if user can edit review
reviewSchema.methods.canEdit = function(userId) {
  // User can edit within 24 hours of creation
  const hoursSinceCreation = (new Date() - this.createdAt) / (1000 * 60 * 60);
  return this.userId.toString() === userId.toString() && hoursSinceCreation <= 24;
};

module.exports = mongoose.model('Review', reviewSchema);
