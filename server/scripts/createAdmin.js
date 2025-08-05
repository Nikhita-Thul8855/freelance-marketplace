const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/freelance-marketplace', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const createAdminUser = async () => {
  try {
    // Delete existing admin user if exists
    await User.deleteOne({ email: 'admin@freelancemarketplace.com' });
    console.log('Removed any existing admin user...');

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);

    // Create admin user
    const adminUser = new User({
      name: 'Admin User',
      email: 'admin@freelancemarketplace.com',
      password: hashedPassword,
      role: 'admin',
      profile: {
        skills: [],
        hourlyRate: 0,
        bio: 'System Administrator',
        portfolio: []
      }
    });

    await adminUser.save();
    console.log('Admin user created successfully!');
    console.log('Email: admin@freelancemarketplace.com');
    console.log('Password: admin123');
    console.log('Role: admin');
    console.log('Please change the password after first login.');
    
  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    mongoose.connection.close();
  }
};

createAdminUser();
