const mongoose = require('mongoose');
const User = require('../models/User');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/freelance-marketplace');

const makeUserAdmin = async () => {
  try {
    // List all users to see what's available
    const users = await User.find({}, 'name email role');
    console.log('=== EXISTING USERS ===');
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name} (${user.email}) - Role: ${user.role}`);
    });
    
    if (users.length === 0) {
      console.log('No users found in database.');
      return;
    }

    // Make the first user an admin (or you can change this logic)
    const userToMakeAdmin = users[0]; // First user
    
    userToMakeAdmin.role = 'admin';
    await userToMakeAdmin.save();
    
    console.log('\n✅ SUCCESS!');
    console.log(`User "${userToMakeAdmin.name}" (${userToMakeAdmin.email}) is now an ADMIN.`);
    console.log('\nYou can now login with:');
    console.log(`Email: ${userToMakeAdmin.email}`);
    console.log(`Password: [their existing password]`);
    console.log(`Role: admin`);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    mongoose.connection.close();
  }
};

makeUserAdmin();
