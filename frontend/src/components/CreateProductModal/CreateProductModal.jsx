import React, { useState, useEffect } from 'react';
import { X, Plus, Edit, Tag, Check, AlertCircle, Sparkles, DollarSign, MapPin, Layers } from 'lucide-react';
import { productService } from '../../services/productService';
import { useAuth } from '../../context/AuthContext';
import ImageUpload from '../ImageUpload/ImageUpload';
import './CreateProductModal.css';

const CONDITION_OPTIONS = [
  { value: 'LIKE_NEW', label: 'Like New', desc: 'Flawless condition, original packaging & accessories' },
  { value: 'EXCELLENT', label: 'Excellent', desc: 'Minimal cosmetic signs of use, 100% functional' },
  { value: 'GOOD', label: 'Good', desc: 'Minor scratches or scuffs, fully tested & working' },
  { value: 'FAIR', label: 'Fair', desc: 'Visible wear or battery degradation, fully operational' },
  { value: 'USED', label: 'Used', desc: 'Standard secondhand device, tested and verified' }
];

export default function CreateProductModal({
  categories = [],
  product = null, // if provided, modal is in EDIT mode
  onClose,
  onSaved
}) {
  const { user, isAuthenticated } = useAuth();
  const isEditMode = Boolean(product && product.id);

  const [formData, setFormData] = useState({
    title: product?.title || '',
    category: product?.category || categories[0]?.name || 'Smartphones',
    brand: product?.brand || '',
    model: product?.model || '',
    condition: product?.condition || 'EXCELLENT',
    price: product?.price ? String(product.price) : '',
    originalPrice: product?.originalPrice ? String(product.originalPrice) : '',
    location: product?.location || user?.address || 'San Francisco, CA',
    description: product?.description || '',
    status: product?.status || 'AVAILABLE',
    imageUrls: product?.imageUrls || (product?.primaryImage ? [product.primaryImage] : [])
  });

  useEffect(() => {
    if (user && !isEditMode) {
      setFormData(prev => ({
        ...prev,
        location: prev.location || user.address || 'San Francisco, CA'
      }));
    }
  }, [user, isEditMode]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImagesChange = (newImages) => {
    setFormData(prev => ({ ...prev, imageUrls: newImages }));
  };

  const calculatedDiscount = () => {
    const p = parseFloat(formData.price);
    const orig = parseFloat(formData.originalPrice);
    if (p && orig && orig > p) {
      return Math.round(((orig - p) / orig) * 100);
    }
    return 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const priceNum = parseFloat(formData.price);
    if (isNaN(priceNum) || priceNum <= 0) {
      setError('Please enter a valid price greater than $0.00');
      return;
    }

    if (!formData.title.trim()) {
      setError('Device title is required.');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        title: formData.title.trim(),
        category: formData.category,
        brand: formData.brand.trim(),
        model: formData.model.trim(),
        condition: formData.condition,
        price: priceNum,
        originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : null,
        location: formData.location.trim() || 'Online / Global',
        description: formData.description.trim(),
        status: formData.status,
        imageUrls: formData.imageUrls.length > 0 ? formData.imageUrls : [
          'https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=800'
        ]
      };

      let result;
      if (isEditMode) {
        result = await productService.updateProduct(product.id, payload);
      } else {
        result = await productService.createProduct(payload);
      }

      setSuccess(true);
      setTimeout(() => {
        if (onSaved) onSaved(result);
        onClose();
      }, 1000);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to save listing.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="create-modal-content glass-card" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>
          <X size={20} />
        </button>

        <div className="modal-form-header">
          <div className="badge badge-emerald">
            {isEditMode ? <Edit size={14} /> : <Tag size={14} />}
            <span>{isEditMode ? 'Update Listing' : 'Sell Electronics'}</span>
          </div>
          <h2>
            {isEditMode ? 'Edit' : 'List Your'}{' '}
            <span className="gradient-text">Electronic Device</span>
          </h2>
          <p>
            {isEditMode
              ? 'Update specifications, pricing, and photos for your existing listing.'
              : 'Post your pre-owned gadget for sale or trade on the VoltTrade marketplace.'}
          </p>
        </div>

        {error && (
          <div className="form-alert error">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="form-alert success">
            <Check size={16} />
            <span>
              {isEditMode
                ? 'Device listing updated successfully!'
                : 'Device listing published to marketplace successfully!'}
            </span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="create-form">
          {/* Title */}
          <div className="form-group">
            <label>Device Title *</label>
            <input
              type="text"
              name="title"
              required
              placeholder="e.g. MacBook Pro 14 M3 Max 1TB Space Black"
              value={formData.title}
              onChange={handleChange}
            />
          </div>

          {/* Category & Condition */}
          <div className="form-row">
            <div className="form-group">
              <label>Category *</label>
              <select name="category" value={formData.category} onChange={handleChange} required>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Condition *</label>
              <select name="condition" value={formData.condition} onChange={handleChange} required>
                {CONDITION_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label} — {opt.desc.substring(0, 30)}...
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Brand & Model */}
          <div className="form-row">
            <div className="form-group">
              <label>Brand</label>
              <input
                type="text"
                name="brand"
                placeholder="e.g. Apple, Sony, Dell, Samsung"
                value={formData.brand}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Model Number / Code</label>
              <input
                type="text"
                name="model"
                placeholder="e.g. A2992, WH-1000XM5, CFI-1215A"
                value={formData.model}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Pricing & Discount */}
          <div className="form-row">
            <div className="form-group">
              <label>Selling Price ($) *</label>
              <div className="price-input-wrapper">
                <span className="price-prefix">$</span>
                <input
                  type="number"
                  name="price"
                  step="0.01"
                  min="0.01"
                  required
                  placeholder="e.g. 799.00"
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
                  placeholder="e.g. 1199.00"
                  value={formData.originalPrice}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          {/* Price savings summary */}
          {calculatedDiscount() > 0 && (
            <div className="discount-preview-pill">
              <Sparkles size={14} />
              <span>
                Calculated Buyer Savings:{' '}
                <strong>
                  {calculatedDiscount()}% OFF (Save $
                  {(parseFloat(formData.originalPrice) - parseFloat(formData.price)).toFixed(2)})
                </strong>
              </span>
            </div>
          )}

          {/* Location & Status (if edit mode) */}
          <div className="form-row">
            <div className="form-group">
              <label>Seller Location</label>
              <input
                type="text"
                name="location"
                placeholder="e.g. San Francisco, CA"
                value={formData.location}
                onChange={handleChange}
              />
            </div>

            {isEditMode && (
              <div className="form-group">
                <label>Listing Status</label>
                <select name="status" value={formData.status} onChange={handleChange}>
                  <option value="AVAILABLE">AVAILABLE (Active)</option>
                  <option value="RESERVED">RESERVED (Pending deal)</option>
                  <option value="SOLD">SOLD (Completed)</option>
                  <option value="EXCHANGED">EXCHANGED (Barter swapped)</option>
                </select>
              </div>
            )}
          </div>

          {/* Description */}
          <div className="form-group">
            <label>Device Description & Condition Notes</label>
            <textarea
              name="description"
              rows={3}
              placeholder="Detail battery health (e.g. 94%), cosmetic condition, included cables, original box, warranty..."
              value={formData.description}
              onChange={handleChange}
            />
          </div>

          {/* Image Upload Component */}
          <div className="form-group">
            <ImageUpload
              images={formData.imageUrls}
              onChange={handleImagesChange}
              maxImages={6}
            />
          </div>

          {/* Form Actions */}
          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {isEditMode ? <Edit size={16} /> : <Plus size={16} />}
              <span>{loading ? 'Saving...' : isEditMode ? 'Update Listing' : 'Publish Listing'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
