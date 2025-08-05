const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  // Order identification
  orderId: {
    type: String,
    unique: true,
    required: true
  },
  
  // Stripe payment information
  stripePaymentIntentId: {
    type: String,
    required: true,
    unique: true
  },
  stripeSessionId: {
    type: String,
    required: true
  },
  
  // Order details
  gig: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Gig',
    required: true
  },
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  freelancer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Pricing
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'usd',
    required: true
  },
  
  // Status tracking
  status: {
    type: String,
    enum: ['pending', 'paid', 'in_progress', 'completed', 'cancelled', 'refunded'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  
  // Order metadata
  gigSnapshot: {
    title: String,
    description: String,
    price: Number,
    category: String,
    deliveryTime: Number
  },
  
  // Important dates
  deliveryDate: {
    type: Date
  },
  completedAt: {
    type: Date
  },
  
  // Communication
  requirements: {
    type: String,
    maxlength: 1000
  },
  notes: {
    type: String,
    maxlength: 500
  },
  
  // Review tracking
  isReviewed: {
    type: Boolean,
    default: false
  },
  reviewId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Review'
  }
}, {
  timestamps: true
});

// Generate unique order ID
orderSchema.pre('save', async function(next) {
  if (!this.orderId) {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(7);
    this.orderId = `ORD-${timestamp}-${random}`.toUpperCase();
  }
  
  // Set delivery date based on gig delivery time
  if (this.deliveryDate === undefined && this.gigSnapshot?.deliveryTime) {
    this.deliveryDate = new Date(Date.now() + (this.gigSnapshot.deliveryTime * 24 * 60 * 60 * 1000));
  }
  
  next();
});

// Indexes for better query performance
orderSchema.index({ client: 1, createdAt: -1 });
orderSchema.index({ freelancer: 1, createdAt: -1 });
orderSchema.index({ gig: 1 });
orderSchema.index({ status: 1 });
// stripePaymentIntentId index removed - already created by unique: true

module.exports = mongoose.model('Order', orderSchema);
