import React, { useState, useEffect } from 'react';
import { Tag, Sparkles, ShieldCheck, Zap, ArrowRight, CheckCircle2, AlertCircle, RefreshCw, Layers, DollarSign, Image as ImageIcon, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { productService } from '../../services/productService';
import { categoryService } from '../../services/categoryService';
import ImageUpload from '../../components/ImageUpload/ImageUpload';
import './Sell.css';

const CONDITION_OPTIONS = [
  {
    value: 'LIKE_NEW',
    label: 'Like New',
    badge: 'Pristine',
    desc: 'Flawless condition with zero scratches. Original packaging, cables, and 100% battery capacity.'
  },
  {
    value: 'EXCELLENT',
    label: 'Excellent',
    badge: 'Superb',
    desc: 'Minimal micro-scratches barely visible from 8 inches. Screen pristine, fully tested hardware.'
  },
  {
    value: 'GOOD',
    label: 'Good',
    badge: 'Popular',
    desc: 'Minor cosmetic wear on body, 100% fully functioning display, ports, and internal components.'
  },
  {
    value: 'FAIR',
    label: 'Fair',
    badge: 'Budget',
    desc: 'Noticeable signs of usage or battery degradation. Tested 100% operational with no screen cracks.'
  },
  {
    value: 'USED',
    label: 'Used',
    badge: 'Standard',
    desc: 'Standard secondhand device. Cleaned, hardware verified, and ready for immediate reuse.'
  }
];

export default function Sell({ onListingCreated, onBackToHome, onOpenAuthModal }) {
  const { user, isAuthenticated } = useAuth();
  const [categories, setCategories] = useState([]);
  const [loadingCats, setLoadingCats] = useState(true);

  const [formData, setFormData] = useState({
    title: '',
    category: 'Smartphones',
    brand: '',
    model: '',
    condition: 'EXCELLENT',
    price: '',
    originalPrice: '',
    location: user?.address || 'San Francisco, CA',
    description: '',
    imageUrls: []
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [successProduct, setSuccessProduct] = useState(null);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const cats = await categoryService.getCategories();
        setCategories(cats);
        if (cats.length > 0 && !formData.category) {
          setFormData(prev => ({ ...prev, category: cats[0].name }));
        }
      } catch (err) {
        console.error('Failed to load categories:', err);
      } finally {
        setLoadingCats(false);
      }
    }
    fetchCategories();
  }, []);

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        location: prev.location || user.address || 'San Francisco, CA'
      }));
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImagesChange = (urls) => {
    setFormData(prev => ({ ...prev, imageUrls: urls }));
  };

  const calculateDiscount = () => {
    const p = parseFloat(formData.price);
    const orig = parseFloat(formData.originalPrice);
    if (p && orig && orig > p) {
      return Math.round(((orig - p) / orig) * 100);
    }
    return 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      onOpenAuthModal('login');
      return;
    }

    setError(null);
    const priceNum = parseFloat(formData.price);
    if (isNaN(priceNum) || priceNum <= 0) {
      setError('Please provide a valid listing price greater than $0.00');
      return;
    }

    if (!formData.title.trim()) {
      setError('Product title is required.');
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        title: formData.title.trim(),
        category: formData.category,
        brand: formData.brand.trim(),
        model: formData.model.trim(),
        condition: formData.condition,
        price: priceNum,
        originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : null,
        location: formData.location.trim() || 'United States',
        description: formData.description.trim(),
        status: 'AVAILABLE',
        imageUrls: formData.imageUrls.length > 0 ? formData.imageUrls : [
          'https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=800'
        ]
      };

      const result = await productService.createProduct(payload);
      setSuccessProduct(result);
      if (onListingCreated) onListingCreated(result);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to list product. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (successProduct) {
    return (
      <div className="sell-page container animate-fade-in">
        <div className="sell-success-card glass-card">
          <div className="success-icon-wrap">
            <CheckCircle2 size={48} className="text-emerald-400" />
          </div>
          <h2>Listing Published Successfully!</h2>
          <p>
            Your device <strong>"{successProduct.title}"</strong> is now live on the VoltTrade marketplace and visible to buyers worldwide.
          </p>

          <div className="success-product-preview">
            <img
              src={successProduct.primaryImage || 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=500'}
              alt={successProduct.title}
            />
            <div className="preview-info">
              <span className="badge badge-emerald">{successProduct.condition}</span>
              <h4>{successProduct.title}</h4>
              <span className="price-tag">${parseFloat(successProduct.price).toFixed(2)}</span>
            </div>
          </div>

          <div className="success-actions">
            <button className="btn btn-primary" onClick={onBackToHome}>
              <span>View in Marketplace</span>
              <ArrowRight size={16} />
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => {
                setSuccessProduct(null);
                setFormData({
                  title: '',
                  category: categories[0]?.name || 'Smartphones',
                  brand: '',
                  model: '',
                  condition: 'EXCELLENT',
                  price: '',
                  originalPrice: '',
                  location: user?.address || 'San Francisco, CA',
                  description: '',
                  imageUrls: []
                });
              }}
            >
              <span>List Another Device</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="sell-page container animate-fade-in">
      {/* Back Button */}
      <button className="btn-back" onClick={onBackToHome}>
        <ArrowLeft size={16} />
        <span>Back to Marketplace</span>
      </button>

      {/* Hero Banner */}
      <div className="sell-hero glass-card">
        <div className="sell-hero-content">
          <div className="badge badge-emerald">
            <Sparkles size={14} />
            <span>Zero Listing Fees</span>
          </div>
          <h1>Sell Your <span className="gradient-text">Electronic Devices</span></h1>
          <p>
            Turn your unused smartphones, laptops, gaming consoles, and audio gear into instant cash or barter for your next gadget upgrade.
          </p>
        </div>

        <div className="sell-perks-grid">
          <div className="perk-card">
            <ShieldCheck size={20} className="text-emerald-400" />
            <div>
              <strong>Verified Buyers</strong>
              <span>Protected transactions & automated payouts</span>
            </div>
          </div>
          <div className="perk-card">
            <Zap size={20} className="text-accent" />
            <div>
              <strong>Instant Publishing</strong>
              <span>Live in seconds on Supabase PostgreSQL</span>
            </div>
          </div>
        </div>
      </div>

      {/* Form Container */}
      <div className="sell-form-container glass-card">
        <div className="form-header">
          <h2>Device Specification Form</h2>
          <p>Fill out accurate information to help verified buyers discover and purchase your listing.</p>
        </div>

        {!isAuthenticated && (
          <div className="unauth-sell-banner">
            <AlertCircle size={18} />
            <span>You are currently browsing as a guest. Please sign in or register to publish your device.</span>
            <button className="btn btn-sm btn-primary" onClick={() => onOpenAuthModal('login')}>
              Sign In
            </button>
          </div>
        )}

        {error && (
          <div className="form-alert error">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="sell-form">
          {/* Section 1: Basic Info */}
          <div className="form-section">
            <h3 className="section-title">
              <span className="section-num">1</span>
              <span>Device Overview</span>
            </h3>

            <div className="form-group">
              <label>Device Title *</label>
              <input
                type="text"
                name="title"
                required
                placeholder="e.g. Sony PlayStation 5 Disc Edition 1TB + God of War"
                value={formData.title}
                onChange={handleChange}
              />
              <span className="field-hint">Include brand, model, and key specs like storage or color.</span>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Category *</label>
                <select name="category" value={formData.category} onChange={handleChange} required>
                  {categories.map(c => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Brand</label>
                <input
                  type="text"
                  name="brand"
                  placeholder="e.g. Apple, Sony, Microsoft, Dell"
                  value={formData.brand}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Model Number / Code</label>
                <input
                  type="text"
                  name="model"
                  placeholder="e.g. CFI-1215A, A2992, WH-1000XM5"
                  value={formData.model}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Item Location</label>
                <input
                  type="text"
                  name="location"
                  placeholder="e.g. San Francisco, CA"
                  value={formData.location}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          {/* Section 2: Condition */}
          <div className="form-section">
            <h3 className="section-title">
              <span className="section-num">2</span>
              <span>Condition Assessment</span>
            </h3>

            <div className="condition-picker-grid">
              {CONDITION_OPTIONS.map(opt => (
                <div
                  key={opt.value}
                  className={`condition-select-card ${formData.condition === opt.value ? 'selected' : ''}`}
                  onClick={() => setFormData(prev => ({ ...prev, condition: opt.value }))}
                >
                  <div className="card-top">
                    <strong>{opt.label}</strong>
                    <span className="badge badge-emerald">{opt.badge}</span>
                  </div>
                  <p>{opt.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: Pricing */}
          <div className="form-section">
            <h3 className="section-title">
              <span className="section-num">3</span>
              <span>Pricing & Value</span>
            </h3>

            <div className="form-row">
              <div className="form-group">
                <label>Your Selling Price ($) *</label>
                <div className="price-input-wrapper">
                  <span className="price-prefix">$</span>
                  <input
                    type="number"
                    name="price"
                    step="0.01"
                    min="0.01"
                    required
                    placeholder="e.g. 420.00"
                    value={formData.price}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Original Retail Price ($)</label>
                <div className="price-input-wrapper">
                  <span className="price-prefix">$</span>
                  <input
                    type="number"
                    name="originalPrice"
                    step="0.01"
                    placeholder="e.g. 499.99"
                    value={formData.originalPrice}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            {calculateDiscount() > 0 && (
              <div className="discount-preview-pill">
                <Sparkles size={16} />
                <span>
                  Buyer Savings Highlight:{' '}
                  <strong>
                    {calculateDiscount()}% OFF (Save $
                    {(parseFloat(formData.originalPrice) - parseFloat(formData.price)).toFixed(2)})
                  </strong>
                </span>
              </div>
            )}

            <div className="form-group">
              <label>Detailed Description & Condition Notes</label>
              <textarea
                name="description"
                rows={4}
                placeholder="Include details about battery health, cosmetic condition, included cables, original box, proof of purchase, and carrier lock status..."
                value={formData.description}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Section 4: Images */}
          <div className="form-section">
            <h3 className="section-title">
              <span className="section-num">4</span>
              <span>Device Photos (Supabase Storage)</span>
            </h3>

            <ImageUpload
              images={formData.imageUrls}
              onChange={handleImagesChange}
              maxImages={6}
            />
          </div>

          {/* Submit Action */}
          <div className="sell-submit-bar">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onBackToHome}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary btn-lg"
              disabled={submitting}
            >
              <Sparkles size={18} />
              <span>{submitting ? 'Publishing Listing...' : 'Publish Device Listing'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
