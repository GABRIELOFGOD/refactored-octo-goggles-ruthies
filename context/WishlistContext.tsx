'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/provider/auth-provider';

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
  const { user, isLoading: authLoading } = useAuth();

  // Get authorization header with token
  const getAuthHeader = () => {
    const token = localStorage.getItem('authToken');
    if (token) {
      return {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      };
    }
    return { 'Content-Type': 'application/json' };
  };

  // Initialize wishlist from API or localStorage
  useEffect(() => {
    const initializeWishlist = async () => {
      if (authLoading) return;

      try {
        setIsLoading(true);

        // If user is logged in, fetch their wishlist
        if (user?.id) {
          const res = await fetch('/api/wishlist', {
            headers: getAuthHeader(),
          });

          if (res.ok) {
            const data = await res.json();
            setWishlistItems(data.data?.products || []);
          } else {
            // Fall back to localStorage for guests
            const stored = localStorage.getItem('wishlist');
            if (stored) {
              setWishlistItems(JSON.parse(stored));
            }
          }
        } else {
          // For guests, use localStorage
          const stored = localStorage.getItem('wishlist');
          if (stored) {
            setWishlistItems(JSON.parse(stored));
          }
        }
      } catch (error) {
        console.error('Failed to initialize wishlist:', error);
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
  }, [user?.id, authLoading]);

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem('wishlist', JSON.stringify(wishlistItems));
  }, [wishlistItems]);

  const addToWishlist = async (productId: string) => {
    try {
      const res = await fetch('/api/wishlist', {
        method: 'POST',
        headers: getAuthHeader(),
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
      console.error('Error adding to wishlist:', error);
      toast.error('Failed to add to wishlist');
      throw error;
    }
  };

  const removeFromWishlist = async (productId: string) => {
    try {
      const res = await fetch(`/api/wishlist/${productId}`, {
        method: 'DELETE',
        headers: getAuthHeader(),
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
      console.error('Error removing from wishlist:', error);
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
