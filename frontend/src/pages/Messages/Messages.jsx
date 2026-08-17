import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, Send, Search, CheckCheck, Clock, User, ShieldCheck, 
  Sparkles, ArrowLeft, Image as ImageIcon, CornerDownLeft, AlertCircle, ShoppingBag 
} from 'lucide-react';
import { messageService } from '../../services/messageService';
import { useAuth } from '../../context/AuthContext';
import './Messages.css';

const QUICK_RESPONSES = [
  "Hi! Is this electronic item still available?",
  "Can you provide more details about battery health?",
  "Would you accept an exchange with my listed device?",
  "What is your best price for direct local pickup?",
  "I have placed an order. When can it be shipped?"
];

export default function Messages({ initialRecipient, onSelectProduct, onOpenAuthModal }) {
  const { user, isAuthenticated } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState('');

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Load conversations
  const loadConversations = async () => {
    if (!isAuthenticated) return;
    try {
      setIsLoading(true);
      const data = await messageService.getConversations();
      setConversations(data);

      if (initialRecipient) {
        const existing = data.find(c => c.otherUserId === initialRecipient.id);
        if (existing) {
          setSelectedConversation(existing);
        } else {
          // Synthetic new conversation
          const synthetic = {
            otherUserId: initialRecipient.id,
            otherUserName: initialRecipient.name || 'Seller',
            otherUserEmail: initialRecipient.email,
            otherUserAvatar: initialRecipient.profileImage,
            lastMessage: 'Start a conversation...',
            lastMessageTime: new Date().toISOString(),
            unreadCount: 0,
            lastProductId: initialRecipient.productId,
            lastProductTitle: initialRecipient.productTitle
          };
          setSelectedConversation(synthetic);
        }
      } else if (data.length > 0 && !selectedConversation) {
        setSelectedConversation(data[0]);
      }
    } catch (err) {
      console.error('Failed to load conversations:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadConversations();
  }, [isAuthenticated, initialRecipient]);

  // Load chat messages when selected conversation changes
  useEffect(() => {
    if (!selectedConversation || !isAuthenticated) return;

    const loadMessages = async () => {
      try {
        const data = await messageService.getConversationMessages(selectedConversation.otherUserId);
        setMessages(data);
        messageService.markAsRead(selectedConversation.otherUserId);
        scrollToBottom();
      } catch (err) {
        console.error('Failed to load messages:', err);
      }
    };

    loadMessages();
    const interval = setInterval(loadMessages, 5000); // Polling for live updates
    return () => clearInterval(interval);
  }, [selectedConversation, isAuthenticated]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;

    const content = newMessage.trim();
    setNewMessage('');
    setIsSending(true);
    setError('');

    try {
      const sent = await messageService.sendMessage({
        receiverId: selectedConversation.otherUserId,
        productId: selectedConversation.lastProductId || null,
        content: content
      });

      setMessages(prev => [...prev, sent]);
      loadConversations();
      scrollToBottom();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send message');
      setNewMessage(content); // restore on error
    } finally {
      setIsSending(false);
    }
  };

  const handleQuickResponse = (text) => {
    setNewMessage(text);
  };

  const filteredConversations = conversations.filter(c => 
    c.otherUserName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.lastMessage?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.lastProductTitle?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isAuthenticated) {
    return (
      <div className="messages-page container">
        <div className="messages-auth-gate glass-card animate-fade-in">
          <MessageSquare size={48} className="text-accent" />
          <h2>VoltTrade Instant Buyer-Seller Chat</h2>
          <p>Please sign in or create an account to communicate directly with certified gadget sellers and buyers.</p>
          <button className="btn btn-primary" onClick={() => onOpenAuthModal && onOpenAuthModal('login')}>
            Sign In to Access Messages
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="messages-page container animate-fade-in">
      <div className="messages-layout glass-card">
        {/* ================= LEFT SIDEBAR: CONVERSATION THREADS ================= */}
        <div className="conversations-sidebar">
          <div className="sidebar-header">
            <div className="sidebar-title-row">
              <h3>Direct Messages</h3>
              <span className="unread-badge">{conversations.reduce((acc, c) => acc + (c.unreadCount || 0), 0)} unread</span>
            </div>
            <div className="search-input-wrap">
              <Search size={16} className="search-icon" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="conv-search-input"
              />
            </div>
          </div>

          <div className="conversations-list">
            {isLoading && conversations.length === 0 ? (
              <div className="conversations-loading">
                <span className="spinner-sm"></span>
                <span>Loading chats...</span>
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="empty-conversations">
                <MessageSquare size={32} className="text-muted" />
                <p>No conversations found.</p>
                <span className="sub">Contact a seller on any product page to start chatting!</span>
              </div>
            ) : (
              filteredConversations.map((conv) => {
                const isSelected = selectedConversation?.otherUserId === conv.otherUserId;
                return (
                  <div
                    key={conv.otherUserId}
                    className={`conversation-item ${isSelected ? 'active' : ''}`}
                    onClick={() => setSelectedConversation(conv)}
                  >
                    <div className="conv-avatar-wrap">
                      <img
                        src={conv.otherUserAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
                        alt={conv.otherUserName}
                        className="conv-avatar"
                      />
                      {conv.unreadCount > 0 && <span className="avatar-unread-dot" />}
                    </div>

                    <div className="conv-details">
                      <div className="conv-top-row">
                        <span className="conv-name">{conv.otherUserName}</span>
                        <span className="conv-time">
                          {new Date(conv.lastMessageTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      {conv.lastProductTitle && (
                        <div className="conv-product-tag">
                          <ShoppingBag size={11} />
                          <span>{conv.lastProductTitle}</span>
                        </div>
                      )}

                      <div className="conv-snippet-row">
                        <span className="conv-snippet">{conv.lastMessage}</span>
                        {conv.unreadCount > 0 && (
                          <span className="conv-unread-count">{conv.unreadCount}</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ================= RIGHT MAIN: CHAT ACTIVE VIEW ================= */}
        <div className="chat-main-pane">
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className="chat-header">
                <div className="chat-recipient-info">
                  <img
                    src={selectedConversation.otherUserAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
                    alt={selectedConversation.otherUserName}
                    className="chat-header-avatar"
                  />
                  <div>
                    <div className="recipient-name-row">
                      <h4>{selectedConversation.otherUserName}</h4>
                      <span className="badge badge-emerald">
                        <ShieldCheck size={12} />
                        <span>Verified Trader</span>
                      </span>
                    </div>
                    <span className="recipient-email">{selectedConversation.otherUserEmail || 'VoltTrade Member'}</span>
                  </div>
                </div>

                {selectedConversation.lastProductTitle && (
                  <div className="chat-linked-product glass-card">
                    <ShoppingBag size={14} className="text-emerald-400" />
                    <div>
                      <span className="linked-label">Inquiry Regarding</span>
                      <span className="linked-title">{selectedConversation.lastProductTitle}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Message History List */}
              <div className="chat-messages-area">
                <div className="chat-encryption-notice">
                  <ShieldCheck size={14} className="text-emerald-400" />
                  <span>VoltTrade End-to-End Buyer Protection & Secure Negotiation Channel</span>
                </div>

                {messages.length === 0 ? (
                  <div className="empty-chat-state">
                    <Sparkles size={36} className="text-accent" />
                    <h4>Start a conversation with {selectedConversation.otherUserName}</h4>
                    <p>Ask questions about device condition, negotiate price, or confirm handover details.</p>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isMine = msg.senderId === user?.id;
                    return (
                      <div
                        key={msg.id}
                        className={`message-bubble-wrapper ${isMine ? 'mine' : 'theirs'}`}
                      >
                        <div className={`message-bubble ${isMine ? 'mine' : 'theirs'}`}>
                          <p className="message-content">{msg.content}</p>
                          <div className="message-meta">
                            <span className="message-time">
                              {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            {isMine && (
                              <CheckCheck size={14} className={msg.isRead ? 'text-emerald-400' : 'text-muted'} />
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Response Templates */}
              <div className="quick-responses-strip">
                <span className="quick-tag-label">Quick suggestions:</span>
                {QUICK_RESPONSES.map((qr, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className="quick-response-chip"
                    onClick={() => handleQuickResponse(qr)}
                  >
                    {qr}
                  </button>
                ))}
              </div>

              {error && (
                <div className="form-alert error animate-shake" style={{ margin: '0.5rem 1rem' }}>
                  <AlertCircle size={14} />
                  <span>{error}</span>
                </div>
              )}

              {/* Message Input Form */}
              <form className="chat-input-form" onSubmit={handleSendMessage}>
                <input
                  type="text"
                  className="chat-text-input"
                  placeholder={`Message ${selectedConversation.otherUserName}...`}
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  disabled={isSending}
                />
                <button
                  type="submit"
                  className="chat-send-btn btn btn-primary"
                  disabled={!newMessage.trim() || isSending}
                >
                  {isSending ? (
                    <span className="spinner-sm"></span>
                  ) : (
                    <>
                      <span>Send</span>
                      <Send size={16} />
                    </>
                  )}
                </button>
              </form>
            </>
          ) : (
            <div className="no-chat-selected">
              <MessageSquare size={54} className="text-muted" />
              <h3>Select a Conversation</h3>
              <p>Choose an active trade conversation from the left sidebar to view messages.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
