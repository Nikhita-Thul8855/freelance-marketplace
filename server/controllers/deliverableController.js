const Deliverable = require('../models/Deliverable');
const Order = require('../models/Order');
const fs = require('fs');
const path = require('path');

// @desc    Upload deliverable files
// @route   POST /api/deliverables
// @access  Private (Freelancer only)
const uploadDeliverable = async (req, res) => {
  try {
    const { orderId, title, description } = req.body;
    const freelancerId = req.user.id;
    const files = req.files;

    // Validate required fields
    if (!orderId || !title || !files || files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Order ID, title, and at least one file are required'
      });
    }

    // Find and validate order
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if user is the freelancer for this order
    if (order.freelancer.toString() !== freelancerId) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to upload deliverables for this order'
      });
    }

    // Check if order is in the right status
    if (!['paid', 'in_progress'].includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: 'Can only upload deliverables for paid or in-progress orders'
      });
    }

    // Check if there's already a deliverable for this order
    const existingDeliverable = await Deliverable.findOne({ order: orderId });
    let version = 1;
    let previousVersion = null;

    if (existingDeliverable) {
      version = existingDeliverable.version + 1;
      previousVersion = existingDeliverable._id;
    }

    // Process uploaded files
    const processedFiles = files.map(file => ({
      filename: file.filename,
      originalName: file.originalname,
      path: file.path,
      size: file.size,
      mimetype: file.mimetype,
      uploadedAt: new Date()
    }));

    // Create deliverable
    const deliverable = new Deliverable({
      order: orderId,
      freelancer: freelancerId,
      title,
      description,
      files: processedFiles,
      version,
      previousVersion
    });

    await deliverable.save();

    // Update order status to completed if it's the first deliverable
    if (version === 1) {
      order.status = 'completed';
      order.completedAt = new Date();
      await order.save();
    }

    // Populate deliverable for response
    const populatedDeliverable = await Deliverable.findById(deliverable._id)
      .populate('order', 'orderId gigSnapshot')
      .populate('freelancer', 'name email');

    res.status(201).json({
      success: true,
      message: 'Deliverable uploaded successfully',
      data: populatedDeliverable
    });

  } catch (error) {
    console.error('Upload deliverable error:', error);
    
    // Clean up uploaded files on error
    if (req.files) {
      req.files.forEach(file => {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to upload deliverable',
      error: error.message
    });
  }
};

// @desc    Get deliverables for an order
// @route   GET /api/deliverables/order/:orderId
// @access  Private
const getOrderDeliverables = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user.id;

    // Find order and check access
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if user has access to this order
    if (order.client.toString() !== userId && order.freelancer.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Get deliverables for this order
    const deliverables = await Deliverable.find({ order: orderId })
      .populate('freelancer', 'name email')
      .sort({ version: -1 });

    res.json({
      success: true,
      data: deliverables
    });

  } catch (error) {
    console.error('Get order deliverables error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch deliverables',
      error: error.message
    });
  }
};

// @desc    Download deliverable file
// @route   GET /api/deliverables/:deliverableId/download/:filename
// @access  Private
const downloadDeliverableFile = async (req, res) => {
  try {
    const { deliverableId, filename } = req.params;
    const userId = req.user.id;

    // Find deliverable
    const deliverable = await Deliverable.findOne({ deliverableId })
      .populate('order');

    if (!deliverable) {
      return res.status(404).json({
        success: false,
        message: 'Deliverable not found'
      });
    }

    // Check access
    const order = deliverable.order;
    if (order.client.toString() !== userId && order.freelancer.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Find the file
    const file = deliverable.files.find(f => f.filename === filename);
    if (!file) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    // Check if file exists on disk
    if (!fs.existsSync(file.path)) {
      return res.status(404).json({
        success: false,
        message: 'File not found on server'
      });
    }

    // Set appropriate headers for download
    res.setHeader('Content-Disposition', `attachment; filename="${file.originalName}"`);
    res.setHeader('Content-Type', file.mimetype);
    res.setHeader('Content-Length', file.size);

    // Stream the file
    const fileStream = fs.createReadStream(file.path);
    fileStream.pipe(res);

  } catch (error) {
    console.error('Download file error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to download file',
      error: error.message
    });
  }
};

// @desc    Approve deliverable (client only)
// @route   PUT /api/deliverables/:deliverableId/approve
// @access  Private (Client only)
const approveDeliverable = async (req, res) => {
  try {
    const { deliverableId } = req.params;
    const { feedback, rating } = req.body;
    const userId = req.user.id;

    // Find deliverable
    const deliverable = await Deliverable.findOne({ deliverableId })
      .populate('order');

    if (!deliverable) {
      return res.status(404).json({
        success: false,
        message: 'Deliverable not found'
      });
    }

    // Check if user is the client
    if (deliverable.order.client.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Only the client can approve deliverables'
      });
    }

    // Update deliverable
    deliverable.status = 'approved';
    deliverable.approvedAt = new Date();
    
    if (feedback || rating) {
      deliverable.clientFeedback = {
        message: feedback,
        rating: rating ? parseInt(rating) : undefined,
        feedbackDate: new Date()
      };
    }

    await deliverable.save();

    res.json({
      success: true,
      message: 'Deliverable approved successfully',
      data: deliverable
    });

  } catch (error) {
    console.error('Approve deliverable error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to approve deliverable',
      error: error.message
    });
  }
};

// @desc    Request revision (client only)
// @route   PUT /api/deliverables/:deliverableId/revision
// @access  Private (Client only)
const requestRevision = async (req, res) => {
  try {
    const { deliverableId } = req.params;
    const { reason, dueDate } = req.body;
    const userId = req.user.id;

    if (!reason) {
      return res.status(400).json({
        success: false,
        message: 'Revision reason is required'
      });
    }

    // Find deliverable
    const deliverable = await Deliverable.findOne({ deliverableId })
      .populate('order');

    if (!deliverable) {
      return res.status(404).json({
        success: false,
        message: 'Deliverable not found'
      });
    }

    // Check if user is the client
    if (deliverable.order.client.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Only the client can request revisions'
      });
    }

    // Update deliverable
    deliverable.status = 'revision_requested';
    deliverable.revisionRequested = {
      reason,
      requestedAt: new Date(),
      dueDate: dueDate ? new Date(dueDate) : new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) // 3 days default
    };

    await deliverable.save();

    // Update order status back to in_progress
    await Order.findByIdAndUpdate(deliverable.order._id, {
      status: 'in_progress'
    });

    res.json({
      success: true,
      message: 'Revision requested successfully',
      data: deliverable
    });

  } catch (error) {
    console.error('Request revision error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to request revision',
      error: error.message
    });
  }
};

// @desc    Get deliverables for freelancer
// @route   GET /api/deliverables/my-deliverables
// @access  Private (Freelancer only)
const getMyDeliverables = async (req, res) => {
  try {
    const freelancerId = req.user.id;
    const { page = 1, limit = 10, status } = req.query;

    // Build query
    let query = { freelancer: freelancerId };
    if (status) {
      query.status = status;
    }

    // Get deliverables with pagination
    const deliverables = await Deliverable.find(query)
      .populate('order', 'orderId gigSnapshot')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Deliverable.countDocuments(query);

    res.json({
      success: true,
      data: deliverables,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('Get my deliverables error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch deliverables',
      error: error.message
    });
  }
};

module.exports = {
  uploadDeliverable,
  getOrderDeliverables,
  downloadDeliverableFile,
  approveDeliverable,
  requestRevision,
  getMyDeliverables
};
