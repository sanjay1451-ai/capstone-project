import React, { useState, useEffect } from 'react';
import { ArrowRight, Sparkles, ShoppingBag, Layers, Activity, Plus, User, ShieldCheck, Tag, MessageSquare } from 'lucide-react';
import Navbar from '../../components/Navbar/Navbar';
import Hero from '../../components/Hero/Hero';
import HealthCheck from '../../components/HealthCheck/HealthCheck';
import FeatureGrid from '../../components/FeatureGrid/FeatureGrid';
import Footer from '../../components/Footer/Footer';
import ProductCard from '../../components/ProductCard/ProductCard';
import ProductDetailsModal from '../../components/ProductDetailsModal/ProductDetailsModal';
import CreateProductModal from '../../components/CreateProductModal/CreateProductModal';
import CheckoutModal from '../../components/CheckoutModal/CheckoutModal';
import ExchangeModal from '../../components/ExchangeModal/ExchangeModal';
import AuthModal from '../../components/AuthModal/AuthModal';
import ProductListing from '../ProductListing/ProductListing';
import Categories from '../Categories/Categories';
import Dashboard from '../Dashboard/Dashboard';
import Profile from '../Profile/Profile';
import Messages from '../Messages/Messages';
import AdminDashboard from '../AdminDashboard/AdminDashboard';
import Sell from '../Sell/Sell';
import { useAuth } from '../../context/AuthContext';
import { useHealthCheck } from '../../hooks/useHealthCheck';
import { productService } from '../../services/productService';
import { categoryService } from '../../services/categoryService';
import './Home.css';

