import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useGigs } from '../context/GigContext';
import { useAuth } from '../context/AuthContext';
import { getImageUrl } from '../utils/imageUtils';
import orderService from '../services/orderService';
import reviewService from '../services/reviewService';
import RealTimeChat from './RealTimeChat';
import { ReviewList } from './ReviewTest';

const GigDetails = () => {
  const { id } = useParams();
  const { currentGig, loading, error, getGig } = useGigs();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState(0);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [purchaseLoading, setPurchaseLoading] = useState(false);
  const [requirements, setRequirements] = useState('');
  const [showRealTimeChat, setShowRealTimeChat] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [reviewStats, setReviewStats] = useState(null);
  const [reviewsLoading, setReviewsLoading] = useState(false);

  useEffect(() => {
    if (id) {
      getGig(id);
      fetchReviews(id);
    }
  }, [id, getGig]);

  // Fetch reviews for this gig
  const fetchReviews = async (gigId) => {
    setReviewsLoading(true);
    try {
      const result = await reviewService.getGigReviews(gigId, {
        page: 1,
        limit: 50, // Show more reviews on detail page
        sortBy: 'createdAt',
        sortOrder: 'desc'
      });

      if (result.success) {
        setReviews(result.data);
        setReviewStats(result.stats);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setReviewsLoading(false);
    }
  };

  // Handle purchase action
  const handlePurchase = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    if (user?.role !== 'client') {
      alert('Only clients can purchase gigs. Please register as a client.');
      return;
    }
    
    setShowPurchaseModal(true);
  };

  // Confirm purchase
  const confirmPurchase = async () => {
    setPurchaseLoading(true);
    
    try {
      // Create order directly using our order service
      const response = await orderService.createOrder(currentGig._id, requirements);
      
      if (response.success) {
        // Close modal
        setShowPurchaseModal(false);
        // Show success message
        alert('Order created successfully! You can track its progress in your dashboard.');
        // Navigate to orders page
        navigate('/orders');
      } else {
        throw new Error(response.error || 'Failed to create order');
      }
    } catch (error) {
      console.error('Purchase error:', error);
      alert(`Order creation failed: ${error.message}`);
    } finally {
      setPurchaseLoading(false);
    }
  };

  // Contact seller
  const handleContact = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    // Navigate to messages page with seller ID
    navigate(`/messages?user=${currentGig.seller._id}`);
  };

  // Open real-time chat
  const handleRealTimeChat = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    setShowRealTimeChat(true);
  };

  // Close real-time chat
  const closeRealTimeChat = () => {
    setShowRealTimeChat(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl">Loading gig details...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Error</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <Link
            to="/gigs"
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Back to Gigs
          </Link>
        </div>
      </div>
    );
  }

  if (!currentGig) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Gig Not Found</h2>
          <Link
            to="/gigs"
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Back to Gigs
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Breadcrumb */}
          <div className="mb-6">
            <nav className="flex" aria-label="Breadcrumb">
              <ol className="flex items-center space-x-4">
                <li>
                  <Link to="/" className="text-gray-400 hover:text-gray-500">
                    Home
                  </Link>
                </li>
                <li>
                  <div className="flex items-center">
                    <svg className="flex-shrink-0 h-5 w-5 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                    <Link to="/gigs" className="ml-4 text-gray-400 hover:text-gray-500">
                      All Gigs
                    </Link>
                  </div>
                </li>
                <li>
                  <div className="flex items-center">
                    <svg className="flex-shrink-0 h-5 w-5 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="ml-4 text-gray-500 truncate">{currentGig?.title}</span>
                  </div>
                </li>
              </ol>
            </nav>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Images and Description */}
            <div className="lg:col-span-2">
              {/* Images Gallery */}
              <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-8">
                {currentGig.images && currentGig.images.length > 0 ? (
                  <div>
                    {/* Main Image */}
                    <div className="relative">
                      <img
                        className="w-full h-96 object-cover"
                        src={getImageUrl(currentGig.images[selectedImage])}
                        alt={currentGig.title}
                      />
                      {currentGig.images.length > 1 && (
                        <div className="absolute bottom-4 right-4 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
                          {selectedImage + 1} / {currentGig.images.length}
                        </div>
                      )}
                    </div>
                    
                    {/* Thumbnail Gallery */}
                    {currentGig.images.length > 1 && (
                      <div className="p-4 bg-gray-50 border-t">
                        <div className="flex space-x-2 overflow-x-auto">
                          {currentGig.images.map((image, index) => (
                            <button
                              key={index}
                              onClick={() => setSelectedImage(index)}
                              className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                                selectedImage === index ? 'border-blue-500' : 'border-gray-200 hover:border-gray-300'
                              }`}
                            >
                              <img
                                className="w-full h-full object-cover"
                                src={getImageUrl(image)}
                                alt={`${currentGig.title} ${index + 1}`}
                              />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="w-full h-96 bg-gray-200 flex items-center justify-center">
                    <div className="text-center">
                      <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p className="mt-2 text-gray-500">No images available</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Description Section */}
              <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">About This Gig</h2>
                <div className="prose max-w-none">
                  <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                    {currentGig.description}
                  </p>
                </div>
              </div>

              {/* Tags Section */}
              {currentGig.tags && currentGig.tags.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Skills & Expertise</h3>
                  <div className="flex flex-wrap gap-2">
                    {currentGig.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Reviews Section */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Reviews ({reviewStats?.totalReviews || 0})
                  </h3>
                  {reviewStats?.averageRating && (
                    <div className="flex items-center space-x-2">
                      <div className="flex text-yellow-400">
                        {[...Array(5)].map((_, i) => (
                          <svg key={i} className={`w-5 h-5 fill-current ${i < Math.floor(reviewStats.averageRating) ? 'text-yellow-400' : 'text-gray-300'}`} viewBox="0 0 20 20">
                            <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
                          </svg>
                        ))}
                      </div>
                      <span className="text-lg font-semibold text-gray-900">
                        {reviewStats.averageRating.toFixed(1)}
                      </span>
                    </div>
                  )}
                </div>

                {reviewsLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="animate-pulse flex space-x-4">
                        <div className="rounded-full bg-gray-200 h-10 w-10"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : reviews.length > 0 ? (
                  <div className="space-y-6">
                    {reviews.map((review) => (
                      <div key={review._id} className="border-b border-gray-200 pb-6 last:border-b-0 last:pb-0">
                        <div className="flex items-start space-x-4">
                          <div className="flex-shrink-0">
                            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium">
                              {review.userId?.name?.charAt(0)?.toUpperCase() || 'U'}
                            </div>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <div>
                                <h4 className="font-medium text-gray-900">
                                  {review.userId?.name || 'Anonymous'}
                                </h4>
                                <div className="flex items-center space-x-2 mt-1">
                                  <div className="flex text-yellow-400">
                                    {[...Array(5)].map((_, i) => (
                                      <svg key={i} className={`w-4 h-4 fill-current ${i < review.rating ? 'text-yellow-400' : 'text-gray-300'}`} viewBox="0 0 20 20">
                                        <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
                                      </svg>
                                    ))}
                                  </div>
                                  <span className="text-sm text-gray-600">
                                    {new Date(review.createdAt).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                              {review.isVerified && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  Verified Purchase
                                </span>
                              )}
                            </div>
                            <p className="text-gray-700 leading-relaxed">
                              {review.comment}
                            </p>
                            
                            {/* Freelancer Response */}
                            {review.freelancerResponse?.comment && (
                              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                                <div className="flex items-center space-x-2 mb-2">
                                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                                    <span className="text-white text-xs font-bold">
                                      {currentGig.seller?.name?.charAt(0)?.toUpperCase() || 'S'}
                                    </span>
                                  </div>
                                  <span className="text-sm font-medium text-blue-800">
                                    Response from {currentGig.seller?.name || 'Seller'}
                                  </span>
                                  <span className="text-xs text-blue-600">
                                    {new Date(review.freelancerResponse.respondedAt).toLocaleDateString()}
                                  </span>
                                </div>
                                <p className="text-blue-700">
                                  {review.freelancerResponse.comment}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.959 8.959 0 01-4.906-1.471c-.883-.484-1.922-.924-3.1-.924H3.1A1.1 1.1 0 012 16.5V9.1A1.1 1.1 0 013.1 8h1.994c1.178 0 2.217-.44 3.1-.924A8.959 8.959 0 0112 4c4.418 0 8 3.582 8 8z" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No reviews yet</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Be the first to review this gig after completing an order.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column - Seller Info and Purchase */}
            <div className="lg:col-span-1">
              {/* Gig Summary Card */}
              <div className="bg-white rounded-lg shadow-sm p-6 mb-6 sticky top-6">
                <div className="border-b border-gray-200 pb-4 mb-4">
                  <h1 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
                    {currentGig.title}
                  </h1>
                  <div className="flex items-center justify-between">
                    <span className="text-3xl font-bold text-green-600">
                      ${currentGig.price}
                    </span>
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                      {currentGig.category}
                    </span>
                  </div>
                </div>

                {/* Key Details */}
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Delivery Time:</span>
                    <span className="font-medium">{currentGig.deliveryTime} days</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Rating:</span>
                    <div className="flex items-center">
                      <div className="flex text-yellow-400">
                        {[...Array(5)].map((_, i) => (
                          <svg key={i} className={`w-4 h-4 fill-current ${i < Math.floor(reviewStats?.averageRating || 0) ? 'text-yellow-400' : 'text-gray-300'}`} viewBox="0 0 20 20">
                            <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
                          </svg>
                        ))}
                      </div>
                      <span className="ml-1 text-sm text-gray-600">
                        {reviewStats?.averageRating ? reviewStats.averageRating.toFixed(1) : 'No rating'} ({reviewStats?.totalReviews || 0} reviews)
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Orders:</span>
                    <span className="font-medium">{currentGig.totalSales || 0} completed</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  {user?.role === 'client' || !isAuthenticated ? (
                    <button
                      onClick={handlePurchase}
                      className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center"
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 1.5M7 13l-1.5-1.5m0 0L4 15m0 0l1.5 1.5M4 15l1.5-1.5" />
                      </svg>
                      {!isAuthenticated ? 'Purchase Now' : 'Hire Freelancer'}
                    </button>
                  ) : (
                    <div className="bg-gray-100 text-gray-600 py-3 px-6 rounded-lg text-center">
                      Only clients can purchase gigs
                    </div>
                  )}
                  
                  <button
                    onClick={handleContact}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors duration-200 mb-2"
                  >
                    Contact Seller
                  </button>
                  
                  <button
                    onClick={handleRealTimeChat}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Real-Time Chat
                  </button>
                </div>
              </div>

              {/* Seller Info Card */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">About the Seller</h3>
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-lg">
                        {currentGig.seller?.name?.charAt(0)?.toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{currentGig.seller?.name}</h4>
                    <p className="text-gray-600 text-sm">{currentGig.seller?.email}</p>
                    <div className="mt-2 flex items-center text-sm text-gray-600">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                      </svg>
                      Member since 2024
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Purchase Modal */}
      {showPurchaseModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Confirm Purchase</h3>
              <button
                onClick={() => setShowPurchaseModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="mb-6">
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <h4 className="font-medium text-gray-900 mb-2">{currentGig.title}</h4>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total:</span>
                  <span className="text-2xl font-bold text-green-600">${currentGig.price}</span>
                </div>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-sm text-gray-600">Delivery:</span>
                  <span className="text-sm text-gray-600">{currentGig.deliveryTime} days</span>
                </div>
              </div>
              
              {/* Requirements */}
              <div className="mb-4">
                <label htmlFor="requirements" className="block text-sm font-medium text-gray-700 mb-2">
                  Project Requirements (Optional)
                </label>
                <textarea
                  id="requirements"
                  value={requirements}
                  onChange={(e) => setRequirements(e.target.value)}
                  placeholder="Describe any specific requirements for your project..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows="3"
                  maxLength="1000"
                />
                <p className="text-xs text-gray-500 mt-1">{requirements.length}/1000 characters</p>
              </div>
              
              <p className="text-sm text-gray-600">
                By clicking "Proceed to Payment", you will be redirected to Stripe to complete your purchase securely. 
                The freelancer will be notified once payment is confirmed.
              </p>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => setShowPurchaseModal(false)}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmPurchase}
                disabled={purchaseLoading}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {purchaseLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  'Proceed to Payment'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Real-Time Chat Overlay */}
      {showRealTimeChat && currentGig?.seller && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-md">
            <RealTimeChat
              otherUser={currentGig.seller}
              onClose={closeRealTimeChat}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default GigDetails;
