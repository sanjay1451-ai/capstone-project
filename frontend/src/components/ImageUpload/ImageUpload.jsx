import React, { useState } from 'react';
import { Upload, X, Star, Link, Image as ImageIcon, Sparkles } from 'lucide-react';
import './ImageUpload.css';

const PRESET_GADGET_IMAGES = [
  { label: 'iPhone Space Black', url: 'https://images.unsplash.com/photo-1678652197831-2d180705cd2c?w=800' },
  { label: 'MacBook Pro', url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800' },
  { label: 'Sony Headphones', url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800' },
  { label: 'PlayStation 5', url: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=800' },
  { label: 'iPad Pro', url: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800' },
  { label: 'Smart Watch', url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800' }
];

export default function ImageUpload({ images = [], onChange, maxImages = 5 }) {
  const [urlInput, setUrlInput] = useState('');
  const [showPresets, setShowPresets] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const handleAddUrl = (e) => {
    e?.preventDefault();
    if (!urlInput.trim()) return;
    if (images.length >= maxImages) return;

    const updated = [...images, urlInput.trim()];
    onChange(updated);
    setUrlInput('');
  };

  const handleSelectPreset = (url) => {
    if (images.length >= maxImages) return;
    if (images.includes(url)) return;
    onChange([...images, url]);
  };

  const handleRemove = (indexToRemove) => {
    const updated = images.filter((_, idx) => idx !== indexToRemove);
    onChange(updated);
  };

  const handleSetPrimary = (indexToPrimary) => {
    if (indexToPrimary === 0) return;
    const item = images[indexToPrimary];
    const remaining = images.filter((_, idx) => idx !== indexToPrimary);
    onChange([item, ...remaining]);
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    files.forEach(file => {
      if (images.length >= maxImages) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target.result;
        onChange(prev => {
          if (prev.length < maxImages) {
            return [...prev, base64];
          }
          return prev;
        });
      };
      reader.readAsDataURL(file);
    });
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files || []);
    if (!files.length) return;

    files.forEach(file => {
      if (!file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target.result;
        onChange(prev => {
          if (prev.length < maxImages) {
            return [...prev, base64];
          }
          return prev;
        });
      };
      reader.readAsDataURL(file);
    });
  };

  return (
    <div className="image-upload-wrapper">
      <div className="image-upload-header">
        <label className="upload-label">
          <ImageIcon size={16} />
          <span>Device Photos ({images.length}/{maxImages})</span>
        </label>
        <button
          type="button"
          className="btn-preset-toggle"
          onClick={() => setShowPresets(!showPresets)}
        >
          <Sparkles size={14} />
          <span>{showPresets ? 'Hide Gallery Presets' : 'Sample Presets'}</span>
        </button>
      </div>

      {/* Preset Quick Chooser */}
      {showPresets && (
        <div className="presets-container glass-card">
          <div className="preset-title">Click to add verified gadget showcase photo:</div>
          <div className="preset-grid">
            {PRESET_GADGET_IMAGES.map((preset, i) => (
              <button
                key={i}
                type="button"
                className={`preset-btn ${images.includes(preset.url) ? 'active' : ''}`}
                onClick={() => handleSelectPreset(preset.url)}
                disabled={images.length >= maxImages}
              >
                <img src={preset.url} alt={preset.label} />
                <span>{preset.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Drag & Drop File Zone */}
      <div
        className={`dropzone ${dragOver ? 'dragover' : ''}`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
      >
        <Upload size={28} className="dropzone-icon" />
        <div className="dropzone-text">
          <label htmlFor="file-input-id" className="browse-link">Browse photo files</label>
          <span> or drag & drop images here</span>
        </div>
        <p className="dropzone-hint">Supports PNG, JPG, WebP up to 5MB (Supabase Storage Sync)</p>
        <input
          id="file-input-id"
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileUpload}
          style={{ display: 'none' }}
          disabled={images.length >= maxImages}
        />
      </div>

      {/* Custom URL Input */}
      <div className="url-input-row">
        <div className="url-input-box">
          <Link size={16} className="url-icon" />
          <input
            type="url"
            placeholder="Or paste an image web URL (e.g. https://...)"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddUrl(); } }}
            disabled={images.length >= maxImages}
          />
        </div>
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={handleAddUrl}
          disabled={!urlInput.trim() || images.length >= maxImages}
        >
          Add URL
        </button>
      </div>

      {/* Thumbnails Gallery */}
      {images.length > 0 && (
        <div className="thumbnails-grid">
          {images.map((imgUrl, index) => (
            <div key={index} className={`thumb-card ${index === 0 ? 'primary' : ''}`}>
              <img src={imgUrl} alt={`Upload ${index + 1}`} />
              
              {index === 0 ? (
                <span className="primary-tag">
                  <Star size={10} /> Primary
                </span>
              ) : (
                <button
                  type="button"
                  className="make-primary-btn"
                  onClick={() => handleSetPrimary(index)}
                  title="Make Primary Cover Photo"
                >
                  <Star size={12} />
                </button>
              )}

              <button
                type="button"
                className="remove-thumb-btn"
                onClick={() => handleRemove(index)}
                title="Remove photo"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
