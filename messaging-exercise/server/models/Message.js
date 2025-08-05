const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  // Message identification
  messageId: {
    type: String,
    unique: true,
    required: true
  },
  
  // Core message data
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true,
    maxlength: 1000,
    trim: true
  },
  
  // Message type and status
  type: {
    type: String,
    enum: ['text', 'image', 'file'],
    default: 'text'
  },
  status: {
    type: String,
    enum: ['sent', 'delivered', 'read'],
    default: 'sent'
  },
  
  // Timestamps
  sentAt: {
    type: Date,
    default: Date.now
  },
  deliveredAt: {
    type: Date
  },
  readAt: {
    type: Date
  },
  
  // Optional: Conversation threading
  conversationId: {
    type: String,
    index: true
  },
  
  // Message metadata
  isEdited: {
    type: Boolean,
    default: false
  },
  editedAt: {
    type: Date
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Generate unique message ID
messageSchema.pre('save', async function(next) {
  if (!this.messageId) {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(7);
    this.messageId = `msg_${timestamp}_${random}`;
  }
  
  // Generate conversation ID if not provided
  if (!this.conversationId) {
    const participants = [this.sender.toString(), this.receiver.toString()].sort();
    this.conversationId = `conv_${participants.join('_')}`;
  }
  
  next();
});

// Update status timestamps
messageSchema.methods.markAsDelivered = function() {
  this.status = 'delivered';
  this.deliveredAt = new Date();
  return this.save();
};

messageSchema.methods.markAsRead = function() {
  this.status = 'read';
  this.readAt = new Date();
  return this.save();
};

// Indexes for better query performance
messageSchema.index({ sender: 1, createdAt: -1 });
messageSchema.index({ receiver: 1, createdAt: -1 });
messageSchema.index({ conversationId: 1, createdAt: -1 });
messageSchema.index({ messageId: 1 });

module.exports = mongoose.model('Message', messageSchema);
