import React, { useState } from 'react';
import { X, Mail, Phone, UserCheck, MessageSquare, Send, CheckCircle2, Copy, AlertCircle, ArrowRight } from 'lucide-react';
import { messageService } from '../../services/messageService';
import { useAuth } from '../../context/AuthContext';
import './ContactSellerModal.css';

export default function ContactSellerModal({ product, onClose, onNavigateToMessages }) {
  if (!product) return null;

  const { isAuthenticated, user } = useAuth();
  const [message, setMessage] = useState(`Hi ${product.sellerName || 'there'}, I am interested in purchasing your "${product.title}". Is it still available?`);
  const [sent, setSent] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState('');

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    if (!isAuthenticated) {
      setError('Please sign in to send in-platform messages.');
      return;
    }

    setIsSending(true);
    setError('');
    try {
      if (product.sellerId) {
        await messageService.sendMessage({
          receiverId: product.sellerId,
          productId: product.id,
          content: message.trim()
        });
      }
      setSent(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to dispatch in-app message');
    } finally {
      setIsSending(false);
    }
  };

  const handleCopyPhone = () => {
    if (product.sellerPhone) {
      navigator.clipboard.writeText(product.sellerPhone);
      setCopiedPhone(true);
      setTimeout(() => setCopiedPhone(false), 2000);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="contact-modal-content glass-card animate-fade-in" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>
          <X size={18} />
        </button>

        <div className="contact-modal-header">
          <div className="contact-icon-wrap">
            <UserCheck size={28} className="text-emerald-400" />
          </div>
          <h3>Contact Verified Seller</h3>
          <p className="seller-subtext">Direct peer-to-peer communication for #{product.id} - {product.title}</p>
        </div>

        {/* Seller Info Card */}
        <div className="seller-summary-card glass-card">
          <div className="seller-avatar-circle">
            {(product.sellerName || 'S').charAt(0).toUpperCase()}
          </div>
          <div className="seller-summary-meta">
            <div className="seller-name-row">
              <h4>{product.sellerName || 'VoltTrade Verified Seller'}</h4>
              <span className="verified-badge">Verified</span>
            </div>
            <p className="seller-location-text">📍 {product.location || 'United States'}</p>
          </div>
        </div>

        {/* Quick Contact Buttons */}
        <div className="quick-contacts-grid">
          {product.sellerEmail && (
            <a
              href={`mailto:${product.sellerEmail}?subject=Inquiry about ${encodeURIComponent(product.title)}&body=${encodeURIComponent(message)}`}
              className="quick-contact-card"
            >
              <Mail size={18} className="text-cyan-400" />
              <div>
                <span className="qc-label">Direct Email</span>
                <span className="qc-val">{product.sellerEmail}</span>
              </div>
            </a>
          )}

          {product.sellerPhone && (
            <div className="quick-contact-card clickable" onClick={handleCopyPhone}>
              <Phone size={18} className="text-emerald-400" />
              <div>
                <span className="qc-label">Phone / WhatsApp</span>
                <span className="qc-val">{product.sellerPhone}</span>
              </div>
              <span className="copy-badge">{copiedPhone ? 'Copied!' : 'Copy'}</span>
            </div>
          )}
        </div>

        {error && (
          <div className="form-alert error animate-shake" style={{ margin: '0.75rem 0' }}>
            <AlertCircle size={14} />
            <span>{error}</span>
          </div>
        )}

        {/* In-Platform Direct Inquiry Form */}
        <form className="inquiry-form" onSubmit={handleSendMessage}>
          <label className="inquiry-label">
            <MessageSquare size={15} />
            <span>Send In-App Direct Message:</span>
          </label>

          {sent ? (
            <div className="inquiry-sent-alert glass-card">
              <CheckCircle2 size={24} className="text-emerald-400" />
              <div>
                <strong>Message Dispatched to Seller!</strong>
                <p>The conversation is live in your Direct Messages inbox.</p>
                {onNavigateToMessages && (
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    style={{ marginTop: '0.5rem' }}
                    onClick={() => {
                      onClose();
                      onNavigateToMessages({
                        id: product.sellerId,
                        name: product.sellerName,
                        email: product.sellerEmail,
                        productId: product.id,
                        productTitle: product.title
                      });
                    }}
                  >
                    <span>Open Live Chat</span>
                    <ArrowRight size={14} />
                  </button>
                )}
              </div>
            </div>
          ) : (
            <>
              <textarea
                className="inquiry-textarea"
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message, negotiation, or delivery question..."
                disabled={isSending}
              />
              <button type="submit" className="btn btn-primary btn-send-inquiry" disabled={isSending}>
                {isSending ? (
                  <span className="spinner-sm"></span>
                ) : (
                  <>
                    <Send size={15} />
                    <span>Send In-App Message</span>
                  </>
                )}
              </button>
            </>
          )}
        </form>
      </div>
    </div>
  );
}
