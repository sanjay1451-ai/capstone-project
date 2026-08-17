import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, Shield, Calendar, Edit3, Save, CheckCircle2, AlertCircle, LogOut, PlusCircle, ArrowLeft, Key } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './Profile.css';

export default function Profile({ onOpenAuthModal, onOpenCreateModal, onBackToHome }) {
  const { user, token, isAuthenticated, updateProfile, logout } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    profileImage: ''
  });
  const [saveStatus, setSaveStatus] = useState({ state: 'idle', message: '' }); // 'idle' | 'saving' | 'success' | 'error'

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        phone: user.phone || '',
        address: user.address || '',
        profileImage: user.profileImage || ''
      });
    }
  }, [user]);

  if (!isAuthenticated || !user) {
    return (
      <div className="profile-page container">
        <div className="unauth-profile-card glass-card animate-fade-in">
          <div className="unauth-icon-wrap">
            <Shield size={40} className="text-accent" />
          </div>
          <h2>Authentication Required</h2>
          <p>Please log in or create an account to access your personal profile, listings, and trade proposals.</p>
          <div className="unauth-actions">
            <button className="btn btn-primary" onClick={() => onOpenAuthModal('login')}>
              Sign In Now
            </button>
            <button className="btn btn-outline" onClick={() => onOpenAuthModal('register')}>
              Create Account
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaveStatus({ state: 'saving', message: 'Updating profile...' });

    try {
      await updateProfile(formData);
      setSaveStatus({ state: 'success', message: 'Profile updated successfully!' });
      setIsEditing(false);
      setTimeout(() => setSaveStatus({ state: 'idle', message: '' }), 4000);
    } catch (err) {
      setSaveStatus({ state: 'error', message: err.message || 'Failed to update profile' });
    }
  };

  const formattedDate = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    : 'Recently';

  return (
    <div className="profile-page container animate-fade-in">
      {/* Top Breadcrumb / Action Bar */}
      <div className="profile-top-bar">
        <button className="btn-back" onClick={onBackToHome}>
          <ArrowLeft size={16} />
          <span>Back to Marketplace</span>
        </button>
        <div className="profile-top-actions">
          <button className="btn btn-outline-danger" onClick={logout}>
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Main Profile Grid */}
      <div className="profile-grid">
        {/* Left Card: User Identity & Avatar */}
        <div className="profile-identity-card glass-card">
          <div className="profile-avatar-container">
            <img
              src={user.profileImage || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
              alt={user.name}
              className="profile-avatar-img"
              onError={(e) => {
                e.target.src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150';
              }}
            />
            <span className={`role-pill ${user.role === 'ROLE_ADMIN' ? 'role-admin' : 'role-user'}`}>
              <Shield size={12} />
              {user.role === 'ROLE_ADMIN' ? 'Administrator' : 'Verified Member'}
            </span>
          </div>

          <h2 className="profile-name">{user.name}</h2>
          <p className="profile-email">{user.email}</p>

          <div className="profile-meta-list">
            <div className="meta-item">
              <Calendar size={15} className="meta-icon" />
              <span>Joined {formattedDate}</span>
            </div>
            <div className="meta-item">
              <Key size={15} className="meta-icon" />
              <span>Account ID: #{user.id}</span>
            </div>
          </div>

          <div className="profile-quick-links">
            <button className="btn btn-primary w-full" onClick={onOpenCreateModal}>
              <PlusCircle size={16} />
              <span>List New Device</span>
            </button>
          </div>
        </div>

        {/* Right Card: Profile Details & Edit Mode */}
        <div className="profile-details-card glass-card">
          <div className="details-header">
            <div>
              <h3 className="details-title">Account Details</h3>
              <p className="details-subtitle">Manage your personal and shipping information</p>
            </div>
            {!isEditing ? (
              <button className="btn btn-outline btn-sm" onClick={() => setIsEditing(true)}>
                <Edit3 size={15} />
                <span>Edit Profile</span>
              </button>
            ) : (
              <button className="btn btn-ghost btn-sm" onClick={() => setIsEditing(false)}>
                Cancel
              </button>
            )}
          </div>

          {/* Feedback status banner */}
          {saveStatus.state !== 'idle' && (
            <div className={`status-banner banner-${saveStatus.state} animate-fade-in`}>
              {saveStatus.state === 'success' && <CheckCircle2 size={16} />}
              {saveStatus.state === 'error' && <AlertCircle size={16} />}
              <span>{saveStatus.message}</span>
            </div>
          )}

          {!isEditing ? (
            /* VIEW MODE */
            <div className="details-view-grid">
              <div className="detail-item">
                <span className="detail-label">Full Name</span>
                <span className="detail-value">{user.name}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Email Address (Read-only)</span>
                <span className="detail-value text-accent">{user.email}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Phone Number</span>
                <span className="detail-value">{user.phone || 'Not provided'}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Shipping / City Address</span>
                <span className="detail-value">{user.address || 'Not provided'}</span>
              </div>
              <div className="detail-item full-width">
                <span className="detail-label">Security Role & Access</span>
                <div className="role-access-box">
                  <span className="role-code">{user.role}</span>
                  <span className="role-desc">
                    {user.role === 'ROLE_ADMIN'
                      ? 'Full privileges: manage all product listings, categories, and review flags.'
                      : 'Standard privileges: buy, list devices, negotiate swaps, and rate products.'}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            /* EDIT MODE */
            <form className="details-edit-form" onSubmit={handleSaveProfile}>
              <div className="form-group">
                <label className="form-label" htmlFor="edit-name">Full Name *</label>
                <div className="input-icon-wrapper">
                  <User className="field-icon" size={18} />
                  <input
                    id="edit-name"
                    type="text"
                    className="form-input with-icon"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="edit-phone">Phone Number</label>
                <div className="input-icon-wrapper">
                  <Phone className="field-icon" size={18} />
                  <input
                    id="edit-phone"
                    type="tel"
                    className="form-input with-icon"
                    placeholder="+1-555-0192"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="edit-address">Delivery Address</label>
                <div className="input-icon-wrapper">
                  <MapPin className="field-icon" size={18} />
                  <input
                    id="edit-address"
                    type="text"
                    className="form-input with-icon"
                    placeholder="123 Tech Blvd, Suite 4, City, State"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="edit-avatar">Profile Image URL</label>
                <input
                  id="edit-avatar"
                  type="url"
                  className="form-input"
                  placeholder="https://..."
                  value={formData.profileImage}
                  onChange={(e) => setFormData({ ...formData, profileImage: e.target.value })}
                />
              </div>

              <div className="edit-form-actions">
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={saveStatus.state === 'saving'}
                >
                  <Save size={16} />
                  <span>{saveStatus.state === 'saving' ? 'Saving...' : 'Save Changes'}</span>
                </button>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {/* JWT Session Information Section */}
          <div className="jwt-session-card">
            <div className="jwt-header">
              <Key size={14} className="text-accent" />
              <span>Active JWT Session Authentication</span>
            </div>
            <p className="jwt-desc">
              Your session is cryptographically signed using HS256 JWT tokens. Private APIs automatically authenticate your identity via HTTP Authorization headers.
            </p>
            <div className="jwt-token-preview">
              <code>{token ? `${token.substring(0, 36)}•••••••••••••••••••••` : 'No Token'}</code>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
