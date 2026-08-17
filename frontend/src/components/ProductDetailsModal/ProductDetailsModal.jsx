import React, { useState, useEffect } from 'react';
import { X, ShieldCheck, MapPin, Tag, ArrowLeftRight, ShoppingBag, Heart, Check, Leaf, UserCheck, Phone, Mail, Star, MessageSquare, Send, AlertCircle } from 'lucide-react';
import { reviewService } from '../../services/reviewService';
import { favoriteService } from '../../services/favoriteService';
import { useAuth } from '../../context/AuthContext';
import './ProductDetailsModal.css';

export default function ProductDetailsModal({
  product,
  onClose,
  onOpenCheckout,
  onOpenExchange,
  onOpenAuthModal
}) {
  if (!product) return null;

  const { user, isAuthenticated } = useAuth();
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
    primaryImage
  } = product;

  // Build images array
  const allImages = imageUrls.length > 0 
    ? imageUrls 
    : [primaryImage || 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=800'];

  const [activeImage, setActiveImage] = useState(allImages[0]);
  const [isFav, setIsFav] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [ratingSummary, setRatingSummary] = useState({ averageRating: 5.0, totalReviews: 0 });
  const [loadingReviews, setLoadingReviews] = useState(true);

  // Review Form States
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState(false);

  useEffect(() => {
    setActiveImage(allImages[0]);
  }, [product]);

  useEffect(() => {
    if (id) {
      // Load reviews
      reviewService.getProductReviews(id)
        .then(data => setReviews(data))
        .catch(err => console.log('Error loading reviews:', err))
        .finally(() => setLoadingReviews(false));

      // Load rating summary
      reviewService.getRatingSummary(id)
        .then(summary => setRatingSummary(summary))
        .catch(err => console.log('Error loading summary:', err));

      // Check favorite
      if (isAuthenticated) {
        favoriteService.checkIsFavorite(id)
          .then(status => setIsFav(status))
          .catch(() => {});
      }
    }
  }, [id, isAuthenticated]);

  const handleToggleFavorite = async () => {
    if (!isAuthenticated) {
      if (onOpenAuthModal) onOpenAuthModal('login');
      return;
    }
    try {
      const res = await favoriteService.toggleFavorite(id);
      setIsFav(res.isFavorite);
    } catch (err) {
      console.error('Error toggling favorite:', err);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      if (onOpenAuthModal) onOpenAuthModal('login');
      return;
    }
    if (!newComment.trim()) {
      setReviewError('Please enter a review comment.');
      return;
    }

    setSubmittingReview(true);
    setReviewError('');
    try {
      const created = await reviewService.addReview(id, {
        rating: newRating,
        comment: newComment.trim()
      });
      setReviews(prev => [created, ...prev]);
      setRatingSummary(prev => ({
        averageRating: Math.round(((prev.averageRating * prev.totalReviews + newRating) / (prev.totalReviews + 1)) * 10) / 10,
        totalReviews: prev.totalReviews + 1
      }));
      setNewComment('');
      setReviewSuccess(true);
      setTimeout(() => setReviewSuccess(false), 3000);
    } catch (err) {
      setReviewError(err.response?.data?.message || err.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleBuyClick = () => {
    if (!isAuthenticated) {
      if (onOpenAuthModal) onOpenAuthModal('login');
      return;
    }
    if (onOpenCheckout) onOpenCheckout(product);
  };

  const handleExchangeClick = () => {
    if (!isAuthenticated) {
      if (onOpenAuthModal) onOpenAuthModal('login');
      return;
    }
    if (onOpenExchange) onOpenExchange(product);
  };

  const savingsAmount = originalPrice && price && Number(originalPrice) > Number(price)
    ? (Number(originalPrice) - Number(price)).toFixed(2)
    : null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content glass-card animate-fade-in" onClick={(e) => e.stopPropagation()}>
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
              <button
                className={`modal-fav-btn ${isFav ? 'active' : ''}`}
                onClick={handleToggleFavorite}
                title={isFav ? 'Remove from wishlist' : 'Add to wishlist'}
              >
                <Heart size={18} fill={isFav ? '#ef4444' : 'none'} color={isFav ? '#ef4444' : 'currentColor'} />
              </button>
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
                <span>Reusing this device saves ~32kg of CO₂ and prevents toxic e-waste landfill pollution.</span>
              </div>
            </div>
          </div>

          {/* Right Column: Details & Actions */}
          <div className="modal-details">
            <div className="category-breadcrumb">
              <span>{category}</span> &bull; <span>{brand || 'Electronics'}</span>
            </div>

            <h2 className="detail-title">{title}</h2>

            {/* Rating Stars Header */}
            <div className="detail-rating-row">
              <div className="stars-cluster">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={15}
                    className={star <= Math.round(ratingSummary.averageRating) ? 'star-filled' : 'star-empty'}
                  />
                ))}
              </div>
              <span className="rating-num">{ratingSummary.averageRating.toFixed(1)}</span>
              <span className="rating-count">({ratingSummary.totalReviews} review{ratingSummary.totalReviews !== 1 ? 's' : ''})</span>
            </div>

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
                <span className="seller-title">Verified Seller: <strong>{sellerName || 'VoltTrade Member'}</strong></span>
              </div>
              <div className="seller-contacts">
                {sellerEmail && <span><Mail size={13} /> {sellerEmail}</span>}
                {sellerPhone && <span><Phone size={13} /> {sellerPhone}</span>}
              </div>
            </div>

            {/* Primary Action Buttons */}
            <div className="detail-actions">
              <button 
                className="btn btn-primary buy-btn"
                onClick={handleBuyClick}
              >
                <ShoppingBag size={18} />
                <span>Buy Now</span>
              </button>

              <button 
                className="btn btn-secondary exchange-btn"
                onClick={handleExchangeClick}
              >
                <ArrowLeftRight size={18} />
                <span>Propose Exchange</span>
              </button>
            </div>

            {/* Verified Recommerce Guarantee */}
            <div className="guarantee-strip">
              <ShieldCheck size={16} className="text-emerald-400" />
              <span>30-Day VoltTrade Buyer Protection & Anti-Fraud Guarantee</span>
            </div>

            {/* ================= REVIEWS SECTION ================= */}
            <div className="reviews-section">
              <div className="reviews-header">
                <div className="reviews-title-wrap">
                  <MessageSquare size={18} className="text-accent" />
                  <h4>Community Reviews ({reviews.length})</h4>
                </div>
              </div>

              {/* Add Review Form */}
              <form className="add-review-box glass-card" onSubmit={handleSubmitReview}>
                <h5>Write a Verified Review</h5>
                
                {reviewError && (
                  <div className="form-alert error small animate-shake">
                    <AlertCircle size={14} />
                    <span>{reviewError}</span>
                  </div>
                )}

                {reviewSuccess && (
                  <div className="form-alert success small animate-fade-in">
                    <Check size={14} />
                    <span>Your review was published successfully!</span>
                  </div>
                )}

                <div className="star-picker-row">
                  <span>Rating:</span>
                  <div className="star-picker">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        className={`star-pick-btn ${star <= newRating ? 'active' : ''}`}
                        onClick={() => setNewRating(star)}
                      >
                        <Star size={16} fill={star <= newRating ? '#f59e0b' : 'none'} />
                      </button>
                    ))}
                  </div>
                  <span className="rating-label-text">
                    {newRating === 5 ? 'Exceptional' : newRating === 4 ? 'Very Good' : newRating === 3 ? 'Good' : newRating === 2 ? 'Fair' : 'Poor'}
                  </span>
                </div>

                <div className="review-input-row">
                  <textarea
                    className="form-textarea review-textarea"
                    rows={2}
                    placeholder={isAuthenticated ? "Share your experience with this device or seller..." : "Sign in to post a review"}
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    disabled={submittingReview}
                  />
                  <button
                    type="submit"
                    className="btn btn-primary btn-sm submit-review-btn"
                    disabled={submittingReview}
                  >
                    {submittingReview ? <span className="spinner-sm"></span> : <Send size={14} />}
                  </button>
                </div>
              </form>

              {/* Reviews List */}
              <div className="reviews-list">
                {loadingReviews ? (
                  <p className="loading-reviews-text">Loading reviews...</p>
                ) : reviews.length === 0 ? (
                  <div className="empty-reviews-state">
                    <p>No reviews yet. Be the first to review this device!</p>
                  </div>
                ) : (
                  reviews.map((rev) => (
                    <div key={rev.id} className="review-card glass-card">
                      <div className="review-user-row">
                        <img
                          src={rev.reviewerAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
                          alt={rev.reviewerName}
                          className="reviewer-avatar"
                        />
                        <div className="reviewer-meta">
                          <span className="reviewer-name">{rev.reviewerName}</span>
                          <div className="stars-cluster small">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star
                                key={s}
                                size={12}
                                className={s <= rev.rating ? 'star-filled' : 'star-empty'}
                              />
                            ))}
                          </div>
                        </div>
                        <span className="review-time">
                          {rev.createdAt ? new Date(rev.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Recently'}
                        </span>
                      </div>
                      <p className="review-comment-text">{rev.comment}</p>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
