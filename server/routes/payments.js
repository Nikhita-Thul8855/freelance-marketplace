const express = require('express');
const router = express.Router();
const StripeService = require('../services/stripeService');
const Order = require('../models/Order');
const { protect } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

/**
 * @route   POST /api/payments/create-checkout-session
 * @desc    Create Stripe checkout session for gig purchase
 * @access  Private (Client only)
 */
router.post('/create-checkout-session', 
  protect,
  [
    body('gigId').isMongoId().withMessage('Valid gig ID is required'),
    body('requirements').optional().isLength({ max: 1000 }).withMessage('Requirements must be less than 1000 characters')
  ],
  async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { gigId, requirements = '' } = req.body;
    const clientId = req.user.id;

    console.log('=== CREATE CHECKOUT SESSION ===');
    console.log('Gig ID:', gigId);
    console.log('Client ID:', clientId);
    console.log('Requirements:', requirements);
    console.log('User role:', req.user.role);

    // Ensure user is a client
    if (req.user.role !== 'client') {
      return res.status(403).json({
        success: false,
        message: 'Only clients can purchase gigs'
      });
    }

    console.log('Calling StripeService.createCheckoutSession...');
    // Create checkout session
    const sessionData = await StripeService.createCheckoutSession(gigId, clientId, requirements);
    console.log('Session data received:', sessionData);

    res.json({
      success: true,
      data: sessionData
    });
  } catch (error) {
    console.error('Create checkout session error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create checkout session'
    });
  }
});

/**
 * @route   GET /api/payments/success
 * @desc    Handle successful payment
 * @access  Private
 */
router.get('/success', protect, async (req, res) => {
  try {
    const { session_id } = req.query;
    
    if (!session_id) {
      return res.status(400).json({
        success: false,
        message: 'Session ID is required'
      });
    }

    // Handle successful payment
    const order = await StripeService.handleSuccessfulPayment(session_id);

    res.json({
      success: true,
      data: {
        order: {
          id: order.orderId,
          status: order.status,
          amount: order.amount,
          gigTitle: order.gigSnapshot.title,
          freelancerName: order.freelancer.name,
          deliveryDate: order.deliveryDate
        }
      }
    });
  } catch (error) {
    console.error('Payment success error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to process successful payment'
    });
  }
});

/**
 * @route   GET /api/payments/orders
 * @desc    Get user's orders
 * @access  Private
 */
router.get('/orders', protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const { status, page = 1, limit = 10 } = req.query;

    // Build query based on user role
    let query = {};
    if (req.user.role === 'client') {
      query.client = userId;
    } else if (req.user.role === 'freelancer') {
      query.freelancer = userId;
    }

    // Add status filter if provided
    if (status) {
      query.status = status;
    }

    // Pagination
    const skip = (page - 1) * limit;

    const orders = await Order.find(query)
      .populate('gig', 'title images category')
      .populate('client', 'name email')
      .populate('freelancer', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Order.countDocuments(query);

    res.json({
      success: true,
      data: {
        orders,
        pagination: {
          current: parseInt(page),
          total: Math.ceil(total / limit),
          count: orders.length,
          totalOrders: total
        }
      }
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders'
    });
  }
});

/**
 * @route   GET /api/payments/orders/:orderId
 * @desc    Get specific order details
 * @access  Private
 */
router.get('/orders/:orderId', protect, async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user.id;

    const order = await Order.findOne({ orderId })
      .populate('gig')
      .populate('client', 'name email')
      .populate('freelancer', 'name email');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if user has access to this order
    const hasAccess = order.client._id.toString() === userId || 
                     order.freelancer._id.toString() === userId;

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      data: { order }
    });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch order'
    });
  }
});

/**
 * @route   POST /api/payments/refund/:orderId
 * @desc    Request refund for an order
 * @access  Private
 */
router.post('/refund/:orderId', [
  protect,
  body('reason').optional().isLength({ max: 500 }).withMessage('Reason must be less than 500 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { orderId } = req.params;
    const { reason = 'requested_by_customer' } = req.body;
    const userId = req.user.id;

    // Find order and check ownership
    const order = await Order.findOne({ orderId });
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Only client can request refund
    if (order.client.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Only the client can request a refund'
      });
    }

    // Check if order is eligible for refund
    if (order.status === 'refunded') {
      return res.status(400).json({
        success: false,
        message: 'Order already refunded'
      });
    }

    if (order.paymentStatus !== 'paid') {
      return res.status(400).json({
        success: false,
        message: 'Order payment not completed'
      });
    }

    // Process refund
    const refund = await StripeService.createRefund(orderId, reason);

    res.json({
      success: true,
      data: { refund },
      message: 'Refund processed successfully'
    });
  } catch (error) {
    console.error('Refund error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to process refund'
    });
  }
});

module.exports = router;
