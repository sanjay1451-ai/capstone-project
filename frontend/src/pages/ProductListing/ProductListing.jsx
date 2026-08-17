import React, { useState, useEffect, useCallback } from 'react';
import { ShoppingBag, Loader2, Sparkles, AlertCircle, PlusCircle } from 'lucide-react';
import ProductCard from '../../components/ProductCard/ProductCard';
import ProductFilter from '../../components/ProductFilter/ProductFilter';
import { productService } from '../../services/productService';
import './ProductListing.css';

export default function ProductListing({
  categories = [],
  selectedCategory,
  onSelectCategory,
  onSelectProduct,
  onOpenCreateModal,
  onOpenAuthModal
}) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCondition, setSelectedCondition] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        category: selectedCategory || undefined,
        condition: selectedCondition || undefined,
        search: searchQuery || undefined
      };
      const data = await productService.getProducts(params);

      // Client-side sorting
      let sorted = [...data];
      if (sortBy === 'price_asc') {
        sorted.sort((a, b) => Number(a.price) - Number(b.price));
      } else if (sortBy === 'price_desc') {
        sorted.sort((a, b) => Number(b.price) - Number(a.price));
      }

      setProducts(sorted);
    } catch (err) {
      setError('Unable to load listings. Please ensure the backend is running.');
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, selectedCondition, searchQuery, sortBy]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleReset = () => {
    setSearchQuery('');
    onSelectCategory('');
    setSelectedCondition('');
    setSortBy('newest');
  };

  return (
    <div className="product-listing-page container">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <div className="badge badge-emerald">
            <ShoppingBag size={14} />
            <span>Marketplace Catalog</span>
          </div>
          <h1 className="page-title">
            {selectedCategory ? `${selectedCategory} Listings` : 'Explore Pre-Owned Electronics'}
          </h1>
          <p className="page-subtitle">
            Diagnostic-tested gadgets ready for direct purchase or peer-to-peer exchange.
          </p>
        </div>

        <button className="btn btn-primary" onClick={onOpenCreateModal}>
          <PlusCircle size={16} />
          <span>List Your Device</span>
        </button>
      </div>

      {/* Filter Bar */}
      <ProductFilter
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={onSelectCategory}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedCondition={selectedCondition}
        onSelectCondition={setSelectedCondition}
        sortBy={sortBy}
        onSortChange={setSortBy}
        onReset={handleReset}
      />

      {/* Results Header */}
      <div className="results-header">
        <span className="results-count">
          Showing <strong>{products.length}</strong> {products.length === 1 ? 'device' : 'devices'}
        </span>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="state-box loading">
          <Loader2 size={32} className="spin icon-load" />
          <span>Querying Supabase PostgreSQL listings...</span>
        </div>
      )}

      {/* Error state */}
      {!loading && error && (
        <div className="state-box error">
          <AlertCircle size={32} />
          <span>{error}</span>
          <button className="btn btn-secondary" onClick={fetchProducts}>
            Retry Request
          </button>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && products.length === 0 && (
        <div className="state-box empty glass-card">
          <Sparkles size={40} className="icon-empty" />
          <h3>No Devices Found</h3>
          <p>Try clearing your filters or be the first to list a gadget in this category.</p>
          <div className="empty-actions">
            <button className="btn btn-secondary" onClick={handleReset}>
              Clear Filters
            </button>
            <button className="btn btn-primary" onClick={onOpenCreateModal}>
              List a Device Now
            </button>
          </div>
        </div>
      )}

      {/* Product Grid */}
      {!loading && !error && products.length > 0 && (
        <div className="products-grid">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onSelect={onSelectProduct}
              onOpenAuthModal={onOpenAuthModal}
            />
          ))}
        </div>
      )}
    </div>
  );
}
