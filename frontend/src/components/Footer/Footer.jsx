import React from 'react';
import { Zap, Heart, Github, ExternalLink } from 'lucide-react';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer-wrapper">
      <div className="container footer-container">
        
        <div className="footer-top">
          <div className="footer-brand">
            <div className="brand">
              <div className="brand-icon-wrapper">
                <Zap className="brand-icon" size={20} />
              </div>
              <span className="brand-title">Volt<span className="gradient-text">Trade</span></span>
            </div>
            <p className="footer-tagline">
              Second-Hand Electronics Trading Platform. Promoting affordable technology access while reducing global e-waste through responsible device reuse.
            </p>
          </div>

          <div className="footer-columns">
            <div className="footer-col">
              <h4>Architecture</h4>
              <ul>
                <li><a href="#health-check">Spring Boot REST API</a></li>
                <li><a href="#health-check">Supabase PostgreSQL</a></li>
                <li><a href="#health-check">React + Vite SPA</a></li>
                <li><a href="#health-check">JWT Stateless Auth</a></li>
              </ul>
            </div>

            <div className="footer-col">
              <h4>Phase 1 Modules</h4>
              <ul>
                <li><span>Full-Stack Scaffolding</span></li>
                <li><span>CORS Bridge</span></li>
                <li><span>Health Check REST Service</span></li>
                <li><span>Environment Isolation</span></li>
              </ul>
            </div>

            <div className="footer-col">
              <h4>Future Phases</h4>
              <ul>
                <li><span>User Auth & Profiles</span></li>
                <li><span>Product Catalog & Search</span></li>
                <li><span>Device Trade-In System</span></li>
                <li><span>Secure Escrow Payments</span></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p className="copyright">
            &copy; {new Date().getFullYear()} Second-Hand Electronics Trading Platform &bull; Capstone Project
          </p>
          <div className="footer-badges">
            <span className="badge badge-emerald">Spring Boot 3.3</span>
            <span className="badge badge-cyan">React 18 + Vite</span>
            <span className="badge badge-emerald">Supabase</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
