import React from 'react';
import { ShoppingBag, Tag, ArrowLeftRight, Leaf, Shield, Database, Lock, Cpu } from 'lucide-react';
import './FeatureGrid.css';

const features = [
  {
    icon: ShoppingBag,
    color: 'emerald',
    title: 'Verified Buy Marketplace',
    description: 'Browse refurbished phones, laptops, and audio gear with diagnostic health ratings and fair market pricing.'
  },
  {
    icon: Tag,
    color: 'cyan',
    title: 'Instant Seller Listings',
    description: 'List your pre-owned electronics in minutes with automated specification detection and image upload.'
  },
  {
    icon: ArrowLeftRight,
    color: 'blue',
    title: 'Peer-to-Peer Device Swaps',
    description: 'Exchange devices directly with other verified users with smart value-matching algorithms.'
  },
  {
    icon: Leaf,
    color: 'emerald',
    title: 'E-Waste Reduction Tracker',
    description: 'Calculate real-time CO2 and raw metal savings with every refurbished transaction completed on platform.'
  },
  {
    icon: Lock,
    color: 'cyan',
    title: 'JWT + Spring Security',
    description: 'Stateless token authorization, encrypted password hashing (BCrypt), and role-based access control.'
  },
  {
    icon: Database,
    color: 'blue',
    title: 'Supabase PostgreSQL',
    description: 'Cloud-native relational persistence with connection pooling, migrations, and ACID compliance.'
  }
];

export default function FeatureGrid() {
  return (
    <section id="features" className="features-section">
      <div className="container">
        <div className="section-header">
          <div className="badge badge-emerald">
            <Cpu size={14} />
            <span>Platform Pillars</span>
          </div>
          <h2 className="section-title">
            Engineered For <span className="gradient-text">Circular Electronics</span>
          </h2>
          <p className="section-subtitle">
            A comprehensive full-stack ecosystem designed to make device reuse simple, transparent, and rewarding.
          </p>
        </div>

        <div className="features-grid">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <div key={idx} className="feature-card glass-card">
                <div className={`feature-icon-wrap ${feature.color}`}>
                  <Icon size={24} />
                </div>
                <h3 className="feature-card-title">{feature.title}</h3>
                <p className="feature-card-desc">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
