import React from 'react';
import { Zap, PlusCircle, LayoutGrid, ShoppingBag, Layers, Activity } from 'lucide-react';
import './Navbar.css';

export default function Navbar({ activeTab, onSelectTab, onOpenCreateModal, backendStatus }) {
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
          <button 
            className={`nav-link-btn ${activeTab === 'health' ? 'active' : ''}`}
            onClick={() => onSelectTab('health')}
          >
            <Activity size={16} />
            <span>API Status</span>
          </button>
        </nav>

        {/* Navbar Actions & Status */}
        <div className="navbar-actions">
          <div className={`status-indicator status-${backendStatus.toLowerCase()}`}>
            <span className="status-dot"></span>
            <span className="status-text">
              API: {backendStatus === 'CHECKING' ? 'Checking...' : backendStatus === 'ONLINE' ? 'Connected' : 'Offline'}
            </span>
          </div>

          <button 
            className="btn btn-primary nav-cta"
            onClick={onOpenCreateModal}
          >
            <PlusCircle size={16} />
            <span>List Device</span>
          </button>
        </div>
      </div>
    </header>
  );
}
