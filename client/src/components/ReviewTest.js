import React, { useState, useEffect } from 'react';
import reviewService from '../services/reviewService';
import { useAuth } from '../context/AuthContext';

const ReviewForm = ({ gigId, orderId, onReviewSubmitted }) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { user } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const reviewData = {
        rating,
        comment,
        gigId,
        orderId
      };

      // Validate data
      const validation = reviewService.validateReviewData(reviewData);
      if (!validation.isValid) {
        setError(validation.errors.join(', '));
        setLoading(false);
        return;
      }

      const result = await reviewService.createReview(reviewData);
      
      if (result.success) {
        alert('Review submitted successfully!');
        setComment('');
        setRating(5);
        if (onReviewSubmitted) {
          onReviewSubmitted(result.data);
        }
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Failed to submit review');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-xl font-semibold mb-4">Write a Review</h3>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Rating */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Rating
          </label>
          <div className="flex space-x-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className={`text-2xl ${
                  star <= rating ? 'text-yellow-400' : 'text-gray-300'
                } hover:text-yellow-400 transition-colors`}
              >
                ★
              </button>
            ))}
          </div>
          <p className="text-sm text-gray-600 mt-1">
            {rating} star{rating !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Comment */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Review Comment
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your experience with this gig..."
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
            minLength={10}
            maxLength={1000}
          />
          <p className="text-sm text-gray-600 mt-1">
            {comment.length}/1000 characters (minimum 10)
          </p>
        </div>

        <button
          type="submit"
          disabled={loading || comment.length < 10}
          className={`w-full py-2 px-4 rounded-md font-medium ${
            loading || comment.length < 10
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
          } text-white transition-colors`}
        >
          {loading ? 'Submitting...' : 'Submit Review'}
        </button>
      </form>
    </div>
  );
};

const ReviewList = ({ gigId, refreshTrigger }) => {
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchReviews();
  }, [gigId, refreshTrigger]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const result = await reviewService.getGigReviews(gigId, {
        page: 1,
        limit: 10,
        sortBy: 'createdAt',
        sortOrder: 'desc'
      });

      if (result.success) {
        setReviews(result.data);
        setStats(result.stats);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Failed to fetch reviews');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="text-red-600">Error: {error}</div>
      </div>
    );
  }

  const summary = reviewService.getReviewSummary(stats);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-xl font-semibold mb-4">Reviews</h3>
      
      {/* Review Summary */}
      {summary.totalReviews > 0 && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-4">
            <div className="text-3xl font-bold text-yellow-600">
              {summary.averageRating.toFixed(1)}
            </div>
            <div>
              <div className="flex text-yellow-400">
                {reviewService.formatRating(summary.averageRating)}
              </div>
              <div className="text-sm text-gray-600">
                {summary.totalReviews} review{summary.totalReviews !== 1 ? 's' : ''} • {summary.ratingText}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No reviews yet. Be the first to review this gig!
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review._id} className="border-b border-gray-200 pb-4 last:border-b-0">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium">
                    {review.userId?.name?.charAt(0) || 'U'}
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="font-medium text-gray-900">
                      {review.userId?.name || 'Anonymous'}
                    </span>
                    <div className="flex text-yellow-400">
                      {reviewService.formatRating(review.rating)}
                    </div>
                    <span className="text-sm text-gray-500">
                      {reviewService.formatReviewDate(review.createdAt)}
                    </span>
                  </div>
                  <p className="text-gray-700">{review.comment}</p>
                  
                  {/* Freelancer Response */}
                  {review.freelancerResponse?.comment && (
                    <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                      <div className="text-sm font-medium text-blue-800 mb-1">
                        Response from freelancer:
                      </div>
                      <p className="text-blue-700">{review.freelancerResponse.comment}</p>
                      <div className="text-xs text-blue-600 mt-1">
                        {reviewService.formatReviewDate(review.freelancerResponse.respondedAt)}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const ReviewTest = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  // Test data - replace with actual gig and order IDs
  const testGigId = '6872a705c1dc0ea1fbd3c6a4';
  const testOrderId = '687e7a963c586be45517c63f';

  const handleReviewSubmitted = (newReview) => {
    console.log('New review submitted:', newReview);
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Review System Test</h1>
      
      <div className="grid md:grid-cols-2 gap-6">
        <ReviewForm
          gigId={testGigId}
          orderId={testOrderId}
          onReviewSubmitted={handleReviewSubmitted}
        />
        <ReviewList
          gigId={testGigId}
          refreshTrigger={refreshTrigger}
        />
      </div>
    </div>
  );
};

export default ReviewTest;
export { ReviewForm, ReviewList };
