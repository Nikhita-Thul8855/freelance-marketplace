import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import socketService from '../services/socketService';
import messageService from '../services/messageService';
import './RealTimeChat.css';

const RealTimeChat = ({ otherUser, onClose }) => {
  const { user, token } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Safety check for required props
  if (!otherUser || !otherUser._id) {
    return (
      <div className="real-time-chat">
        <div className="chat-header">
          <h3>Chat Error</h3>
          <button onClick={onClose} className="close-button">✕</button>
        </div>
        <div className="messages-container">
          <div className="no-messages">
            <p>Unable to load chat. User information is missing.</p>
          </div>
        </div>
      </div>
    );
  }

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize socket connection and load messages
  useEffect(() => {
    if (!user || !otherUser || !token) {
      console.log('❌ Missing required data for chat:', { user: !!user, otherUser: !!otherUser, token: !!token });
      setConnectionStatus('error');
      return;
    }

    console.log('🚀 Initializing real-time chat...');
    console.log('Current user:', user.name);
    console.log('Other user:', otherUser.name);

    // Connect to socket
    try {
      setConnectionStatus('connecting');
      
      socketService.connect(token);
      
      // Join conversation room
      socketService.joinConversation(otherUser._id);

      // Load existing messages
      loadMessages();

      // Setup event listeners
      setupSocketListeners();
      
      setConnectionStatus('connected');

    } catch (error) {
      console.error('❌ Failed to initialize chat:', error);
      setConnectionStatus('error');
    }

    return () => {
      // Cleanup
      socketService.leaveConversation(otherUser._id);
      cleanupSocketListeners();
    };
  }, [user, otherUser, token]);

  // Load existing messages
  const loadMessages = async () => {
    try {
      console.log('📥 Loading existing messages...');
      const result = await messageService.getConversationMessages(otherUser._id);
      
      if (result.success) {
        console.log('✅ Messages loaded:', result.data?.length || 0);
        // Filter out any undefined or malformed messages
        const validMessages = (result.data || []).filter(msg => 
          msg && (msg._id || msg.messageId) && msg.content
        );
        setMessages(validMessages);
      } else {
        console.error('❌ Failed to load messages:', result.error);
        setMessages([]);
      }
    } catch (error) {
      console.error('❌ Error loading messages:', error);
      setMessages([]);
    }
  };

  // Setup socket event listeners
  const setupSocketListeners = () => {
    // Connection status
    socketService.on('connected', () => {
      console.log('✅ Chat connected');
      setConnectionStatus('connected');
    });

    socketService.on('disconnected', () => {
      console.log('🔴 Chat disconnected');
      setConnectionStatus('disconnected');
    });

    socketService.on('connect_error', () => {
      console.log('❌ Chat connection error');
      setConnectionStatus('error');
    });

    // New messages
    socketService.on('new-message', (data) => {
      console.log('📨 Received new message:', data);
      if (data.success && data.message) {
        setMessages(prev => {
          // Check if message already exists to avoid duplicates
          const messageId = data.message._id || data.message.messageId;
          if (!messageId) {
            console.warn('⚠️ Received message without ID:', data.message);
            return prev;
          }
          
          const exists = prev.some(msg => 
            msg && (msg._id === messageId || msg.messageId === messageId)
          );
          if (exists) return prev;
          
          return [...prev, data.message];
        });
      }
    });

    // Typing indicators
    socketService.on('user-typing', (data) => {
      if (data.userId === otherUser._id) {
        console.log('⌨️ Other user is typing');
        setOtherUserTyping(true);
      }
    });

    socketService.on('user-stop-typing', (data) => {
      if (data.userId === otherUser._id) {
        console.log('⌨️ Other user stopped typing');
        setOtherUserTyping(false);
      }
    });

    // Message read receipts
    socketService.on('message-read', (data) => {
      console.log('✅ Message read receipt:', data);
      setMessages(prev => prev.map(msg => 
        msg._id === data.messageId 
          ? { ...msg, status: 'read', readAt: data.readAt }
          : msg
      ));
    });
  };

  // Cleanup socket listeners
  const cleanupSocketListeners = () => {
    socketService.off('connected');
    socketService.off('disconnected');
    socketService.off('connect_error');
    socketService.off('new-message');
    socketService.off('user-typing');
    socketService.off('user-stop-typing');
    socketService.off('message-read');
  };

  // Handle sending messages
  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() || sending) return;

    const messageContent = newMessage.trim();
    setNewMessage('');
    setSending(true);

    try {
      console.log('📤 Sending message via Socket.io...');
      
      // Send via socket for real-time delivery
      if (socketService.isConnected()) {
        await socketService.sendMessage(otherUser._id, messageContent);
        console.log('✅ Message sent via Socket.io');
      } else {
        // Fallback to HTTP API
        console.log('📡 Socket not connected, using HTTP API...');
        const result = await messageService.sendMessage(otherUser._id, messageContent);
        
        if (result.success) {
          setMessages(prev => [...prev, result.data]);
        } else {
          throw new Error(result.error);
        }
      }

      // Stop typing
      socketService.stopTyping(otherUser._id);
      setIsTyping(false);

    } catch (error) {
      console.error('❌ Failed to send message:', error);
      // Restore message on error
      setNewMessage(messageContent);
      alert('Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  // Handle typing indicators
  const handleTyping = (e) => {
    setNewMessage(e.target.value);

    if (!isTyping && e.target.value.trim()) {
      setIsTyping(true);
      socketService.startTyping(otherUser._id);
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout
    typingTimeoutRef.current = setTimeout(() => {
      if (isTyping) {
        setIsTyping(false);
        socketService.stopTyping(otherUser._id);
      }
    }, 2000);
  };

  // Format message time
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Get connection status display
  const getConnectionStatusDisplay = () => {
    switch (connectionStatus) {
      case 'connected':
        return <span className="status-connected">🟢 Real-time</span>;
      case 'disconnected':
        return <span className="status-disconnected">🔴 Disconnected</span>;
      case 'error':
        return <span className="status-error">❌ Connection Error</span>;
      default:
        return <span className="status-connecting">🟡 Connecting...</span>;
    }
  };

  return (
    <div className="realtime-chat">
      <div className="chat-header">
        <div className="user-info">
          <img 
            src={otherUser.avatar || '/default-avatar.png'} 
            alt={otherUser.name}
            className="user-avatar"
          />
          <div>
            <h3>{otherUser.name}</h3>
            <span className="user-role">{otherUser.role}</span>
          </div>
        </div>
        <div className="chat-status">
          {getConnectionStatusDisplay()}
        </div>
        <button className="close-btn" onClick={onClose}>✕</button>
      </div>

      <div className="messages-container">
        {messages.length === 0 ? (
          <div className="no-messages">
            <p>Start your conversation with {otherUser.name}</p>
          </div>
        ) : (
          messages.filter(message => message && (message._id || message.messageId)).map((message) => {
            // Safe way to get sender ID with null checks
            const senderId = message.senderId?._id || message.senderId || message.sender?._id || message.sender;
            const isSentByMe = senderId === user.id || senderId === user._id;
            
            return (
              <div
                key={message._id || message.messageId || Math.random()}
                className={`message ${isSentByMe ? 'sent' : 'received'}`}
              >
                <div className="message-content">
                  <p>{message.content || 'Message content unavailable'}</p>
                  <div className="message-meta">
                    <span className="message-time">{formatTime(message.createdAt || message.timestamp)}</span>
                    {isSentByMe ? (
                      <span className={`message-status ${message.status || 'sent'}`}>
                        {message.status === 'read' ? '✓✓' : '✓'}
                      </span>
                    ) : null}
                  </div>
                </div>
              </div>
            );
          })
        )}
        
        {otherUserTyping && (
          <div className="typing-indicator">
            <div className="typing-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
            <p>{otherUser.name} is typing...</p>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      <form className="message-form" onSubmit={handleSendMessage}>
        <div className="input-container">
          <input
            type="text"
            value={newMessage}
            onChange={handleTyping}
            placeholder="Type your message..."
            disabled={sending}
            className="message-input"
          />
          <button 
            type="submit" 
            disabled={!newMessage.trim() || sending}
            className="send-btn"
          >
            {sending ? '⏳' : '📤'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default RealTimeChat;
