'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useWishlist } from '@/context/WishlistContext';
import { Button } from '@/components/ui/button';
import { Heart } from 'lucide-react';
import { toast } from 'sonner';
import ProductCard from '@/components/ProductCard';
import { IProduct } from '@/types';
import { useAuth } from '@/provider/auth-provider';

export default function WishlistPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { wishlistItems, isLoading } = useWishlist();
  const [products, setProducts] = useState<IProduct[]>([]);
  const [loadedWishlistIds, setLoadedWishlistIds] = useState<string[]>([]);
  const productsLoading =
    wishlistItems.length > 0 && loadedWishlistIds.join(',') !== wishlistItems.join(',');

  useEffect(() => {
    if (isLoading || authLoading || !user) return;
    if (wishlistItems.length === 0) return;

    const productIds = [...wishlistItems];
    const ids = productIds.join(',');
    fetch(`/api/products?ids=${encodeURIComponent(ids)}`)
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok || !data.success) {
          throw new Error(data.error || 'Failed to load wishlist products');
        }
        setProducts(data.data);
      })
      .catch((error) => {
        console.error('Error fetching wishlist products:', error);
        toast.error('Failed to load wishlist products');
      })
      .finally(() => setLoadedWishlistIds(productIds));
  }, [authLoading, isLoading, user, wishlistItems]);

  if (authLoading || (user && isLoading)) {
    return (
      <div className="min-h-screen bg-[#fbf9f3] py-10 sm:py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-5 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="aspect-[4/5] animate-pulse rounded-2xl bg-primary/10" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#fbf9f3] py-10 sm:py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-xl rounded-3xl border border-primary/10 bg-white px-6 py-16 text-center shadow-sm">
            <Heart className="mx-auto mb-5 h-14 w-14 text-primary/25" />
            <h1 className="font-playfair text-3xl text-primary">Sign in to see your saved looks</h1>
            <p className="mb-6 mt-3 text-sm text-neutral-600">
              Please sign in to access your saved items
            </p>
            <Link href="/auth/login">
              <Button className="rounded-full bg-primary px-6 text-white hover:bg-primary/90">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading || productsLoading) {
    return (
      <div className="min-h-screen bg-[#fbf9f3] py-10 sm:py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-5 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[4/5] rounded-2xl bg-primary/10"></div>
                <div className="p-4 space-y-3">
                  <div className="h-4 w-3/4 rounded bg-primary/10"></div>
                  <div className="h-6 w-1/2 rounded bg-primary/10"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (wishlistItems.length === 0 || products.length === 0) {
    return (
      <div className="min-h-screen bg-[#fbf9f3] py-10 sm:py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-xl rounded-3xl border border-primary/10 bg-white px-6 py-16 text-center shadow-sm">
            <Heart className="mx-auto mb-5 h-14 w-14 text-primary/25" />
            <h1 className="font-playfair text-3xl text-primary">Keep your favourites close.</h1>
            <p className="mb-6 mt-3 text-sm text-neutral-600">
              Save the pieces you love and come back to them whenever you like.
            </p>
            <Link href="/shop">
              <Button className="rounded-full bg-primary px-6 text-white hover:bg-primary/90">
                Explore the collection
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fbf9f3] py-10 sm:py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12">
          <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-primary/55">Your style shortlist</p>
          <h1 className="mb-2 font-playfair text-4xl text-primary">Saved looks</h1>
          <p className="text-sm text-neutral-600">
            {products.length} {products.length === 1 ? 'piece' : 'pieces'} saved
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 gap-5 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>

        {/* Continue Shopping Button */}
        <div className="mt-12 text-center">
          <Link href="/shop">
            <Button
              variant="outline"
              className="rounded-full border-primary/20 text-primary hover:bg-white"
            >
              Continue Shopping
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
