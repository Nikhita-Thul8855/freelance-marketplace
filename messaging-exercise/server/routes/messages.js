const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  sendMessage,
  getConversation,
  getConversations,
  markAsRead,
  deleteMessage
} = require('../controllers/messageController');

// @route   POST /api/messages
// @desc    Send a new message
// @access  Private
router.post('/', protect, sendMessage);

// @route   GET /api/messages/conversations
// @desc    Get all conversations for current user
// @access  Private
router.get('/conversations', protect, getConversations);

// @route   GET /api/messages/conversation/:userId
// @desc    Get conversation between current user and specified user
// @access  Private
router.get('/conversation/:userId', protect, getConversation);

// @route   PUT /api/messages/:messageId/read
// @desc    Mark message as read
// @access  Private
router.put('/:messageId/read', protect, markAsRead);

// @route   DELETE /api/messages/:messageId
// @desc    Delete a message (soft delete)
// @access  Private
router.delete('/:messageId', protect, deleteMessage);

module.exports = router;
