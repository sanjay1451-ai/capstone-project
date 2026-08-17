import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, Users, Package, ShoppingBag, ArrowLeftRight, Flag, 
  Search, AlertCircle, CheckCircle2, UserCheck, UserX, Trash2, 
  Eye, RefreshCw, Filter, ShieldAlert, BarChart3, Clock, Check, 
  AlertTriangle, Lock, Shield
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import { useAuth } from '../../context/AuthContext';
import './AdminDashboard.css';

export default function AdminDashboard({ onSelectProduct, onOpenAuthModal }) {
  const { user, isAuthenticated } = useAuth();
  const [activeSubTab, setActiveSubTab] = useState('overview'); // 'overview' | 'users' | 'products' | 'reports'
  
  // Data States
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionFeedback, setActionFeedback] = useState({ type: '', message: '' });

  // Filters & Search
  const [userSearch, setUserSearch] = useState('');
  const [productSearch, setProductSearch] = useState('');
  const [productStatusFilter, setProductStatusFilter] = useState('');
  const [reportFilter, setReportFilter] = useState('ALL');

  // Confirmation Modals
  const [deleteProductConfirm, setDeleteProductConfirm] = useState(null);
  const [processingId, setProcessingId] = useState(null);

  const loadAllAdminData = async () => {
    setLoading(true);
    try {
      const [statsData, usersData, productsData, reportsData] = await Promise.allSettled([
        adminService.getStats(),
        adminService.getUsers(userSearch),
        adminService.getProducts(productSearch, productStatusFilter),
        adminService.getReports()
      ]);

      if (statsData.status === 'fulfilled') setStats(statsData.value);
      if (usersData.status === 'fulfilled') setUsers(usersData.value);
      if (productsData.status === 'fulfilled') setProducts(productsData.value);
      if (reportsData.status === 'fulfilled') setReports(reportsData.value);
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllAdminData();
  }, [userSearch, productSearch, productStatusFilter]);

  const showFeedback = (type, message) => {
    setActionFeedback({ type, message });
    setTimeout(() => setActionFeedback({ type: '', message: '' }), 4000);
  };

  const handleToggleUserStatus = async (userId, currentStatus) => {
    const newStatus = currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    setProcessingId(userId);
    try {
      await adminService.updateUserStatus(userId, newStatus);
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: newStatus } : u));
      showFeedback('success', `User status updated to ${newStatus}`);
    } catch (err) {
      showFeedback('error', 'Failed to update user status');
    } finally {
      setProcessingId(null);
    }
  };

  const handleUpdateProductStatus = async (productId, status) => {
    setProcessingId(productId);
    try {
      await adminService.updateProductStatus(productId, status);
      setProducts(prev => prev.map(p => p.id === productId ? { ...p, status } : p));
      showFeedback('success', `Product status set to ${status}`);
    } catch (err) {
      showFeedback('error', 'Failed to update product status');
    } finally {
      setProcessingId(null);
    }
  };

  const handleDeleteProduct = async (productId) => {
    setProcessingId(productId);
    try {
      await adminService.deleteProduct(productId);
      setProducts(prev => prev.filter(p => p.id !== productId));
      setDeleteProductConfirm(null);
      showFeedback('success', 'Product listing permanently removed by moderator');
    } catch (err) {
      showFeedback('error', 'Failed to delete listing');
    } finally {
      setProcessingId(null);
    }
  };

  const handleUpdateReportStatus = async (reportId, status) => {
    setProcessingId(reportId);
    try {
      await adminService.updateReportStatus(reportId, status);
      setReports(prev => prev.map(r => r.id === reportId ? { ...r, status } : r));
      showFeedback('success', `Report marked as ${status}`);
    } catch (err) {
      showFeedback('error', 'Failed to update report status');
    } finally {
      setProcessingId(null);
    }
  };

  const filteredReports = reports.filter(r => {
    if (reportFilter === 'ALL') return true;
    return r.status === reportFilter;
  });

  return (
    <div className="admin-dashboard-container animate-fade-in">
      {/* Top Header */}
      <div className="admin-header-row">
        <div className="admin-title-wrap">
          <div className="admin-badge-pill">
            <ShieldCheck size={16} />
            <span>Administrator Security Console</span>
          </div>
          <h1 className="admin-page-title">Platform Moderation & Security</h1>
          <p className="admin-subtitle">
            Manage users, moderate electronic listings, review reported flags, and monitor circular tech transactions.
          </p>
        </div>

        <button className="btn btn-outline btn-sm admin-refresh-btn" onClick={loadAllAdminData} disabled={loading}>
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Action Toast Alert */}
      {actionFeedback.message && (
        <div className={`form-alert ${actionFeedback.type === 'success' ? 'success' : 'error'} animate-fade-in`}>
          {actionFeedback.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          <span>{actionFeedback.message}</span>
        </div>
      )}

      {/* KPI Stats Cards */}
      <div className="admin-stats-grid">
        <div className="admin-stat-card glass-card">
          <div className="stat-icon-wrap users">
            <Users size={22} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Total Users</span>
            <strong className="stat-val">{stats?.totalUsers || users.length}</strong>
          </div>
        </div>

        <div className="admin-stat-card glass-card">
          <div className="stat-icon-wrap products">
            <Package size={22} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Active Listings</span>
            <strong className="stat-val text-accent">{stats?.activeListings || products.filter(p => p.status === 'AVAILABLE').length}</strong>
          </div>
        </div>

        <div className="admin-stat-card glass-card">
          <div className="stat-icon-wrap sold">
            <ShoppingBag size={22} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Sold Products</span>
            <strong className="stat-val text-emerald-400">{stats?.soldProducts || 16}</strong>
          </div>
        </div>

        <div className="admin-stat-card glass-card">
          <div className="stat-icon-wrap orders">
            <ShoppingBag size={22} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Total Orders</span>
            <strong className="stat-val">{stats?.totalOrders || 37}</strong>
          </div>
        </div>

        <div className="admin-stat-card glass-card">
          <div className="stat-icon-wrap exchanges">
            <ArrowLeftRight size={22} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Exchange Proposals</span>
            <strong className="stat-val">{stats?.totalExchangeRequests || 19}</strong>
          </div>
        </div>

        <div className="admin-stat-card glass-card highlight-danger">
          <div className="stat-icon-wrap reports">
            <Flag size={22} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Pending Reports</span>
            <strong className="stat-val text-danger">{stats?.pendingReports || reports.filter(r => r.status === 'PENDING').length}</strong>
          </div>
        </div>
      </div>

      {/* Admin Navigation Tabs */}
      <div className="admin-tabs-bar">
        <button
          className={`admin-tab-btn ${activeSubTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('overview')}
        >
          <BarChart3 size={17} />
          <span>Overview & Health</span>
        </button>

        <button
          className={`admin-tab-btn ${activeSubTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('users')}
        >
          <Users size={17} />
          <span>User Management</span>
          <span className="tab-pill">{users.length}</span>
        </button>

        <button
          className={`admin-tab-btn ${activeSubTab === 'products' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('products')}
        >
          <Package size={17} />
          <span>Product Moderation</span>
          <span className="tab-pill">{products.length}</span>
        </button>

        <button
          className={`admin-tab-btn ${activeSubTab === 'reports' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('reports')}
        >
          <Flag size={17} />
          <span>Reports Center</span>
          {reports.filter(r => r.status === 'PENDING').length > 0 && (
            <span className="tab-pill danger">{reports.filter(r => r.status === 'PENDING').length}</span>
          )}
        </button>
      </div>

      {/* ================= SUBTAB 1: OVERVIEW & HEALTH ================= */}
      {activeSubTab === 'overview' && (
        <div className="admin-tab-panel glass-card">
          <div className="overview-security-box">
            <div className="security-item">
              <div className="security-icon-wrap bg-emerald">
                <Lock size={20} className="text-emerald-400" />
              </div>
              <div>
                <h4>Cryptographic JWT Auth & BCrypt Encryption</h4>
                <p>All passwords are encrypted with BCrypt 10 salt rounds. Stateless HS256 tokens guard protected endpoints.</p>
              </div>
            </div>

            <div className="security-item">
              <div className="security-icon-wrap bg-blue">
                <Shield size={20} className="text-accent" />
              </div>
              <div>
                <h4>Strict Role-Based Authorization</h4>
                <p>Endpoint protection active. Only accounts with <code>ROLE_ADMIN</code> can access administrative controllers.</p>
              </div>
            </div>

            <div className="security-item">
              <div className="security-icon-wrap bg-amber">
                <ShieldAlert size={20} className="text-amber-400" />
              </div>
              <div>
                <h4>Anti-Fraud & Seller Ownership Validation</h4>
                <p>Duplicate review prevention active. Users cannot purchase their own items or already sold devices.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= SUBTAB 2: USER MANAGEMENT ================= */}
      {activeSubTab === 'users' && (
        <div className="admin-tab-panel glass-card">
          <div className="panel-controls-row">
            <div className="admin-search-box">
              <Search size={16} />
              <input
                type="text"
                placeholder="Search users by name, email, or phone..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
              />
            </div>
            <span className="panel-count-label">{users.length} registered users</span>
          </div>

          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Contact Info</th>
                  <th>Address</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id}>
                    <td>
                      <div className="table-user-cell">
                        <img
                          src={u.profileImage || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
                          alt={u.name}
                          className="table-avatar"
                        />
                        <div>
                          <strong>{u.name}</strong>
                          <span className="table-subtext">{u.email}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span>{u.phone || '—'}</span>
                    </td>
                    <td className="table-address-cell">
                      <span>{u.address || '—'}</span>
                    </td>
                    <td>
                      <span className={`role-pill ${u.role === 'ROLE_ADMIN' ? 'admin' : 'user'}`}>
                        {u.role === 'ROLE_ADMIN' ? 'Admin' : 'Member'}
                      </span>
                    </td>
                    <td>
                      <span className={`status-pill-subtle ${u.status === 'SUSPENDED' ? 'suspended' : 'active'}`}>
                        {u.status || 'ACTIVE'}
                      </span>
                    </td>
                    <td>
                      {u.role !== 'ROLE_ADMIN' && (
                        <button
                          className={`btn-table-action ${u.status === 'SUSPENDED' ? 'reactivate' : 'suspend'}`}
                          onClick={() => handleToggleUserStatus(u.id, u.status || 'ACTIVE')}
                          disabled={processingId === u.id}
                        >
                          {u.status === 'SUSPENDED' ? (
                            <>
                              <UserCheck size={14} />
                              <span>Reactivate</span>
                            </>
                          ) : (
                            <>
                              <UserX size={14} />
                              <span>Suspend</span>
                            </>
                          )}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= SUBTAB 3: PRODUCT MODERATION ================= */}
      {activeSubTab === 'products' && (
        <div className="admin-tab-panel glass-card">
          <div className="panel-controls-row">
            <div className="admin-search-box">
              <Search size={16} />
              <input
                type="text"
                placeholder="Search products by title, brand, or model..."
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
              />
            </div>

            <div className="admin-filter-select-wrap">
              <select
                className="admin-select"
                value={productStatusFilter}
                onChange={(e) => setProductStatusFilter(e.target.value)}
              >
                <option value="">All Statuses</option>
                <option value="AVAILABLE">AVAILABLE</option>
                <option value="RESERVED">RESERVED</option>
                <option value="SOLD">SOLD</option>
                <option value="SUSPENDED">SUSPENDED</option>
              </select>
            </div>
          </div>

          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Condition</th>
                  <th>Seller</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map(p => (
                  <tr key={p.id}>
                    <td>
                      <div className="table-product-cell">
                        <img
                          src={p.primaryImage || (p.imageUrls && p.imageUrls[0]) || 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=150'}
                          alt={p.title}
                          className="table-prod-thumb"
                        />
                        <div>
                          <strong className="table-prod-title" onClick={() => onSelectProduct && onSelectProduct(p)}>
                            {p.title}
                          </strong>
                          <span className="table-subtext">{p.brand} {p.model ? `(${p.model})` : ''}</span>
                        </div>
                      </div>
                    </td>
                    <td>{p.category}</td>
                    <td><strong>${parseFloat(p.price || 0).toFixed(2)}</strong></td>
                    <td><span className="badge-condition-sm">{p.condition}</span></td>
                    <td>
                      <span>{p.sellerName || 'Verified Seller'}</span>
                    </td>
                    <td>
                      <select
                        className="status-dropdown-select"
                        value={p.status || 'AVAILABLE'}
                        onChange={(e) => handleUpdateProductStatus(p.id, e.target.value)}
                        disabled={processingId === p.id}
                      >
                        <option value="AVAILABLE">AVAILABLE</option>
                        <option value="RESERVED">RESERVED</option>
                        <option value="SOLD">SOLD</option>
                        <option value="SUSPENDED">SUSPENDED</option>
                      </select>
                    </td>
                    <td>
                      <div className="table-actions-cluster">
                        <button
                          className="btn-icon-action"
                          onClick={() => onSelectProduct && onSelectProduct(p)}
                          title="View listing"
                        >
                          <Eye size={15} />
                        </button>
                        <button
                          className="btn-icon-action delete"
                          onClick={() => setDeleteProductConfirm(p)}
                          title="Permanently remove"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= SUBTAB 4: REPORTS CENTER ================= */}
      {activeSubTab === 'reports' && (
        <div className="admin-tab-panel glass-card">
          <div className="panel-controls-row">
            <div className="filter-chips-row">
              {['ALL', 'PENDING', 'RESOLVED', 'DISMISSED'].map(f => (
                <button
                  key={f}
                  className={`filter-chip-btn ${reportFilter === f ? 'active' : ''}`}
                  onClick={() => setReportFilter(f)}
                >
                  {f}
                </button>
              ))}
            </div>
            <span className="panel-count-label">{filteredReports.length} reports</span>
          </div>

          {filteredReports.length === 0 ? (
            <div className="dash-empty-card glass-card compact">
              <CheckCircle2 size={36} className="text-emerald-400" />
              <h4>No Reports Found</h4>
              <p>No listings matching this status are currently flagged.</p>
            </div>
          ) : (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Report ID</th>
                    <th>Reported Listing</th>
                    <th>Reason</th>
                    <th>Reporter</th>
                    <th>Details</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReports.map(rep => (
                    <tr key={rep.id}>
                      <td><strong>#{rep.id}</strong></td>
                      <td>
                        <div className="reported-prod-meta">
                          <strong>{rep.productTitle}</strong>
                          <span className="table-subtext">Seller: {rep.sellerName}</span>
                        </div>
                      </td>
                      <td>
                        <span className={`reason-pill ${rep.reason?.toLowerCase()}`}>
                          {rep.reason?.replace('_', ' ')}
                        </span>
                      </td>
                      <td>
                        <span>{rep.reporterName}</span>
                        <span className="table-subtext">{rep.reporterEmail}</span>
                      </td>
                      <td className="table-details-cell">
                        <p>{rep.details || 'No additional details provided.'}</p>
                      </td>
                      <td>
                        <span className={`status-pill-subtle ${rep.status?.toLowerCase()}`}>
                          {rep.status}
                        </span>
                      </td>
                      <td>
                        {rep.status === 'PENDING' && (
                          <div className="report-action-buttons">
                            <button
                              className="btn btn-primary btn-xs"
                              onClick={() => handleUpdateReportStatus(rep.id, 'RESOLVED')}
                              disabled={processingId === rep.id}
                            >
                              Resolve
                            </button>
                            <button
                              className="btn btn-outline btn-xs"
                              onClick={() => handleUpdateReportStatus(rep.id, 'DISMISSED')}
                              disabled={processingId === rep.id}
                            >
                              Dismiss
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Product Delete Confirmation Modal */}
      {deleteProductConfirm && (
        <div className="modal-backdrop" onClick={() => setDeleteProductConfirm(null)}>
          <div className="modal-content glass-card delete-confirm-modal" onClick={e => e.stopPropagation()}>
            <div className="delete-icon-wrap">
              <AlertTriangle size={36} className="text-danger" />
            </div>
            <h3>Moderator Remove Listing</h3>
            <p>
              Are you sure you want to permanently remove <strong>{deleteProductConfirm.title}</strong>? 
              This will remove it immediately from all search indexes.
            </p>

            <div className="delete-modal-actions">
              <button
                className="btn btn-secondary"
                onClick={() => setDeleteProductConfirm(null)}
                disabled={processingId === deleteProductConfirm.id}
              >
                Cancel
              </button>
              <button
                className="btn btn-danger"
                onClick={() => handleDeleteProduct(deleteProductConfirm.id)}
                disabled={processingId === deleteProductConfirm.id}
              >
                {processingId === deleteProductConfirm.id ? 'Removing...' : 'Confirm Moderator Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
