import React, { useState, useEffect } from 'react';
import { X, ShieldCheck, MapPin, Tag, ArrowLeftRight, ShoppingBag, Heart, Check, Leaf, UserCheck, Phone, Mail } from 'lucide-react';
import './ProductDetailsModal.css';

export default function ProductDetailsModal({ product, onClose }) {
  if (!product) return null;

  const {
    id,
    title,
    description,
    category,
    brand,
    model,
    condition,
    price,
    originalPrice,
    discountPercentage,
    location,
    sellerName,
    sellerEmail,
    sellerPhone,
    imageUrls = [],
    primaryImage,
    createdAt
  } = product;

  // Build images array
  const allImages = imageUrls.length > 0 
    ? imageUrls 
    : [primaryImage || 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=800'];

  const [activeImage, setActiveImage] = useState(allImages[0]);
  const [exchangeSent, setExchangeSent] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);

  useEffect(() => {
    setActiveImage(allImages[0]);
  }, [product]);

  const savingsAmount = originalPrice && price && Number(originalPrice) > Number(price)
    ? (Number(originalPrice) - Number(price)).toFixed(2)
    : null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content glass-card" onClick={(e) => e.stopPropagation()}>
        {/* Close button */}
        <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
          <X size={20} />
        </button>

        <div className="modal-grid">
          {/* Left Column: Image Gallery */}
          <div className="modal-gallery">
            <div className="main-image-wrap">
              <img src={activeImage} alt={title} className="main-img" />
              <div className="condition-pill">
                {condition ? condition.replace('_', ' ') : 'VERIFIED'}
              </div>
            </div>

            {/* Thumbnails */}
            {allImages.length > 1 && (
              <div className="thumbnail-row">
                {allImages.map((img, idx) => (
                  <button
                    key={idx}
                    className={`thumb-btn ${activeImage === img ? 'active' : ''}`}
                    onClick={() => setActiveImage(img)}
                  >
                    <img src={img} alt={`Thumbnail ${idx + 1}`} />
                  </button>
                ))}
              </div>
            )}

            {/* Eco Impact Calculator Callout */}
            <div className="eco-callout">
              <div className="eco-icon-wrap">
                <Leaf size={20} />
              </div>
              <div className="eco-text">
                <strong>Circular Tech Impact:</strong>
                <span>Reusing this device saves ~32kg of CO₂ and prevents e-waste landfill contamination.</span>
              </div>
            </div>
          </div>

          {/* Right Column: Details & Actions */}
          <div className="modal-details">
            <div className="category-breadcrumb">
              <span>{category}</span> &bull; <span>{brand || 'Electronics'}</span>
            </div>

            <h2 className="detail-title">{title}</h2>

            {/* Pricing Box */}
            <div className="detail-price-box">
              <div className="price-primary">
                <span className="price-tag">${price ? Number(price).toFixed(2) : '0.00'}</span>
                {originalPrice && Number(originalPrice) > Number(price) && (
                  <span className="original-strike">${Number(originalPrice).toFixed(2)}</span>
                )}
              </div>
              {discountPercentage > 0 && (
                <span className="savings-badge">
                  Save ${savingsAmount} ({discountPercentage}% OFF)
                </span>
              )}
            </div>

            {/* Tech Specs */}
            <div className="specs-table">
              <div className="spec-row">
                <span className="spec-label">Condition:</span>
                <span className="spec-value highlight">{condition ? condition.replace('_', ' ') : 'N/A'}</span>
              </div>
              <div className="spec-row">
                <span className="spec-label">Brand / Model:</span>
                <span className="spec-value">{brand || '—'} {model ? `(${model})` : ''}</span>
              </div>
              <div className="spec-row">
                <span className="spec-label">Location:</span>
                <span className="spec-value">
                  <MapPin size={14} /> {location || 'United States'}
                </span>
              </div>
              <div className="spec-row">
                <span className="spec-label">Listing ID:</span>
                <span className="spec-value">#VT-{id}</span>
              </div>
            </div>

            {/* Description */}
            <div className="detail-description">
              <h4>Item Description</h4>
              <p>{description || 'No description provided by the seller.'}</p>
            </div>

            {/* Seller Card */}
            <div className="seller-box">
              <div className="seller-header">
                <UserCheck size={18} className="seller-icon" />
                <span className="seller-title">Verified Seller: <strong>{sellerName || 'EcoTrade User'}</strong></span>
              </div>
              <div className="seller-contacts">
                {sellerEmail && <span><Mail size={13} /> {sellerEmail}</span>}
                {sellerPhone && <span><Phone size={13} /> {sellerPhone}</span>}
              </div>
            </div>

            {/* Actions */}
            <div className="detail-actions">
              <button 
                className={`btn btn-primary buy-btn ${orderSuccess ? 'done' : ''}`}
                onClick={() => setOrderSuccess(true)}
              >
                <ShoppingBag size={18} />
                <span>{orderSuccess ? 'Order Placed (Demo)' : 'Buy Now'}</span>
              </button>

              <button 
                className={`btn btn-secondary exchange-btn ${exchangeSent ? 'done' : ''}`}
                onClick={() => setExchangeSent(true)}
              >
                <ArrowLeftRight size={18} />
                <span>{exchangeSent ? 'Exchange Proposed' : 'Propose Exchange'}</span>
              </button>
            </div>

            {orderSuccess && (
              <div className="action-feedback success">
                <Check size={16} /> Order record generated in Supabase schema format!
              </div>
            )}

            {exchangeSent && (
              <div className="action-feedback info">
                <Check size={16} /> Exchange request proposal ready for Phase 3 peer matching!
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
