// Test script to check MongoDB connection and create a test user
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Debug environment loading
console.log('🔍 Environment debugging:');
console.log('Current directory:', __dirname);
console.log('Env file path:', path.join(__dirname, '.env'));
console.log('MONGO_URI from process.env:', process.env.MONGO_URI);

// If dotenv fails, set manually for testing
if (!process.env.MONGO_URI) {
  console.log('⚠️  Setting environment variables manually...');
  process.env.MONGO_URI = "mongodb+srv://freelancemarketplace:freelancemarketplace123@cluster0.mongodb.net/freelance-marketplace?retryWrites=true&w=majority";
  process.env.JWT_SECRET = "freelance_marketplace_super_secret_key_2024_production_ready";
}

// User schema (simplified)
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['client', 'freelancer', 'admin'], required: true }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);

async function testDB() {
  try {
    // Connect to MongoDB
    console.log('🔗 Connecting to MongoDB...');
    console.log('MONGO_URI:', process.env.MONGO_URI);
    
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ MongoDB connected successfully');
    
    // Check if test user exists
    const existingUser = await User.findOne({ email: 'test@example.com' });
    
    if (existingUser) {
      console.log('👤 Test user already exists');
      console.log('User details:', {
        name: existingUser.name,
        email: existingUser.email,
        role: existingUser.role
      });
    } else {
      // Create test user
      console.log('👤 Creating test user...');
      const testUser = new User({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        role: 'client'
      });
      
      await testUser.save();
      console.log('✅ Test user created successfully');
    }
    
    // Test login credentials
    console.log('🔐 Testing login...');
    const user = await User.findOne({ email: 'test@example.com' });
    if (user) {
      const isMatch = await user.comparePassword('password123');
      console.log('Password match result:', isMatch);
    }
    
    console.log('🎉 Database test completed successfully');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Database test failed:', error.message);
    process.exit(1);
  }
}

testDB();
