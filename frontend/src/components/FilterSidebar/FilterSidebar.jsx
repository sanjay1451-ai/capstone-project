import React, { useState } from 'react';
import { Filter, X, RotateCcw, ChevronDown, ChevronUp, DollarSign, MapPin, Tag, SlidersHorizontal, Sparkles } from 'lucide-react';
import './FilterSidebar.css';

const POPULAR_BRANDS = ['Apple', 'Sony', 'Samsung', 'Dell', 'Nintendo', 'Microsoft', 'Lenovo', 'HP', 'Asus', 'Bose'];

const CONDITION_FILTERS = [
  { value: 'LIKE_NEW', label: 'Like New' },
  { value: 'EXCELLENT', label: 'Excellent' },
  { value: 'GOOD', label: 'Good' },
  { value: 'FAIR', label: 'Fair' },
  { value: 'USED', label: 'Used' }
];

const PRICE_PRESETS = [
  { label: 'Under $100', min: '', max: '100' },
  { label: '$100 – $500', min: '100', max: '500' },
  { label: '$500 – $1,000', min: '500', max: '1000' },
  { label: '$1,000+', min: '1000', max: '' }
];

export default function FilterSidebar({
  categories = [],
  selectedCategory = '',
  onSelectCategory,
  selectedBrand = '',
  onSelectBrand,
  selectedCondition = '',
  onSelectCondition,
  minPrice = '',
  maxPrice = '',
  onPriceChange,
  locationQuery = '',
  onLocationChange,
  onResetFilters,
  isOpenMobile = false,
  onCloseMobile
}) {
  const [catOpen, setCatOpen] = useState(true);
  const [brandOpen, setBrandOpen] = useState(true);
  const [priceOpen, setPriceOpen] = useState(true);
  const [conditionOpen, setConditionOpen] = useState(true);
  const [locationOpen, setLocationOpen] = useState(true);

  const hasActiveFilters = Boolean(
    selectedCategory ||
    selectedBrand ||
    selectedCondition ||
    minPrice ||
    maxPrice ||
    locationQuery
  );

  return (
    <aside className={`filter-sidebar glass-card ${isOpenMobile ? 'mobile-open' : ''}`}>
      {/* Sidebar Header */}
      <div className="filter-sidebar-header">
        <div className="header-title">
          <Filter size={18} className="text-emerald-400" />
          <h3>Refine Listings</h3>
        </div>

        <div className="header-actions">
          {hasActiveFilters && (
            <button className="btn-reset-sidebar" onClick={onResetFilters} title="Reset all filters">
              <RotateCcw size={13} />
              <span>Reset</span>
            </button>
          )}

          {onCloseMobile && (
            <button className="btn-close-mobile" onClick={onCloseMobile}>
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      <div className="filter-sidebar-body">
        {/* ================= CATEGORIES ACCORDION ================= */}
        <div className="filter-section">
          <button className="filter-section-toggle" onClick={() => setCatOpen(!catOpen)}>
            <span className="section-label">
              <Tag size={15} />
              <span>Categories</span>
            </span>
            {catOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>

          {catOpen && (
            <div className="filter-section-content">
              <button
                className={`filter-pill-btn ${!selectedCategory ? 'active' : ''}`}
                onClick={() => onSelectCategory('')}
              >
                All Categories
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  className={`filter-pill-btn ${selectedCategory === cat.name ? 'active' : ''}`}
                  onClick={() => onSelectCategory(cat.name)}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ================= PRICE RANGE ACCORDION ================= */}
        <div className="filter-section">
          <button className="filter-section-toggle" onClick={() => setPriceOpen(!priceOpen)}>
            <span className="section-label">
              <DollarSign size={15} />
              <span>Price Range ($)</span>
            </span>
            {priceOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>

          {priceOpen && (
            <div className="filter-section-content">
              <div className="price-inputs-row">
                <input
                  type="number"
                  placeholder="Min ($)"
                  min="0"
                  value={minPrice}
                  onChange={(e) => onPriceChange(e.target.value, maxPrice)}
                  className="filter-num-input"
                />
                <span className="price-sep">–</span>
                <input
                  type="number"
                  placeholder="Max ($)"
                  min="0"
                  value={maxPrice}
                  onChange={(e) => onPriceChange(minPrice, e.target.value)}
                  className="filter-num-input"
                />
              </div>

              {/* Quick Presets */}
              <div className="price-presets-grid">
                {PRICE_PRESETS.map((preset, i) => (
                  <button
                    key={i}
                    className={`preset-pill ${minPrice === preset.min && maxPrice === preset.max ? 'active' : ''}`}
                    onClick={() => onPriceChange(preset.min, preset.max)}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ================= CONDITION ACCORDION ================= */}
        <div className="filter-section">
          <button className="filter-section-toggle" onClick={() => setConditionOpen(!conditionOpen)}>
            <span className="section-label">
              <SlidersHorizontal size={15} />
              <span>Condition</span>
            </span>
            {conditionOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>

          {conditionOpen && (
            <div className="filter-section-content">
              <button
                className={`filter-pill-btn ${!selectedCondition ? 'active' : ''}`}
                onClick={() => onSelectCondition('')}
              >
                Any Condition
              </button>
              {CONDITION_FILTERS.map((cond) => (
                <button
                  key={cond.value}
                  className={`filter-pill-btn ${selectedCondition === cond.value ? 'active' : ''}`}
                  onClick={() => onSelectCondition(cond.value)}
                >
                  {cond.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ================= BRAND ACCORDION ================= */}
        <div className="filter-section">
          <button className="filter-section-toggle" onClick={() => setBrandOpen(!brandOpen)}>
            <span className="section-label">
              <Sparkles size={15} />
              <span>Brand</span>
            </span>
            {brandOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>

          {brandOpen && (
            <div className="filter-section-content brands-grid">
              <button
                className={`brand-chip ${!selectedBrand ? 'active' : ''}`}
                onClick={() => onSelectBrand('')}
              >
                All Brands
              </button>
              {POPULAR_BRANDS.map((brand) => (
                <button
                  key={brand}
                  className={`brand-chip ${selectedBrand.toLowerCase() === brand.toLowerCase() ? 'active' : ''}`}
                  onClick={() => onSelectBrand(selectedBrand.toLowerCase() === brand.toLowerCase() ? '' : brand)}
                >
                  {brand}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ================= LOCATION ACCORDION ================= */}
        <div className="filter-section">
          <button className="filter-section-toggle" onClick={() => setLocationOpen(!locationOpen)}>
            <span className="section-label">
              <MapPin size={15} />
              <span>Location</span>
            </span>
            {locationOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>

          {locationOpen && (
            <div className="filter-section-content">
              <div className="location-input-box">
                <MapPin size={14} className="loc-icon" />
                <input
                  type="text"
                  placeholder="e.g. San Francisco, Austin..."
                  value={locationQuery}
                  onChange={(e) => onLocationChange(e.target.value)}
                  className="filter-loc-input"
                />
                {locationQuery && (
                  <button className="loc-clear-btn" onClick={() => onLocationChange('')}>
                    &times;
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
