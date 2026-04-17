'use client';

import { useState } from 'react';
import { ProductVariant } from '@/types';

interface ProductVariantSelectorProps {
  variants: ProductVariant[];
  onSelect: (variant: ProductVariant) => void;
  selectedVariant?: ProductVariant;
}

export default function ProductVariantSelector({
  variants,
  onSelect,
  selectedVariant,
}: ProductVariantSelectorProps) {
  const sizes = [...new Set(variants.map((v) => v.size))];
  const colors = [...new Set(variants.map((v) => v.color).filter(Boolean))];
  const materials = [...new Set(variants.map((v) => v.material).filter(Boolean))];

  const [selectedSize, setSelectedSize] = useState<string>(selectedVariant?.size || sizes[0]);
  const [selectedColor, setSelectedColor] = useState<string | undefined>(
    selectedVariant?.color || colors[0]
  );
  const [selectedMaterial, setSelectedMaterial] = useState<string | undefined>(
    selectedVariant?.material || materials[0]
  );

  const handleChange = () => {
    const variant = variants.find(
      (v) =>
        v.size === selectedSize &&
        v.color === selectedColor &&
        v.material === selectedMaterial
    );
    if (variant) {
      onSelect(variant);
    }
  };

  return (
    <div className="space-y-6">
      {/* Size Selector */}
      {sizes.length > 0 && (
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-3">
            Size {selectedSize && <span className="text-secondary">- {selectedSize}</span>}
          </label>
          <div className="flex flex-wrap gap-2">
            {sizes.map((size) => (
              <button
                key={size}
                onClick={() => {
                  setSelectedSize(size);
                  handleChange();
                }}
                className={`px-4 py-2 rounded-lg border-2 font-medium transition-all ${
                  selectedSize === size
                    ? 'border-primary bg-primary text-white'
                    : 'border-gray-300 text-gray-700 hover:border-primary'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Color Selector */}
      {colors.length > 0 && (
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-3">
            Color {selectedColor && <span className="text-secondary">- {selectedColor}</span>}
          </label>
          <div className="flex flex-wrap gap-2">
            {colors.map((color) => (
              <button
                key={color}
                onClick={() => {
                  setSelectedColor(color);
                  handleChange();
                }}
                className={`px-4 py-2 rounded-lg border-2 font-medium transition-all ${
                  selectedColor === color
                    ? 'border-primary bg-primary text-white'
                    : 'border-gray-300 text-gray-700 hover:border-primary'
                }`}
              >
                {color}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Material Selector */}
      {materials.length > 0 && (
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-3">
            Material {selectedMaterial && <span className="text-secondary">- {selectedMaterial}</span>}
          </label>
          <div className="flex flex-wrap gap-2">
            {materials.map((material) => (
              <button
                key={material}
                onClick={() => {
                  setSelectedMaterial(material);
                  handleChange();
                }}
                className={`px-4 py-2 rounded-lg border-2 font-medium transition-all ${
                  selectedMaterial === material
                    ? 'border-primary bg-primary text-white'
                    : 'border-gray-300 text-gray-700 hover:border-primary'
                }`}
              >
                {material}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Stock Status */}
      {selectedVariant && (
        <div className="pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <span className="text-gray-700 font-medium">Stock Available:</span>
            <span
              className={`font-bold text-lg ${
                selectedVariant.stock > 0 ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {selectedVariant.stock > 0 ? `${selectedVariant.stock} units` : 'Out of Stock'}
            </span>
          </div>
          {selectedVariant.sku && (
            <p className="text-xs text-gray-500 mt-2">SKU: {selectedVariant.sku}</p>
          )}
        </div>
      )}
    </div>
  );
}
