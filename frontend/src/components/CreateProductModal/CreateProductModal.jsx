import React, { useState, useEffect } from 'react';
import { X, Plus, Image as ImageIcon, Tag, Check, AlertCircle } from 'lucide-react';
import { productService } from '../../services/productService';
import { useAuth } from '../../context/AuthContext';
import './CreateProductModal.css';

export default function CreateProductModal({ categories = [], onClose, onCreated }) {
  const { user, isAuthenticated } = useAuth();

  const [formData, setFormData] = useState({
    title: '',
    category: categories[0]?.name || 'Smartphones',
    brand: '',
    model: '',
    condition: 'EXCELLENT',
    price: '',
    originalPrice: '',
    location: user?.address || 'San Francisco, CA',
    description: '',
    imageUrl: '',
    sellerId: user?.id || 1
  });

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        sellerId: user.id || 1,
        location: prev.location || user.address || 'San Francisco, CA'
      }));
    }
  }, [user]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const payload = {
        sellerId: formData.sellerId || 1,
        title: formData.title,
        category: formData.category,
        brand: formData.brand,
        model: formData.model,
        condition: formData.condition,
        price: parseFloat(formData.price),
        originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : null,
        location: formData.location || 'United States',
        description: formData.description,
        status: 'AVAILABLE',
        imageUrls: formData.imageUrl ? [formData.imageUrl.trim()] : []
      };

      const result = await productService.createProduct(payload);
      setSuccess(true);
      setTimeout(() => {
        onCreated(result);
        onClose();
      }, 1000);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to list product');
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
            <Tag size={14} />
            <span>Marketplace Listing</span>
          </div>
          <h2>List a <span className="gradient-text">Second-Hand Device</span></h2>
          <p>Create a verified electronic listing in the PostgreSQL database.</p>
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
            <span>Product listing published to Supabase database successfully!</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="create-form">
          <div className="form-group">
            <label>Device Title *</label>
            <input
              type="text"
              name="title"
              required
              placeholder="e.g. MacBook Pro 14 M3 Pro 512GB Space Black"
              value={formData.title}
              onChange={handleChange}
            />
          </div>

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
                <option value="LIKE_NEW">Like New</option>
                <option value="EXCELLENT">Excellent</option>
                <option value="GOOD">Good</option>
                <option value="FAIR">Fair</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Brand</label>
              <input
                type="text"
                name="brand"
                placeholder="e.g. Apple, Sony, Dell"
                value={formData.brand}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Model</label>
              <input
                type="text"
                name="model"
                placeholder="e.g. A2992, WH-1000XM5"
                value={formData.model}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Listing Price ($) *</label>
              <input
                type="number"
                name="price"
                step="0.01"
                min="0.01"
                required
                placeholder="e.g. 899.00"
                value={formData.price}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Original Retail Price ($)</label>
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

          <div className="form-group">
            <label>Location</label>
            <input
              type="text"
              name="location"
              placeholder="e.g. San Francisco, CA"
              value={formData.location}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Image URL</label>
            <input
              type="url"
              name="imageUrl"
              placeholder="https://images.unsplash.com/..."
              value={formData.imageUrl}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              name="description"
              rows={3}
              placeholder="Detail device condition, battery health, included accessories..."
              value={formData.description}
              onChange={handleChange}
            />
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              <Plus size={16} />
              <span>{loading ? 'Publishing...' : 'Publish Listing'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
