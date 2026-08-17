import React, { useState } from 'react';
import { X, Mail, Lock, User, Phone, MapPin, Eye, EyeOff, ShieldCheck, Sparkles, LogIn, UserPlus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './AuthModal.css';

export default function AuthModal({ isOpen, onClose, initialTab = 'login', onAuthSuccess }) {
  const [activeTab, setActiveTab] = useState(initialTab); // 'login' | 'register'
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Form State
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });

  const [registerData, setRegisterData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    address: ''
  });

  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login, register } = useAuth();

  if (!isOpen) return null;

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSubmitting(true);

    try {
      await login(loginData.email, loginData.password);
      if (onAuthSuccess) onAuthSuccess();
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (registerData.password !== registerData.confirmPassword) {
      setErrorMsg('Passwords do not match. Please verify your password confirmation.');
      return;
    }

    if (registerData.password.length < 6) {
      setErrorMsg('Password must be at least 6 characters in length.');
      return;
    }

    setIsSubmitting(true);

    try {
      await register(registerData);
      if (onAuthSuccess) onAuthSuccess();
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Registration failed. Please check the entered information.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Quick 1-Click Demo Login
  const handleQuickLogin = async (email, password) => {
    setErrorMsg('');
    setIsSubmitting(true);
    try {
      await login(email, password);
      if (onAuthSuccess) onAuthSuccess();
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Demo login failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-modal-overlay" onClick={onClose}>
      <div className="auth-modal-content glass-card animate-fade-in" onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        <button className="auth-close-btn" onClick={onClose} aria-label="Close modal">
          <X size={20} />
        </button>

        {/* Modal Header */}
        <div className="auth-modal-header">
          <div className="auth-badge">
            <ShieldCheck size={16} className="text-accent" />
            <span>VoltTrade Secure Auth</span>
          </div>
          <h2 className="auth-title">
            {activeTab === 'login' ? 'Welcome Back' : 'Create an Account'}
          </h2>
          <p className="auth-subtitle">
            {activeTab === 'login'
              ? 'Sign in to access your listings, purchases, and trade offers.'
              : 'Join VoltTrade to securely buy, sell, and exchange electronics.'}
          </p>
        </div>

        {/* Tabs */}
        <div className="auth-tab-switch">
          <button
            type="button"
            className={`auth-tab-btn ${activeTab === 'login' ? 'active' : ''}`}
            onClick={() => { setActiveTab('login'); setErrorMsg(''); }}
          >
            <LogIn size={16} />
            <span>Sign In</span>
          </button>
          <button
            type="button"
            className={`auth-tab-btn ${activeTab === 'register' ? 'active' : ''}`}
            onClick={() => { setActiveTab('register'); setErrorMsg(''); }}
          >
            <UserPlus size={16} />
            <span>Register</span>
          </button>
        </div>

        {/* Error Alert Banner */}
        {errorMsg && (
          <div className="auth-error-banner animate-shake">
            <span>{errorMsg}</span>
          </div>
        )}

        {/* ================= SIGN IN FORM ================= */}
        {activeTab === 'login' && (
          <form className="auth-form" onSubmit={handleLoginSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="login-email">Email Address</label>
              <div className="input-icon-wrapper">
                <Mail className="field-icon" size={18} />
                <input
                  id="login-email"
                  type="email"
                  className="form-input with-icon"
                  placeholder="name@example.com"
                  value={loginData.email}
                  onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="login-password">Password</label>
              <div className="input-icon-wrapper">
                <Lock className="field-icon" size={18} />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  className="form-input with-icon with-action"
                  placeholder="••••••••"
                  value={loginData.password}
                  onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                  required
                />
                <button
                  type="button"
                  className="action-icon-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary auth-submit-btn"
              disabled={isSubmitting}
            >
              {isSubmitting ? <span className="spinner-sm"></span> : 'Sign In to Account'}
            </button>

            {/* Quick Demo Credentials */}
            <div className="demo-credentials-box">
              <div className="demo-header">
                <Sparkles size={14} className="text-accent" />
                <span>Quick Demo Accounts (1-Click Test)</span>
              </div>
              <div className="demo-btns-row">
                <button
                  type="button"
                  className="demo-pill-btn"
                  onClick={() => handleQuickLogin('demo@volttrade.com', 'Password123!')}
                  disabled={isSubmitting}
                >
                  <span>Regular User</span>
                  <small>demo@volttrade.com</small>
                </button>
                <button
                  type="button"
                  className="demo-pill-btn demo-admin-btn"
                  onClick={() => handleQuickLogin('admin@volttrade.com', 'AdminPassword123!')}
                  disabled={isSubmitting}
                >
                  <span>Admin User</span>
                  <small>admin@volttrade.com</small>
                </button>
              </div>
            </div>
          </form>
        )}

        {/* ================= REGISTER FORM ================= */}
        {activeTab === 'register' && (
          <form className="auth-form" onSubmit={handleRegisterSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="reg-name">Full Name *</label>
              <div className="input-icon-wrapper">
                <User className="field-icon" size={18} />
                <input
                  id="reg-name"
                  type="text"
                  className="form-input with-icon"
                  placeholder="Alex Rivers"
                  value={registerData.name}
                  onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="reg-email">Email Address *</label>
              <div className="input-icon-wrapper">
                <Mail className="field-icon" size={18} />
                <input
                  id="reg-email"
                  type="email"
                  className="form-input with-icon"
                  placeholder="alex@volttrade.com"
                  value={registerData.email}
                  onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="form-row-2">
              <div className="form-group">
                <label className="form-label" htmlFor="reg-password">Password *</label>
                <div className="input-icon-wrapper">
                  <Lock className="field-icon" size={18} />
                  <input
                    id="reg-password"
                    type={showPassword ? 'text' : 'password'}
                    className="form-input with-icon with-action"
                    placeholder="Min 6 chars"
                    value={registerData.password}
                    onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                    required
                  />
                  <button
                    type="button"
                    className="action-icon-btn"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="reg-confirm-password">Confirm Password *</label>
                <div className="input-icon-wrapper">
                  <Lock className="field-icon" size={18} />
                  <input
                    id="reg-confirm-password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    className="form-input with-icon with-action"
                    placeholder="Re-enter password"
                    value={registerData.confirmPassword}
                    onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                    required
                  />
                  <button
                    type="button"
                    className="action-icon-btn"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="reg-phone">Phone Number</label>
              <div className="input-icon-wrapper">
                <Phone className="field-icon" size={18} />
                <input
                  id="reg-phone"
                  type="tel"
                  className="form-input with-icon"
                  placeholder="+1 (555) 019-2834"
                  value={registerData.phone}
                  onChange={(e) => setRegisterData({ ...registerData, phone: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="reg-address">Delivery / City Address</label>
              <div className="input-icon-wrapper">
                <MapPin className="field-icon" size={18} />
                <input
                  id="reg-address"
                  type="text"
                  className="form-input with-icon"
                  placeholder="San Francisco, CA"
                  value={registerData.address}
                  onChange={(e) => setRegisterData({ ...registerData, address: e.target.value })}
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary auth-submit-btn"
              disabled={isSubmitting}
            >
              {isSubmitting ? <span className="spinner-sm"></span> : 'Complete Registration'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
