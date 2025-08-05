const express = require('express');
const router = express.Router();
const {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
  getOrderStats
} = require('../controllers/orderController');
const { protect } = require('../middleware/auth');

// @route   POST /api/orders
// @desc    Create a new order
// @access  Private
router.post('/', (req, res, next) => {
  console.log('=== ORDER ROUTE HIT ===');
  console.log('Method:', req.method);
  console.log('URL:', req.url);
  console.log('Headers:', req.headers);
  console.log('Body:', req.body);
  next();
}, protect, createOrder);

// @route   GET /api/orders
// @desc    Get orders by user role (client sees their purchases, freelancer sees their work)
// @access  Private
router.get('/', protect, getOrders);

// @route   GET /api/orders/stats
// @desc    Get order statistics for dashboard
// @access  Private
router.get('/stats', protect, getOrderStats);

// @route   GET /api/orders/:id
// @desc    Get single order by ID
// @access  Private
router.get('/:id', protect, getOrderById);

// @route   PUT /api/orders/:id/status
// @desc    Update order status
// @access  Private
router.put('/:id/status', protect, updateOrderStatus);

module.exports = router;
