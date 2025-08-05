import api from './api';

class OrderService {
  // Create a new order
  async createOrder(gigId, requirements = '', notes = '') {
    try {
      const response = await api.post('/orders', {
        gigId,
        requirements,
        notes
      });
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to create order'
      };
    }
  }

  // Get orders for current user
  async getOrders(params = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.status) queryParams.append('status', params.status);
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.limit) queryParams.append('limit', params.limit.toString());

      const response = await api.get(`/orders?${queryParams.toString()}`);
      return {
        success: true,
        data: response.data.data,
        pagination: response.data.pagination
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch orders'
      };
    }
  }

  // Get single order by ID
  async getOrderById(orderId) {
    try {
      const response = await api.get(`/orders/${orderId}`);
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch order'
      };
    }
  }

  // Update order status
  async updateOrderStatus(orderId, status) {
    try {
      const response = await api.put(`/orders/${orderId}/status`, { status });
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to update order status'
      };
    }
  }

  // Get order statistics
  async getOrderStats() {
    try {
      const response = await api.get('/orders/stats');
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch order statistics'
      };
    }
  }

  // Helper method to get status badge color
  getStatusColor(status) {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      paid: 'bg-blue-100 text-blue-800',
      in_progress: 'bg-orange-100 text-orange-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      refunded: 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  }

  // Helper method to get status display text
  getStatusText(status) {
    const texts = {
      pending: 'Pending',
      paid: 'Paid',
      in_progress: 'In Progress',
      completed: 'Completed',
      cancelled: 'Cancelled',
      refunded: 'Refunded'
    };
    return texts[status] || status;
  }

  // Helper method to check if status can be updated by user role
  canUpdateStatus(order, userRole, newStatus) {
    const currentStatus = order.status;
    
    if (userRole === 'freelancer') {
      // Freelancer can mark paid orders as in_progress
      if (currentStatus === 'paid' && newStatus === 'in_progress') return true;
      // Freelancer can mark in_progress orders as completed
      if (currentStatus === 'in_progress' && newStatus === 'completed') return true;
      // Freelancer can cancel orders
      if (newStatus === 'cancelled') return true;
    }
    
    if (userRole === 'client') {
      // Client can cancel orders
      if (newStatus === 'cancelled') return true;
    }
    
    return false;
  }
}

export default new OrderService();
