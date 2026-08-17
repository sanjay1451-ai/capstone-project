import React, { useState, useRef, useEffect } from 'react';
import { Zap, PlusCircle, ShoppingBag, Layers, Activity, User, LogIn, UserPlus, LogOut, Shield, ChevronDown, ArrowRightLeft, Heart, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './Navbar.css';

export default function Navbar({
  activeTab,
  onSelectTab,
  onOpenCreateModal,
  onOpenAuthModal,
  backendStatus
}) {
  const { user, isAuthenticated, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleTabClick = (tab) => {
    setIsDropdownOpen(false);
    onSelectTab(tab);
  };

  const handleLogoutClick = () => {
    setIsDropdownOpen(false);
    logout();
    if (activeTab === 'dashboard' || activeTab === 'profile') {
      onSelectTab('home');
    }
  };

  return (
    <header className="navbar-wrapper">
      <div className="container navbar-container">
        {/* Brand Logo */}
        <div className="brand" onClick={() => onSelectTab('home')} role="button" tabIndex={0}>
          <div className="brand-icon-wrapper">
            <Zap className="brand-icon" size={24} />
          </div>
          <div className="brand-text">
            <span className="brand-title">Volt<span className="gradient-text">Trade</span></span>
            <span className="brand-subtitle">Electronics Recommerce</span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="nav-links">
          <button 
            className={`nav-link-btn ${activeTab === 'home' ? 'active' : ''}`}
            onClick={() => onSelectTab('home')}
          >
            Home
          </button>
          <button 
            className={`nav-link-btn ${activeTab === 'products' ? 'active' : ''}`}
            onClick={() => onSelectTab('products')}
          >
            <ShoppingBag size={16} />
            <span>Marketplace</span>
          </button>
          <button 
            className={`nav-link-btn ${activeTab === 'categories' ? 'active' : ''}`}
            onClick={() => onSelectTab('categories')}
          >
            <Layers size={16} />
            <span>Categories</span>
          </button>
          {isAuthenticated && (
            <button 
              className={`nav-link-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => onSelectTab('dashboard')}
            >
              <LayoutDashboard size={16} />
              <span>Dashboard</span>
            </button>
          )}
          <button 
            className={`nav-link-btn ${activeTab === 'health' ? 'active' : ''}`}
            onClick={() => onSelectTab('health')}
          >
            <Activity size={16} />
            <span>API Status</span>
          </button>
        </nav>

        {/* Navbar Actions & Auth State */}
        <div className="navbar-actions">
          {/* API Health Pill */}
          <div className={`status-indicator status-${backendStatus?.toLowerCase() || 'online'}`}>
            <span className="status-dot"></span>
            <span className="status-text">
              API: {backendStatus === 'CHECKING' ? 'Checking...' : backendStatus === 'ONLINE' ? 'Connected' : 'Ready'}
            </span>
          </div>

          {/* List Device CTA */}
          <button 
            className="btn btn-primary nav-cta"
            onClick={onOpenCreateModal}
          >
            <PlusCircle size={16} />
            <span>List Device</span>
          </button>

          {/* Authentication State */}
          {!isAuthenticated ? (
            <div className="auth-buttons-group">
              <button
                className="btn btn-ghost nav-auth-btn"
                onClick={() => onOpenAuthModal('login')}
              >
                <LogIn size={15} />
                <span>Sign In</span>
              </button>
              <button
                className="btn btn-outline nav-auth-btn reg-btn"
                onClick={() => onOpenAuthModal('register')}
              >
                <UserPlus size={15} />
                <span>Register</span>
              </button>
            </div>
          ) : (
            <div className="user-dropdown-wrapper" ref={dropdownRef}>
              <button
                className={`user-profile-pill ${isDropdownOpen ? 'active' : ''}`}
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                aria-expanded={isDropdownOpen}
              >
                <img
                  src={user?.profileImage || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
                  alt={user?.name || 'User'}
                  className="user-nav-avatar"
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150';
                  }}
                />
                <span className="user-nav-name">{user?.name?.split(' ')[0] || 'Account'}</span>
                {user?.role === 'ROLE_ADMIN' && (
                  <span className="nav-admin-tag">Admin</span>
                )}
                <ChevronDown size={14} className={`dropdown-arrow ${isDropdownOpen ? 'rotate' : ''}`} />
              </button>

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <div className="user-menu-dropdown glass-card animate-fade-in">
                  <div className="user-menu-header">
                    <p className="menu-user-name">{user?.name}</p>
                    <p className="menu-user-email">{user?.email}</p>
                    <span className="menu-user-role">
                      <Shield size={11} />
                      {user?.role === 'ROLE_ADMIN' ? 'Administrator' : 'Verified Member'}
                    </span>
                  </div>

                  <div className="user-menu-items">
                    <button
                      className={`menu-item-btn ${activeTab === 'dashboard' ? 'item-active' : ''}`}
                      onClick={() => handleTabClick('dashboard')}
                    >
                      <LayoutDashboard size={16} />
                      <span>User Dashboard</span>
                    </button>
                    <button
                      className={`menu-item-btn ${activeTab === 'profile' ? 'item-active' : ''}`}
                      onClick={() => handleTabClick('profile')}
                    >
                      <User size={16} />
                      <span>My Profile & Settings</span>
                    </button>
                    <button
                      className="menu-item-btn"
                      onClick={() => {
                        setIsDropdownOpen(false);
                        onOpenCreateModal();
                      }}
                    >
                      <PlusCircle size={16} />
                      <span>List a New Device</span>
                    </button>
                    <button
                      className="menu-item-btn text-danger"
                      onClick={handleLogoutClick}
                    >
                      <LogOut size={16} />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
