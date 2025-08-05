const express = require('express');
const {
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
} = require('../controllers/gigController');
const { protect } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

const router = express.Router();

// Protected routes that need specific paths should come before generic ones
router.get('/my-gigs', protect, getMyGigs);
router.get('/earnings/stats', protect, getEarningsStats);
router.get('/:id/analytics', protect, getGigAnalytics);
router.get('/:id/performance', protect, getGigPerformance);
router.patch('/:id/status', protect, updateGigStatus);

// Public routes
router.get('/', getGigs);
router.get('/:id', getGig);

// Other protected routes
router.use(protect); // All routes after this middleware are protected

router.post('/', upload.array('images', 5), createGig);
router.put('/:id', upload.array('images', 5), updateGig);
router.delete('/:id', deleteGig);

module.exports = router;
