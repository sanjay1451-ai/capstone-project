import React, { useState, useEffect } from 'react';
import { X, RefreshCw, ArrowRightLeft, ShieldCheck, CheckCircle2, AlertCircle, PlusCircle } from 'lucide-react';
import { exchangeService } from '../../services/exchangeService';
import { productService } from '../../services/productService';
import { useAuth } from '../../context/AuthContext';
import './ExchangeModal.css';

export default function ExchangeModal({ targetProduct, onClose, onExchangeProposed, onOpenCreateModal }) {
  const { user, isAuthenticated } = useAuth();
  const [userProducts, setUserProducts] = useState([]);
  const [selectedOfferedId, setSelectedOfferedId] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loadingInventory, setLoadingInventory] = useState(true);

  useEffect(() => {
    async function loadUserInventory() {
      setLoadingInventory(true);
      try {
        let items = [];
        if (isAuthenticated) {
          try {
            items = await productService.getMyListings();
          } catch (e) {
            console.log('Error fetching my listings for exchange, falling back to catalog:', e);
          }
        }
        
        if (!items || items.length === 0) {
          const catalog = await productService.getProducts();
          items = catalog.filter(p => p.id !== targetProduct?.id);
        } else {
          items = items.filter(p => p.id !== targetProduct?.id && p.status !== 'SOLD' && p.status !== 'EXCHANGED');
        }

        setUserProducts(items);
        if (items.length > 0) {
          setSelectedOfferedId(items[0].id);
        }
      } catch (err) {
        console.error('Error loading products for exchange:', err);
      } finally {
        setLoadingInventory(false);
      }
    }

    loadUserInventory();
  }, [targetProduct, isAuthenticated]);

  if (!targetProduct) return null;

  const handleSubmitExchange = async (e) => {
    e.preventDefault();
    setError('');

    if (!selectedOfferedId) {
      setError('Please select a device from your listings to offer in exchange.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await exchangeService.createExchange({
        productId: targetProduct.id,
        offeredProductId: parseInt(selectedOfferedId),
        message: message.trim() || 'I would like to trade my device for yours. Let me know if you are interested!'
      });
      setSuccess(true);
      setTimeout(() => {
        if (onExchangeProposed) onExchangeProposed(res);
        onClose();
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to submit exchange proposal');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedOfferedProduct = userProducts.find(p => p.id === parseInt(selectedOfferedId));

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="exchange-modal-card glass-card animate-fade-in" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose} aria-label="Close">
          <X size={20} />
        </button>

        <div className="exchange-header">
          <div className="badge badge-emerald">
            <RefreshCw size={14} />
            <span>Device Barter & Swap</span>
          </div>
          <h2>Propose Device Exchange</h2>
          <p>Swap your existing hardware directly without buying or selling fees.</p>
        </div>

        {error && (
          <div className="form-alert error animate-shake">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {success ? (
          <div className="exchange-success-state animate-fade-in">
            <div className="success-icon-wrap">
              <CheckCircle2 size={48} className="text-emerald-400" />
            </div>
            <h3>Trade Proposal Sent!</h3>
            <p>The owner of <strong>{targetProduct.title}</strong> has received your swap proposal. Track responses in your Exchange Hub.</p>
          </div>
        ) : (
          <form className="exchange-form" onSubmit={handleSubmitExchange}>
            {/* Visual Swap Comparison Strip */}
            <div className="swap-comparison-grid">
              {/* Desired Target Item */}
              <div className="swap-side-box glass-card">
                <span className="swap-side-badge">You Receive</span>
                <img
                  src={targetProduct.primaryImage || 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=150'}
                  alt={targetProduct.title}
                  className="swap-thumb"
                />
                <h5 className="swap-title">{targetProduct.title}</h5>
                <span className="swap-price">${parseFloat(targetProduct.price || 0).toFixed(2)}</span>
              </div>

              {/* Center Swap Arrow Icon */}
              <div className="swap-divider-icon">
                <ArrowRightLeft size={22} className="text-accent" />
              </div>

              {/* Offered Item */}
              <div className="swap-side-box glass-card">
                <span className="swap-side-badge offered">You Offer</span>
                {selectedOfferedProduct ? (
                  <>
                    <img
                      src={selectedOfferedProduct.primaryImage || 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=150'}
                      alt={selectedOfferedProduct.title}
                      className="swap-thumb"
                    />
                    <h5 className="swap-title">{selectedOfferedProduct.title}</h5>
                    <span className="swap-price">${parseFloat(selectedOfferedProduct.price || 0).toFixed(2)}</span>
                  </>
                ) : (
                  <div className="empty-offered-placeholder">
                    <p>Select a device below</p>
                  </div>
                )}
              </div>
            </div>

            {/* Select Offered Device */}
            <div className="form-group">
              <label className="form-label" htmlFor="offered-device-select">Select Device from Your Listings to Trade *</label>
              {loadingInventory ? (
                <p className="loading-inventory-note">Loading your listed inventory...</p>
              ) : userProducts.length === 0 ? (
                <div className="no-listings-prompt glass-card">
                  <p>You don't have any active devices listed to offer for trade.</p>
                  {onOpenCreateModal && (
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => {
                        onClose();
                        onOpenCreateModal();
                      }}
                    >
                      <PlusCircle size={14} />
                      <span>List a Device First</span>
                    </button>
                  )}
                </div>
              ) : (
                <select
                  id="offered-device-select"
                  className="form-select"
                  value={selectedOfferedId}
                  onChange={(e) => setSelectedOfferedId(e.target.value)}
                  required
                >
                  {userProducts.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title} (${parseFloat(p.price || 0).toFixed(2)} - {p.condition?.replace('_', ' ')})
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Negotiation Message */}
            <div className="form-group">
              <label className="form-label" htmlFor="trade-message">Negotiation Message / Cash Top-up Note</label>
              <textarea
                id="trade-message"
                className="form-textarea"
                rows={3}
                placeholder="e.g. My device includes the original box and charger. I can also add $30 cash to balance the value."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </div>

            {/* Action Buttons */}
            <div className="exchange-actions">
              <button type="button" className="btn btn-secondary" onClick={onClose} disabled={isSubmitting}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={isSubmitting || userProducts.length === 0}>
                {isSubmitting ? (
                  <span className="spinner-sm"></span>
                ) : (
                  <>
                    <RefreshCw size={16} />
                    <span>Submit Proposal</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
