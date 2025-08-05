import api from './api';

class PaymentService {
  /**
   * Create Stripe checkout session
   */
  static async createCheckoutSession(gigId, requirements = '') {
    try {
      const response = await api.post('/payments/create-checkout-session', {
        gigId,
        requirements
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to create checkout session');
    }
  }

  /**
   * Handle successful payment
   */
  static async handlePaymentSuccess(sessionId) {
    try {
      const response = await api.get(`/payments/success?session_id=${sessionId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to process payment success');
    }
  }

  /**
   * Get user orders
   */
  static async getOrders(params = {}) {
    try {
      const queryParams = new URLSearchParams(params).toString();
      const response = await api.get(`/payments/orders?${queryParams}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch orders');
    }
  }

  /**
   * Get specific order
   */
  static async getOrder(orderId) {
    try {
      const response = await api.get(`/payments/orders/${orderId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch order');
    }
  }

  /**
   * Request refund
   */
  static async requestRefund(orderId, reason = '') {
    try {
      const response = await api.post(`/payments/refund/${orderId}`, {
        reason
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to process refund');
    }
  }
}

export default PaymentService;
