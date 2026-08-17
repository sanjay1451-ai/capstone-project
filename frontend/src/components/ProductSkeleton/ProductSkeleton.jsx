import React from 'react';
import './ProductSkeleton.css';

export default function ProductSkeleton({ count = 8 }) {
  return (
    <div className="skeleton-grid">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="product-skeleton-card glass-card">
          <div className="skeleton-image-box skeleton-pulse"></div>
          <div className="skeleton-body">
            <div className="skeleton-line-sm skeleton-pulse"></div>
            <div className="skeleton-line-lg skeleton-pulse"></div>
            <div className="skeleton-line-md skeleton-pulse"></div>
            <div className="skeleton-footer-row">
              <div className="skeleton-price skeleton-pulse"></div>
              <div className="skeleton-btn skeleton-pulse"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