export default function Home() {
  const [activeTab, setActiveTab] = useState('home'); // 'home' | 'products' | 'categories' | 'sell' | 'dashboard' | 'profile' | 'messages' | 'admin' | 'health'
  const [categories, setCategories] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  
  // Modals & Navigation state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState('login');
  const [checkoutProduct, setCheckoutProduct] = useState(null);
  const [exchangeProduct, setExchangeProduct] = useState(null);
  const [messagesRecipient, setMessagesRecipient] = useState(null);

  const { isAuthenticated, user } = useAuth();

  // Live REST Health Check Hook
  const { status, data, latency, error, lastChecked, refetch } = useHealthCheck(true);

  // Load Categories
  useEffect(() => {
    categoryService.getCategories()
      .then(setCategories)
      .catch((err) => console.log('Backend categories loading...'));
  }, [status]);

  // Load Featured Products for Home
  const loadFeatured = () => {
    productService.getProducts()
      .then((items) => setFeaturedProducts(items.slice(0, 4)))
      .catch((err) => console.log('Backend products loading...'));
  };

  useEffect(() => {
    loadFeatured();
  }, [status]);

  const handleCategorySelect = (categoryName) => {
    setSelectedCategory(categoryName);
    setActiveTab('products');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleProductCreated = () => {
    loadFeatured();
    if (activeTab !== 'products' && activeTab !== 'dashboard') {
      setActiveTab('products');
    }
  };

  const handleOpenAuthModal = (tab = 'login') => {
    setAuthModalTab(tab);
    setIsAuthModalOpen(true);
  };

  const handleOpenCreateModal = (productToEdit = null) => {
    if (!isAuthenticated) {
      handleOpenAuthModal('login');
    } else {
      setEditingProduct(productToEdit && productToEdit.id ? productToEdit : null);
      setIsCreateModalOpen(true);
    }
  };

  const handleOpenCheckout = (product) => {
    setSelectedProduct(null);
    setCheckoutProduct(product);
  };

  const handleOpenExchange = (product) => {
    setSelectedProduct(null);
    setExchangeProduct(product);
  };

  const handleOpenMessagesWithSeller = (recipient) => {
    setSelectedProduct(null);
    setMessagesRecipient(recipient);
    setActiveTab('messages');
  };

  return (
    <div className="home-page">
      {/* Navigation Header with Live Status & Auth State */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={(tab) => {
          if (tab !== 'messages') setMessagesRecipient(null);
          setActiveTab(tab);
        }}
        onOpenCreateModal={() => handleOpenCreateModal(null)}
        onOpenAuthModal={handleOpenAuthModal}
        backendStatus={status}
      />

      <main>
        {/* TAB 1: HOME VIEW */}
        {activeTab === 'home' && (
          <>
            <Hero onExploreMarketplace={() => setActiveTab('products')} onListDevice={() => handleOpenCreateModal(null)} />

            {/* Featured Categories Strip */}
            {categories.length > 0 && (
              <section className="home-categories-section">
                <div className="container">
                  <div className="section-header-compact">
                    <div>
                      <span className="section-eyebrow">Browse by Category</span>
                      <h2 className="section-heading-sm">Popular Electronics</h2>
                    </div>
                    <button className="view-all-link" onClick={() => setActiveTab('categories')}>
                      <span>All Categories</span>
                      <ArrowRight size={14} />
                    </button>
                  </div>

                  <div className="category-chips-row">
                    {categories.map((cat) => (
                      <button
                        key={cat.id}
                        className="cat-chip-card glass-card"
                        onClick={() => handleCategorySelect(cat.name)}
                      >
                        <span className="cat-chip-name">{cat.name}</span>
                        <ArrowRight size={14} className="chip-arrow" />
                      </button>
                    ))}
                  </div>
                </div>
              </section>
            )}

            {/* Featured Devices Grid */}
            <section className="featured-products-section">
              <div className="container">
                <div className="section-header-compact">
                  <div>
                    <span className="section-eyebrow">Verified Marketplace</span>
                    <h2 className="section-heading-sm">Featured Circular Tech</h2>
                  </div>
                  <button className="view-all-link" onClick={() => { setSelectedCategory(''); setActiveTab('products'); }}>
                    <span>View All Listings ({featuredProducts.length}+)</span>
                    <ArrowRight size={14} />
                  </button>
                </div>

                {featuredProducts.length > 0 ? (
                  <div className="home-products-grid">
                    {featuredProducts.map((product) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        onSelect={setSelectedProduct}
                        onOpenAuthModal={handleOpenAuthModal}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="empty-featured glass-card">
                    <Sparkles size={28} className="text-accent" />
                    <p>Connect your Supabase database to populate listings or click "List Device" above.</p>
                  </div>
                )}
              </div>
            </section>

            {/* Platform Pillars */}
            <FeatureGrid />

            {/* Live REST Health Check Widget */}
            <HealthCheck
              status={status}
              data={data}
              latency={latency}
              error={error}
              lastChecked={lastChecked}
              onRefresh={refetch}
            />
          </>
        )}

        {/* TAB 2: PRODUCTS MARKETPLACE VIEW */}
        {activeTab === 'products' && (
          <ProductListing
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            onSelectProduct={setSelectedProduct}
            onOpenCreateModal={() => handleOpenCreateModal(null)}
            onOpenAuthModal={handleOpenAuthModal}
          />
        )}

        {/* TAB 3: CATEGORIES BROWSER VIEW */}
        {activeTab === 'categories' && (
          <Categories
            categories={categories}
            onSelectCategory={handleCategorySelect}
          />
        )}

        {/* TAB 4: SELL ELECTRONICS VIEW */}
        {activeTab === 'sell' && (
          <Sell
            onListingCreated={() => {
              loadFeatured();
              setActiveTab('dashboard');
            }}
            onBackToHome={() => setActiveTab('products')}
            onOpenAuthModal={handleOpenAuthModal}
          />
        )}

        {/* TAB 5: BUYER-SELLER MESSAGING */}
        {activeTab === 'messages' && (
          <Messages
            initialRecipient={messagesRecipient}
            onSelectProduct={setSelectedProduct}
            onOpenAuthModal={handleOpenAuthModal}
          />
        )}

        {/* TAB 6: USER DASHBOARD */}
        {activeTab === 'dashboard' && (
          <Dashboard
            initialTab="listings"
            onSelectProduct={setSelectedProduct}
            onOpenCreateModal={() => handleOpenCreateModal(null)}
            onEditProduct={(product) => handleOpenCreateModal(product)}
            onOpenAuthModal={handleOpenAuthModal}
            onBackToHome={() => setActiveTab('products')}
          />
        )}

        {/* TAB 7: USER PROFILE DIRECT TAB */}
        {activeTab === 'profile' && (
          <Dashboard
            initialTab="profile"
            onSelectProduct={setSelectedProduct}
            onOpenCreateModal={() => handleOpenCreateModal(null)}
            onEditProduct={(product) => handleOpenCreateModal(product)}
            onOpenAuthModal={handleOpenAuthModal}
            onBackToHome={() => setActiveTab('home')}
          />
        )}

        {/* TAB 8: ADMIN SECURITY & MODERATION CONSOLE */}
        {activeTab === 'admin' && (
          <AdminDashboard
            onSelectProduct={setSelectedProduct}
            onOpenAuthModal={handleOpenAuthModal}
          />
        )}

        {/* TAB 9: API STATUS VIEW */}
        {activeTab === 'health' && (
          <div style={{ paddingTop: '2rem' }}>
            <HealthCheck
              status={status}
              data={data}
              latency={latency}
              error={error}
              lastChecked={lastChecked}
              onRefresh={refetch}
            />
          </div>
        )}
      </main>

      {/* Product Details Modal with Reviews, Checkout & Exchange */}
      {selectedProduct && (
        <ProductDetailsModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onOpenCheckout={handleOpenCheckout}
          onOpenExchange={handleOpenExchange}
          onOpenAuthModal={handleOpenAuthModal}
          onNavigateToMessages={handleOpenMessagesWithSeller}
        />
      )}

      {/* Checkout Modal */}
      {checkoutProduct && (
        <CheckoutModal
          product={checkoutProduct}
          onClose={() => setCheckoutProduct(null)}
          onOrderPlaced={() => {
            loadFeatured();
          }}
          onNavigateToDashboard={(tab) => {
            setActiveTab('dashboard');
          }}
        />
      )}

      {/* Exchange Proposal Modal */}
      {exchangeProduct && (
        <ExchangeModal
          targetProduct={exchangeProduct}
          onClose={() => setExchangeProduct(null)}
          onExchangeProposed={() => {
            setActiveTab('dashboard');
          }}
        />
      )}

      {/* Create / Edit Listing Modal */}
      {isCreateModalOpen && (
        <CreateProductModal
          categories={categories}
          product={editingProduct}
          onClose={() => {
            setIsCreateModalOpen(false);
            setEditingProduct(null);
          }}
          onSaved={handleProductCreated}
        />
      )}

      {/* Authentication Modal (Sign In / Register) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        initialTab={authModalTab}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={() => {
          console.log('Authentication successful!');
        }}
      />

      <Footer />
    </div>
  );
}
