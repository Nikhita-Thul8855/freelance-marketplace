const mongoose = require('mongoose');

const GigSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
    maxlength: [1000, 'Description cannot be more than 1000 characters']
  },
  price: {
    type: Number,
    required: [true, 'Please add a price'],
    min: [5, 'Price must be at least $5']
  },
  images: [{
    type: String,
    required: false
  }],
  category: {
    type: String,
    required: [true, 'Please add a category'],
    enum: [
      'Web Development',
      'Mobile Development',
      'Design & Creative',
      'Writing & Translation',
      'Digital Marketing',
      'Video & Animation',
      'Music & Audio',
      'Programming & Tech',
      'Business',
      'Lifestyle',
      'Other'
    ]
  },
  seller: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  deliveryTime: {
    type: Number,
    required: [true, 'Please add delivery time in days'],
    min: [1, 'Delivery time must be at least 1 day'],
    max: [30, 'Delivery time cannot be more than 30 days']
  },
  tags: [{
    type: String,
    trim: true
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  rating: {
    type: Number,
    default: 0,
    min: [0, 'Rating must be at least 0'],
    max: [5, 'Rating cannot be more than 5']
  },
  numOfReviews: {
    type: Number,
    default: 0
  },
  totalSales: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Create index for better search performance
GigSchema.index({ title: 'text', description: 'text', tags: 'text' });
GigSchema.index({ category: 1 });
GigSchema.index({ seller: 1 });
GigSchema.index({ price: 1 });
GigSchema.index({ rating: -1 });

module.exports = mongoose.model('Gig', GigSchema);
