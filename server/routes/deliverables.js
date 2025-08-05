const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { uploadDeliverables, handleUploadError } = require('../middleware/deliverableUpload');
const {
  uploadDeliverable,
  getOrderDeliverables,
  downloadDeliverableFile,
  approveDeliverable,
  requestRevision,
  getMyDeliverables
} = require('../controllers/deliverableController');

// @route   POST /api/deliverables
// @desc    Upload deliverable files
// @access  Private (Freelancer only)
router.post('/', protect, uploadDeliverables, handleUploadError, uploadDeliverable);

// @route   GET /api/deliverables/my-deliverables
// @desc    Get deliverables for freelancer
// @access  Private (Freelancer only)
router.get('/my-deliverables', protect, getMyDeliverables);

// @route   GET /api/deliverables/order/:orderId
// @desc    Get deliverables for an order
// @access  Private
router.get('/order/:orderId', protect, getOrderDeliverables);

// @route   GET /api/deliverables/:deliverableId/download/:filename
// @desc    Download deliverable file
// @access  Private
router.get('/:deliverableId/download/:filename', protect, downloadDeliverableFile);

// @route   PUT /api/deliverables/:deliverableId/approve
// @desc    Approve deliverable (client only)
// @access  Private (Client only)
router.put('/:deliverableId/approve', protect, approveDeliverable);

// @route   PUT /api/deliverables/:deliverableId/revision
// @desc    Request revision (client only)
// @access  Private (Client only)
router.put('/:deliverableId/revision', protect, requestRevision);

module.exports = router;
