import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import orderService from '../services/orderService';
import reviewService from '../services/reviewService';
import messageService from '../services/messageService';

const ClientDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  // State management
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    orderStats: null,
    recentOrders: [],
    myReviews: [],
    favoriteGigs: [],
    unreadMessages: 0
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [orderStats, recentOrders, myReviews, unreadMessages] = await Promise.all([
        orderService.getOrderStats(),
        orderService.getOrders({ limit: 5 }),
        reviewService.getMyReviews({ limit: 5 }),
        messageService.getUnreadCount()
      ]);

      setDashboardData({
        orderStats: orderStats.success ? orderStats.data : null,
        recentOrders: recentOrders.success ? recentOrders.data : [],
        myReviews: myReviews.success ? myReviews.data : [],
        favoriteGigs: [], // Will implement favorites later
        unreadMessages: unreadMessages.success ? unreadMessages.data : 0
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const getUpcomingDeliveries = () => {
    return dashboardData.recentOrders.filter(order => 
      order.status === 'in_progress' && order.deliveryDate
    );
  };

  const { orderStats, recentOrders, myReviews, unreadMessages } = dashboardData;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Client Dashboard
              </h1>
              <p className="text-gray-600">
                Welcome back, {user?.name}!
              </p>
            </div>
            <div className="flex space-x-4">
              <Link
                to="/gigs"
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              >
                Browse Services
              </Link>
              <Link
                to="/messages"
                className="relative bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
              >
                Messages
                {unreadMessages > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {unreadMessages}
                  </span>
                )}
              </Link>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Total Spent */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Total Spent
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {loading ? '...' : formatPrice(orderStats?.totals?.totalRevenue || 0)}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            {/* Total Orders */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Total Orders
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {loading ? '...' : orderStats?.totals?.totalOrders || 0}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            {/* Active Orders */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Active Orders
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {loading ? '...' : ((orderStats?.statusBreakdown?.paid?.count || 0) + (orderStats?.statusBreakdown?.in_progress?.count || 0))}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            {/* Reviews Given */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Reviews Given
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {loading ? '...' : myReviews.length}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Recent Orders */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    Recent Orders
                  </h3>
                  <Link
                    to="/orders"
                    className="text-sm text-blue-600 hover:text-blue-500"
                  >
                    View all →
                  </Link>
                </div>
                
                {loading ? (
                  <div className="animate-pulse space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex space-x-4">
                        <div className="h-12 w-12 bg-gray-200 rounded-lg"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : recentOrders.length > 0 ? (
                  <div className="space-y-4">
                    {recentOrders.map((order) => (
                      <div key={order._id} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                        <div className="flex-shrink-0">
                          <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <span className="text-blue-600 font-bold text-sm">
                              {order.gig?.title?.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {order.gig?.title}
                            </p>
                            <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${orderService.getStatusColor(order.status)}`}>
                              {orderService.getStatusText(order.status)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between mt-1">
                            <p className="text-sm text-gray-500">
                              Freelancer: {order.freelancer?.name}
                            </p>
                            <p className="text-sm font-semibold text-blue-600">
                              {formatPrice(order.amount)}
                            </p>
                          </div>
                          <p className="text-xs text-gray-400 mt-1">
                            Ordered: {new Date(order.createdAt).toLocaleDateString()}
                            {order.deliveryDate && (
                              <span className="ml-2">
                                • Due: {new Date(order.deliveryDate).toLocaleDateString()}
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                      </svg>
                    </div>
                    <p className="text-gray-500">No orders yet.</p>
                    <p className="text-gray-400 text-sm mt-2">
                      Start by browsing available services and placing your first order.
                    </p>
                    <Link
                      to="/gigs"
                      className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                    >
                      Browse Services
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Upcoming Deliveries */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Upcoming Deliveries
                </h3>
                
                {loading ? (
                  <div className="animate-pulse space-y-4">
                    {[1, 2].map((i) => (
                      <div key={i} className="flex space-x-4">
                        <div className="h-10 w-10 bg-gray-200 rounded-lg"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : getUpcomingDeliveries().length > 0 ? (
                  <div className="space-y-4">
                    {getUpcomingDeliveries().map((order) => (
                      <div key={order._id} className="flex items-center space-x-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 bg-yellow-500 rounded-lg flex items-center justify-center">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {order.gig?.title}
                          </p>
                          <p className="text-sm text-gray-500">
                            Due: {new Date(order.deliveryDate).toLocaleDateString()}
                          </p>
                        </div>
                        <Link
                          to={`/orders/${order._id}`}
                          className="text-blue-600 hover:text-blue-500 text-sm font-medium"
                        >
                          View
                        </Link>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No upcoming deliveries.</p>
                  </div>
                )}
              </div>
            </div>

            {/* My Reviews */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    My Reviews
                  </h3>
                </div>
                
                {loading ? (
                  <div className="animate-pulse space-y-4">
                    {[1, 2].map((i) => (
                      <div key={i} className="space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                        <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                      </div>
                    ))}
                  </div>
                ) : myReviews.length > 0 ? (
                  <div className="space-y-4">
                    {myReviews.map((review) => (
                      <div key={review._id} className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <div className="flex text-yellow-400">
                              {[...Array(5)].map((_, i) => (
                                <svg key={i} className={`w-4 h-4 fill-current ${i < review.rating ? 'text-yellow-400' : 'text-gray-300'}`} viewBox="0 0 20 20">
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                                </svg>
                              ))}
                            </div>
                            <span className="text-sm text-gray-600">
                              for {review.gig?.title}
                            </span>
                          </div>
                          <span className="text-xs text-gray-400">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700">
                          {review.comment}
                        </p>
                        {review.freelancerResponse?.comment && (
                          <div className="mt-2 p-2 bg-blue-50 rounded">
                            <p className="text-xs text-blue-600 font-medium">Freelancer Response:</p>
                            <p className="text-sm text-blue-700">
                              {review.freelancerResponse.comment}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No reviews given yet.</p>
                    <p className="text-gray-400 text-sm mt-2">
                      Complete orders to leave reviews for freelancers.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Quick Actions
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <Link
                    to="/gigs"
                    className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center mb-2">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <span className="text-sm font-medium text-gray-900">Browse Services</span>
                  </Link>

                  <Link
                    to="/orders"
                    className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center mb-2">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                      </svg>
                    </div>
                    <span className="text-sm font-medium text-gray-900">My Orders</span>
                  </Link>

                  <Link
                    to="/messages"
                    className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors relative"
                  >
                    <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center mb-2">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.959 8.959 0 01-4.906-1.471c-.883-.484-1.922-.924-3.1-.924H3.1A1.1 1.1 0 012 16.5V9.1A1.1 1.1 0 013.1 8h1.994c1.178 0 2.217-.44 3.1-.924A8.959 8.959 0 0112 4c4.418 0 8 3.582 8 8z" />
                      </svg>
                    </div>
                    <span className="text-sm font-medium text-gray-900">Messages</span>
                    {unreadMessages > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {unreadMessages}
                      </span>
                    )}
                  </Link>

                  <Link
                    to="/profile"
                    className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="w-8 h-8 bg-gray-500 rounded-md flex items-center justify-center mb-2">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <span className="text-sm font-medium text-gray-900">Profile</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ClientDashboard;
