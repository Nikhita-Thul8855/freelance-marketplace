import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import orderService from '../services/orderService';
import deliverableService from '../services/deliverableService';
import messageService from '../services/messageService';

const OrderDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [deliverables, setDeliverables] = useState([]);
  const [loadingDeliverables, setLoadingDeliverables] = useState(false);

  useEffect(() => {
    fetchOrder();
    fetchDeliverables();
  }, [id]);

  const fetchOrder = async () => {
    setLoading(true);
    setError(null);

    const result = await orderService.getOrderById(id);

    if (result.success) {
      setOrder(result.data);
    } else {
      setError(result.error);
    }

    setLoading(false);
  };

  const fetchDeliverables = async () => {
    setLoadingDeliverables(true);
    const result = await deliverableService.getOrderDeliverables(id);
    
    if (result.success) {
      setDeliverables(result.data);
    }
    setLoadingDeliverables(false);
  };

  const handleStatusUpdate = async (newStatus) => {
    setUpdating(true);
    const result = await orderService.updateOrderStatus(id, newStatus);
    
    if (result.success) {
      setOrder(result.data);
    } else {
      setError(result.error);
    }
    setUpdating(false);
  };

  const handleActionClick = (action) => {
    if (action.action === 'upload_deliverable') {
      navigate(`/orders/${id}/upload-deliverable`);
    } else if (action.status) {
      handleStatusUpdate(action.status);
    }
  };

  const handleContactUser = () => {
    const targetUserId = user?.role === 'client' ? order.freelancer._id : order.client._id;
    navigate(`/messages?user=${targetUserId}`);
  };

  const handleDownloadFile = async (deliverableId, filename) => {
    try {
      const response = await deliverableService.downloadFile(deliverableId, filename);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading file:', error);
      alert('Error downloading file. Please try again.');
    }
  };

  const handleApproveDeliverable = async (deliverableId) => {
    try {
      const rating = prompt('Please rate this deliverable (1-5):');
      const feedback = prompt('Please provide feedback (optional):');
      
      if (rating && rating >= 1 && rating <= 5) {
        const result = await deliverableService.approveDeliverable(deliverableId, {
          rating: parseInt(rating),
          message: feedback || ''
        });
        
        if (result.success) {
          fetchDeliverables();
          // Also update order status to completed
          await handleStatusUpdate('completed');
          alert('Deliverable approved successfully!');
        } else {
          setError(result.error);
        }
      }
    } catch (error) {
      console.error('Error approving deliverable:', error);
      alert('Error approving deliverable. Please try again.');
    }
  };

  const handleRequestRevision = async (deliverableId, reason) => {
    try {
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 3); // 3 days from now
      
      const result = await deliverableService.requestRevision(deliverableId, {
        reason,
        dueDate: dueDate.toISOString()
      });
      
      if (result.success) {
        fetchDeliverables();
        fetchOrder(); // Refresh order status
        alert('Revision requested successfully!');
      } else {
        setError(result.error);
      }
    } catch (error) {
      console.error('Error requesting revision:', error);
      alert('Error requesting revision. Please try again.');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
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

  const getAvailableActions = () => {
    if (!order) return [];
    
    const actions = [];
    
    if (user?.role === 'freelancer') {
      if (order.status === 'paid') {
        actions.push({
          label: 'Start Work',
          status: 'in_progress',
          className: 'bg-blue-600 hover:bg-blue-700 text-white',
          icon: '🚀'
        });
      } else if (order.status === 'in_progress') {
        actions.push({
          label: 'Upload Deliverable',
          action: 'upload_deliverable',
          className: 'bg-purple-600 hover:bg-purple-700 text-white',
          icon: '📁'
        });
      }
      
      if (order.status !== 'completed' && order.status !== 'cancelled') {
        actions.push({
          label: 'Cancel Order',
          status: 'cancelled',
          className: 'bg-red-600 hover:bg-red-700 text-white',
          icon: '❌'
        });
      }
    } else if (user?.role === 'client') {
      if (order.status !== 'completed' && order.status !== 'cancelled') {
        actions.push({
          label: 'Cancel Order',
          status: 'cancelled',
          className: 'bg-red-600 hover:bg-red-700 text-white',
          icon: '❌'
        });
      }
    }
    
    return actions;
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: '⏳',
      paid: '💳',
      in_progress: '🔄',
      completed: '✅',
      cancelled: '❌',
      refunded: '💰'
    };
    return icons[status] || '📋';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Order Not Found</h2>
          <p className="text-gray-600 mb-4">{error || 'The order you are looking for does not exist.'}</p>
          <button
            onClick={() => navigate('/orders')}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            Back to Orders
          </button>
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
                <nav className="flex space-x-4 text-sm text-gray-500 mb-4">
                  <Link to="/dashboard" className="hover:text-gray-700">Dashboard</Link>
                  <span>/</span>
                  <Link to="/orders" className="hover:text-gray-700">Orders</Link>
                  <span>/</span>
                  <span className="text-gray-900">{order.orderId}</span>
                </nav>
                <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl">
                  Order Details
                </h1>
                <div className="mt-2 flex items-center space-x-2">
                  <span className="text-2xl">{getStatusIcon(order.status)}</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${orderService.getStatusColor(order.status)}`}>
                    {orderService.getStatusText(order.status)}
                  </span>
                </div>
              </div>
              <div className="mt-4 flex space-x-3 md:mt-0 md:ml-4">
                {getAvailableActions().map((action, index) => (
                  <button
                    key={index}
                    onClick={() => handleActionClick(action)}
                    disabled={updating}
                    className={`px-4 py-2 rounded-md text-sm font-medium ${action.className} disabled:opacity-50`}
                  >
                    {updating ? '⏳' : action.icon} {action.label}
                  </button>
                ))}
                <button
                  onClick={handleContactUser}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  💬 Message {user?.role === 'client' ? 'Freelancer' : 'Client'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Gig Details */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Service Details</h2>
              </div>
              <div className="p-6">
                <div className="flex items-start space-x-4">
                  {order.gig?.images && order.gig.images.length > 0 && (
                    <img
                      src={`http://localhost:5000${order.gig.images[0]}`}
                      alt={order.gig.title}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                  )}
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {order.gig?.title}
                    </h3>
                    <p className="text-gray-600 mb-4">{order.gig?.description}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span className="bg-gray-100 px-2 py-1 rounded">
                        {order.gig?.category}
                      </span>
                      <span>📅 {order.gig?.deliveryTime} days delivery</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Requirements & Notes */}
            {(order.requirements || order.notes) && (
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-medium text-gray-900">Project Details</h2>
                </div>
                <div className="p-6 space-y-4">
                  {order.requirements && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Requirements:</h4>
                      <p className="text-gray-600 bg-gray-50 p-4 rounded-lg">{order.requirements}</p>
                    </div>
                  )}
                  {order.notes && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Additional Notes:</h4>
                      <p className="text-gray-600 bg-gray-50 p-4 rounded-lg">{order.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Deliverables */}
            {deliverables.length > 0 && (
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-medium text-gray-900">Deliverables</h2>
                </div>
                <div className="divide-y divide-gray-200">
                  {deliverables.map((deliverable) => (
                    <div key={deliverable._id} className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <h3 className="text-lg font-medium text-gray-900">
                              {deliverable.title}
                            </h3>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${deliverableService.getStatusColor(deliverable.status)}`}>
                              {deliverableService.getStatusText(deliverable.status)}
                            </span>
                            <span className="text-sm text-gray-500">
                              v{deliverable.version}
                            </span>
                          </div>
                          
                          {deliverable.description && (
                            <p className="mt-2 text-gray-600">{deliverable.description}</p>
                          )}
                          
                          <div className="mt-4">
                            <h4 className="text-sm font-medium text-gray-900 mb-2">Files:</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              {deliverable.files.map((file, index) => (
                                <div key={index} className="flex items-center space-x-3 p-2 border border-gray-200 rounded-md">
                                  <span className="text-2xl">
                                    {deliverableService.getFileTypeIcon(file.mimetype)}
                                  </span>
                                  <div className="flex-1">
                                    <p className="text-sm font-medium text-gray-900">{file.originalName}</p>
                                    <p className="text-xs text-gray-500">
                                      {deliverableService.formatFileSize(file.size)}
                                    </p>
                                  </div>
                                  <button
                                    onClick={() => handleDownloadFile(deliverable.deliverableId, file.filename)}
                                    className="text-blue-600 hover:text-blue-800"
                                  >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                                    </svg>
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                          
                          {deliverable.clientFeedback && (
                            <div className="mt-4 p-4 bg-green-50 rounded-md">
                              <h4 className="text-sm font-medium text-green-900">Client Feedback</h4>
                              <p className="mt-1 text-sm text-green-800">{deliverable.clientFeedback.message}</p>
                              {deliverable.clientFeedback.rating && (
                                <div className="mt-2 flex items-center">
                                  <span className="text-sm text-green-800">Rating: </span>
                                  <div className="ml-2 flex items-center">
                                    {[...Array(5)].map((_, i) => (
                                      <svg key={i} className={`w-4 h-4 ${i < deliverable.clientFeedback.rating ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                      </svg>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                          
                          {deliverable.revisionRequested && (
                            <div className="mt-4 p-4 bg-orange-50 rounded-md">
                              <h4 className="text-sm font-medium text-orange-900">Revision Requested</h4>
                              <p className="mt-1 text-sm text-orange-800">{deliverable.revisionRequested.reason}</p>
                              <p className="mt-1 text-xs text-orange-600">
                                Due: {new Date(deliverable.revisionRequested.dueDate).toLocaleDateString()}
                              </p>
                            </div>
                          )}
                        </div>
                        
                        {/* Actions for client */}
                        {user?.role === 'client' && deliverable.status === 'submitted' && (
                          <div className="ml-6 flex flex-col space-y-2">
                            <button
                              onClick={() => handleApproveDeliverable(deliverable.deliverableId)}
                              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md text-sm font-medium"
                            >
                              ✅ Approve
                            </button>
                            <button
                              onClick={() => {
                                const reason = prompt('Please provide a reason for revision:');
                                if (reason) {
                                  handleRequestRevision(deliverable.deliverableId, reason);
                                }
                              }}
                              className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-md text-sm font-medium"
                            >
                              🔄 Request Revision
                            </button>
                          </div>
                        )}
                      </div>
                      
                      <div className="mt-4 text-sm text-gray-500">
                        Submitted on {new Date(deliverable.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Timeline */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Order Timeline</h2>
              </div>
              <div className="p-6">
                <div className="flow-root">
                  <ul className="-mb-8">
                    <li>
                      <div className="relative pb-8">
                        <div className="relative flex space-x-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500">
                            <span className="text-white text-sm">📋</span>
                          </div>
                          <div className="min-w-0 flex-1">
                            <div>
                              <p className="text-sm text-gray-900">
                                Order created
                              </p>
                              <p className="text-xs text-gray-500">
                                {formatDate(order.createdAt)}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                    
                    {order.status !== 'pending' && (
                      <li>
                        <div className="relative pb-8">
                          <div className="relative flex space-x-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500">
                              <span className="text-white text-sm">💳</span>
                            </div>
                            <div className="min-w-0 flex-1">
                              <div>
                                <p className="text-sm text-gray-900">
                                  Payment processed
                                </p>
                                <p className="text-xs text-gray-500">
                                  {formatDate(order.createdAt)}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </li>
                    )}

                    {order.completedAt && (
                      <li>
                        <div className="relative">
                          <div className="relative flex space-x-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500">
                              <span className="text-white text-sm">✅</span>
                            </div>
                            <div className="min-w-0 flex-1">
                              <div>
                                <p className="text-sm text-gray-900">
                                  Order completed
                                </p>
                                <p className="text-xs text-gray-500">
                                  {formatDate(order.completedAt)}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Order Summary */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Order Summary</h2>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Order ID:</span>
                  <span className="font-mono text-sm">{order.orderId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Amount:</span>
                  <span className="font-semibold text-green-600 text-lg">
                    {formatPrice(order.amount)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment Status:</span>
                  <span className="font-medium capitalize">{order.paymentStatus}</span>
                </div>
                {order.deliveryDate && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Expected Delivery:</span>
                    <span className="font-medium">
                      {formatDate(order.deliveryDate)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Participants */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Participants</h2>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Client</h4>
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">
                        {order.client?.name?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{order.client?.name}</p>
                      <p className="text-xs text-gray-500">{order.client?.email}</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Freelancer</h4>
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">
                        {order.freelancer?.name?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{order.freelancer?.name}</p>
                      <p className="text-xs text-gray-500">{order.freelancer?.email}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
