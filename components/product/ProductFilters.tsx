'use client';

import { useState, useMemo } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { useCurrency } from '@/context/CurrencyContext';
import { t, convertCurrency } from '@/lib/i18n';
import { Filter } from 'lucide-react';

interface ProductFiltersProps {
  onFilterChange: (filters: {
    category?: string;
    priceRange?: [number, number];
    sizes?: string[];
    colors?: string[];
    sort?: string;
    currency?: string;
  }) => void;
  availableCategories: Array<{ _id: string; name: string }>;
}

export default function ProductFilters({
  onFilterChange,
  availableCategories,
}: ProductFiltersProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100000]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<string>('newest');

  const { language } = useLanguage();
  const { currency } = useCurrency();

  // Calculate max price based on currency
  const maxPriceNGN = 100000;
  const maxPriceConverted = convertCurrency(maxPriceNGN, 'NGN', currency);

  const handleFilterChange = () => {
    onFilterChange({
      category: selectedCategory || undefined,
      priceRange: priceRange[1] < maxPriceConverted ? priceRange : undefined,
      sizes: selectedSizes.length > 0 ? selectedSizes : undefined,
      colors: selectedColors.length > 0 ? selectedColors : undefined,
      sort: sortBy,
      currency,
    });
  };

  const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
  const colors = ['Black', 'White', 'Gold', 'Silver', 'Navy', 'Burgundy', 'Blush'];

  const currencySymbols: Record<string, string> = {
    NGN: '₦',
    USD: '$',
    GBP: '£',
    EUR: '€',
  };

  return (
    <div className="bg-white rounded-lg border border-neutral-200 p-6 space-y-6 shadow-sm sticky top-4">
      <div className="flex items-center gap-2 mb-4">
        <Filter className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-bold text-primary">{t(language, 'shop.filters')}</h2>
      </div>

      {/* Sort */}
      <div className="border-b border-neutral-200 pb-6">
        <h3 className="font-bold text-neutral-900 mb-3 text-sm">{t(language, 'shop.sortBy')}</h3>
        <select
          value={sortBy}
          onChange={(e) => {
            setSortBy(e.target.value);
            handleFilterChange();
          }}
          className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-secondary bg-white"
        >
          <option value="newest">{t(language, 'shop.newest')}</option>
          <option value="price-low">{t(language, 'shop.priceLow')}</option>
          <option value="price-high">{t(language, 'shop.priceHigh')}</option>
          <option value="popular">{t(language, 'shop.popular')}</option>
        </select>
      </div>

      {/* Currency Display */}
      <div className="bg-light-bg rounded-lg p-3 border border-secondary/20">
        <p className="text-xs text-neutral-600 font-semibold">{t(language, 'header.currency')}</p>
        <p className="text-lg font-bold text-secondary">{currency} ({currencySymbols[currency]})</p>
      </div>

      {/* Categories */}
      {availableCategories.length > 0 && (
        <div className="border-b border-neutral-200 pb-6">
          <h3 className="font-bold text-neutral-900 mb-3 text-sm">{t(language, 'shop.category')}</h3>
          <div className="space-y-2">
            <label className="flex items-center gap-2 cursor-pointer hover:text-secondary transition-colors">
              <input
                type="radio"
                name="category"
                value=""
                checked={selectedCategory === ''}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  onFilterChange({ sort: sortBy, currency });
                }}
                className="w-4 h-4 accent-secondary"
              />
              <span className="text-sm text-neutral-700">{t(language, 'shop.allCategories')}</span>
            </label>
            {availableCategories.map((cat) => (
              <label key={cat._id} className="flex items-center gap-2 cursor-pointer hover:text-secondary transition-colors">
                <input
                  type="radio"
                  name="category"
                  value={cat._id}
                  checked={selectedCategory === cat._id}
                  onChange={(e) => {
                    setSelectedCategory(e.target.value);
                    handleFilterChange();
                  }}
                  className="w-4 h-4 accent-secondary"
                />
                <span className="text-sm text-neutral-700">{cat.name}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Price Range */}
      <div className="border-b border-neutral-200 pb-6">
        <h3 className="font-bold text-neutral-900 mb-3 text-sm">{t(language, 'shop.priceRange')}</h3>
        <div className="space-y-4">
          <input
            type="range"
            min="0"
            max={Math.round(maxPriceConverted)}
            value={priceRange[1]}
            onChange={(e) => {
              const newRange: [number, number] = [priceRange[0], parseInt(e.target.value)];
              setPriceRange(newRange);
              handleFilterChange();
            }}
            className="w-full h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-secondary"
          />
          <div className="flex justify-between items-center bg-light-bg p-3 rounded-lg border border-neutral-200">
            <div className="text-center">
              <p className="text-xs text-neutral-500 mb-1">{t(language, 'shop.min')}</p>
              <p className="font-bold text-primary text-sm">
                {currencySymbols[currency]}{priceRange[0].toLocaleString()}
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-neutral-500 mb-1">{t(language, 'shop.max')}</p>
              <p className="font-bold text-secondary text-sm">
                {currencySymbols[currency]}{Math.round(priceRange[1]).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Sizes */}
      <div className="border-b border-neutral-200 pb-6">
        <h3 className="font-bold text-neutral-900 mb-3 text-sm">{t(language, 'shop.size')}</h3>
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
              className={`px-3 py-2 rounded-lg border-2 text-xs font-bold transition-all ${
                selectedSizes.includes(size)
                  ? 'border-secondary bg-secondary text-white'
                  : 'border-neutral-300 text-neutral-700 hover:border-secondary'
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      {/* Colors */}
      <div className="border-b border-neutral-200 pb-6">
        <h3 className="font-bold text-neutral-900 mb-3 text-sm">{t(language, 'shop.color')}</h3>
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
              className={`px-3 py-2 rounded-lg border-2 text-xs font-bold transition-all ${
                selectedColors.includes(color)
                  ? 'border-secondary bg-secondary text-white'
                  : 'border-neutral-300 text-neutral-700 hover:border-secondary'
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
          setPriceRange([0, maxPriceConverted]);
          setSelectedSizes([]);
          setSelectedColors([]);
          setSortBy('newest');
          onFilterChange({ currency });
        }}
        className="w-full bg-linear-to-r from-neutral-100 to-neutral-50 text-neutral-700 py-3 rounded-lg font-bold hover:from-neutral-200 hover:to-neutral-100 transition-all border border-neutral-200"
      >
        {t(language, 'shop.resetFilters')}
      </button>
    </div>
  );
}
