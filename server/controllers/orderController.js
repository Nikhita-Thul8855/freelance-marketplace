const Order = require('../models/Order');
const Gig = require('../models/Gig');
const User = require('../models/User');

// @desc    Create a new order
// @route   POST /api/orders
// @access  Private
const createOrder = async (req, res) => {
  try {
    console.log('=== CREATE ORDER REQUEST ===');
    console.log('User:', req.user);
    console.log('Body:', req.body);
    
    const { gigId, requirements, notes } = req.body;
    const clientId = req.user.id;

    // Validate required fields
    if (!gigId) {
      console.log('Error: Gig ID is missing');
      return res.status(400).json({
        success: false,
        message: 'Gig ID is required'
      });
    }

    console.log('Fetching gig with ID:', gigId);
    // Fetch the gig details
    const gig = await Gig.findById(gigId).populate('seller');
    if (!gig) {
      console.log('Error: Gig not found for ID:', gigId);
      return res.status(404).json({
        success: false,
        message: 'Gig not found'
      });
    }

    console.log('Gig found:', gig.title);
    console.log('Gig seller:', gig.seller._id);
    console.log('Client ID:', clientId);

    // Check if client is trying to order their own gig
    if (gig.seller._id.toString() === clientId) {
      console.log('Error: Client trying to order own gig');
      return res.status(400).json({
        success: false,
        message: 'You cannot order your own gig'
      });
    }

    // Check if client role is valid
    console.log('Fetching client details...');
    const client = await User.findById(clientId);
    console.log('Client found:', client);
    
    if (client.role !== 'client') {
      console.log('Error: User is not a client, role:', client.role);
      return res.status(403).json({
        success: false,
        message: 'Only clients can create orders'
      });
    }

    console.log('Creating gig snapshot...');
    // Create gig snapshot for order history
    const gigSnapshot = {
      title: gig.title,
      description: gig.description,
      price: gig.price,
      category: gig.category,
      deliveryTime: gig.deliveryTime
    };

    console.log('Creating order object...');
    // Create the order
    const order = new Order({
      orderId: `ORD_${Date.now()}_${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      gig: gigId,
      client: clientId,
      freelancer: gig.seller._id,
      amount: gig.price,
      gigSnapshot,
      requirements: requirements || '',
      notes: notes || '',
      // For demo purposes, we'll set some default Stripe values
      stripePaymentIntentId: `pi_demo_${Date.now()}`,
      stripeSessionId: `cs_demo_${Date.now()}`,
      status: 'paid', // Skip payment for demo
      paymentStatus: 'paid'
    });

    console.log('Order object created:', order);
    console.log('Saving order...');
    await order.save();
    console.log('Order saved successfully with ID:', order._id);

    // Populate the order for response
    const populatedOrder = await Order.findById(order._id)
      .populate('gig', 'title description price category')
      .populate('client', 'name email')
      .populate('freelancer', 'name email');

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: populatedOrder
    });

  } catch (error) {
    console.error('=== CREATE ORDER ERROR ===');
    console.error('Error message:', error.message);
    console.error('Error name:', error.name);
    console.error('Error stack:', error.stack);
    if (error.name === 'ValidationError') {
      console.error('Validation errors:', error.errors);
    }
    console.error('Full error object:', error);
    
    res.status(500).json({
      success: false,
      message: 'Failed to create order',
      error: error.message
    });
  }
};

// @desc    Get orders by user role
// @route   GET /api/orders
// @access  Private
const getOrders = async (req, res) => {
  try {
    const userId = req.user.id;
    const { status, page = 1, limit = 10 } = req.query;

    // Get user to determine role
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Build query based on user role
    let query = {};
    if (user.role === 'client') {
      query.client = userId;
    } else if (user.role === 'freelancer') {
      query.freelancer = userId;
    } else {
      return res.status(403).json({
        success: false,
        message: 'Invalid user role'
      });
    }

    // Add status filter if provided
    if (status) {
      query.status = status;
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get orders with pagination
    const orders = await Order.find(query)
      .populate('gig', 'title description price category images')
      .populate('client', 'name email avatar')
      .populate('freelancer', 'name email avatar')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    // Get total count for pagination
    const total = await Order.countDocuments(query);

    res.json({
      success: true,
      data: orders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders',
      error: error.message
    });
  }
};

// @desc    Get single order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const order = await Order.findById(id)
      .populate('gig', 'title description price category images deliveryTime')
      .populate('client', 'name email avatar')
      .populate('freelancer', 'name email avatar');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if user is authorized to view this order
    if (order.client._id.toString() !== userId && order.freelancer._id.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this order'
      });
    }

    res.json({
      success: true,
      data: order
    });

  } catch (error) {
    console.error('Get order by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch order',
      error: error.message
    });
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private
const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user.id;

    // Validate status
    const validStatuses = ['pending', 'paid', 'in_progress', 'completed', 'cancelled', 'refunded'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check authorization based on status update
    let authorized = false;
    if (status === 'in_progress' && order.freelancer.toString() === userId) {
      authorized = true; // Freelancer can mark as in progress
    } else if (status === 'completed' && order.freelancer.toString() === userId) {
      authorized = true; // Freelancer can mark as completed
      order.completedAt = new Date();
    } else if (status === 'cancelled' && (order.client.toString() === userId || order.freelancer.toString() === userId)) {
      authorized = true; // Both can cancel
    }

    if (!authorized) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this order status'
      });
    }

    order.status = status;
    await order.save();

    // Populate the updated order
    const updatedOrder = await Order.findById(order._id)
      .populate('gig', 'title description price category')
      .populate('client', 'name email')
      .populate('freelancer', 'name email');

    res.json({
      success: true,
      message: 'Order status updated successfully',
      data: updatedOrder
    });

  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update order status',
      error: error.message
    });
  }
};

// @desc    Get order statistics for dashboard
// @route   GET /api/orders/stats
// @access  Private
const getOrderStats = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get user to determine role
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Build query based on user role
    let query = {};
    if (user.role === 'client') {
      query.client = userId;
    } else if (user.role === 'freelancer') {
      query.freelancer = userId;
    } else {
      return res.status(403).json({
        success: false,
        message: 'Invalid user role'
      });
    }

    // Get status counts
    const stats = await Order.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' }
        }
      }
    ]);

    // Get total orders and revenue
    const totals = await Order.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: '$amount' }
        }
      }
    ]);

    // Format stats
    const formattedStats = {
      pending: { count: 0, totalAmount: 0 },
      paid: { count: 0, totalAmount: 0 },
      in_progress: { count: 0, totalAmount: 0 },
      completed: { count: 0, totalAmount: 0 },
      cancelled: { count: 0, totalAmount: 0 },
      refunded: { count: 0, totalAmount: 0 }
    };

    stats.forEach(stat => {
      formattedStats[stat._id] = {
        count: stat.count,
        totalAmount: stat.totalAmount
      };
    });

    res.json({
      success: true,
      data: {
        statusBreakdown: formattedStats,
        totals: totals[0] || { totalOrders: 0, totalRevenue: 0 }
      }
    });

  } catch (error) {
    console.error('Get order stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch order statistics',
      error: error.message
    });
  }
};

module.exports = {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
  getOrderStats
};
