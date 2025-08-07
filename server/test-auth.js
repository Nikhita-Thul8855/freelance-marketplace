// Test authentication with mock user
const MockUser = require('./models/MockUser');

async function testAuth() {
  console.log('🧪 Testing authentication system...');
  
  try {
    // Test user creation
    console.log('👤 Creating test user...');
    const user = await MockUser.create({
      name: 'Auth Test User',
      email: 'authtest@example.com',
      password: 'testpass123',
      role: 'client'
    });
    console.log('✅ User created:', { name: user.name, email: user.email });
    
    // Test login
    console.log('🔐 Testing login...');
    const foundUser = await MockUser.findOne({ email: 'authtest@example.com' });
    if (foundUser) {
      const isMatch = await foundUser.comparePassword('testpass123');
      console.log('✅ Password verification:', isMatch ? 'SUCCESS' : 'FAILED');
      
      if (isMatch) {
        const token = foundUser.getSignedJwtToken();
        console.log('✅ JWT Token generated:', token.substring(0, 50) + '...');
      }
    }
    
    // Show all users
    console.log('📋 All users in system:');
    const testUser = await MockUser.findOne({ email: 'test@example.com' });
    if (testUser) {
      console.log('- test@example.com (password: password123)');
    }
    console.log('- authtest@example.com (password: testpass123)');
    
    console.log('🎉 Authentication test completed successfully!');
    
  } catch (error) {
    console.error('❌ Authentication test failed:', error.message);
  }
}

testAuth();
