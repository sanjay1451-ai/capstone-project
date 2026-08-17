import React from 'react';
import { MapPin, Sparkles, ShieldCheck, Tag, ArrowRight, ArrowLeftRight } from 'lucide-react';
import './ProductCard.css';

export default function ProductCard({ product, onSelect }) {
  const {
    id,
    title,
    category,
    brand,
    model,
    condition,
    price,
    originalPrice,
    discountPercentage,
    location,
    primaryImage,
    sellerName
  } = product;

  const getConditionColor = (cond) => {
    switch (cond?.toUpperCase()) {
      case 'LIKE_NEW':
        return 'cond-like-new';
      case 'EXCELLENT':
        return 'cond-excellent';
      case 'GOOD':
        return 'cond-good';
      default:
        return 'cond-fair';
    }
  };

  const formatCondition = (cond) => {
    return cond ? cond.replace('_', ' ') : 'VERIFIED';
  };

  return (
    <div className="product-card glass-card" onClick={() => onSelect(product)}>
      {/* Image Wrap & Badges */}
      <div className="product-img-wrapper">
        <img
          src={primaryImage || 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=600'}
          alt={title}
          className="product-img"
          loading="lazy"
        />

        {/* Condition Tag */}
        <span className={`condition-tag ${getConditionColor(condition)}`}>
          {formatCondition(condition)}
        </span>

        {/* Discount Badge if available */}
        {discountPercentage > 0 && (
          <span className="discount-tag">
            {discountPercentage}% OFF
          </span>
        )}
      </div>

      {/* Content */}
      <div className="product-body">
        <div className="product-meta-header">
          <span className="product-category">{category}</span>
          {location && (
            <span className="product-location">
              <MapPin size={12} />
              {location}
            </span>
          )}
        </div>

        <h3 className="product-title" title={title}>{title}</h3>

        {/* Brand & Model tags */}
        <div className="product-specs">
          {brand && <span className="spec-badge">{brand}</span>}
          {model && <span className="spec-badge">{model}</span>}
        </div>

        {/* Price Row */}
        <div className="product-footer">
          <div className="price-block">
            <span className="current-price">${price ? Number(price).toFixed(2) : '0.00'}</span>
            {originalPrice && Number(originalPrice) > Number(price) && (
              <span className="original-price">${Number(originalPrice).toFixed(2)}</span>
            )}
          </div>

          <button className="view-details-btn" aria-label="View product details">
            <span>Details</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
