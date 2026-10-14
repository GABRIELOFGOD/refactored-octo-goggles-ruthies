'use client';

import { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { useCurrency } from '@/context/CurrencyContext';
import { t, convertCurrency } from '@/lib/i18n';
import type { Currency } from '@/lib/i18n';
import { Filter } from 'lucide-react';

export interface ProductFilterValues {
  category?: string;
  priceRange?: [number, number];
  sizes?: string[];
  colors?: string[];
  sort: string;
  currency: Currency;
}

interface ProductFiltersProps {
  onFilterChange: (filters: ProductFilterValues) => void;
  availableCategories: Array<{ _id: string; name: string }>;
}

export default function ProductFilters({
  onFilterChange,
  availableCategories,
}: ProductFiltersProps) {
  const { language } = useLanguage();
  const { currency } = useCurrency();
  const maxPriceNGN = 100000;
  const maxPriceConverted = convertCurrency(maxPriceNGN, 'NGN', currency);

  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, maxPriceConverted]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<string>('newest');

  const handleFilterChange = (overrides: Partial<ProductFilterValues> = {}) => {
    onFilterChange({
      category: selectedCategory || undefined,
      priceRange: priceRange[1] < maxPriceConverted ? priceRange : undefined,
      sizes: selectedSizes.length > 0 ? selectedSizes : undefined,
      colors: selectedColors.length > 0 ? selectedColors : undefined,
      sort: sortBy,
      currency,
      ...overrides,
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
    <div className="sticky top-28 space-y-6 rounded-2xl border border-primary/10 bg-white p-5 shadow-sm shadow-primary/5 sm:p-6">
      <div className="mb-4 flex items-center gap-2">
        <Filter className="h-5 w-5 text-primary" />
        <h2 className="font-playfair text-xl text-primary">{t(language, 'shop.filters')}</h2>
      </div>

      {/* Sort */}
      <div className="border-b border-neutral-200 pb-6">
        <h3 className="font-bold text-neutral-900 mb-3 text-sm">{t(language, 'shop.sortBy')}</h3>
        <select
          value={sortBy}
          onChange={(e) => {
            const sort = e.target.value;
            setSortBy(sort);
            handleFilterChange({ sort });
          }}
          className="w-full rounded-xl border border-primary/15 bg-[#fbf9f3] px-3 py-2.5 text-sm text-primary focus:outline-none focus:ring-2 focus:ring-secondary"
        >
          <option value="newest">{t(language, 'shop.newest')}</option>
          <option value="price-low">{t(language, 'shop.priceLow')}</option>
          <option value="price-high">{t(language, 'shop.priceHigh')}</option>
          <option value="popular">{t(language, 'shop.popular')}</option>
        </select>
      </div>

      {/* Currency Display */}
      <div className="rounded-xl border border-secondary/30 bg-[#fbf9f3] p-3">
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
                  const category = e.target.value;
                  setSelectedCategory(category);
                  handleFilterChange({ category: category || undefined });
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
                    const category = e.target.value;
                    setSelectedCategory(category);
                    handleFilterChange({ category });
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
              handleFilterChange({
                priceRange: newRange[1] < maxPriceConverted ? newRange : undefined,
              });
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
                handleFilterChange({ sizes: newSizes.length ? newSizes : undefined });
              }}
              className={`rounded-lg border px-3 py-2 text-xs font-semibold transition-all ${
                selectedSizes.includes(size)
                  ? 'border-primary bg-primary text-white'
                  : 'border-primary/15 text-neutral-700 hover:border-primary'
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
                handleFilterChange({ colors: newColors.length ? newColors : undefined });
              }}
              className={`rounded-lg border px-3 py-2 text-xs font-semibold transition-all ${
                selectedColors.includes(color)
                  ? 'border-primary bg-primary text-white'
                  : 'border-primary/15 text-neutral-700 hover:border-primary'
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
          onFilterChange({ currency, sort: 'newest' });
        }}
        className="w-full rounded-xl border border-primary/15 bg-[#fbf9f3] py-3 font-semibold text-primary transition-colors hover:bg-primary/5"
      >
        {t(language, 'shop.resetFilters')}
      </button>
    </div>
  );
}
