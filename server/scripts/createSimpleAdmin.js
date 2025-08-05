const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/freelance-marketplace');

const createSimpleAdmin = async () => {
  try {
    // Delete existing simple admin if exists
    await User.deleteOne({ email: 'admin@admin.com' });
    console.log('Removed any existing simple admin user...');

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('123456', salt);

    // Create simple admin user
    const adminUser = new User({
      name: 'Simple Admin',
      email: 'admin@admin.com',
      password: hashedPassword,
      role: 'admin',
      profile: {
        skills: [],
        hourlyRate: 0,
        bio: 'Simple Administrator',
        portfolio: []
      }
    });

    await adminUser.save();
    console.log('Simple admin user created successfully!');
    console.log('Email: admin@admin.com');
    console.log('Password: 123456');
    console.log('Role: admin');
    
  } catch (error) {
    console.error('Error creating simple admin user:', error);
  } finally {
    mongoose.connection.close();
  }
};

createSimpleAdmin();
