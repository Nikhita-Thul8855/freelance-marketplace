// Mock database connection for testing without MongoDB
console.log('🔧 Using mock database connection (MongoDB not required)');

const connectDB = async () => {
  try {
    console.log('✅ Mock database connected successfully');
    return true;
  } catch (error) {
    console.error('❌ Mock database connection failed:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
