import React from 'react';
import { ArrowRight, Sparkles, ShieldCheck, Leaf, RefreshCw, Smartphone, Laptop, Headphones, Gamepad2 } from 'lucide-react';
import './Hero.css';

export default function Hero() {
  return (
    <section className="hero-section">
      <div className="container hero-container">
        
        {/* Top Tagline Badge */}
        <div className="hero-badge-wrapper">
          <div className="badge badge-emerald">
            <Sparkles size={14} />
            <span>Capstone Project &bull; Phase 1 Foundation</span>
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
          verified second-hand devices. Upgrade your tech affordably while accelerating the circular economy.
        </p>

        {/* CTAs */}
        <div className="hero-actions">
          <a href="#health-check" className="btn btn-primary">
            <span>Test API Health</span>
            <ArrowRight size={18} />
          </a>
          <a href="#features" className="btn btn-secondary">
            <span>Platform Overview</span>
          </a>
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
              <span className="stat-label">JWT + Spring Security</span>
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
