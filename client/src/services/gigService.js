import api from './api';

class GigService {
  // Get freelancer's own gigs
  async getMyGigs(params = {}) {
    try {
      const response = await api.get('/api/gigs/my-gigs', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching my gigs:', error);
      throw error;
    }
  }

  // Get gig analytics for freelancer
  async getGigAnalytics(gigId) {
    try {
      const response = await api.get(`/api/gigs/${gigId}/analytics`);
      return response.data;
    } catch (error) {
      console.error('Error fetching gig analytics:', error);
      throw error;
    }
  }

  // Get earnings summary for freelancer
  async getEarnings(params = {}) {
    try {
      const response = await api.get('/api/gigs/earnings', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching earnings:', error);
      throw error;
    }
  }

  // Get earnings statistics
  async getEarningsStats() {
    try {
      const response = await api.get('/api/gigs/earnings/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching earnings stats:', error);
      throw error;
    }
  }

  // Update gig status (pause/activate)
  async updateGigStatus(gigId, status) {
    try {
      const response = await api.patch(`/api/gigs/${gigId}/status`, { status });
      return response.data;
    } catch (error) {
      console.error('Error updating gig status:', error);
      throw error;
    }
  }

  // Get gig performance metrics
  async getGigPerformance(gigId) {
    try {
      const response = await api.get(`/api/gigs/${gigId}/performance`);
      return response.data;
    } catch (error) {
      console.error('Error fetching gig performance:', error);
      throw error;
    }
  }

  // Delete gig
  async deleteGig(gigId) {
    try {
      const response = await api.delete(`/api/gigs/${gigId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting gig:', error);
      throw error;
    }
  }

  // Get gig orders for freelancer
  async getGigOrders(gigId, params = {}) {
    try {
      const response = await api.get(`/api/gigs/${gigId}/orders`, { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching gig orders:', error);
      throw error;
    }
  }

  // Format currency
  formatPrice(price) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  }

  // Get status color for UI
  getStatusColor(status) {
    const statusColors = {
      active: 'bg-green-100 text-green-800',
      paused: 'bg-yellow-100 text-yellow-800',
      inactive: 'bg-gray-100 text-gray-800',
      pending: 'bg-blue-100 text-blue-800'
    };
    return statusColors[status] || 'bg-gray-100 text-gray-800';
  }

  // Get status text for display
  getStatusText(status) {
    const statusTexts = {
      active: 'Active',
      paused: 'Paused',
      inactive: 'Inactive',
      pending: 'Pending Approval'
    };
    return statusTexts[status] || status;
  }
}

export default new GigService();
