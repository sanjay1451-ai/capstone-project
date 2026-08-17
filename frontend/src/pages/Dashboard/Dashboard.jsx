import React, { useState, useEffect } from 'react';
import { ShoppingBag, ArrowRightLeft, Heart, User, CheckCircle2, Clock, Truck, Package, XCircle, AlertCircle, RefreshCw, Eye, Tag, Trash2, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { orderService } from '../../services/orderService';
import { exchangeService } from '../../services/exchangeService';
import { favoriteService } from '../../services/favoriteService';
import Profile from '../Profile/Profile';
import ProductCard from '../../components/ProductCard/ProductCard';
import './Dashboard.css';

export default function Dashboard({
  initialTab = 'purchases',
  onSelectProduct,
  onOpenCreateModal,
  onOpenAuthModal,
  onBackToHome
}) {
  const { user, isAuthenticated } = useAuth();
  const [currentTab, setCurrentTab] = useState(initialTab); // 'purchases' | 'sales' | 'exchanges' | 'wishlist' | 'profile'

  // Data states
  const [purchases, setPurchases] = useState([]);
  const [sales, setSales] = useState([]);
  const [sentExchanges, setSentExchanges] = useState([]);
  const [receivedExchanges, setReceivedExchanges] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionFeedback, setActionFeedback] = useState({ state: 'idle', message: '' });

  const loadDashboardData = async () => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const [myOrdersData, mySalesData, sentExData, recExData, favsData] = await Promise.allSettled([
        orderService.getMyOrders(),
        orderService.getSellerOrders(),
        exchangeService.getSentExchanges(),
        exchangeService.getReceivedExchanges(),
        favoriteService.getMyFavorites()
      ]);

      if (myOrdersData.status === 'fulfilled') setPurchases(myOrdersData.value);
      if (mySalesData.status === 'fulfilled') setSales(mySalesData.value);
      if (sentExData.status === 'fulfilled') setSentExchanges(sentExData.value);
      if (recExData.status === 'fulfilled') setReceivedExchanges(recExData.value);
      if (favsData.status === 'fulfilled') setFavorites(favsData.value);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [isAuthenticated]);

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await orderService.updateOrderStatus(orderId, newStatus);
      setActionFeedback({ state: 'success', message: `Order marked as ${newStatus}` });
      loadDashboardData();
      setTimeout(() => setActionFeedback({ state: 'idle', message: '' }), 3500);
    } catch (err) {
      setActionFeedback({ state: 'error', message: err.message || 'Failed to update order status' });
    }
  };

  const handleUpdateExchangeStatus = async (exchangeId, newStatus) => {
    try {
      await exchangeService.updateStatus(exchangeId, newStatus);
      setActionFeedback({ state: 'success', message: `Trade proposal marked as ${newStatus}` });
      loadDashboardData();
      setTimeout(() => setActionFeedback({ state: 'idle', message: '' }), 3500);
    } catch (err) {
      setActionFeedback({ state: 'error', message: err.message || 'Failed to update exchange status' });
    }
  };

  const handleRemoveFavorite = async (productId) => {
    try {
      await favoriteService.toggleFavorite(productId);
      setFavorites(prev => prev.filter(p => p.id !== productId));
    } catch (err) {
      console.error('Failed to remove favorite:', err);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="dashboard-page container">
        <div className="unauth-profile-card glass-card animate-fade-in">
          <div className="unauth-icon-wrap">
            <ShoppingBag size={40} className="text-accent" />
          </div>
          <h2>Sign In to Access Dashboard</h2>
          <p>View your purchases, sales orders, barter trade proposals, and saved wishlist.</p>
          <div className="unauth-actions">
            <button className="btn btn-primary" onClick={() => onOpenAuthModal('login')}>
              Sign In
            </button>
            <button className="btn btn-outline" onClick={() => onOpenAuthModal('register')}>
              Create Account
            </button>
          </div>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status) => {
    const s = (status || 'PENDING').toUpperCase();
    switch (s) {
      case 'DELIVERED':
      case 'ACCEPTED':
        return <span className="status-pill status-delivered"><CheckCircle2 size={13} /> {s}</span>;
      case 'SHIPPED':
        return <span className="status-pill status-shipped"><Truck size={13} /> {s}</span>;
      case 'CONFIRMED':
        return <span className="status-pill status-confirmed"><Package size={13} /> {s}</span>;
      case 'CANCELLED':
      case 'REJECTED':
        return <span className="status-pill status-cancelled"><XCircle size={13} /> {s}</span>;
      default:
        return <span className="status-pill status-pending"><Clock size={13} /> {s}</span>;
    }
  };

  return (
    <div className="dashboard-page container animate-fade-in">
      {/* Top Header */}
      <div className="dashboard-top-header">
        <div>
          <button className="btn-back" onClick={onBackToHome}>
            <ArrowLeft size={16} />
            <span>Marketplace</span>
          </button>
          <h1 className="dashboard-heading">User Management Center</h1>
          <p className="dashboard-subheading">Welcome back, <strong>{user?.name}</strong> &bull; {user?.role}</p>
        </div>
        <button className="btn btn-primary" onClick={onOpenCreateModal}>
          <span>List a Device</span>
        </button>
      </div>

      {/* Action Feedback Banner */}
      {actionFeedback.state !== 'idle' && (
        <div className={`status-banner banner-${actionFeedback.state} animate-fade-in`}>
          {actionFeedback.state === 'success' && <CheckCircle2 size={16} />}
          {actionFeedback.state === 'error' && <AlertCircle size={16} />}
          <span>{actionFeedback.message}</span>
        </div>
      )}

      {/* Dashboard Navigation Tabs */}
      <div className="dashboard-tabs-bar">
        <button
          className={`dash-tab-btn ${currentTab === 'purchases' ? 'active' : ''}`}
          onClick={() => setCurrentTab('purchases')}
        >
          <ShoppingBag size={17} />
          <span>My Purchases</span>
          {purchases.length > 0 && <span className="tab-counter">{purchases.length}</span>}
        </button>

        <button
          className={`dash-tab-btn ${currentTab === 'sales' ? 'active' : ''}`}
          onClick={() => setCurrentTab('sales')}
        >
          <Tag size={17} />
          <span>Incoming Sales</span>
          {sales.length > 0 && <span className="tab-counter">{sales.length}</span>}
        </button>

        <button
          className={`dash-tab-btn ${currentTab === 'exchanges' ? 'active' : ''}`}
          onClick={() => setCurrentTab('exchanges')}
        >
          <ArrowRightLeft size={17} />
          <span>Exchange Hub</span>
          {(receivedExchanges.length + sentExchanges.length) > 0 && (
            <span className="tab-counter">{receivedExchanges.length + sentExchanges.length}</span>
          )}
        </button>

        <button
          className={`dash-tab-btn ${currentTab === 'wishlist' ? 'active' : ''}`}
          onClick={() => setCurrentTab('wishlist')}
        >
          <Heart size={17} />
          <span>Wishlist</span>
          {favorites.length > 0 && <span className="tab-counter">{favorites.length}</span>}
        </button>

        <button
          className={`dash-tab-btn ${currentTab === 'profile' ? 'active' : ''}`}
          onClick={() => setCurrentTab('profile')}
        >
          <User size={17} />
          <span>Profile & Settings</span>
        </button>
      </div>

      {/* ================= TAB 1: PURCHASES ================= */}
      {currentTab === 'purchases' && (
        <div className="dashboard-tab-content">
          <div className="dash-section-header">
            <h3>My Orders & Order History</h3>
            <span className="text-muted">{purchases.length} total orders</span>
          </div>

          {loading ? (
            <div className="dash-loading"><div className="spinner-sm"></div></div>
          ) : purchases.length === 0 ? (
            <div className="dash-empty-card glass-card">
              <ShoppingBag size={36} className="text-accent" />
              <h4>No Orders Yet</h4>
              <p>Explore verified electronic listings and place your first order.</p>
              <button className="btn btn-outline" onClick={onBackToHome}>Browse Marketplace</button>
            </div>
          ) : (
            <div className="orders-list">
              {purchases.map(order => (
                <div key={order.id} className="order-item-card glass-card">
                  <div className="order-item-header">
                    <div className="order-id-block">
                      <span className="order-id-label">Order #{order.id}</span>
                      <span className="order-date">
                        {order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'Recently'}
                      </span>
                    </div>
                    {getStatusBadge(order.orderStatus)}
                  </div>

                  <div className="order-item-body">
                    {order.product ? (
                      <div className="order-product-details">
                        <img
                          src={order.product.primaryImage || 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=150'}
                          alt={order.product.title}
                          className="order-prod-img"
                        />
                        <div>
                          <h4 className="order-prod-title" onClick={() => onSelectProduct(order.product)}>
                            {order.product.title}
                          </h4>
                          <p className="order-prod-seller">Sold by: {order.sellerName || 'VoltTrade Merchant'}</p>
                          <span className="order-prod-qty">Qty: {order.quantity}</span>
                        </div>
                      </div>
                    ) : (
                      <p className="text-muted">Item details archived</p>
                    )}

                    <div className="order-price-block">
                      <span className="price-label">Total Paid</span>
                      <span className="price-val">${parseFloat(order.totalPrice || 0).toFixed(2)}</span>
                    </div>
                  </div>

                  {order.orderStatus === 'PENDING' && (
                    <div className="order-item-footer">
                      <button
                        className="btn btn-ghost btn-sm text-danger"
                        onClick={() => handleUpdateOrderStatus(order.id, 'CANCELLED')}
                      >
                        Cancel Order
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ================= TAB 2: INCOMING SALES ================= */}
      {currentTab === 'sales' && (
        <div className="dashboard-tab-content">
          <div className="dash-section-header">
            <h3>Sales Orders</h3>
            <span className="text-muted">{sales.length} customer orders</span>
          </div>

          {loading ? (
            <div className="dash-loading"><div className="spinner-sm"></div></div>
          ) : sales.length === 0 ? (
            <div className="dash-empty-card glass-card">
              <Tag size={36} className="text-accent" />
              <h4>No Sales Orders Yet</h4>
              <p>When buyers order your listed electronics, their orders will appear here for fulfillment.</p>
              <button className="btn btn-primary" onClick={onOpenCreateModal}>List Device for Sale</button>
            </div>
          ) : (
            <div className="orders-list">
              {sales.map(order => (
                <div key={order.id} className="order-item-card glass-card">
                  <div className="order-item-header">
                    <div className="order-id-block">
                      <span className="order-id-label">Sales Order #{order.id}</span>
                      <span className="order-date">Buyer: {order.buyerName} ({order.buyerEmail})</span>
                    </div>
                    {getStatusBadge(order.orderStatus)}
                  </div>

                  <div className="order-item-body">
                    {order.product && (
                      <div className="order-product-details">
                        <img
                          src={order.product.primaryImage || 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=150'}
                          alt={order.product.title}
                          className="order-prod-img"
                        />
                        <div>
                          <h4 className="order-prod-title">{order.product.title}</h4>
                          <span className="order-prod-qty">Quantity Ordered: {order.quantity}</span>
                        </div>
                      </div>
                    )}

                    <div className="order-price-block">
                      <span className="price-label">Payout</span>
                      <span className="price-val text-emerald-400">${parseFloat(order.totalPrice || 0).toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="order-item-footer">
                    <span className="manage-status-label">Update Fulfillment:</span>
                    <div className="status-action-btns">
                      {order.orderStatus === 'PENDING' && (
                        <button
                          className="btn btn-outline btn-sm"
                          onClick={() => handleUpdateOrderStatus(order.id, 'CONFIRMED')}
                        >
                          Confirm
                        </button>
                      )}
                      {order.orderStatus !== 'SHIPPED' && order.orderStatus !== 'DELIVERED' && order.orderStatus !== 'CANCELLED' && (
                        <button
                          className="btn btn-outline btn-sm"
                          onClick={() => handleUpdateOrderStatus(order.id, 'SHIPPED')}
                        >
                          Mark Shipped
                        </button>
                      )}
                      {order.orderStatus === 'SHIPPED' && (
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => handleUpdateOrderStatus(order.id, 'DELIVERED')}
                        >
                          Mark Delivered
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ================= TAB 3: EXCHANGE HUB ================= */}
      {currentTab === 'exchanges' && (
        <div className="dashboard-tab-content">
          <div className="dash-section-header">
            <h3>Barter & Swap Proposals</h3>
            <span className="text-muted">{receivedExchanges.length} received &bull; {sentExchanges.length} sent</span>
          </div>

          <div className="exchange-subsections-grid">
            {/* Incoming Proposals */}
            <div className="exchange-column">
              <h4 className="column-title">Incoming Trade Offers (Your Items)</h4>
              {receivedExchanges.length === 0 ? (
                <div className="dash-empty-card glass-card compact">
                  <p>No incoming trade proposals yet.</p>
                </div>
              ) : (
                receivedExchanges.map(ex => (
                  <div key={ex.id} className="exchange-card glass-card">
                    <div className="ex-card-header">
                      <span className="ex-from">From: {ex.requesterName}</span>
                      {getStatusBadge(ex.status)}
                    </div>

                    <div className="ex-trade-compare">
                      <div className="ex-side">
                        <small>They Want:</small>
                        <p>{ex.targetProduct?.title}</p>
                      </div>
                      <ArrowRightLeft size={16} className="text-accent" />
                      <div className="ex-side">
                        <small>They Offer:</small>
                        <p>{ex.offeredProduct?.title}</p>
                      </div>
                    </div>

                    {ex.message && (
                      <div className="ex-message-box">
                        <p>"{ex.message}"</p>
                      </div>
                    )}

                    {ex.status === 'PENDING' && (
                      <div className="ex-action-row">
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => handleUpdateExchangeStatus(ex.id, 'ACCEPTED')}
                        >
                          Accept Trade
                        </button>
                        <button
                          className="btn btn-outline-danger btn-sm"
                          onClick={() => handleUpdateExchangeStatus(ex.id, 'REJECTED')}
                        >
                          Decline
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Outgoing Proposals */}
            <div className="exchange-column">
              <h4 className="column-title">Sent Trade Proposals</h4>
              {sentExchanges.length === 0 ? (
                <div className="dash-empty-card glass-card compact">
                  <p>You haven't proposed any device exchanges yet.</p>
                </div>
              ) : (
                sentExchanges.map(ex => (
                  <div key={ex.id} className="exchange-card glass-card">
                    <div className="ex-card-header">
                      <span className="ex-from">Target: {ex.targetProduct?.title}</span>
                      {getStatusBadge(ex.status)}
                    </div>

                    <div className="ex-trade-compare">
                      <div className="ex-side">
                        <small>You Offered:</small>
                        <p>{ex.offeredProduct?.title}</p>
                      </div>
                    </div>

                    {ex.message && (
                      <div className="ex-message-box">
                        <p>"{ex.message}"</p>
                      </div>
                    )}

                    {ex.status === 'PENDING' && (
                      <div className="ex-action-row">
                        <button
                          className="btn btn-ghost btn-sm text-danger"
                          onClick={() => handleUpdateExchangeStatus(ex.id, 'CANCELLED')}
                        >
                          Withdraw Proposal
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 4: WISHLIST ================= */}
      {currentTab === 'wishlist' && (
        <div className="dashboard-tab-content">
          <div className="dash-section-header">
            <h3>Saved Electronics Wishlist</h3>
            <span className="text-muted">{favorites.length} saved devices</span>
          </div>

          {favorites.length === 0 ? (
            <div className="dash-empty-card glass-card">
              <Heart size={36} className="text-accent" />
              <h4>Your Wishlist is Empty</h4>
              <p>Click the heart icon on any device listing in the marketplace to bookmark it here.</p>
              <button className="btn btn-outline" onClick={onBackToHome}>Explore Marketplace</button>
            </div>
          ) : (
            <div className="wishlist-grid">
              {favorites.map(prod => (
                <div key={prod.id} className="wishlist-card-wrapper">
                  <ProductCard
                    product={prod}
                    onSelect={onSelectProduct}
                  />
                  <button
                    className="btn-remove-wishlist"
                    onClick={() => handleRemoveFavorite(prod.id)}
                    title="Remove from wishlist"
                  >
                    <Trash2 size={14} />
                    <span>Remove</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ================= TAB 5: PROFILE ================= */}
      {currentTab === 'profile' && (
        <Profile
          onOpenAuthModal={onOpenAuthModal}
          onOpenCreateModal={onOpenCreateModal}
          onBackToHome={onBackToHome}
        />
      )}
    </div>
  );
}
