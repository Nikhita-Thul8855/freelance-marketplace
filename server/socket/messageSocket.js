const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Message = require('../models/Message');

module.exports = (io) => {
  console.log('🚀 Initializing Socket.io messaging...');
  
  // Store connected users
  const connectedUsers = new Map();

  // Authentication middleware for socket connections
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      console.log('🔐 Socket authentication attempt...');
      console.log('Token received:', token ? 'Present' : 'Missing');
      
      if (!token) {
        console.log('❌ No token provided');
        return next(new Error('Authentication error - No token'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);
      
      if (!user) {
        console.log('❌ User not found');
        return next(new Error('User not found'));
      }

      socket.userId = user._id.toString();
      socket.user = user;
      
      console.log('✅ Socket authenticated for user:', user.name);
      next();
    } catch (error) {
      console.log('❌ Socket authentication failed:', error.message);
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`🟢 User ${socket.user.name} (${socket.user.role}) connected to real-time messaging`);
    console.log(`📱 Socket ID: ${socket.id}`);
    
    // Store user connection
    connectedUsers.set(socket.userId, {
      socketId: socket.id,
      user: socket.user,
      lastSeen: new Date()
    });

    // Join user to their personal room
    socket.join(socket.userId);
    console.log(`🏠 User joined personal room: ${socket.userId}`);

    // Broadcast user online status
    socket.broadcast.emit('user-online', {
      userId: socket.userId,
      user: {
        id: socket.user._id,
        name: socket.user.name,
        role: socket.user.role,
        avatar: socket.user.avatar
      }
    });

    // Handle joining conversation rooms
    socket.on('join-conversation', (otherUserId) => {
      const conversationRoom = [socket.userId, otherUserId].sort().join('-');
      socket.join(conversationRoom);
      console.log(`💬 User ${socket.user.name} joined conversation with ${otherUserId}`);
      console.log(`🏠 Conversation room: ${conversationRoom}`);
    });

    // Handle leaving conversation rooms
    socket.on('leave-conversation', (otherUserId) => {
      const conversationRoom = [socket.userId, otherUserId].sort().join('-');
      socket.leave(conversationRoom);
      console.log(`📴 User ${socket.user.name} left conversation with ${otherUserId}`);
    });

    // Handle real-time message sending
    socket.on('send-message', async (data) => {
      try {
        console.log('📨 Real-time message received:', data);
        
        const { receiverId, content, type = 'text' } = data;
        
        // Create message through existing API logic
        const messageData = {
          sender: socket.userId,     // Use 'sender' not 'senderId'
          receiver: receiverId,      // Use 'receiver' not 'receiverId'
          content,
          type,
          messageId: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          timestamp: new Date(),
          status: 'sent'
        };

        // Save to database
        const message = new Message(messageData);
        await message.save();

        // Populate sender and receiver info
        await message.populate('sender receiver', 'name email avatar role');

        console.log('✅ Real-time message saved:', message.messageId);

        // First, send direct response to sender to resolve the promise
        socket.emit('message-sent', {
          success: true,
          message: message
        });

        // Emit to conversation room
        const conversationRoom = [socket.userId, receiverId].sort().join('-');
        io.to(conversationRoom).emit('new-message', {
          success: true,
          message: message
        });

        // Also emit to both users' personal rooms for notifications
        io.to(receiverId).emit('message-notification', {
          from: socket.user,
          message: message,
          conversationId: conversationRoom
        });

        console.log(`📤 Message emitted to room: ${conversationRoom}`);
      } catch (error) {
        console.error('❌ Error sending real-time message:', error);
        socket.emit('message-error', {
          error: 'Failed to send message',
          details: error.message
        });
      }
    });

    // Handle typing indicators
    socket.on('typing', (data) => {
      console.log(`⌨️ ${socket.user.name} is typing to ${data.receiverId}`);
      const conversationRoom = [socket.userId, data.receiverId].sort().join('-');
      socket.to(conversationRoom).emit('user-typing', {
        userId: socket.userId,
        userName: socket.user.name,
        receiverId: data.receiverId
      });
    });

    socket.on('stop-typing', (data) => {
      console.log(`⌨️ ${socket.user.name} stopped typing to ${data.receiverId}`);
      const conversationRoom = [socket.userId, data.receiverId].sort().join('-');
      socket.to(conversationRoom).emit('user-stop-typing', {
        userId: socket.userId,
        receiverId: data.receiverId
      });
    });

    // Handle message read status
    socket.on('mark-message-read', async (data) => {
      try {
        const { messageId, conversationRoom } = data;
        
        // Update message status in database
        await Message.findByIdAndUpdate(messageId, { 
          status: 'read',
          readAt: new Date()
        });

        // Emit read receipt
        socket.to(conversationRoom).emit('message-read', {
          messageId,
          readBy: socket.userId,
          readAt: new Date()
        });

        console.log(`✅ Message ${messageId} marked as read`);
      } catch (error) {
        console.error('❌ Error marking message as read:', error);
      }
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`🔴 User ${socket.user.name} disconnected from real-time messaging`);
      
      // Remove from connected users
      connectedUsers.delete(socket.userId);
      
      // Broadcast user offline status
      socket.broadcast.emit('user-offline', {
        userId: socket.userId,
        lastSeen: new Date()
      });
    });
  });

  // Function to emit new message to relevant users (for API calls)
  const emitNewMessage = (message, senderId, receiverId) => {
    console.log(`📡 Emitting new message from API: ${message.messageId}`);
    
    // Emit to receiver's personal room
    io.to(receiverId).emit('new-message', {
      success: true,
      message: message
    });
    
    // Emit to sender's personal room (for multi-device sync)
    io.to(senderId).emit('new-message', {
      success: true,
      message: message,
      self: true
    });

    // Emit to conversation room
    const conversationRoom = [senderId, receiverId].sort().join('-');
    io.to(conversationRoom).emit('conversation-update', {
      message: message,
      conversationRoom
    });
  };

  // Function to get online users
  const getOnlineUsers = () => {
    return Array.from(connectedUsers.entries()).map(([userId, data]) => ({
      userId,
      user: data.user,
      lastSeen: data.lastSeen
    }));
  };

  // Expose functions for use in other parts of the app
  io.emitNewMessage = emitNewMessage;
  io.getOnlineUsers = getOnlineUsers;
  io.connectedUsers = connectedUsers;

  console.log('✅ Socket.io messaging initialized successfully');
  return io;
};
