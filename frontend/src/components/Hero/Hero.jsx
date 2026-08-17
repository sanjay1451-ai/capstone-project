import React from 'react';
import { ArrowRight, Sparkles, ShieldCheck, Leaf, RefreshCw, Smartphone, Laptop, Headphones, Gamepad2, PlusCircle, ShoppingBag } from 'lucide-react';
import './Hero.css';

export default function Hero({ onExploreMarketplace, onListDevice }) {
  return (
    <section className="hero-section">
      <div className="container hero-container">
        
        {/* Top Tagline Badge */}
        <div className="hero-badge-wrapper">
          <div className="badge badge-emerald">
            <Sparkles size={14} />
            <span>VoltTrade &bull; Secure JWT Auth & Recommerce</span>
          </div>
        </div>

        {/* Main Headline */}
        <h1 className="hero-title">
          Smart Electronics Trading.<br />
          <span className="gradient-text">Zero E-Waste Impact.</span>
        </h1>

        {/* Subtitle */}
        <p className="hero-description">
          A secure, community-driven marketplace built to buy, sell, and exchange 
          verified second-hand devices. Upgrade your tech affordably with cryptographically secure authentication.
        </p>

        {/* CTAs */}
        <div className="hero-actions">
          <button className="btn btn-primary" onClick={onExploreMarketplace}>
            <ShoppingBag size={18} />
            <span>Explore Marketplace</span>
          </button>
          <button className="btn btn-secondary" onClick={onListDevice}>
            <PlusCircle size={18} />
            <span>List Your Device</span>
          </button>
        </div>

        {/* Impact Counters & Trust Badges */}
        <div className="hero-stats-grid">
          <div className="stat-card glass-card">
            <div className="stat-icon-wrap emerald">
              <Leaf size={22} />
            </div>
            <div className="stat-info">
              <span className="stat-number">Circular Tech</span>
              <span className="stat-label">Active E-Waste Reduction</span>
            </div>
          </div>

          <div className="stat-card glass-card">
            <div className="stat-icon-wrap cyan">
              <RefreshCw size={22} />
            </div>
            <div className="stat-info">
              <span className="stat-number">Direct Exchange</span>
              <span className="stat-label">Device-for-Device Swaps</span>
            </div>
          </div>

          <div className="stat-card glass-card">
            <div className="stat-icon-wrap blue">
              <ShieldCheck size={22} />
            </div>
            <div className="stat-info">
              <span className="stat-number">Secure & Verified</span>
              <span className="stat-label">BCrypt + JWT Protected</span>
            </div>
          </div>
        </div>

        {/* Floating Category Pills */}
        <div className="category-pills">
          <div className="pill"><Smartphone size={16} /> Smartphones</div>
          <div className="pill"><Laptop size={16} /> Laptops</div>
          <div className="pill"><Headphones size={16} /> Audio Gear</div>
          <div className="pill"><Gamepad2 size={16} /> Gaming Consoles</div>
        </div>

      </div>
    </section>
  );
}
