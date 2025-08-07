// Simple in-memory user storage for testing
const bcrypt = require('bcryptjs');

// In-memory user storage
let users = [];

// User class with methods
class User {
  constructor(userData) {
    this.name = userData.name;
    this.email = userData.email;
    this.password = userData.password; // Will be hashed
    this.role = userData.role;
    this._id = Date.now().toString(); // Simple ID generation
  }

  // Hash password
  static async hashPassword(password) {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
  }

  // Compare password
  async comparePassword(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
  }

  // Generate JWT token (simplified)
  getSignedJwtToken() {
    const jwt = require('jsonwebtoken');
    return jwt.sign(
      { id: this._id }, 
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '30d' }
    );
  }

  // Static methods for database operations
  static async create(userData) {
    // Check if user already exists
    const existingUser = users.find(u => u.email === userData.email);
    if (existingUser) {
      throw new Error('User already exists');
    }

    // Hash password
    const hashedPassword = await User.hashPassword(userData.password);
    
    // Create new user
    const user = new User({
      ...userData,
      password: hashedPassword
    });

    // Save to memory
    users.push(user);
    return user;
  }

  static async findOne(query) {
    const user = users.find(u => {
      if (query.email) return u.email === query.email;
      if (query._id) return u._id === query._id;
      return false;
    });
    return user || null;
  }

  static async findById(id) {
    return users.find(u => u._id === id) || null;
  }
}

// Create a default test user
async function createDefaultUser() {
  try {
    const existingUser = await User.findOne({ email: 'test@example.com' });
    if (!existingUser) {
      await User.create({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        role: 'client'
      });
      console.log('✅ Default test user created: test@example.com / password123');
    }
  } catch (error) {
    console.log('ℹ️  Default user already exists');
  }
}

// Initialize default user
createDefaultUser();

module.exports = User;
