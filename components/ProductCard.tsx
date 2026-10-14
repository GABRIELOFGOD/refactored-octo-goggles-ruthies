'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, type MouseEvent } from 'react';
import { Heart, ShoppingBag, Star } from 'lucide-react';
import { IProduct } from '@/types';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { useCurrency } from '@/context/CurrencyContext';
import { useLanguage } from '@/context/LanguageContext';
import { formatPrice, t } from '@/lib/i18n';
import PhotoAttribution from '@/components/product/PhotoAttribution';

export default function ProductCard({ product }: { product: IProduct }) {
  const { addToCart } = useCart();
  const { toggleWishlist, isWishlisted } = useWishlist();
  const [isWishedLoading, setIsWishedLoading] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const { currency } = useCurrency();
  const { language } = useLanguage();

  const images = [product.heroImage, ...(product.gallery || [])].filter(Boolean);
  const [imageIndex, setImageIndex] = useState(0);
  const currentImage = images[imageIndex] || product.heroImage;
  const photoCredit = product.photoCredits?.find((credit) => credit.imageUrl === currentImage);
  const stock = product.totalStock ?? product.variants?.reduce((total, variant) => total + variant.stock, 0) ?? 0;
  const outOfStock = stock <= 0;
  const isWished = isWishlisted(product._id);
  const isFeatured = product.isFeatured || product.badges?.includes('featured');
  const isNew = product.isNewArrival || product.badges?.includes('new');
  const price = product.prices?.[currency] || 0;
  const categoryName = typeof product.category === 'string' ? '' : product.category?.name;

  const handleWishlistToggle = async (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    setIsWishedLoading(true);
    try {
      await toggleWishlist(product._id);
    } catch (error) {
      console.error('Error toggling wishlist:', error);
    } finally {
      setIsWishedLoading(false);
    }
  };

  const handleQuickAddToCart = async (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    if (outOfStock || isAddingToCart) return;

    setIsAddingToCart(true);
    try {
      const variant = product.variants?.find((item) => item.stock > 0) || {
        sku: product.sku || '',
        size: '',
      };
      await addToCart({
        product: product._id,
        quantity: 1,
        price,
        currency,
        variant,
      });
    } catch (error) {
      console.error('Error adding to cart:', error);
    } finally {
      setIsAddingToCart(false);
    }
  };

  return (
    <article className="group flex h-full flex-col">
      <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-[#eeeae0]">
        <Link
          href={`/shop/${product.slug || product._id}`}
          className="absolute inset-0"
          aria-label={`View ${product.name}`}
        >
          {currentImage ? (
            <Image
              src={currentImage}
              alt={`${product.name} style reference`}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
            />
          ) : (
            <span className="flex h-full items-center justify-center font-playfair text-xl text-primary/50">
              Ruthie&apos;s Africa
            </span>
          )}
        </Link>

        <div className="pointer-events-none absolute left-3 top-3 z-10 flex flex-wrap gap-2 sm:left-4 sm:top-4">
          {isNew && (
            <span className="rounded-full bg-white px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-primary shadow-sm">
              New
            </span>
          )}
          {isFeatured && (
            <span className="rounded-full bg-secondary px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-primary shadow-sm">
              The edit
            </span>
          )}
        </div>
        {photoCredit && (
          <span className="pointer-events-none absolute bottom-3 left-3 z-10 rounded-full bg-white/90 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-widest text-primary shadow-sm">
            Style reference
          </span>
        )}

        <button
          type="button"
          onClick={handleWishlistToggle}
          disabled={isWishedLoading}
          aria-label={isWished ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
          aria-pressed={isWished}
          className="absolute right-3 top-3 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/95 text-primary shadow-sm transition hover:scale-105 hover:bg-white disabled:opacity-60 sm:right-4 sm:top-4"
        >
          <Heart className={`h-[18px] w-[18px] ${isWished ? 'fill-primary text-primary' : ''}`} />
        </button>

        {images.length > 1 && (
          <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 gap-1.5 rounded-full bg-black/20 px-2.5 py-2 backdrop-blur-sm">
            {images.map((image, index) => (
              <button
                key={`${image}-${index}`}
                type="button"
                onClick={() => setImageIndex(index)}
                aria-label={`Show image ${index + 1} of ${images.length}`}
                aria-pressed={index === imageIndex}
                className={`h-1.5 rounded-full transition-all ${index === imageIndex ? 'w-5 bg-white' : 'w-1.5 bg-white/65'}`}
              />
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col pt-3 sm:pt-4">
        <PhotoAttribution credit={photoCredit} compact />
        {categoryName && (
          <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-primary/55">
            {categoryName}
          </p>
        )}
        <Link
          href={`/shop/${product.slug || product._id}`}
          className="line-clamp-2 font-playfair text-base leading-snug text-primary transition-colors hover:text-primary/70 sm:text-lg"
        >
          {product.name}
        </Link>

        {product.rating && product.ratingCount ? (
          <div className="mt-2 flex items-center gap-1.5" aria-label={`${product.rating.toFixed(1)} out of 5 stars`}>
            <Star className="h-3.5 w-3.5 fill-secondary text-secondary" />
            <span className="text-xs font-medium text-primary">{product.rating.toFixed(1)}</span>
            <span className="text-xs text-neutral-500">({product.ratingCount})</span>
          </div>
        ) : null}

        <div className="mt-2 flex items-baseline gap-2">
          <span className="font-semibold text-primary">{formatPrice(price, currency)}</span>
          {product.originalPrice && product.originalPrice > price && (
            <span className="text-xs text-neutral-500 line-through">
              {formatPrice(product.originalPrice, currency)}
            </span>
          )}
        </div>

        <div className="mt-auto pt-3">
          <button
            type="button"
            onClick={handleQuickAddToCart}
            disabled={outOfStock || isAddingToCart}
            className="flex min-h-10 w-full items-center justify-center gap-2 rounded-full border border-primary/20 px-3 py-2 text-xs font-semibold text-primary transition-colors hover:border-primary hover:bg-primary hover:text-white disabled:cursor-not-allowed disabled:border-neutral-200 disabled:bg-neutral-100 disabled:text-neutral-500"
          >
            <ShoppingBag className="h-4 w-4" />
            {outOfStock
              ? t(language, 'shop.outOfStock')
              : isAddingToCart
                ? 'Adding…'
                : t(language, 'shop.addToCart')}
          </button>
        </div>
      </div>
    </article>
  );
}
