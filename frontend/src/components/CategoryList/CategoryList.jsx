import React from 'react';
import { Smartphone, Laptop, Headphones, Gamepad2, Tablet, Watch, Camera, Layers, ArrowRight } from 'lucide-react';
import './CategoryList.css';

const iconMap = {
  'smartphones': Smartphone,
  'laptops & computers': Laptop,
  'laptops & pcs': Laptop,
  'audio & sound': Headphones,
  'audio & headphones': Headphones,
  'gaming & consoles': Gamepad2,
  'gaming consoles': Gamepad2,
  'tablets & readers': Tablet,
  'tablets & e-readers': Tablet,
  'wearables & smartwatches': Watch,
  'cameras & photography': Camera,
  'cameras & optics': Camera
};

export default function CategoryList({ categories = [], onSelectCategory }) {
  const getIcon = (categoryName) => {
    const key = categoryName?.toLowerCase();
    const IconComponent = iconMap[key] || Layers;
    return <IconComponent size={28} />;
  };

  return (
    <div className="categories-grid">
      {categories.map((cat) => (
        <div
          key={cat.id}
          className="category-card glass-card"
          onClick={() => onSelectCategory(cat.name)}
        >
          <div className="category-icon-wrapper">
            {getIcon(cat.name)}
          </div>
          <div className="category-info">
            <h3 className="category-name">{cat.name}</h3>
            <p className="category-desc">{cat.description}</p>
          </div>
          <div className="category-action">
            <span>Browse Listings</span>
            <ArrowRight size={14} />
          </div>
        </div>
      ))}
    </div>
  );
}
