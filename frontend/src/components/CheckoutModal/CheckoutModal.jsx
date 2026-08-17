import React, { useState } from 'react';
import { X, ShoppingBag, ShieldCheck, MapPin, CheckCircle2, AlertCircle, ArrowRight, Truck, CreditCard, DollarSign, Wallet, PackageCheck } from 'lucide-react';
import { orderService } from '../../services/orderService';
import { useAuth } from '../../context/AuthContext';
import './CheckoutModal.css';

const PAYMENT_METHODS = [
  { id: 'card', name: 'Credit / Debit Card (Demo Visa/Mastercard)', icon: CreditCard, subtitle: 'Instant safe processing with mock 3D Secure' },
  { id: 'balance', name: 'VoltTrade Wallet Balance', icon: Wallet, subtitle: 'Available demo credit balance: $2,500.00' },
  { id: 'cod', name: 'Cash on Verified Delivery (COD)', icon: DollarSign, subtitle: 'Pay directly after device physical inspection' }
];

export default function CheckoutModal({ product, onClose, onOrderPlaced, onNavigateToDashboard }) {
  const { user } = useAuth();
  const [quantity, setQuantity] = useState(1);
  const [shippingAddress, setShippingAddress] = useState(user?.address || '124 Tech Boulevard, San Francisco, CA 94107');
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [createdOrder, setCreatedOrder] = useState(null);

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
      setCreatedOrder(order);
      if (onOrderPlaced) onOrderPlaced(order);
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

        {createdOrder ? (
          /* ================= ORDER TRACKING & CONFIRMATION SCREEN ================= */
          <div className="order-confirmation-view animate-fade-in">
            <div className="confirmation-header">
              <div className="success-icon-badge">
                <CheckCircle2 size={42} className="text-emerald-400" />
              </div>
              <h2>Order Confirmed!</h2>
              <p className="order-subtext">
                Thank you for your purchase, <strong>{user?.name || 'Customer'}</strong>. Your order is registered in the system.
              </p>
            </div>

            {/* Order Reference Card */}
            <div className="order-ref-card glass-card">
              <div className="ref-grid">
                <div>
                  <span className="ref-label">Order Number</span>
                  <span className="ref-val">#VT-ORD-{createdOrder.id}</span>
                </div>
                <div>
                  <span className="ref-label">Estimated Delivery</span>
                  <span className="ref-val">3–5 Business Days</span>
                </div>
                <div>
                  <span className="ref-label">Payment Method</span>
                  <span className="ref-val">Demo {paymentMethod.toUpperCase()} (Paid)</span>
                </div>
                <div>
                  <span className="ref-label">Total Amount</span>
                  <span className="ref-val text-emerald-400">${parseFloat(createdOrder.totalPrice || totalPrice).toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Order Tracking Stepper */}
            <div className="order-stepper-box glass-card">
              <h4>Live Delivery Status</h4>
              <div className="stepper-track">
                <div className="step-item active">
                  <div className="step-circle">1</div>
                  <span>Order Placed</span>
                </div>
                <div className="step-line active"></div>
                <div className="step-item active">
                  <div className="step-circle">2</div>
                  <span>Confirmed</span>
                </div>
                <div className="step-line"></div>
                <div className="step-item">
                  <div className="step-circle">3</div>
                  <span>Shipped</span>
                </div>
                <div className="step-line"></div>
                <div className="step-item">
                  <div className="step-circle">4</div>
                  <span>Delivered</span>
                </div>
              </div>
            </div>

            <div className="confirmation-actions">
              <button
                className="btn btn-secondary"
                onClick={onClose}
              >
                Continue Shopping
              </button>
              {onNavigateToDashboard && (
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    onClose();
                    onNavigateToDashboard('purchases');
                  }}
                >
                  <PackageCheck size={16} />
                  <span>View in My Orders</span>
                </button>
              )}
            </div>
          </div>
        ) : (
          /* ================= CHECKOUT FORM ================= */
          <>
            <div className="checkout-header">
              <div className="badge badge-emerald">
                <ShieldCheck size={14} />
                <span>VoltTrade Secure Checkout</span>
              </div>
              <h2>Review & Complete Order</h2>
              <p>Protected by VoltTrade Buyer Guarantee & 30-Day Anti-Fraud Protection.</p>
            </div>

            {error && (
              <div className="form-alert error animate-shake">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

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
                  <label className="form-label" htmlFor="shipping-address">Delivery / Shipping Address *</label>
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

              {/* Demo Payment Method Selector */}
              <div className="form-group">
                <label className="form-label">Select Payment Method (Demo Simulation)</label>
                <div className="payment-options-grid">
                  {PAYMENT_METHODS.map((method) => {
                    const Icon = method.icon;
                    return (
                      <div
                        key={method.id}
                        className={`payment-option-card ${paymentMethod === method.id ? 'active' : ''}`}
                        onClick={() => setPaymentMethod(method.id)}
                      >
                        <div className="payment-opt-radio">
                          <div className={`radio-dot ${paymentMethod === method.id ? 'checked' : ''}`} />
                        </div>
                        <div className="payment-opt-meta">
                          <div className="payment-opt-title">
                            <Icon size={16} className="text-emerald-400" />
                            <strong>{method.name}</strong>
                          </div>
                          <span className="payment-opt-sub">{method.subtitle}</span>
                        </div>
                      </div>
                    );
                  })}
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
                  <span>Total Amount Due</span>
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
                      <span>Confirm & Place Order (${totalPrice.toFixed(2)})</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
