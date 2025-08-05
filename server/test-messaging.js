// Simple test script to verify messaging functionality
const express = require('express');
const mongoose = require('mongoose');
const app = express();

// Load environment
require('dotenv').config();

app.use(express.json());

// Connect to database
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/freelance-marketplace');

// Import models
const User = require('./models/User');
const Message = require('./models/Message');
const Conversation = require('./models/Conversation');

// Test route to check users and messages
app.get('/test/users', async (req, res) => {
  try {
    const users = await User.find().select('name email role').limit(10);
    const userCount = await User.countDocuments();
    
    res.json({
      success: true,
      total: userCount,
      users: users
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Test route to check messages
app.get('/test/messages', async (req, res) => {
  try {
    const messages = await Message.find()
      .populate('sender', 'name email')
      .populate('receiver', 'name email')
      .sort({ createdAt: -1 })
      .limit(10);
    
    const messageCount = await Message.countDocuments();
    
    res.json({
      success: true,
      total: messageCount,
      messages: messages
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Test route to check conversations
app.get('/test/conversations', async (req, res) => {
  try {
    const conversations = await Conversation.find()
      .populate('participants', 'name email')
      .populate('lastMessage')
      .limit(10);
    
    const conversationCount = await Conversation.countDocuments();
    
    res.json({
      success: true,
      total: conversationCount,
      conversations: conversations
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start test server on different port
const PORT = 5001;
app.listen(PORT, () => {
  console.log(`🧪 Test server running on port ${PORT}`);
  console.log(`📊 Test URLs:`);
  console.log(`   Users: http://localhost:${PORT}/test/users`);
  console.log(`   Messages: http://localhost:${PORT}/test/messages`);
  console.log(`   Conversations: http://localhost:${PORT}/test/conversations`);
});
