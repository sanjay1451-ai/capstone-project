import React, { useState } from 'react';
import { X, ShoppingBag, ShieldCheck, MapPin, CheckCircle2, AlertCircle, ArrowRight, Truck } from 'lucide-react';
import { orderService } from '../../services/orderService';
import { useAuth } from '../../context/AuthContext';
import './CheckoutModal.css';

export default function CheckoutModal({ product, onClose, onOrderPlaced }) {
  const { user } = useAuth();
  const [quantity, setQuantity] = useState(1);
  const [shippingAddress, setShippingAddress] = useState(user?.address || '124 Tech Boulevard, San Francisco, CA');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  if (!product) return null;

  const unitPrice = parseFloat(product.price) || 0;
  const totalPrice = unitPrice * quantity;

  const handleCheckout = async (e) => {
    e.preventDefault();
    setError('');

    if (!shippingAddress.trim()) {
      setError('Please provide a valid shipping address.');
      return;
    }

    setIsSubmitting(true);
    try {
      const order = await orderService.createOrder({
        productId: product.id,
        quantity: quantity,
        shippingAddress: shippingAddress.trim(),
        notes: notes.trim()
      });
      setSuccess(true);
      setTimeout(() => {
        if (onOrderPlaced) onOrderPlaced(order);
        onClose();
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to complete checkout');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="checkout-modal-card glass-card animate-fade-in" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose} aria-label="Close">
          <X size={20} />
        </button>

        <div className="checkout-header">
          <div className="badge badge-emerald">
            <ShieldCheck size={14} />
            <span>VoltTrade Secure Checkout</span>
          </div>
          <h2>Review & Complete Order</h2>
          <p>Protected by VoltTrade Buyer Guarantee & Certified Device Inspection.</p>
        </div>

        {error && (
          <div className="form-alert error animate-shake">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {success ? (
          <div className="checkout-success-state animate-fade-in">
            <div className="success-icon-wrap">
              <CheckCircle2 size={48} className="text-emerald-400" />
            </div>
            <h3>Order Placed Successfully!</h3>
            <p>Your order for <strong>{product.title}</strong> has been registered. You can track its delivery status in your Dashboard.</p>
          </div>
        ) : (
          <form className="checkout-form" onSubmit={handleCheckout}>
            {/* Product Summary Row */}
            <div className="order-product-strip glass-card">
              <img
                src={product.primaryImage || 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=150'}
                alt={product.title}
                className="checkout-prod-thumb"
              />
              <div className="checkout-prod-info">
                <span className="checkout-prod-category">{product.category} &bull; {product.condition}</span>
                <h4 className="checkout-prod-title">{product.title}</h4>
                <div className="checkout-prod-price-row">
                  <span className="checkout-unit-price">${unitPrice.toFixed(2)} each</span>
                  <span className="checkout-seller">Seller: {product.sellerName || 'Verified Merchant'}</span>
                </div>
              </div>
            </div>

            {/* Quantity & Shipping */}
            <div className="checkout-inputs-row">
              <div className="form-group" style={{ maxWidth: '120px' }}>
                <label className="form-label" htmlFor="order-qty">Quantity</label>
                <input
                  id="order-qty"
                  type="number"
                  min="1"
                  max="10"
                  className="form-input"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  required
                />
              </div>

              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label" htmlFor="shipping-address">Delivery Address *</label>
                <div className="input-icon-wrapper">
                  <MapPin className="field-icon" size={18} />
                  <input
                    id="shipping-address"
                    type="text"
                    className="form-input with-icon"
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="order-notes">Delivery Instructions (Optional)</label>
              <input
                id="order-notes"
                type="text"
                className="form-input"
                placeholder="e.g. Leave with building receptionist or ring bell #4"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            {/* Price Summary Breakdown */}
            <div className="order-summary-box">
              <div className="summary-line">
                <span>Subtotal ({quantity} item{quantity > 1 ? 's' : ''})</span>
                <span>${totalPrice.toFixed(2)}</span>
              </div>
              <div className="summary-line">
                <span className="flex-center-gap"><Truck size={14} /> Express Insured Shipping</span>
                <span className="text-emerald-400">FREE</span>
              </div>
              <div className="summary-line">
                <span className="flex-center-gap"><ShieldCheck size={14} /> Certified Recommerce Protection</span>
                <span className="text-emerald-400">INCLUDED</span>
              </div>
              <div className="summary-total-line">
                <span>Total Amount</span>
                <span className="total-val">${totalPrice.toFixed(2)}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="checkout-actions">
              <button type="button" className="btn btn-secondary" onClick={onClose} disabled={isSubmitting}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary btn-checkout-submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <span className="spinner-sm"></span>
                ) : (
                  <>
                    <ShoppingBag size={18} />
                    <span>Confirm Order (${totalPrice.toFixed(2)})</span>
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
