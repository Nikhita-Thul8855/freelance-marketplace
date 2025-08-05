const express = require('express');
const {
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
} = require('../controllers/adminController');
const { protectAdmin } = require('../middleware/adminAuth');

const router = express.Router();

// All routes are protected and require admin privileges
router.use(protectAdmin);

// Dashboard
router.get('/stats', getDashboardStats);

// User management
router.get('/users', getUsers);
router.put('/users/:userId', updateUser);
router.delete('/users/:userId', deleteUser);

// Gig management
router.get('/gigs', getGigs);
router.put('/gigs/:gigId', updateGig);
router.delete('/gigs/:gigId', deleteGig);

// Review management
router.get('/reviews', getReviews);
router.put('/reviews/:reviewId', updateReview);
router.delete('/reviews/:reviewId', deleteReview);

module.exports = router;
