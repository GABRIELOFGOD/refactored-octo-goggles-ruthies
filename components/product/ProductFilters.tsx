'use client';

import { useState } from 'react';

interface ProductFiltersProps {
  onFilterChange: (filters: {
    category?: string;
    priceRange?: [number, number];
    sizes?: string[];
    colors?: string[];
    sort?: string;
  }) => void;
  availableCategories: Array<{ _id: string; name: string }>;
}

export default function ProductFilters({
  onFilterChange,
  availableCategories,
}: ProductFiltersProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<string>('newest');

  const handleFilterChange = () => {
    onFilterChange({
      category: selectedCategory || undefined,
      priceRange: priceRange[1] < 1000 ? priceRange : undefined,
      sizes: selectedSizes.length > 0 ? selectedSizes : undefined,
      colors: selectedColors.length > 0 ? selectedColors : undefined,
      sort: sortBy,
    });
  };

  const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
  const colors = ['Black', 'White', 'Gold', 'Silver', 'Navy', 'Burgundy', 'Blush'];

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
      {/* Sort */}
      <div>
        <h3 className="font-bold text-gray-900 mb-3">Sort By</h3>
        <select
          value={sortBy}
          onChange={(e) => {
            setSortBy(e.target.value);
            handleFilterChange();
          }}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="newest">Newest</option>
          <option value="price-low">Price: Low to High</option>
          <option value="price-high">Price: High to Low</option>
          <option value="popular">Most Popular</option>
        </select>
      </div>

      {/* Categories */}
      {availableCategories.length > 0 && (
        <div>
          <h3 className="font-bold text-gray-900 mb-3">Category</h3>
          <div className="space-y-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="category"
                value=""
                checked={selectedCategory === ''}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  onFilterChange({ sort: sortBy });
                }}
                className="w-4 h-4"
              />
              <span className="text-sm text-gray-700">All Categories</span>
            </label>
            {availableCategories.map((cat) => (
              <label key={cat._id} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="category"
                  value={cat._id}
                  checked={selectedCategory === cat._id}
                  onChange={(e) => {
                    setSelectedCategory(e.target.value);
                    handleFilterChange();
                  }}
                  className="w-4 h-4"
                />
                <span className="text-sm text-gray-700">{cat.name}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Price Range */}
      <div>
        <h3 className="font-bold text-gray-900 mb-3">Price Range</h3>
        <div className="space-y-2">
          <input
            type="range"
            min="0"
            max="1000"
            value={priceRange[1]}
            onChange={(e) => {
              const newRange: [number, number] = [priceRange[0], parseInt(e.target.value)];
              setPriceRange(newRange);
              handleFilterChange();
            }}
            className="w-full"
          />
          <div className="flex justify-between text-sm text-gray-600">
            <span>${priceRange[0]}</span>
            <span>${priceRange[1]}</span>
          </div>
        </div>
      </div>

      {/* Sizes */}
      <div>
        <h3 className="font-bold text-gray-900 mb-3">Size</h3>
        <div className="flex flex-wrap gap-2">
          {sizes.map((size) => (
            <button
              key={size}
              onClick={() => {
                const newSizes = selectedSizes.includes(size)
                  ? selectedSizes.filter((s) => s !== size)
                  : [...selectedSizes, size];
                setSelectedSizes(newSizes);
                handleFilterChange();
              }}
              className={`px-3 py-1 rounded-md border-2 text-sm font-medium transition-all ${
                selectedSizes.includes(size)
                  ? 'border-primary bg-primary text-white'
                  : 'border-gray-300 text-gray-700 hover:border-primary'
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      {/* Colors */}
      <div>
        <h3 className="font-bold text-gray-900 mb-3">Color</h3>
        <div className="flex flex-wrap gap-2">
          {colors.map((color) => (
            <button
              key={color}
              onClick={() => {
                const newColors = selectedColors.includes(color)
                  ? selectedColors.filter((c) => c !== color)
                  : [...selectedColors, color];
                setSelectedColors(newColors);
                handleFilterChange();
              }}
              className={`px-3 py-1 rounded-md border-2 text-sm font-medium transition-all ${
                selectedColors.includes(color)
                  ? 'border-primary bg-primary text-white'
                  : 'border-gray-300 text-gray-700 hover:border-primary'
              }`}
            >
              {color}
            </button>
          ))}
        </div>
      </div>

      {/* Reset Button */}
      <button
        onClick={() => {
          setSelectedCategory('');
          setPriceRange([0, 1000]);
          setSelectedSizes([]);
          setSelectedColors([]);
          setSortBy('newest');
          onFilterChange({});
        }}
        className="w-full bg-gray-100 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-200 transition-all"
      >
        Reset Filters
      </button>
    </div>
  );
}
