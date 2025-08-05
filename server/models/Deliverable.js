const mongoose = require('mongoose');

const deliverableSchema = new mongoose.Schema({
  // Deliverable identification
  deliverableId: {
    type: String,
    unique: true,
    required: true
  },
  
  // Related order
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  
  // Freelancer who uploaded
  freelancer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Deliverable details
  title: {
    type: String,
    required: true,
    maxlength: 200
  },
  
  description: {
    type: String,
    maxlength: 1000
  },
  
  // Files uploaded
  files: [{
    filename: {
      type: String,
      required: true
    },
    originalName: {
      type: String,
      required: true
    },
    path: {
      type: String,
      required: true
    },
    size: {
      type: Number,
      required: true
    },
    mimetype: {
      type: String,
      required: true
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Status
  status: {
    type: String,
    enum: ['submitted', 'approved', 'revision_requested', 'rejected'],
    default: 'submitted'
  },
  
  // Client feedback
  clientFeedback: {
    message: String,
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    feedbackDate: Date
  },
  
  // Revision details
  revisionRequested: {
    reason: String,
    requestedAt: Date,
    dueDate: Date
  },
  
  // Approval details
  approvedAt: Date,
  
  // Version tracking
  version: {
    type: Number,
    default: 1
  },
  
  // Previous version reference
  previousVersion: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Deliverable'
  }
  
}, {
  timestamps: true
});

// Generate unique deliverable ID
deliverableSchema.pre('save', async function(next) {
  if (!this.deliverableId) {
    this.deliverableId = `del_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  next();
});

// Index for faster queries
deliverableSchema.index({ order: 1, version: -1 });
deliverableSchema.index({ freelancer: 1, createdAt: -1 });
// deliverableId index removed - already created by unique: true

module.exports = mongoose.model('Deliverable', deliverableSchema);
