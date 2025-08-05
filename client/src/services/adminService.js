import api from './api';

class AdminService {
  // Dashboard statistics
  async getDashboardStats() {
    try {
      const response = await api.get('/admin/stats');
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch dashboard stats'
      };
    }
  }

  // User management
  async getUsers(params = {}) {
    try {
      const { page = 1, limit = 10, search = '', role = '' } = params;
      const response = await api.get(`/admin/users?page=${page}&limit=${limit}&search=${search}&role=${role}`);
      return {
        success: true,
        data: response.data.data,
        pagination: response.data.pagination
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch users'
      };
    }
  }

  async updateUser(userId, updateData) {
    try {
      const response = await api.put(`/admin/users/${userId}`, updateData);
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to update user'
      };
    }
  }

  async deleteUser(userId) {
    try {
      const response = await api.delete(`/admin/users/${userId}`);
      return {
        success: true,
        message: response.data.message
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to delete user'
      };
    }
  }

  // Gig management
  async getGigs(params = {}) {
    try {
      const { page = 1, limit = 10, search = '', category = '', status = '' } = params;
      const response = await api.get(`/admin/gigs?page=${page}&limit=${limit}&search=${search}&category=${category}&status=${status}`);
      return {
        success: true,
        data: response.data.data,
        pagination: response.data.pagination
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch gigs'
      };
    }
  }

  async updateGig(gigId, updateData) {
    try {
      const response = await api.put(`/admin/gigs/${gigId}`, updateData);
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to update gig'
      };
    }
  }

  async deleteGig(gigId) {
    try {
      const response = await api.delete(`/admin/gigs/${gigId}`);
      return {
        success: true,
        message: response.data.message
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to delete gig'
      };
    }
  }

  // Review management
  async getReviews(params = {}) {
    try {
      const { page = 1, limit = 10, status = '' } = params;
      const response = await api.get(`/admin/reviews?page=${page}&limit=${limit}&status=${status}`);
      return {
        success: true,
        data: response.data.data,
        pagination: response.data.pagination
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch reviews'
      };
    }
  }

  async updateReview(reviewId, updateData) {
    try {
      const response = await api.put(`/admin/reviews/${reviewId}`, updateData);
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to update review'
      };
    }
  }

  async deleteReview(reviewId) {
    try {
      const response = await api.delete(`/admin/reviews/${reviewId}`);
      return {
        success: true,
        message: response.data.message
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to delete review'
      };
    }
  }
}

export default new AdminService();
