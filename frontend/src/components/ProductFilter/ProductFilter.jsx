import React from 'react';
import { Search, Filter, RotateCcw, SlidersHorizontal } from 'lucide-react';
import './ProductFilter.css';

export default function ProductFilter({
  categories = [],
  selectedCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  selectedCondition,
  onSelectCondition,
  sortBy,
  onSortChange,
  onReset
}) {
  const conditions = [
    { label: 'All Conditions', value: '' },
    { label: 'Like New', value: 'LIKE_NEW' },
    { label: 'Excellent', value: 'EXCELLENT' },
    { label: 'Good', value: 'GOOD' },
    { label: 'Fair', value: 'FAIR' }
  ];

  return (
    <div className="filter-panel glass-card">
      <div className="filter-top-row">
        {/* Search Input */}
        <div className="search-input-wrapper">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search phones, laptops, consoles, audio..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          {searchQuery && (
            <button className="clear-search-btn" onClick={() => onSearchChange('')}>
              &times;
            </button>
          )}
        </div>

        {/* Category Dropdown */}
        <div className="select-wrapper">
          <select
            className="custom-select"
            value={selectedCategory}
            onChange={(e) => onSelectCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.name}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Sort Dropdown */}
        <div className="select-wrapper">
          <select
            className="custom-select"
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
          >
            <option value="newest">Newest Listed</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
          </select>
        </div>

        {/* Reset button */}
        {(searchQuery || selectedCategory || selectedCondition || sortBy !== 'newest') && (
          <button className="btn btn-secondary reset-btn" onClick={onReset}>
            <RotateCcw size={14} />
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* Condition Filter Chips */}
      <div className="filter-condition-row">
        <span className="condition-label">
          <SlidersHorizontal size={14} /> Condition:
        </span>
        <div className="condition-chips">
          {conditions.map((cond) => (
            <button
              key={cond.value}
              className={`chip-btn ${selectedCondition === cond.value ? 'active' : ''}`}
              onClick={() => onSelectCondition(cond.value)}
            >
              {cond.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
