'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { toast } from 'sonner';

interface WishlistContextType {
  wishlistItems: string[];
  addToWishlist: (productId: string) => Promise<void>;
  removeFromWishlist: (productId: string) => Promise<void>;
  toggleWishlist: (productId: string) => Promise<void>;
  isWishlisted: (productId: string) => boolean;
  isLoading: boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [wishlistItems, setWishlistItems] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize wishlist from API or localStorage
  useEffect(() => {
    const initializeWishlist = async () => {
      try {
        // Try to fetch from API (requires auth)
        const res = await fetch('/api/wishlist');
        if (res.ok) {
          const data = await res.json();
          setWishlistItems(data.data?.products || []);
        } else {
          // Fall back to localStorage
          const stored = localStorage.getItem('wishlist');
          if (stored) {
            setWishlistItems(JSON.parse(stored));
          }
        }
      } catch (error) {
        // Fall back to localStorage
        const stored = localStorage.getItem('wishlist');
        if (stored) {
          setWishlistItems(JSON.parse(stored));
        }
      } finally {
        setIsLoading(false);
      }
    };

    initializeWishlist();
  }, []);

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem('wishlist', JSON.stringify(wishlistItems));
  }, [wishlistItems]);

  const addToWishlist = async (productId: string) => {
    try {
      const res = await fetch('/api/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId }),
      });

      if (res.ok) {
        const data = await res.json();
        setWishlistItems(data.data?.products || []);
        toast.success('Added to wishlist');
      } else {
        // Fallback for guests
        setWishlistItems((prev) => [...new Set([...prev, productId])]);
        toast.success('Added to wishlist');
      }
    } catch (error) {
      toast.error('Failed to add to wishlist');
      throw error;
    }
  };

  const removeFromWishlist = async (productId: string) => {
    try {
      const res = await fetch(`/api/wishlist/${productId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        const data = await res.json();
        setWishlistItems(data.data?.products || []);
        toast.success('Removed from wishlist');
      } else {
        // Fallback for guests
        setWishlistItems((prev) => prev.filter((id) => id !== productId));
        toast.success('Removed from wishlist');
      }
    } catch (error) {
      toast.error('Failed to remove from wishlist');
      throw error;
    }
  };

  const toggleWishlist = async (productId: string) => {
    if (wishlistItems.includes(productId)) {
      await removeFromWishlist(productId);
    } else {
      await addToWishlist(productId);
    }
  };

  const isWishlisted = (productId: string) => wishlistItems.includes(productId);

  return (
    <WishlistContext.Provider
      value={{
        wishlistItems,
        addToWishlist,
        removeFromWishlist,
        toggleWishlist,
        isWishlisted,
        isLoading,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within WishlistProvider');
  }
  return context;
}
