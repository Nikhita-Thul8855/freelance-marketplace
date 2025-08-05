const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
  // Conversation participants
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  
  // Last message info
  lastMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  },
  
  // Unread count for each participant
  unreadCount: {
    type: Map,
    of: Number,
    default: new Map()
  },
  
  // Related order/gig (optional)
  relatedOrder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  },
  relatedGig: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Gig'
  },
  
  // Conversation status
  status: {
    type: String,
    enum: ['active', 'archived', 'blocked'],
    default: 'active'
  }
}, {
  timestamps: true
});

// Index for faster queries
conversationSchema.index({ participants: 1 });
conversationSchema.index({ updatedAt: -1 });

module.exports = mongoose.model('Conversation', conversationSchema);
