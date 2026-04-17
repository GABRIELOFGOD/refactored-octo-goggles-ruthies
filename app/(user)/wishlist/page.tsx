'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useWishlist } from '@/context/WishlistContext';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { Heart, ShoppingCart } from 'lucide-react';
import { toast } from 'sonner';
import ProductCard from '@/components/ProductCard';
import { IProduct } from '@/types';

export default function WishlistPage() {
  const { data: session } = useSession();
  const { wishlistItems, isLoading, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();
  const [mounted, setMounted] = useState(false);
  const [products, setProducts] = useState<IProduct[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (wishlistItems.length > 0 && mounted) {
      fetchWishlistProducts();
    }
  }, [wishlistItems, mounted]);

  const fetchWishlistProducts = async () => {
    try {
      setProductsLoading(true);
      const ids = wishlistItems.join(',');
      const response = await fetch(`/api/products?ids=${ids}`);
      const data = await response.json();

      if (data.success) {
        setProducts(data.data);
      }
    } catch (error) {
      console.error('Error fetching wishlist products:', error);
      toast.error('Failed to load wishlist products');
    } finally {
      setProductsLoading(false);
    }
  };

  const handleAddToCart = async (product: IProduct) => {
    try {
      await addToCart({
        product: product._id,
        quantity: 1,
        price: product.prices?.NGN || 0,
        currency: 'NGN',
        variant: product.variants?.[0] || {
          size: '',
          sku: '',
        },
      });
      toast.success('Added to cart');
    } catch (error) {
      toast.error('Failed to add to cart');
    }
  };

  if (!mounted) return null;

  if (!session) {
    return (
      <div className="min-h-screen bg-linear-to-b from-light-bg to-light-bg/50 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center py-12">
            <Heart className="w-16 h-16 mx-auto text-neutral-300 mb-4" />
            <h1 className="text-3xl font-display mb-2">Sign in to View Wishlist</h1>
            <p className="text-neutral-600 mb-6">
              Please sign in to access your saved items
            </p>
            <Link href="/auth/login">
              <Button className="bg-primary text-light-bg hover:bg-primary/90">
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
      <div className="min-h-screen bg-linear-to-b from-light-bg to-light-bg/50 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="bg-white rounded-lg overflow-hidden animate-pulse">
                <div className="aspect-square bg-neutral-200"></div>
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-neutral-200 rounded w-3/4"></div>
                  <div className="h-6 bg-neutral-200 rounded w-1/2"></div>
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
      <div className="min-h-screen bg-linear-to-b from-light-bg to-light-bg/50 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center py-12">
            <Heart className="w-16 h-16 mx-auto text-neutral-300 mb-4" />
            <h1 className="text-3xl font-display mb-2">Your Wishlist is Empty</h1>
            <p className="text-neutral-600 mb-6">
              Save your favorite items to your wishlist to view them later
            </p>
            <Link href="/shop">
              <Button className="bg-primary text-light-bg hover:bg-primary/90">
                Explore Products
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-light-bg to-light-bg/50 py-12">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-display text-primary mb-2">My Wishlist</h1>
          <p className="text-neutral-600">
            {products.length} {products.length === 1 ? 'item' : 'items'} saved
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <div key={product._id} className="relative">
              <ProductCard
                product={product}
                onWishlistChange={() => {
                  removeFromWishlist(product._id);
                }}
              />

              {/* Quick Add to Cart Button */}
              <button
                onClick={() => handleAddToCart(product)}
                className="absolute bottom-4 left-4 right-4 bg-secondary text-light-bg rounded-lg py-2 font-semibold hover:bg-secondary/90 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100"
              >
                <ShoppingCart className="w-4 h-4" />
                Add to Cart
              </button>
            </div>
          ))}
        </div>

        {/* Continue Shopping Button */}
        <div className="mt-12 text-center">
          <Link href="/shop">
            <Button
              variant="outline"
              className="border-primary text-primary hover:bg-light-bg"
            >
              Continue Shopping
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
