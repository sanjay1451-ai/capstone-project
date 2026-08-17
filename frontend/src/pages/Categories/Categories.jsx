import React from 'react';
import { Layers } from 'lucide-react';
import CategoryList from '../../components/CategoryList/CategoryList';
import './Categories.css';

export default function Categories({ categories = [], onSelectCategory }) {
  return (
    <div className="categories-page container">
      <div className="categories-header">
        <div className="badge badge-cyan">
          <Layers size={14} />
          <span>Device Categories</span>
        </div>
        <h1 className="categories-title">
          Browse by <span className="gradient-text">Product Category</span>
        </h1>
        <p className="categories-subtitle">
          Select an electronics category to explore pre-owned, certified, and refurbished equipment.
        </p>
      </div>

      <CategoryList
        categories={categories}
        onSelectCategory={onSelectCategory}
      />
    </div>
  );
}
