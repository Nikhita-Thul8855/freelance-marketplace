import api from './api';
import socketService from './socketService';

class MessageService {
  // Send a message
  async sendMessage(receiverId, content, type = 'text', relatedOrder = null, relatedGig = null) {
    try {
      console.log('🚀 Sending message...');
      console.log('Receiver ID:', receiverId);
      console.log('Content:', content);
      console.log('Type:', type);

      // Try socket first if connected
      if (socketService.isConnected()) {
        console.log('📡 Sending via Socket.io...');
        try {
          await socketService.sendMessage(receiverId, content, type);
          console.log('✅ Message sent via Socket.io');
          return {
            success: true,
            data: {
              content,
              receiverId,
              type,
              timestamp: new Date(),
              via: 'socket'
            }
          };
        } catch (socketError) {
          console.log('⚠️ Socket send failed, falling back to HTTP...');
        }
      }

      // Fallback to HTTP API
      console.log('📡 Sending via HTTP API...');
      const response = await api.post('/messages', {
        receiverId,
        content,
        type,
        relatedOrder,
        relatedGig
      });
      
      console.log('✅ Message sent successfully via HTTP:', response.data);
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      console.error('❌ Message send failed:');
      console.error('Error:', error);
      console.error('Response:', error.response?.data);
      console.error('Status:', error.response?.status);
      console.error('Headers:', error.response?.headers);
      
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to send message',
        details: {
          status: error.response?.status,
          data: error.response?.data
        }
      };
    }
  }

  // Get conversation messages
  async getConversationMessages(userId, page = 1, limit = 20) {
    try {
      const response = await api.get(`/messages/conversation/${userId}?page=${page}&limit=${limit}`);
      return {
        success: true,
        data: response.data.data,
        pagination: response.data.pagination
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch messages'
      };
    }
  }

  // Get all conversations
  async getConversations() {
    try {
      const response = await api.get('/messages/conversations');
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch conversations'
      };
    }
  }

  // Mark message as read
  async markAsRead(messageId) {
    try {
      const response = await api.put(`/messages/${messageId}/read`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to mark message as read'
      };
    }
  }

  // Delete message
  async deleteMessage(messageId) {
    try {
      const response = await api.delete(`/messages/${messageId}`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to delete message'
      };
    }
  }

  // Get unread message count
  async getUnreadCount() {
    try {
      const response = await api.get('/messages/unread-count');
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      console.error('Error fetching unread count:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch unread count',
        data: 0
      };
    }
  }

  // Format message time
  formatMessageTime(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  }
}

const messageService = new MessageService();
export default messageService;
