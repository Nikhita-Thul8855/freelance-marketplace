import { io } from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.connected = false;
    this.callbacks = new Map();
  }

  // Initialize socket connection
  connect(token) {
    console.log('🔗 Initializing Socket.io connection...');
    
    if (this.socket && this.connected) {
      console.log('✅ Socket already connected');
      return this.socket;
    }

    try {
      this.socket = io('http://localhost:5000', {
        auth: {
          token: token
        },
        transports: ['websocket', 'polling'],
        timeout: 10000,
        forceNew: true
      });

      this.setupEventListeners();
      return this.socket;
    } catch (error) {
      console.error('❌ Socket connection failed:', error);
      throw error;
    }
  }

  // Setup event listeners
  setupEventListeners() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('🟢 Socket.io connected successfully');
      console.log('📱 Socket ID:', this.socket.id);
      this.connected = true;
      this.triggerCallback('connected', { socketId: this.socket.id });
    });

    this.socket.on('disconnect', (reason) => {
      console.log('🔴 Socket.io disconnected:', reason);
      this.connected = false;
      this.triggerCallback('disconnected', { reason });
    });

    this.socket.on('connect_error', (error) => {
      console.error('❌ Socket connection error:', error);
      this.connected = false;
      this.triggerCallback('connect_error', { error });
    });

    // Real-time message events
    this.socket.on('new-message', (data) => {
      console.log('📨 New message received:', data);
      this.triggerCallback('new-message', data);
    });

    this.socket.on('message-notification', (data) => {
      console.log('🔔 Message notification:', data);
      this.triggerCallback('message-notification', data);
    });

    this.socket.on('message-error', (data) => {
      console.error('❌ Message error:', data);
      this.triggerCallback('message-error', data);
    });

    // Typing indicators
    this.socket.on('user-typing', (data) => {
      console.log('⌨️ User typing:', data);
      this.triggerCallback('user-typing', data);
    });

    this.socket.on('user-stop-typing', (data) => {
      console.log('⌨️ User stopped typing:', data);
      this.triggerCallback('user-stop-typing', data);
    });

    // User status events
    this.socket.on('user-online', (data) => {
      console.log('🟢 User came online:', data);
      this.triggerCallback('user-online', data);
    });

    this.socket.on('user-offline', (data) => {
      console.log('🔴 User went offline:', data);
      this.triggerCallback('user-offline', data);
    });

    // Message read receipts
    this.socket.on('message-read', (data) => {
      console.log('✅ Message read:', data);
      this.triggerCallback('message-read', data);
    });

    // Conversation updates
    this.socket.on('conversation-update', (data) => {
      console.log('💬 Conversation updated:', data);
      this.triggerCallback('conversation-update', data);
    });
  }

  // Join a conversation room
  joinConversation(otherUserId) {
    if (!this.socket || !this.connected) {
      console.warn('⚠️ Socket not connected, cannot join conversation');
      return;
    }

    console.log(`🏠 Joining conversation with user: ${otherUserId}`);
    this.socket.emit('join-conversation', otherUserId);
  }

  // Leave a conversation room
  leaveConversation(otherUserId) {
    if (!this.socket || !this.connected) {
      console.warn('⚠️ Socket not connected, cannot leave conversation');
      return;
    }

    console.log(`🚪 Leaving conversation with user: ${otherUserId}`);
    this.socket.emit('leave-conversation', otherUserId);
  }

  // Send a real-time message
  sendMessage(receiverId, content, type = 'text') {
    if (!this.socket || !this.connected) {
      console.warn('⚠️ Socket not connected, cannot send message');
      return Promise.reject(new Error('Socket not connected'));
    }

    console.log('📤 Sending real-time message:', { receiverId, content, type });
    
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Message send timeout'));
      }, 10000);

      // Listen for response
      const messageHandler = (data) => {
        clearTimeout(timeout);
        this.socket.off('message-sent', messageHandler);
        this.socket.off('message-error', errorHandler);
        resolve(data);
      };

      const errorHandler = (error) => {
        clearTimeout(timeout);
        this.socket.off('message-sent', messageHandler);
        this.socket.off('message-error', errorHandler);
        reject(error);
      };

      this.socket.once('message-sent', messageHandler);
      this.socket.once('message-error', errorHandler);

      // Send the message
      this.socket.emit('send-message', {
        receiverId,
        content,
        type
      });
    });
  }

  // Send typing indicator
  startTyping(receiverId) {
    if (!this.socket || !this.connected) return;
    
    console.log(`⌨️ Started typing to: ${receiverId}`);
    this.socket.emit('typing', { receiverId });
  }

  // Stop typing indicator
  stopTyping(receiverId) {
    if (!this.socket || !this.connected) return;
    
    console.log(`⌨️ Stopped typing to: ${receiverId}`);
    this.socket.emit('stop-typing', { receiverId });
  }

  // Mark message as read
  markMessageAsRead(messageId, conversationRoom) {
    if (!this.socket || !this.connected) return;
    
    console.log(`✅ Marking message as read: ${messageId}`);
    this.socket.emit('mark-message-read', { messageId, conversationRoom });
  }

  // Register callback for events
  on(event, callback) {
    if (!this.callbacks.has(event)) {
      this.callbacks.set(event, []);
    }
    this.callbacks.get(event).push(callback);
  }

  // Unregister callback
  off(event, callback) {
    if (!this.callbacks.has(event)) return;
    
    const callbacks = this.callbacks.get(event);
    const index = callbacks.indexOf(callback);
    if (index > -1) {
      callbacks.splice(index, 1);
    }
  }

  // Trigger callbacks
  triggerCallback(event, data) {
    if (!this.callbacks.has(event)) return;
    
    this.callbacks.get(event).forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error(`❌ Error in ${event} callback:`, error);
      }
    });
  }

  // Disconnect socket
  disconnect() {
    if (this.socket) {
      console.log('🔴 Disconnecting Socket.io...');
      this.socket.disconnect();
      this.socket = null;
      this.connected = false;
      this.callbacks.clear();
    }
  }

  // Get connection status
  isConnected() {
    return this.connected && this.socket?.connected;
  }

  // Get socket instance
  getSocket() {
    return this.socket;
  }
}

// Create singleton instance
const socketService = new SocketService();
export default socketService;
