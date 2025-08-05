const Gig = require('../models/Gig');
const User = require('../models/User');
const { isCloudinaryConfigured } = require('../middleware/upload');

// @desc    Get all gigs
// @route   GET /api/gigs
// @access  Public
const getGigs = async (req, res) => {
  try {
    const {
      category,
      minPrice,
      maxPrice,
      search,
      sort,
      page = 1,
      limit = 10
    } = req.query;

    let query = { isActive: true };

    // Filter by category
    if (category) {
      query.category = category;
    }

    // Filter by price range
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // Search functionality
    if (search) {
      query.$text = { $search: search };
    }

    // Sort options
    let sortOptions = {};
    if (sort === 'price-low') sortOptions.price = 1;
    else if (sort === 'price-high') sortOptions.price = -1;
    else if (sort === 'rating') sortOptions.rating = -1;
    else if (sort === 'newest') sortOptions.createdAt = -1;
    else sortOptions.createdAt = -1; // Default sort

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const gigs = await Gig.find(query)
      .populate('seller', 'name email')
      .sort(sortOptions)
      .limit(limitNum)
      .skip(skip);

    const total = await Gig.countDocuments(query);

    res.status(200).json({
      success: true,
      count: gigs.length,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      data: gigs
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single gig
// @route   GET /api/gigs/:id
// @access  Public
const getGig = async (req, res) => {
  try {
    console.log('=== GET SINGLE GIG REQUEST ===');
    console.log('Request ID:', req.params.id);
    console.log('Request path:', req.path);
    console.log('Full URL:', req.originalUrl);
    
    // Validate ObjectId format
    const mongoose = require('mongoose');
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      console.log('Invalid ObjectId format:', req.params.id);
      return res.status(400).json({
        success: false,
        message: 'Invalid gig ID format'
      });
    }

    console.log('Searching for gig with ID:', req.params.id);
    const gig = await Gig.findById(req.params.id).populate('seller', 'name email');

    if (!gig) {
      console.log('Gig not found for ID:', req.params.id);
      return res.status(404).json({
        success: false,
        message: 'Gig not found'
      });
    }

    console.log('Gig found successfully:', gig.title);
    res.status(200).json({
      success: true,
      data: gig
    });
  } catch (error) {
    console.error('Error fetching gig:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Create new gig
// @route   POST /api/gigs
// @access  Private (Freelancers only)
const createGig = async (req, res) => {
  try {
    console.log('Creating gig for user:', req.user?.id);
    console.log('Request body:', req.body);
    console.log('Files:', req.files);

    // Check if user is a freelancer
    if (req.user.role !== 'freelancer') {
      return res.status(403).json({
        success: false,
        message: 'Only freelancers can create gigs'
      });
    }

    // Add seller to req.body
    req.body.seller = req.user.id;

    // Handle uploaded images
    if (req.files && req.files.length > 0) {
      if (isCloudinaryConfigured) {
        // Cloudinary URLs
        req.body.images = req.files.map(file => file.path);
      } else {
        // Local file paths
        req.body.images = req.files.map(file => `/uploads/${file.filename}`);
      }
    }

    // Handle tags (convert to array if string)
    if (req.body.tags && typeof req.body.tags === 'string') {
      req.body.tags = [req.body.tags];
    }

    // Convert string values to numbers for FormData submissions
    if (req.body.price) {
      req.body.price = Number(req.body.price);
    }
    if (req.body.deliveryTime) {
      req.body.deliveryTime = Number(req.body.deliveryTime);
    }

    console.log('Final gig data:', req.body);

    const gig = await Gig.create(req.body);

    res.status(201).json({
      success: true,
      data: gig
    });
  } catch (error) {
    console.error('Error creating gig:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update gig
// @route   PUT /api/gigs/:id
// @access  Private (Gig owner only)
const updateGig = async (req, res) => {
  try {
    let gig = await Gig.findById(req.params.id);

    if (!gig) {
      return res.status(404).json({
        success: false,
        message: 'Gig not found'
      });
    }

    // Make sure user is gig owner
    if (gig.seller.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You can only update your own gigs'
      });
    }

    // Handle uploaded images
    if (req.files && req.files.length > 0) {
      if (isCloudinaryConfigured) {
        // Cloudinary URLs
        req.body.images = req.files.map(file => file.path);
      } else {
        // Local file paths
        req.body.images = req.files.map(file => `/uploads/${file.filename}`);
      }
    }

    // Handle tags (convert to array if string)
    if (req.body.tags && typeof req.body.tags === 'string') {
      req.body.tags = [req.body.tags];
    }

    // Convert string values to numbers for FormData submissions
    if (req.body.price) {
      req.body.price = Number(req.body.price);
    }
    if (req.body.deliveryTime) {
      req.body.deliveryTime = Number(req.body.deliveryTime);
    }

    gig = await Gig.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).populate('seller', 'name email');

    res.status(200).json({
      success: true,
      data: gig
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete gig
// @route   DELETE /api/gigs/:id
// @access  Private (Gig owner only)
const deleteGig = async (req, res) => {
  try {
    const gig = await Gig.findById(req.params.id);

    if (!gig) {
      return res.status(404).json({
        success: false,
        message: 'Gig not found'
      });
    }

    // Make sure user is gig owner
    if (gig.seller.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own gigs'
      });
    }

    await gig.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Gig deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get gigs by current user
// @route   GET /api/gigs/my-gigs
// @access  Private (Freelancers only)
const getMyGigs = async (req, res) => {
  try {
    const { limit = 10, page = 1 } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const gigs = await Gig.find({ seller: req.user.id })
      .sort({ createdAt: -1 })
      .limit(limitNum)
      .skip(skip)
      .populate('seller', 'name email')
      .lean();

    // Add order count and rating for each gig
    const gigsWithStats = await Promise.all(gigs.map(async (gig) => {
      const Order = require('../models/Order');
      const Review = require('../models/Review');
      
      const orderCount = await Order.countDocuments({ 
        gig: gig._id, 
        status: { $in: ['completed', 'delivered'] }
      });
      
      const reviews = await Review.find({ gigId: gig._id, status: 'active' });
      const averageRating = reviews.length > 0 
        ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
        : 0;

      return {
        ...gig,
        orderCount,
        rating: Math.round(averageRating * 10) / 10,
        reviewCount: reviews.length
      };
    }));

    res.status(200).json({
      success: true,
      count: gigsWithStats.length,
      data: gigsWithStats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get earnings statistics for freelancer
// @route   GET /api/gigs/earnings/stats
// @access  Private (Freelancers only)
const getEarningsStats = async (req, res) => {
  try {
    const Order = require('../models/Order');
    const Review = require('../models/Review');

    // Get all gigs by this freelancer
    const gigs = await Gig.find({ seller: req.user.id });
    const gigIds = gigs.map(gig => gig._id);

    // Calculate earnings
    const completedOrders = await Order.find({
      gig: { $in: gigIds },
      status: { $in: ['completed', 'delivered'] }
    });

    const totalEarnings = completedOrders.reduce((sum, order) => sum + order.amount, 0);
    const activeGigs = await Gig.countDocuments({ seller: req.user.id, isActive: true });
    const totalOrders = completedOrders.length;

    // Calculate average rating
    const reviews = await Review.find({ gigId: { $in: gigIds }, status: 'active' });
    const averageRating = reviews.length > 0 
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
      : 0;

    // Monthly earnings (last 6 months)
    const monthlyEarnings = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);

      const monthOrders = await Order.find({
        gig: { $in: gigIds },
        status: { $in: ['completed', 'delivered'] },
        createdAt: { $gte: monthStart, $lte: monthEnd }
      });

      const monthEarnings = monthOrders.reduce((sum, order) => sum + order.amount, 0);
      
      monthlyEarnings.push({
        month: date.toLocaleString('default', { month: 'short', year: 'numeric' }),
        earnings: monthEarnings,
        orders: monthOrders.length
      });
    }

    res.status(200).json({
      success: true,
      data: {
        totalEarnings,
        activeGigs,
        totalOrders,
        averageRating: Math.round(averageRating * 10) / 10,
        monthlyEarnings
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get analytics for a specific gig
// @route   GET /api/gigs/:id/analytics
// @access  Private (Gig owner only)
const getGigAnalytics = async (req, res) => {
  try {
    const gig = await Gig.findById(req.params.id);
    
    if (!gig) {
      return res.status(404).json({
        success: false,
        message: 'Gig not found'
      });
    }

    // Check if user owns this gig
    if (gig.seller.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this gig analytics'
      });
    }

    const Order = require('../models/Order');
    const Review = require('../models/Review');

    // Get order statistics
    const orders = await Order.find({ gig: req.params.id });
    const completedOrders = orders.filter(order => ['completed', 'delivered'].includes(order.status));
    const totalRevenue = completedOrders.reduce((sum, order) => sum + order.amount, 0);

    // Get review statistics  
    const reviews = await Review.find({ gigId: req.params.id, status: 'active' });
    const averageRating = reviews.length > 0 
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
      : 0;

    // Views and conversion (mock data - would need tracking implementation)
    const analytics = {
      totalViews: Math.floor(Math.random() * 1000) + 100, // Mock data
      totalOrders: orders.length,
      completedOrders: completedOrders.length,
      totalRevenue,
      averageRating: Math.round(averageRating * 10) / 10,
      totalReviews: reviews.length,
      conversionRate: orders.length > 0 ? (completedOrders.length / orders.length * 100).toFixed(1) : 0
    };

    res.status(200).json({
      success: true,
      data: analytics
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get performance metrics for a gig
// @route   GET /api/gigs/:id/performance
// @access  Private (Gig owner only)
const getGigPerformance = async (req, res) => {
  try {
    const gig = await Gig.findById(req.params.id);
    
    if (!gig) {
      return res.status(404).json({
        success: false,
        message: 'Gig not found'
      });
    }

    // Check if user owns this gig
    if (gig.seller.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this gig performance'
      });
    }

    const Order = require('../models/Order');
    
    // Performance metrics over last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentOrders = await Order.find({
      gig: req.params.id,
      createdAt: { $gte: thirtyDaysAgo }
    });

    const completedRecentOrders = recentOrders.filter(order => 
      ['completed', 'delivered'].includes(order.status)
    );

    const performance = {
      ordersLast30Days: recentOrders.length,
      completedLast30Days: completedRecentOrders.length,
      revenueLast30Days: completedRecentOrders.reduce((sum, order) => sum + order.amount, 0),
      averageOrderValue: completedRecentOrders.length > 0 
        ? completedRecentOrders.reduce((sum, order) => sum + order.amount, 0) / completedRecentOrders.length
        : 0,
      responseTime: '< 2 hours', // Mock data
      deliveryTime: `${gig.deliveryTime} days`
    };

    res.status(200).json({
      success: true,
      data: performance
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update gig status (active/paused)
// @route   PATCH /api/gigs/:id/status
// @access  Private (Gig owner only)
const updateGigStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['active', 'paused', 'inactive'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be active, paused, or inactive'
      });
    }

    const gig = await Gig.findById(req.params.id);
    
    if (!gig) {
      return res.status(404).json({
        success: false,
        message: 'Gig not found'
      });
    }

    // Check if user owns this gig
    if (gig.seller.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this gig'
      });
    }

    // Update status
    if (status === 'active') {
      gig.isActive = true;
    } else {
      gig.isActive = false;
    }

    gig.status = status;
    await gig.save();

    res.status(200).json({
      success: true,
      data: gig
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  getGigs,
  getGig,
  createGig,
  updateGig,
  deleteGig,
  getMyGigs,
  getEarningsStats,
  getGigAnalytics,
  getGigPerformance,
  updateGigStatus
};
