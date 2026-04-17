'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { IProduct } from '@/types';
import { Heart, ShoppingCart, Eye } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { toast } from 'sonner';

interface ProductCardProps {
  product: IProduct;
  onWishlistChange?: () => void;
}

export default function ProductCard({ product, onWishlistChange }: ProductCardProps) {
  const { addToCart } = useCart();
  const { toggleWishlist, isWishlisted } = useWishlist();
  const [isWishedLoading, setIsWishedLoading] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  const isFeatured = product.badges?.includes('featured');
  const isNew = product.badges?.includes('new');
  const price = product.prices?.NGN || 0;
  const outOfStock = product.totalStock === 0;

  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setIsWishedLoading(true);
    try {
      await toggleWishlist(product._id);
      onWishlistChange?.();
    } catch (error) {
      console.error('Error toggling wishlist:', error);
    } finally {
      setIsWishedLoading(false);
    }
  };

  const handleQuickAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (outOfStock) {
      toast.error('Out of stock');
      return;
    }

    setIsAddingToCart(true);
    try {
      await addToCart({
        product: product._id,
        quantity: 1,
        price,
        currency: 'NGN',
        variant: product.variants?.[0] || {
          sku: product.sku || '',
          size: '',
          color: '',
          material: '',
          stock: product.totalStock || 0,
        },
      });
      toast.success('Added to cart!');
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add to cart');
    } finally {
      setIsAddingToCart(false);
    }
  };

  const isWished = isWishlisted(product._id);

  return (
    <Link href={`/shop/${product.slug || product._id}`}>
      <div className="group cursor-pointer h-full">
        {/* Image Container */}
        <div className="relative aspect-square rounded-lg overflow-hidden bg-neutral-100 mb-4">
          {product.heroImage && (
            <Image
              src={product.heroImage}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-300"
              priority={false}
            />
          )}

          {/* Badges */}
          <div className="absolute top-4 left-4 flex gap-2">
            {isFeatured && (
              <span className="bg-secondary text-light-bg px-3 py-1 rounded-full text-xs font-semibold">
                Featured
              </span>
            )}
            {isNew && (
              <span className="bg-primary text-light-bg px-3 py-1 rounded-full text-xs font-semibold">
                New
              </span>
            )}
          </div>

          {/* Stock Status */}
          {outOfStock && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="text-light-bg font-semibold text-lg">Out of Stock</span>
            </div>
          )}

          {/* Hover Overlay Actions */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-4">
            <div className="flex gap-3 w-full px-4">
              {/* Wishlist Button */}
              <button
                onClick={handleWishlistToggle}
                disabled={isWishedLoading}
                className={`flex-1 py-2 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
                  isWished
                    ? 'bg-secondary text-light-bg hover:bg-secondary/90'
                    : 'bg-light-bg text-primary hover:bg-light-bg/90'
                } disabled:opacity-50`}
              >
                <Heart
                  className={`w-4 h-4 ${isWished ? 'fill-current' : ''}`}
                />
                {isWished ? 'Saved' : 'Save'}
              </button>

              {/* Quick View Button */}
              <button className="flex-1 py-2 rounded-lg font-semibold transition-all bg-light-bg text-primary hover:bg-light-bg/90 flex items-center justify-center gap-2">
                <Eye className="w-4 h-4" />
                View
              </button>
            </div>
          </div>

          {/* Quick Add to Cart - Always visible on mobile, hover on desktop */}
          {!outOfStock && (
            <button
              onClick={handleQuickAddToCart}
              disabled={isAddingToCart}
              className="absolute bottom-4 left-4 right-4 bg-secondary text-light-bg rounded-lg py-2 font-semibold hover:bg-secondary/90 transition-all opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <ShoppingCart className="w-4 h-4" />
              Add to Cart
            </button>
          )}
        </div>

        {/* Product Info */}
        <div>
          <h3 className="text-sm md:text-base font-semibold text-primary group-hover:text-secondary transition-colors line-clamp-2 mb-2">
            {product.name}
          </h3>

          {/* Price */}
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-lg md:text-xl font-bold text-secondary">
              ₦{price.toLocaleString()}
            </span>
            {product.originalPrice && product.originalPrice > price && (
              <span className="text-sm text-neutral-500 line-through">
                ₦{product.originalPrice.toLocaleString()}
              </span>
            )}
          </div>

          {/* Rating (if available) */}
          {product.rating && (
            <div className="flex items-center gap-1 text-xs text-neutral-600">
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-yellow-400">
                    {i < Math.floor(product.rating || 0) ? '★' : '☆'}
                  </span>
                ))}
              </div>
              <span>({product.ratingCount || 0})</span>
            </div>
          )}

          {/* Stock Indicator */}
          <div className="mt-2">
            {product.totalStock !== undefined && product.totalStock > 0 && product.totalStock <= 5 ? (
              <p className="text-xs text-red-600 font-semibold">
                Only {product.totalStock} left in stock
              </p>
            ) : product.totalStock !== undefined && product.totalStock > 0 ? (
              <p className="text-xs text-green-600 font-semibold">In stock</p>
            ) : null}
          </div>
        </div>
      </div>
    </Link>
  );
}
