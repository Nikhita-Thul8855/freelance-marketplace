import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSearchParams, useNavigate } from 'react-router-dom';
import messageService from '../services/messageService';
import socketService from '../services/socketService';
import RealTimeChat from './RealTimeChat';

const Messages = () => {
  const { user, token } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [error, setError] = useState('');
  const [showRealTimeChat, setShowRealTimeChat] = useState(false);
  const [realTimeChatUser, setRealTimeChatUser] = useState(null);
  
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load conversations on mount
  useEffect(() => {
    loadConversations();
    
    // Check if we need to open a specific conversation
    const userId = searchParams.get('user');
    if (userId) {
      setSelectedUser({ _id: userId });
      loadMessages(userId);
    }

    // Initialize socket connection
    if (user && token) {
      try {
        socketService.connect(token);
        setupSocketListeners();
      } catch (error) {
        console.error('Failed to connect to real-time messaging:', error);
      }
    }

    return () => {
      // Cleanup socket listeners
      if (socketService.isConnected()) {
        socketService.disconnect();
      }
    };
  }, [searchParams, user, token]);

  // Setup socket event listeners
  const setupSocketListeners = () => {
    socketService.on('new-message', (data) => {
      if (data.success && data.message) {
        // Update messages if this conversation is currently open
        if (selectedUser && 
            (data.message.senderId._id === selectedUser._id || 
             data.message.receiverId._id === selectedUser._id)) {
          setMessages(prev => {
            const exists = prev.some(msg => 
              msg._id === data.message._id || 
              msg.messageId === data.message.messageId
            );
            if (exists) return prev;
            return [...prev, data.message];
          });
        }
        
        // Refresh conversations to update last message
        loadConversations();
      }
    });

    socketService.on('message-notification', (data) => {
      // Show browser notification for new messages
      if (Notification.permission === 'granted' && data.from.id !== user.id) {
        new Notification(`New message from ${data.from.name}`, {
          body: data.message.content,
          icon: data.from.avatar || '/default-avatar.png'
        });
      }
    });
  };

  // Open real-time chat
  const openRealTimeChat = (userToChat) => {
    setRealTimeChatUser(userToChat);
    setShowRealTimeChat(true);
  };

  // Close real-time chat
  const closeRealTimeChat = () => {
    setShowRealTimeChat(false);
    setRealTimeChatUser(null);
    // Refresh conversations and messages
    loadConversations();
    if (selectedUser) {
      loadMessages(selectedUser._id);
    }
  };

  const loadConversations = async () => {
    try {
      const result = await messageService.getConversations();
      if (result.success) {
        // Filter out any invalid conversations
        const validConversations = (result.data || []).filter(conv => {
          const isValid = conv && 
            conv._id && 
            conv.otherParticipant && 
            conv.otherParticipant._id && 
            conv.otherParticipant.name;
          
          if (!isValid) {
            console.warn('Invalid conversation found:', conv);
          }
          
          return isValid;
        });
        
        console.log('Loaded valid conversations:', validConversations.length);
        setConversations(validConversations);
      } else {
        console.error('Failed to load conversations:', result.error);
        setError(result.error);
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
      setError('Failed to load conversations');
    }
    setLoading(false);
  };

  const loadMessages = async (userId) => {
    if (!userId) return;
    
    try {
      const result = await messageService.getConversationMessages(userId);
      if (result.success) {
        // Filter out any invalid messages and ensure data integrity
        const validMessages = (result.data || []).filter(message => {
          const isValid = message && 
            message._id && 
            message.sender && 
            message.sender._id;
          
          if (!isValid) {
            console.warn('Invalid message found:', message);
          }
          
          return isValid;
        });
        
        console.log('Loaded valid messages:', validMessages.length);
        setMessages(validMessages);
      } else {
        console.error('Failed to load messages:', result.error);
        setError(result.error);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
      setError('Failed to load messages');
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUser || sendingMessage) return;

    console.log('📨 Attempting to send message...');
    console.log('Selected user:', selectedUser);
    console.log('Message content:', newMessage.trim());

    setSendingMessage(true);
    const result = await messageService.sendMessage(selectedUser._id, newMessage.trim());
    
    if (result.success) {
      console.log('✅ Message sent successfully');
      setMessages(prev => [...prev, result.data]);
      setNewMessage('');
      setError(''); // Clear any previous errors
      // Refresh conversations to update last message
      loadConversations();
    } else {
      console.error('❌ Message send failed:', result);
      setError(`Failed to send message: ${result.error}`);
      
      // Show more detailed error if available
      if (result.details) {
        console.error('Error details:', result.details);
        if (result.details.status === 401) {
          setError('Authentication required. Please log in again.');
        } else if (result.details.status === 404) {
          setError('Recipient not found.');
        } else if (result.details.status === 500) {
          setError('Server error. Please try again later.');
        }
      }
    }
    
    setSendingMessage(false);
  };

  const selectConversation = (conversation) => {
    setSelectedUser(conversation.otherParticipant);
    loadMessages(conversation.otherParticipant._id);
    setError('');
  };

  const formatTime = (dateString) => {
    return messageService.formatMessageTime(dateString);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading messages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="flex h-96">
              {/* Conversations Sidebar */}
              <div className="w-1/3 bg-gray-50 border-r border-gray-200">
                <div className="p-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-medium text-gray-900">Messages</h2>
                    <button
                      onClick={() => navigate('/dashboard')}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
                
                <div className="overflow-y-auto h-full">
                  {conversations.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">
                      <p>No conversations yet</p>
                      <p className="text-sm mt-2">Start messaging with freelancers or clients!</p>
                    </div>
                  ) : (
                    conversations.filter(conv => conv && conv._id && conv.otherParticipant).map((conv) => (
                      <div
                        key={conv._id}
                        className={`p-4 border-b border-gray-200 hover:bg-gray-100 ${
                          selectedUser?._id === conv.otherParticipant._id ? 'bg-blue-50' : ''
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="flex-shrink-0">
                            <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                              <span className="text-sm font-medium text-gray-700">
                                {conv.otherParticipant.name?.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          </div>
                          <div 
                            className="flex-1 min-w-0 cursor-pointer"
                            onClick={() => selectConversation(conv)}
                          >
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {conv.otherParticipant.name}
                              </p>
                              {conv.unreadCount > 0 && (
                                <span className="bg-blue-600 text-white text-xs rounded-full px-2 py-1">
                                  {conv.unreadCount}
                                </span>
                              )}
                            </div>
                            {conv.lastMessage && (
                              <p className="text-xs text-gray-500 truncate">
                                {conv.lastMessage.content}
                              </p>
                            )}
                            <p className="text-xs text-gray-400">
                              {formatTime(conv.updatedAt)}
                            </p>
                          </div>
                          <div className="flex-shrink-0">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                openRealTimeChat(conv.otherParticipant);
                              }}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                              title="Open Real-time Chat"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Chat Area */}
              <div className="flex-1 flex flex-col">
                {selectedUser ? (
                  <>
                    {/* Chat Header */}
                    <div className="p-4 border-b border-gray-200 bg-white">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-700">
                            {selectedUser.name?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">
                            {selectedUser.name}
                          </h3>
                          <p className="text-sm text-gray-500">{selectedUser.email}</p>
                        </div>
                      </div>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                      {error && (
                        <div className="bg-red-50 border border-red-200 rounded-md p-4">
                          <p className="text-sm text-red-600">{error}</p>
                        </div>
                      )}
                      
                      {messages.filter(message => message && message._id && message.sender).map((message) => (
                        <div
                          key={message._id}
                          className={`flex ${message.sender._id === user._id ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                              message.sender._id === user._id
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-200 text-gray-900'
                            }`}
                          >
                            <p className="text-sm">{message.content}</p>
                            <p className={`text-xs mt-1 ${
                              message.sender._id === user._id ? 'text-blue-200' : 'text-gray-500'
                            }`}>
                              {formatTime(message.createdAt)}
                            </p>
                          </div>
                        </div>
                      ))}
                      <div ref={messagesEndRef} />
                    </div>

                    {/* Message Input */}
                    <div className="p-4 border-t border-gray-200 bg-white">
                      <form onSubmit={handleSendMessage} className="flex space-x-2">
                        <input
                          type="text"
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          placeholder="Type your message..."
                          className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          disabled={sendingMessage}
                        />
                        <button
                          type="submit"
                          disabled={sendingMessage || !newMessage.trim()}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {sendingMessage ? (
                            <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                          ) : (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                            </svg>
                          )}
                        </button>
                      </form>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No conversation selected</h3>
                      <p className="text-gray-500">Choose a conversation from the sidebar to start messaging</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Real-Time Chat Overlay */}
      {showRealTimeChat && realTimeChatUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-md">
            <RealTimeChat
              otherUser={realTimeChatUser}
              onClose={closeRealTimeChat}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Messages;
