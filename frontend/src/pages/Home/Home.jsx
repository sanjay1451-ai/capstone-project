import React, { useState, useEffect } from 'react';
import { ArrowRight, Sparkles, ShoppingBag, Layers, Activity, Plus } from 'lucide-react';
import Navbar from '../../components/Navbar/Navbar';
import Hero from '../../components/Hero/Hero';
import HealthCheck from '../../components/HealthCheck/HealthCheck';
import FeatureGrid from '../../components/FeatureGrid/FeatureGrid';
import Footer from '../../components/Footer/Footer';
import ProductCard from '../../components/ProductCard/ProductCard';
import ProductDetailsModal from '../../components/ProductDetailsModal/ProductDetailsModal';
import CreateProductModal from '../../components/CreateProductModal/CreateProductModal';
import ProductListing from '../ProductListing/ProductListing';
import Categories from '../Categories/Categories';
import { useHealthCheck } from '../../hooks/useHealthCheck';
import { productService } from '../../services/productService';
import { categoryService } from '../../services/categoryService';
import './Home.css';

export default function Home() {
  const [activeTab, setActiveTab] = useState('home'); // 'home' | 'products' | 'categories' | 'health'
  const [categories, setCategories] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Phase 1 Live Health Check Hook
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
    if (activeTab !== 'products') {
      setActiveTab('products');
    }
  };

  return (
    <div className="home-page">
      {/* Navigation Header with Live Status */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenCreateModal={() => setIsCreateModalOpen(true)}
        backendStatus={status}
      />

      <main>
        {/* TAB 1: HOME VIEW */}
        {activeTab === 'home' && (
          <>
            <Hero />

            {/* Featured Categories Carousel / Strip */}
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
                    <span className="section-eyebrow">Database Catalog</span>
                    <h2 className="section-heading-sm">Featured Verified Listings</h2>
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

            {/* Phase 1 Live REST Health Check Widget */}
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
            onOpenCreateModal={() => setIsCreateModalOpen(true)}
          />
        )}

        {/* TAB 3: CATEGORIES BROWSER VIEW */}
        {activeTab === 'categories' && (
          <Categories
            categories={categories}
            onSelectCategory={handleCategorySelect}
          />
        )}

        {/* TAB 4: API STATUS VIEW */}
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

      {/* Product Details Modal */}
      {selectedProduct && (
        <ProductDetailsModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}

      {/* Create Listing Modal */}
      {isCreateModalOpen && (
        <CreateProductModal
          categories={categories}
          onClose={() => setIsCreateModalOpen(false)}
          onCreated={handleProductCreated}
        />
      )}

      <Footer />
    </div>
  );
}
