// Quick debug script to test messaging functionality
const express = require('express');
const app = express();

app.use(express.json());

// Test endpoint to debug message sending
app.post('/debug/message', (req, res) => {
  console.log('\n=== MESSAGE DEBUG REQUEST ===');
  console.log('Headers:', req.headers);
  console.log('Body:', req.body);
  console.log('Authorization:', req.headers.authorization);
  
  // Check for required fields
  const { receiverId, content } = req.body;
  
  if (!receiverId) {
    console.log('❌ Missing receiverId');
    return res.status(400).json({ success: false, message: 'receiverId is required' });
  }
  
  if (!content) {
    console.log('❌ Missing content');
    return res.status(400).json({ success: false, message: 'content is required' });
  }
  
  console.log('✅ All required fields present');
  console.log('receiverId:', receiverId);
  console.log('content:', content);
  
  res.json({
    success: true,
    message: 'Debug successful',
    receivedData: req.body
  });
});

app.listen(3001, () => {
  console.log('🔧 Debug server running on port 3001');
  console.log('Test URL: http://localhost:3001/debug/message');
});
