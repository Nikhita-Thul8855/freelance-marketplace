const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const User = require('../models/User');

// @desc    Send a message
// @route   POST /api/messages
// @access  Private
const sendMessage = async (req, res) => {
  try {
    console.log('\n=== SEND MESSAGE REQUEST ===');
    console.log('User:', req.user ? `${req.user.email} (ID: ${req.user.id})` : 'No user found');
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    
    const { receiverId, content, type = 'text', relatedOrder, relatedGig } = req.body;
    const senderId = req.user.id;

    // Validate input
    if (!receiverId || !content) {
      console.log('❌ Validation failed - missing required fields');
      console.log('receiverId:', receiverId);
      console.log('content:', content);
      return res.status(400).json({
        success: false,
        message: 'Receiver ID and content are required'
      });
    }

    // Check if receiver exists
    console.log('🔍 Looking for receiver with ID:', receiverId);
    const receiver = await User.findById(receiverId);
    if (!receiver) {
      console.log('❌ Receiver not found');
      return res.status(404).json({
        success: false,
        message: 'Receiver not found'
      });
    }
    console.log('✅ Receiver found:', receiver.email);

    // Don't allow sending messages to self
    if (senderId === receiverId) {
      console.log('❌ Attempted to send message to self');
      return res.status(400).json({
        success: false,
        message: 'Cannot send message to yourself'
      });
    }

    console.log('🚀 Creating message...');
    // Create message
    const message = new Message({
      sender: senderId,
      receiver: receiverId,
      content,
      type,
      relatedOrder,
      relatedGig
    });

    await message.save();
    console.log('✅ Message saved with ID:', message._id);

    // Find or create conversation
    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, receiverId] }
    });

    if (!conversation) {
      conversation = new Conversation({
        participants: [senderId, receiverId],
        unreadCount: new Map([
          [senderId, 0],
          [receiverId, 1]
        ])
      });
    } else {
      // Update unread count for receiver
      const currentUnread = conversation.unreadCount.get(receiverId) || 0;
      conversation.unreadCount.set(receiverId, currentUnread + 1);
    }

    conversation.lastMessage = message._id;
    await conversation.save();

    // Populate message for response
    const populatedMessage = await Message.findById(message._id)
      .populate('sender', 'name email avatar')
      .populate('receiver', 'name email avatar');

    res.status(201).json({
      success: true,
      data: populatedMessage
    });

  } catch (error) {
    console.error('\n❌ SEND MESSAGE ERROR:');
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error('Request body:', req.body);
    console.error('User:', req.user ? `${req.user.email} (ID: ${req.user.id})` : 'No user');
    
    res.status(500).json({
      success: false,
      message: 'Failed to send message',
      error: error.message
    });
  }
};

// @desc    Get messages in a conversation
// @route   GET /api/messages/conversation/:userId
// @access  Private
const getConversationMessages = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.id;
    const { page = 1, limit = 20 } = req.query;

    // Find messages between current user and specified user
    const messages = await Message.find({
      $or: [
        { sender: currentUserId, receiver: userId },
        { sender: userId, receiver: currentUserId }
      ]
    })
    .populate('sender', 'name email avatar')
    .populate('receiver', 'name email avatar')
    .sort({ createdAt: -1 })
    .limit(parseInt(limit))
    .skip((parseInt(page) - 1) * parseInt(limit));

    // Mark messages as read
    await Message.updateMany(
      { sender: userId, receiver: currentUserId, status: { $ne: 'read' } },
      { status: 'read', readAt: new Date() }
    );

    // Update conversation unread count
    await Conversation.updateOne(
      { participants: { $all: [currentUserId, userId] } },
      { $set: { [`unreadCount.${currentUserId}`]: 0 } }
    );

    const total = await Message.countDocuments({
      $or: [
        { sender: currentUserId, receiver: userId },
        { sender: userId, receiver: currentUserId }
      ]
    });

    res.json({
      success: true,
      data: messages.reverse(), // Reverse to show oldest first
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('Get conversation messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch messages',
      error: error.message
    });
  }
};

// @desc    Get all conversations for current user
// @route   GET /api/messages/conversations
// @access  Private
const getConversations = async (req, res) => {
  try {
    const userId = req.user.id;

    const conversations = await Conversation.find({
      participants: userId
    })
    .populate('participants', 'name email avatar')
    .populate('lastMessage')
    .sort({ updatedAt: -1 });

    // Transform conversations to include other participant info
    const transformedConversations = conversations.map(conv => {
      const otherParticipant = conv.participants.find(p => p._id.toString() !== userId);
      return {
        _id: conv._id,
        otherParticipant,
        lastMessage: conv.lastMessage,
        unreadCount: conv.unreadCount.get(userId) || 0,
        updatedAt: conv.updatedAt
      };
    });

    res.json({
      success: true,
      data: transformedConversations
    });

  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch conversations',
      error: error.message
    });
  }
};

// @desc    Mark message as read
// @route   PUT /api/messages/:messageId/read
// @access  Private
const markAsRead = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user.id;

    const message = await Message.findOne({
      messageId,
      receiver: userId
    });

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    message.status = 'read';
    message.readAt = new Date();
    await message.save();

    res.json({
      success: true,
      message: 'Message marked as read'
    });

  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark message as read',
      error: error.message
    });
  }
};

// @desc    Delete a message
// @route   DELETE /api/messages/:messageId
// @access  Private
const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user.id;

    const message = await Message.findOne({
      messageId,
      sender: userId
    });

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found or you are not authorized to delete it'
      });
    }

    await message.deleteOne();

    res.json({
      success: true,
      message: 'Message deleted successfully'
    });

  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete message',
      error: error.message
    });
  }
};

module.exports = {
  sendMessage,
  getConversationMessages,
  getConversations,
  markAsRead,
  deleteMessage
};
