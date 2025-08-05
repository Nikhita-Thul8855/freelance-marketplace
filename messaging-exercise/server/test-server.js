const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Test route
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Messaging API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Simple test route for API endpoints
app.get('/api/test', (req, res) => {
  res.json({
    success: true,
    message: 'Test endpoint working!',
    endpoints: [
      'GET /api/health - Health check',
      'GET /api/test - This test endpoint',
      'POST /api/auth/register - Register user (requires MongoDB)',
      'POST /api/auth/login - Login user (requires MongoDB)',
      'POST /api/messages - Send message (requires MongoDB)',
      'GET /api/messages/conversations - Get conversations (requires MongoDB)'
    ]
  });
});

const PORT = process.env.PORT || 4000;

const server = app.listen(PORT, () => {
  console.log(`\n🚀 Messaging API Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 API Base URL: http://localhost:${PORT}/api`);
  console.log(`🧪 Test URL: http://localhost:${PORT}/api/test`);
  console.log('─'.repeat(50));
  console.log('✅ Server is ready for testing!');
});

module.exports = app;
