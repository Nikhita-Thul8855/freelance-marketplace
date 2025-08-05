const User = require('../models/User');
const Gig = require('../models/Gig');
const Order = require('../models/Order');
const Review = require('../models/Review');
const Message = require('../models/Message');

// @desc    Get dashboard statistics
// @route   GET /api/admin/stats
// @access  Private (Admin only)
const getDashboardStats = async (req, res) => {
  try {
    // Get counts
    const [userCount, gigCount, orderCount, reviewCount, messageCount] = await Promise.all([
      User.countDocuments(),
      Gig.countDocuments(),
      Order.countDocuments(),
      Review.countDocuments(),
      Message.countDocuments()
    ]);

    // Get user distribution
    const userRoles = await User.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get order status distribution
    const orderStatuses = await Order.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get recent activity (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentActivity = await Promise.all([
      User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
      Gig.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
      Order.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
      Review.countDocuments({ createdAt: { $gte: thirtyDaysAgo } })
    ]);

    // Calculate revenue (sum of completed orders)
    const revenueData = await Order.aggregate([
      {
        $match: { status: 'completed' }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$amount' },
          completedOrders: { $sum: 1 }
        }
      }
    ]);

    const revenue = revenueData.length > 0 ? revenueData[0] : { totalRevenue: 0, completedOrders: 0 };

    res.json({
      success: true,
      data: {
        overview: {
          totalUsers: userCount,
          totalGigs: gigCount,
          totalOrders: orderCount,
          totalReviews: reviewCount,
          totalMessages: messageCount,
          totalRevenue: revenue.totalRevenue,
          completedOrders: revenue.completedOrders
        },
        userDistribution: userRoles,
        orderDistribution: orderStatuses,
        recentActivity: {
          newUsers: recentActivity[0],
          newGigs: recentActivity[1],
          newOrders: recentActivity[2],
          newReviews: recentActivity[3]
        }
      }
    });

  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard statistics',
      error: error.message
    });
  }
};

// @desc    Get all users with pagination
// @route   GET /api/admin/users
// @access  Private (Admin only)
const getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', role = '' } = req.query;

    // Build query
    let query = {};
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (role && role !== 'all') {
      query.role = role;
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get users
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    // Get total count
    const total = await User.countDocuments(query);

    res.json({
      success: true,
      data: users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users',
      error: error.message
    });
  }
};

// @desc    Update user status or role
// @route   PUT /api/admin/users/:userId
// @access  Private (Admin only)
const updateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role, isActive } = req.body;

    const updateData = {};
    if (role) updateData.role = role;
    if (typeof isActive !== 'undefined') updateData.isActive = isActive;

    const user = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'User updated successfully',
      data: user
    });

  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user',
      error: error.message
    });
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:userId
// @access  Private (Admin only)
const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    // Prevent deleting admin users
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.role === 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Cannot delete admin users'
      });
    }

    await User.findByIdAndDelete(userId);

    res.json({
      success: true,
      message: 'User deleted successfully'
    });

  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete user',
      error: error.message
    });
  }
};

// @desc    Get all gigs with pagination
// @route   GET /api/admin/gigs
// @access  Private (Admin only)
const getGigs = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', category = '', status = '' } = req.query;

    // Build query
    let query = {};
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (category && category !== 'all') {
      query.category = category;
    }

    if (status && status !== 'all') {
      query.status = status;
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get gigs
    const gigs = await Gig.find(query)
      .populate('seller', 'name email')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    // Get total count
    const total = await Gig.countDocuments(query);

    res.json({
      success: true,
      data: gigs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get gigs error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch gigs',
      error: error.message
    });
  }
};

// @desc    Update gig status
// @route   PUT /api/admin/gigs/:gigId
// @access  Private (Admin only)
const updateGig = async (req, res) => {
  try {
    const { gigId } = req.params;
    const { status } = req.body;

    const gig = await Gig.findByIdAndUpdate(
      gigId,
      { status },
      { new: true, runValidators: true }
    ).populate('seller', 'name email');

    if (!gig) {
      return res.status(404).json({
        success: false,
        message: 'Gig not found'
      });
    }

    res.json({
      success: true,
      message: 'Gig updated successfully',
      data: gig
    });

  } catch (error) {
    console.error('Update gig error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update gig',
      error: error.message
    });
  }
};

// @desc    Delete gig
// @route   DELETE /api/admin/gigs/:gigId
// @access  Private (Admin only)
const deleteGig = async (req, res) => {
  try {
    const { gigId } = req.params;

    const gig = await Gig.findByIdAndDelete(gigId);

    if (!gig) {
      return res.status(404).json({
        success: false,
        message: 'Gig not found'
      });
    }

    res.json({
      success: true,
      message: 'Gig deleted successfully'
    });

  } catch (error) {
    console.error('Delete gig error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete gig',
      error: error.message
    });
  }
};

// @desc    Get all reviews with pagination
// @route   GET /api/admin/reviews
// @access  Private (Admin only)
const getReviews = async (req, res) => {
  try {
    const { page = 1, limit = 10, status = '' } = req.query;

    // Build query
    let query = {};
    
    if (status && status !== 'all') {
      query.status = status;
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get reviews
    const reviews = await Review.find(query)
      .populate('userId', 'name email')
      .populate('gigId', 'title')
      .populate('orderId', 'orderId')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    // Get total count
    const total = await Review.countDocuments(query);

    res.json({
      success: true,
      data: reviews,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reviews',
      error: error.message
    });
  }
};

// @desc    Update review status
// @route   PUT /api/admin/reviews/:reviewId
// @access  Private (Admin only)
const updateReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { status } = req.body;

    const review = await Review.findByIdAndUpdate(
      reviewId,
      { status },
      { new: true, runValidators: true }
    ).populate('userId', 'name email')
     .populate('gigId', 'title');

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    res.json({
      success: true,
      message: 'Review updated successfully',
      data: review
    });

  } catch (error) {
    console.error('Update review error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update review',
      error: error.message
    });
  }
};

// @desc    Delete review
// @route   DELETE /api/admin/reviews/:reviewId
// @access  Private (Admin only)
const deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;

    const review = await Review.findByIdAndDelete(reviewId);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    res.json({
      success: true,
      message: 'Review deleted successfully'
    });

  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete review',
      error: error.message
    });
  }
};

module.exports = {
  getDashboardStats,
  getUsers,
  updateUser,
  deleteUser,
  getGigs,
  updateGig,
  deleteGig,
  getReviews,
  updateReview,
  deleteReview
};
