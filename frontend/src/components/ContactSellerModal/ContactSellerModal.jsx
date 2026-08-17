import React, { useState } from 'react';
import { X, Mail, Phone, UserCheck, MessageSquare, Send, CheckCircle2, Copy } from 'lucide-react';
import './ContactSellerModal.css';

export default function ContactSellerModal({ product, onClose }) {
  if (!product) return null;

  const [message, setMessage] = useState(`Hi ${product.sellerName || 'there'}, I am interested in purchasing your "${product.title}". Is it still available?`);
  const [sent, setSent] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState(false);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    setSent(true);
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
              <h4>{product.sellerName || 'EcoTrade Verified Seller'}</h4>
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
                <strong>Message Dispatched!</strong>
                <p>The seller has been notified and will contact you via email/SMS shortly.</p>
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
              />
              <button type="submit" className="btn btn-primary btn-send-inquiry">
                <Send size={15} />
                <span>Send Direct Inquiry</span>
              </button>
            </>
          )}
        </form>
      </div>
    </div>
  );
}
