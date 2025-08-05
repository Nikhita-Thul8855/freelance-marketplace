import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import orderService from '../services/orderService';
import reviewService from '../services/reviewService';
import { ReviewForm } from './ReviewTest';

const Orders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderReviews, setOrderReviews] = useState({});

  useEffect(() => {
    fetchOrders();
  }, [filter, currentPage]);

  useEffect(() => {
    // Check for existing reviews when orders are loaded
    if (orders.length > 0 && user?.role === 'client') {
      checkExistingReviews();
    }
  }, [orders, user]);

  const checkExistingReviews = async () => {
    const reviews = {};
    for (const order of orders) {
      if (order.status === 'completed') {
        try {
          const result = await reviewService.getGigReviews(order.gig._id);
          if (result.success) {
            // Check if current user has already reviewed this order
            const userReview = result.data.reviews.find(
              review => review.orderId === order._id
            );
            if (userReview) {
              reviews[order._id] = userReview;
            }
          }
        } catch (error) {
          console.error('Error checking reviews:', error);
        }
      }
    }
    setOrderReviews(reviews);
  };

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);

    const params = {
      page: currentPage,
      limit: 10
    };

    if (filter !== 'all') {
      params.status = filter;
    }

    const result = await orderService.getOrders(params);

    if (result.success) {
      setOrders(result.data);
      setPagination(result.pagination);
    } else {
      setError(result.error);
    }

    setLoading(false);
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    const result = await orderService.updateOrderStatus(orderId, newStatus);
    
    if (result.success) {
      // Refresh the orders list
      fetchOrders();
    } else {
      setError(result.error);
    }
  };

  const openReviewModal = (order) => {
    setSelectedOrder(order);
    setShowReviewModal(true);
  };

  const closeReviewModal = () => {
    setShowReviewModal(false);
    setSelectedOrder(null);
  };

  const handleReviewSubmitted = (newReview) => {
    // Update the orderReviews state
    setOrderReviews(prev => ({
      ...prev,
      [selectedOrder._id]: newReview
    }));
    closeReviewModal();
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const getAvailableActions = (order) => {
    const actions = [];
    
    if (user?.role === 'freelancer') {
      if (order.status === 'paid') {
        actions.push({
          label: 'Start Work',
          status: 'in_progress',
          className: 'bg-blue-600 hover:bg-blue-700 text-white',
          action: 'status'
        });
      } else if (order.status === 'in_progress') {
        actions.push({
          label: 'Mark Complete',
          status: 'completed',
          className: 'bg-green-600 hover:bg-green-700 text-white',
          action: 'status'
        });
      }
      
      if (order.status !== 'completed' && order.status !== 'cancelled') {
        actions.push({
          label: 'Cancel',
          status: 'cancelled',
          className: 'bg-red-600 hover:bg-red-700 text-white',
          action: 'status'
        });
      }
    } else if (user?.role === 'client') {
      if (order.status !== 'completed' && order.status !== 'cancelled') {
        actions.push({
          label: 'Cancel',
          status: 'cancelled',
          className: 'bg-red-600 hover:bg-red-700 text-white',
          action: 'status'
        });
      }
      
      // Add review option for completed orders
      if (order.status === 'completed') {
        const hasReview = orderReviews[order._id];
        if (hasReview) {
          actions.push({
            label: 'View Review',
            className: 'bg-green-600 hover:bg-green-700 text-white',
            action: 'view-review'
          });
        } else {
          actions.push({
            label: 'Leave Review',
            className: 'bg-blue-600 hover:bg-blue-700 text-white',
            action: 'review'
          });
        }
      }
    }
    
    return actions;
  };

  if (loading && orders.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="md:flex md:items-center md:justify-between">
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl">
                  {user?.role === 'client' ? 'My Orders' : 'My Work'}
                </h1>
                <p className="mt-1 text-sm text-gray-500">
                  {user?.role === 'client' 
                    ? 'Track your hired services and orders' 
                    : 'Manage your active projects and deliverables'
                  }
                </p>
              </div>
              <div className="mt-4 flex md:mt-0 md:ml-4">
                <Link
                  to="/dashboard"
                  className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Back to Dashboard
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex flex-wrap gap-2">
            {['all', 'pending', 'paid', 'in_progress', 'completed', 'cancelled'].map((status) => (
              <button
                key={status}
                onClick={() => {
                  setFilter(status);
                  setCurrentPage(1);
                }}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  filter === status
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {status === 'all' ? 'All Orders' : orderService.getStatusText(status)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {orders.length === 0 && !loading ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Orders Found</h3>
            <p className="text-gray-500 mb-4">
              {user?.role === 'client' 
                ? "You haven't placed any orders yet. Start by browsing available services!"
                : "You haven't received any orders yet. Make sure your gigs are visible and attractive!"
              }
            </p>
            <Link
              to="/gigs"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              {user?.role === 'client' ? 'Browse Services' : 'View All Gigs'}
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order._id} className="bg-white rounded-lg shadow overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="text-lg font-medium text-gray-900">
                          {order.gig?.title}
                        </h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${orderService.getStatusColor(order.status)}`}>
                          {orderService.getStatusText(order.status)}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">Order ID:</span>
                          <p className="font-mono">{order.orderId}</p>
                        </div>
                        <div>
                          <span className="font-medium">
                            {user?.role === 'client' ? 'Freelancer:' : 'Client:'}
                          </span>
                          <p>{user?.role === 'client' ? order.freelancer?.name : order.client?.name}</p>
                        </div>
                        <div>
                          <span className="font-medium">Amount:</span>
                          <p className="text-lg font-semibold text-green-600">
                            {formatPrice(order.amount)}
                          </p>
                        </div>
                        <div>
                          <span className="font-medium">Created:</span>
                          <p>{formatDate(order.createdAt)}</p>
                        </div>
                      </div>

                      {order.deliveryDate && (
                        <div className="mt-3 text-sm text-gray-600">
                          <span className="font-medium">Expected Delivery:</span>
                          <span className="ml-2">{formatDate(order.deliveryDate)}</span>
                        </div>
                      )}

                      {order.requirements && (
                        <div className="mt-3">
                          <span className="text-sm font-medium text-gray-700">Requirements:</span>
                          <p className="text-sm text-gray-600 mt-1">{order.requirements}</p>
                        </div>
                      )}
                    </div>

                    <div className="ml-6 flex flex-col space-y-2">
                      {getAvailableActions(order).map((action, index) => (
                        <button
                          key={index}
                          onClick={() => {
                            if (action.action === 'status') {
                              handleStatusUpdate(order._id, action.status);
                            } else if (action.action === 'review') {
                              openReviewModal(order);
                            } else if (action.action === 'view-review') {
                              // Could open a modal to view the review
                              alert('Review already submitted!');
                            }
                          }}
                          className={`px-4 py-2 rounded-md text-sm font-medium ${action.className}`}
                        >
                          {action.label}
                        </button>
                      ))}
                      <Link
                        to={`/orders/${order._id}`}
                        className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 text-center"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.pages > 1 && (
          <div className="mt-6 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
              {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
              {pagination.total} results
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={pagination.page === 1}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="px-3 py-2 text-sm text-gray-700">
                Page {pagination.page} of {pagination.pages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, pagination.pages))}
                disabled={pagination.page === pagination.pages}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Review Modal */}
      {showReviewModal && selectedOrder && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Leave a Review
                </h3>
                <button
                  onClick={closeReviewModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="mb-4 p-3 bg-gray-50 rounded-md">
                <p className="text-sm font-medium text-gray-900">{selectedOrder.gig?.title}</p>
                <p className="text-sm text-gray-600">
                  Freelancer: {selectedOrder.freelancer?.name}
                </p>
              </div>

              <ReviewForm
                gigId={selectedOrder.gig?._id}
                orderId={selectedOrder._id}
                onReviewSubmitted={handleReviewSubmitted}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
