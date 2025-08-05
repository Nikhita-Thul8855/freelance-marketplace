const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/freelance-marketplace');

const verifyAdminLogin = async () => {
  try {
    console.log('=== VERIFYING ADMIN USERS ===\n');
    
    // Check all admin users
    const adminUsers = await User.find({ role: 'admin' }).select('+password');
    
    if (adminUsers.length === 0) {
      console.log('❌ No admin users found!');
      return;
    }
    
    console.log(`Found ${adminUsers.length} admin user(s):\n`);
    
    for (let admin of adminUsers) {
      console.log(`👤 Admin: ${admin.name}`);
      console.log(`📧 Email: ${admin.email}`);
      console.log(`🔑 Has Password: ${admin.password ? 'Yes' : 'No'}`);
      
      if (admin.password) {
        // Test password verification
        const testPasswords = ['admin123', '123456', 'nikhita123', 'password', 'admin'];
        
        for (let testPassword of testPasswords) {
          const isMatch = await bcrypt.compare(testPassword, admin.password);
          if (isMatch) {
            console.log(`✅ Working Password: "${testPassword}"`);
            break;
          }
        }
      }
      console.log('---\n');
    }
    
    // Create a simple admin with known password
    console.log('🔧 Creating simple test admin...');
    
    // Delete existing test admin
    await User.deleteOne({ email: 'test@admin.com' });
    
    // Create new test admin
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin', salt);
    
    const testAdmin = new User({
      name: 'Test Admin',
      email: 'test@admin.com',
      password: hashedPassword,
      role: 'admin',
      profile: {
        skills: [],
        hourlyRate: 0,
        bio: 'Test Administrator',
        portfolio: []
      }
    });
    
    await testAdmin.save();
    
    console.log('✅ Test admin created successfully!');
    console.log('📧 Email: test@admin.com');
    console.log('🔑 Password: admin');
    console.log('👤 Role: admin');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    mongoose.connection.close();
  }
};

verifyAdminLogin();
