import api from './api';

class ReviewService {
  // Create a new review
  async createReview(reviewData) {
    try {
      console.log('🌟 Creating review...');
      console.log('Review data:', reviewData);

      const response = await api.post('/reviews', reviewData);
      
      console.log('✅ Review created successfully:', response.data);
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      console.error('❌ Create review failed:');
      console.error('Error:', error);
      console.error('Response:', error.response?.data);
      
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to create review',
        details: {
          status: error.response?.status,
          data: error.response?.data
        }
      };
    }
  }

  // Get reviews for a specific gig
  async getGigReviews(gigId, options = {}) {
    try {
      const { 
        page = 1, 
        limit = 10, 
        sortBy = 'createdAt', 
        sortOrder = 'desc',
        rating = null 
      } = options;

      let url = `/reviews/gig/${gigId}?page=${page}&limit=${limit}&sortBy=${sortBy}&sortOrder=${sortOrder}`;
      
      if (rating) {
        url += `&rating=${rating}`;
      }

      const response = await api.get(url);
      
      return {
        success: true,
        data: response.data.data,
        stats: response.data.stats,
        pagination: response.data.pagination
      };
    } catch (error) {
      console.error('❌ Get gig reviews failed:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch reviews'
      };
    }
  }

  // Get reviews by a specific user
  async getUserReviews(userId, options = {}) {
    try {
      const { page = 1, limit = 10 } = options;
      
      const response = await api.get(`/reviews/user/${userId}?page=${page}&limit=${limit}`);
      
      return {
        success: true,
        data: response.data.data,
        pagination: response.data.pagination
      };
    } catch (error) {
      console.error('❌ Get user reviews failed:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch user reviews'
      };
    }
  }

  // Get single review
  async getReview(reviewId) {
    try {
      const response = await api.get(`/reviews/${reviewId}`);
      
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      console.error('❌ Get review failed:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch review'
      };
    }
  }

  // Update a review
  async updateReview(reviewId, updateData) {
    try {
      console.log('📝 Updating review:', reviewId);
      console.log('Update data:', updateData);

      const response = await api.put(`/reviews/${reviewId}`, updateData);
      
      console.log('✅ Review updated successfully:', response.data);
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      console.error('❌ Update review failed:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to update review',
        details: {
          status: error.response?.status,
          data: error.response?.data
        }
      };
    }
  }

  // Delete a review
  async deleteReview(reviewId) {
    try {
      console.log('🗑️ Deleting review:', reviewId);

      const response = await api.delete(`/reviews/${reviewId}`);
      
      console.log('✅ Review deleted successfully');
      return {
        success: true,
        message: response.data.message
      };
    } catch (error) {
      console.error('❌ Delete review failed:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to delete review'
      };
    }
  }

  // Add freelancer response to review
  async addFreelancerResponse(reviewId, comment) {
    try {
      console.log('💬 Adding freelancer response to review:', reviewId);
      console.log('Response comment:', comment);

      const response = await api.post(`/reviews/${reviewId}/response`, { comment });
      
      console.log('✅ Response added successfully:', response.data);
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      console.error('❌ Add response failed:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to add response'
      };
    }
  }

  // Format rating display
  formatRating(rating) {
    return '★'.repeat(Math.floor(rating)) + '☆'.repeat(5 - Math.floor(rating));
  }

  // Get rating color based on rating value
  getRatingColor(rating) {
    if (rating >= 4.5) return '#10B981'; // Green
    if (rating >= 3.5) return '#F59E0B'; // Yellow
    if (rating >= 2.5) return '#F97316'; // Orange
    return '#EF4444'; // Red
  }

  // Format review date
  formatReviewDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
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
  }

  // Calculate rating percentage for display
  getRatingPercentage(rating) {
    return (rating / 5) * 100;
  }

  // Validate review data before submission
  validateReviewData(reviewData) {
    const errors = [];

    if (!reviewData.rating || reviewData.rating < 1 || reviewData.rating > 5) {
      errors.push('Rating must be between 1 and 5 stars');
    }

    if (!reviewData.comment || reviewData.comment.trim().length < 10) {
      errors.push('Review comment must be at least 10 characters long');
    }

    if (reviewData.comment && reviewData.comment.length > 1000) {
      errors.push('Review comment cannot exceed 1000 characters');
    }

    if (!reviewData.gigId) {
      errors.push('Gig ID is required');
    }

    if (!reviewData.orderId) {
      errors.push('Order ID is required');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Get review statistics summary
  getReviewSummary(stats) {
    if (!stats || stats.totalReviews === 0) {
      return {
        averageRating: 0,
        totalReviews: 0,
        ratingText: 'No reviews yet',
        distributionPercentages: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
      };
    }

    const distributionPercentages = {};
    Object.keys(stats.distribution).forEach(rating => {
      distributionPercentages[rating] = stats.totalReviews > 0 
        ? Math.round((stats.distribution[rating] / stats.totalReviews) * 100)
        : 0;
    });

    const ratingText = stats.averageRating >= 4.5 ? 'Excellent' :
                      stats.averageRating >= 3.5 ? 'Very Good' :
                      stats.averageRating >= 2.5 ? 'Good' :
                      stats.averageRating >= 1.5 ? 'Fair' : 'Poor';

    return {
      averageRating: stats.averageRating,
      totalReviews: stats.totalReviews,
      ratingText,
      distributionPercentages
    };
  }

  // Get reviews written by the current user (for client dashboard)
  async getMyReviews(options = {}) {
    try {
      const { 
        page = 1, 
        limit = 10, 
        sortBy = 'createdAt', 
        sortOrder = 'desc' 
      } = options;

      const url = `/reviews/my-reviews?page=${page}&limit=${limit}&sortBy=${sortBy}&sortOrder=${sortOrder}`;
      const response = await api.get(url);
      
      return {
        success: true,
        data: response.data.data,
        pagination: response.data.pagination
      };
    } catch (error) {
      console.error('Error fetching my reviews:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch reviews',
        data: []
      };
    }
  }

  // Get reviews for freelancer's gigs (for freelancer dashboard)
  async getReviewsForFreelancer(options = {}) {
    try {
      const { 
        page = 1, 
        limit = 10, 
        sortBy = 'createdAt', 
        sortOrder = 'desc' 
      } = options;

      const url = `/reviews/freelancer-reviews?page=${page}&limit=${limit}&sortBy=${sortBy}&sortOrder=${sortOrder}`;
      const response = await api.get(url);
      
      return {
        success: true,
        data: response.data.data,
        pagination: response.data.pagination
      };
    } catch (error) {
      console.error('Error fetching freelancer reviews:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch reviews',
        data: []
      };
    }
  }

  // Add freelancer response to a review
  async addFreelancerResponse(reviewId, responseData) {
    try {
      const response = await api.post(`/reviews/${reviewId}/response`, responseData);
      
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      console.error('Error adding freelancer response:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to add response'
      };
    }
  }
}

const reviewService = new ReviewService();
export default reviewService;
