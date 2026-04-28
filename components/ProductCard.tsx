'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { IProduct } from '@/types';
import { Heart, ShoppingCart, Star, Truck, Shield } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { toast } from 'sonner';
import { useCurrency } from '@/context/CurrencyContext';
import { useLanguage } from '@/context/LanguageContext';
import { formatPrice, t } from '@/lib/i18n';

interface ProductCardProps {
  product: IProduct;
  onWishlistChange?: () => void;
}

export default function ProductCard({ product, onWishlistChange }: ProductCardProps) {
  const { addToCart } = useCart();
  const { toggleWishlist, isWishlisted } = useWishlist();
  const [isWishedLoading, setIsWishedLoading] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [imageIndex, setImageIndex] = useState(0);

  const { currency } = useCurrency();
  const { language } = useLanguage();

  const isFeatured = product.badges?.includes('featured');
  const isNew = product.badges?.includes('new');
  const price = product.prices?.[currency] || 0;
  const outOfStock = product.totalStock === 0;
  const images = [product.heroImage, ...(product.gallery || [])].filter(Boolean);
  const currentImage = images[imageIndex] || product.heroImage;

  const discountPercent = product.originalPrice
    ? Math.round(((product.originalPrice - price) / product.originalPrice) * 100)
    : 0;

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
      toast.error(t(language, 'shop.outOfStock'));
      return;
    }

    setIsAddingToCart(true);
    try {
      await addToCart({
        product: product._id,
        quantity: 1,
        price,
        currency,
        variant: product.variants?.[0] || {
          sku: product.sku || '',
          size: '',
          color: '',
          material: '',
          stock: product.totalStock || 0,
        },
      });
      toast.success(t(language, 'shop.addToCart'));
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
      <div className="group cursor-pointer h-full flex flex-col bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-300">
        {/* Image Container */}
        <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-neutral-50 to-neutral-100">
          {currentImage && (
            <Image
              src={currentImage}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              priority={false}
            />
          )}

          {/* Badges Container */}
          <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
            {isNew && (
              <span className="bg-gradient-to-r from-primary to-secondary text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                {t(language, 'shop.newArrivals')}
              </span>
            )}
            {isFeatured && (
              <span className="bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                ⭐ {t(language, 'shop.featured')}
              </span>
            )}
            {discountPercent > 0 && (
              <span className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                -{discountPercent}%
              </span>
            )}
          </div>

          {/* Wishlist Button - Always Visible Top Right */}
          <button
            onClick={handleWishlistToggle}
            disabled={isWishedLoading}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center hover:bg-white hover:scale-110 transition-all shadow-md z-10 disabled:opacity-50"
          >
            <Heart
              className={`w-5 h-5 transition-colors ${
                isWished ? 'fill-red-500 text-red-500' : 'text-neutral-600'
              }`}
            />
          </button>

          {/* Out of Stock Overlay */}
          {outOfStock && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-20">
              <div className="text-center">
                <p className="text-white font-bold text-lg">{t(language, 'shop.outOfStock')}</p>
              </div>
            </div>
          )}

          {/* Hover Overlay Actions */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-3 z-20">
            {/* Add to Cart Button */}
            {!outOfStock && (
              <button
                onClick={handleQuickAddToCart}
                disabled={isAddingToCart}
                className="bg-secondary hover:bg-secondary/90 text-white font-bold py-3 px-6 rounded-lg transition-all transform hover:scale-105 flex items-center gap-2 w-5/6 justify-center shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
              >
                <ShoppingCart className="w-5 h-5" />
                <span>{t(language, 'shop.addToCart')}</span>
              </button>
            )}

            {/* View Details Button */}
            <button className="bg-white/90 backdrop-blur-sm text-primary font-bold py-3 px-6 rounded-lg hover:bg-white transition-all transform hover:scale-105 flex items-center gap-2 w-5/6 justify-center shadow-lg">
              <Star className="w-5 h-5" />
              <span>{t(language, 'shop.description')}</span>
            </button>
          </div>

          {/* Image Gallery Dots (if multiple images) */}
          {images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 z-10">
              {images.map((_, idx) => (
                <button
                  key={idx}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setImageIndex(idx);
                  }}
                  className={`w-2 h-2 rounded-full transition-all ${
                    idx === imageIndex ? 'bg-white w-6' : 'bg-white/60 hover:bg-white/80'
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Product Info Section */}
        <div className="p-4 flex-1 flex flex-col">
          {/* Product Name */}
          <h3 className="text-sm md:text-base font-bold text-primary group-hover:text-secondary transition-colors line-clamp-2 mb-2 h-10">
            {product.name}
          </h3>

          {/* Product Description */}
          {product.shortDescription && (
            <p className="text-xs text-neutral-600 line-clamp-2 mb-3">
              {product.shortDescription}
            </p>
          )}

          {/* Rating Section */}
          {product.rating && product.ratingCount && (
            <div className="flex items-center gap-2 mb-3 pb-3 border-b border-neutral-100">
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.floor(product.rating || 0)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-neutral-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs font-semibold text-neutral-700">
                {product.rating.toFixed(1)}
              </span>
              <span className="text-xs text-neutral-500">
                ({product.ratingCount})
              </span>
            </div>
          )}

          {/* Price Section */}
          <div className="flex items-end gap-3 mb-3">
            <span className="text-xl md:text-2xl font-black text-secondary">
              {formatPrice(price, currency)}
            </span>
            {product.originalPrice && product.originalPrice > price && (
              <span className="text-sm text-neutral-500 line-through font-medium">
                {formatPrice(product.originalPrice, currency)}
              </span>
            )}
          </div>

          {/* Stock Status */}
          <div className="mb-3">
            {outOfStock ? (
              <p className="text-xs font-bold text-red-600">{t(language, 'shop.outOfStock')}</p>
            ) : product.totalStock !== undefined && product.totalStock <= 5 && product.totalStock > 0 ? (
              <p className="text-xs font-bold text-orange-600">
                ⚠️ {t(language, 'common.search')} {product.totalStock} left
              </p>
            ) : product.totalStock !== undefined && product.totalStock > 0 ? (
              <p className="text-xs font-bold text-green-600">✓ {t(language, 'shop.inStock')}</p>
            ) : null}
          </div>

          {/* Trust Badges */}
          <div className="flex gap-3 text-xs text-neutral-600 pt-3 border-t border-neutral-100">
            <div className="flex items-center gap-1">
              <Truck className="w-3.5 h-3.5" />
              <span>Free ship</span>
            </div>
            <div className="flex items-center gap-1">
              <Shield className="w-3.5 h-3.5" />
              <span>Verified</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
