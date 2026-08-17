import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ShoppingBag, Search, SlidersHorizontal, ArrowUpDown, RotateCcw, AlertCircle, PlusCircle, Sparkles, Filter, X, CheckCircle2, MapPin } from 'lucide-react';
import ProductCard from '../../components/ProductCard/ProductCard';
import FilterSidebar from '../../components/FilterSidebar/FilterSidebar';
import ProductSkeleton from '../../components/ProductSkeleton/ProductSkeleton';
import Pagination from '../../components/Pagination/Pagination';
import { productService } from '../../services/productService';
import './ProductListing.css';

export default function ProductListing({
  categories = [],
  selectedCategory = '',
  onSelectCategory,
  onSelectProduct,
  onOpenCreateModal,
  onOpenAuthModal
}) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedCondition, setSelectedCondition] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [locationQuery, setLocationQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest'); // 'newest' | 'price_asc' | 'price_desc' | 'oldest'

  // Mobile Drawer State
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = {
        keyword: searchQuery.trim() || undefined,
        category: selectedCategory || undefined,
        brand: selectedBrand || undefined,
        condition: selectedCondition || undefined,
        location: locationQuery.trim() || undefined,
        minPrice: minPrice ? parseFloat(minPrice) : undefined,
        maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
        sort: sortBy
      };

      const data = await productService.searchProducts(params);
      setProducts(data);
      setCurrentPage(1); // reset to page 1 on new filter/search
    } catch (err) {
      console.error('Error fetching marketplace products:', err);
      setError('Unable to load listings. Please ensure the backend is connected.');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedCategory, selectedBrand, selectedCondition, locationQuery, minPrice, maxPrice, sortBy]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handlePriceChange = (min, max) => {
    setMinPrice(min);
    setMaxPrice(max);
  };

  const handleResetAll = () => {
    setSearchQuery('');
    if (onSelectCategory) onSelectCategory('');
    setSelectedBrand('');
    setSelectedCondition('');
    setMinPrice('');
    setMaxPrice('');
    setLocationQuery('');
    setSortBy('newest');
    setCurrentPage(1);
  };

  // Paginated Sliced Results
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return products.slice(start, start + pageSize);
  }, [products, currentPage, pageSize]);

  // Active filters array for pill tags
  const activeFilterTags = useMemo(() => {
    const tags = [];
    if (selectedCategory) {
      tags.push({ key: 'category', label: `Category: ${selectedCategory}`, clear: () => onSelectCategory('') });
    }
    if (selectedBrand) {
      tags.push({ key: 'brand', label: `Brand: ${selectedBrand}`, clear: () => setSelectedBrand('') });
    }
    if (selectedCondition) {
      tags.push({ key: 'condition', label: `Condition: ${selectedCondition.replace('_', ' ')}`, clear: () => setSelectedCondition('') });
    }
    if (minPrice || maxPrice) {
      const pLabel = minPrice && maxPrice ? `$${minPrice}–$${maxPrice}` : minPrice ? `Min $${minPrice}` : `Max $${maxPrice}`;
      tags.push({ key: 'price', label: `Price: ${pLabel}`, clear: () => { setMinPrice(''); setMaxPrice(''); } });
    }
    if (locationQuery) {
      tags.push({ key: 'location', label: `Location: ${locationQuery}`, clear: () => setLocationQuery('') });
    }
    return tags;
  }, [selectedCategory, selectedBrand, selectedCondition, minPrice, maxPrice, locationQuery, onSelectCategory]);

  return (
    <div className="marketplace-page container animate-fade-in">
      {/* Top Banner & Header */}
      <div className="marketplace-header">
        <div>
          <div className="badge badge-emerald">
            <ShoppingBag size={14} />
            <span>Circular Tech Recommerce</span>
          </div>
          <h1 className="marketplace-title">Marketplace <span className="gradient-text">Catalog</span></h1>
          <p className="marketplace-subtitle">
            Explore diagnostic-tested smartphones, laptops, audio gear, and gaming hardware verified for immediate reuse.
          </p>
        </div>

        <button className="btn btn-primary" onClick={onOpenCreateModal}>
          <PlusCircle size={16} />
          <span>List a Device</span>
        </button>
      </div>

      {/* Search & Sort Controls Bar */}
      <div className="marketplace-controls-bar glass-card">
        {/* Search Input */}
        <div className="marketplace-search-box">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search device title, model, brand (e.g. iPhone 14, MacBook Pro, PS5)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button className="clear-query-btn" onClick={() => setSearchQuery('')}>
              &times;
            </button>
          )}
        </div>

        <div className="controls-right-group">
          {/* Mobile Filter Toggle */}
          <button
            className="btn-mobile-filter-toggle"
            onClick={() => setIsMobileFilterOpen(true)}
          >
            <Filter size={16} />
            <span>Filters</span>
            {activeFilterTags.length > 0 && (
              <span className="mobile-badge-count">{activeFilterTags.length}</span>
            )}
          </button>

          {/* Sort Dropdown */}
          <div className="sort-selector-wrapper">
            <ArrowUpDown size={15} className="sort-icon" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="sort-select"
            >
              <option value="newest">Newest Listings</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="oldest">Oldest Listings</option>
            </select>
          </div>
        </div>
      </div>

      {/* Active Filter Pills Strip */}
      {activeFilterTags.length > 0 && (
        <div className="active-filters-strip">
          <span className="active-filters-label">Active Filters:</span>
          <div className="filter-tags-list">
            {activeFilterTags.map(tag => (
              <span key={tag.key} className="filter-tag-pill">
                <span>{tag.label}</span>
                <button onClick={tag.clear} title="Remove filter">&times;</button>
              </span>
            ))}
            <button className="btn-clear-all-tags" onClick={handleResetAll}>
              <RotateCcw size={12} />
              <span>Clear All</span>
            </button>
          </div>
        </div>
      )}

      {/* Marketplace Layout: Sidebar + Grid */}
      <div className="marketplace-layout-row">
        {/* Left Filter Sidebar */}
        <FilterSidebar
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={onSelectCategory}
          selectedBrand={selectedBrand}
          onSelectBrand={setSelectedBrand}
          selectedCondition={selectedCondition}
          onSelectCondition={setSelectedCondition}
          minPrice={minPrice}
          maxPrice={maxPrice}
          onPriceChange={handlePriceChange}
          locationQuery={locationQuery}
          onLocationChange={setLocationQuery}
          onResetFilters={handleResetAll}
          isOpenMobile={isMobileFilterOpen}
          onCloseMobile={() => setIsMobileFilterOpen(false)}
        />

        {/* Right Product Grid Area */}
        <div className="marketplace-main-column">
          {/* Results Summary Bar */}
          <div className="results-summary-bar">
            <span className="results-count-text">
              Found <strong>{products.length}</strong> available {products.length === 1 ? 'device' : 'devices'}
            </span>
          </div>

          {/* Loading Skeleton */}
          {loading && <ProductSkeleton count={pageSize} />}

          {/* Error Banner */}
          {!loading && error && (
            <div className="marketplace-error-card glass-card">
              <AlertCircle size={36} className="text-danger" />
              <h3>Unable to Load Products</h3>
              <p>{error}</p>
              <button className="btn btn-secondary" onClick={fetchProducts}>
                <RotateCcw size={14} />
                <span>Retry Search</span>
              </button>
            </div>
          )}

          {/* Empty Search Results */}
          {!loading && !error && products.length === 0 && (
            <div className="marketplace-empty-card glass-card">
              <div className="empty-icon-wrap">
                <Sparkles size={40} className="text-emerald-400" />
              </div>
              <h3>No Matching Electronic Devices Found</h3>
              <p>
                We couldn't find any listings matching your search or active filter criteria. Try broadening your keywords or resetting filters.
              </p>
              <div className="empty-card-actions">
                <button className="btn btn-secondary" onClick={handleResetAll}>
                  <RotateCcw size={14} />
                  <span>Reset All Filters</span>
                </button>
                <button className="btn btn-primary" onClick={onOpenCreateModal}>
                  <PlusCircle size={15} />
                  <span>List a Device Now</span>
                </button>
              </div>
            </div>
          )}

          {/* Populated Product Grid */}
          {!loading && !error && products.length > 0 && (
            <>
              <div className="marketplace-products-grid">
                {paginatedProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onSelect={onSelectProduct}
                    onOpenAuthModal={onOpenAuthModal}
                  />
                ))}
              </div>

              {/* Pagination */}
              <Pagination
                currentPage={currentPage}
                totalItems={products.length}
                pageSize={pageSize}
                onPageChange={(page) => {
                  setCurrentPage(page);
                  window.scrollTo({ top: 200, behavior: 'smooth' });
                }}
                onPageSizeChange={(size) => {
                  setPageSize(size);
                  setCurrentPage(1);
                }}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
