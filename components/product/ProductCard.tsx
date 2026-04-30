'use client';

import Link from 'next/link';
import { IProduct } from '@/types';
import { useState } from 'react';
import { formatPrice } from '@/lib/i18n';
import { useCurrency } from '@/context/CurrencyContext';

interface ProductCardProps {
  product: IProduct;
  onAddToCart?: (product: IProduct) => void;
}

export default function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);

  const { currency } = useCurrency();

  return (
    <Link href={`/shop/${product.slug}`}>
      <div className="group cursor-pointer">
        {/* Image Container */}
        <div
          className="relative h-72 bg-gray-200 rounded-lg overflow-hidden mb-4"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <img
            src={product.heroImage}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />

          {/* Gallery Preview on Hover */}
          {isHovered && product.gallery.length > 0 && (
            <div className="absolute inset-0 bg-cover bg-center transition-all duration-300">
              <img
                src={product.gallery[0]}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-3 left-3 flex gap-2">
            {product.isFeatured && (
              <span className="bg-secondary text-primary px-3 py-1 rounded-full text-xs font-bold">
                Featured
              </span>
            )}
            {product.isNewArrival && (
              <span className="bg-accent text-white px-3 py-1 rounded-full text-xs font-bold">
                New
              </span>
            )}
          </div>

          {/* Wishlist Button */}
          <button
            onClick={(e) => {
              e.preventDefault();
              setIsWishlisted(!isWishlisted);
            }}
            className="absolute top-3 right-3 bg-white rounded-full w-10 h-10 flex items-center justify-center shadow-md hover:shadow-lg transition-shadow"
          >
            <span className="text-xl">{isWishlisted ? '♥' : '♡'}</span>
          </button>

          {/* Quick Add on Hover */}
          {isHovered && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  onAddToCart?.(product);
                }}
                className="bg-secondary text-primary px-6 py-2 rounded-lg font-bold hover:bg-opacity-90 transition-all"
              >
                Add to Cart
              </button>
            </div>
          )}
        </div>

        {/* Product Info */}
        <h3 className="font-playfair text-lg font-bold text-primary group-hover:text-secondary transition-colors">
          {product.name}
        </h3>

        {product.category && (
          <p className="text-sm text-gray-500 mb-2">
            {typeof product.category === 'string' ? product.category : product.category.name || 'Category'}
          </p>
        )}

        {/* Price */}
        <div className="flex items-center justify-between">
          <p className="text-secondary font-bold text-lg">
            {/* ${product.prices.USD.toFixed(2)} */}
            {formatPrice(product.prices[currency as keyof typeof product.prices], currency)}
          </p>

          {/* Stock Status */}
          <div className="text-xs">
            {product.variants.reduce((sum, v) => sum + v.stock, 0) > 0 ? (
              <span className="text-green-600 font-medium">In Stock</span>
            ) : (
              <span className="text-red-600 font-medium">Out of Stock</span>
            )}
          </div>
        </div>

        {/* Rating Placeholder */}
        <div className="mt-2 flex items-center gap-1">
          {[...Array(5)].map((_, i) => (
            <span key={i} className="text-gray-300">
              ★
            </span>
          ))}
          <span className="text-xs text-gray-500 ml-2">({product.totalSold} sold)</span>
        </div>
      </div>
    </Link>
  );
}
