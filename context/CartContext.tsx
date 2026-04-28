'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { CartItem, ICart } from '@/types';
import { toast } from 'sonner';
import { useAuth } from '@/provider/auth-provider';

interface CartContextType {
  cart: ICart | null;
  items: CartItem[];
  totalItems: number;
  subtotal: number;
  addToCart: (item: CartItem) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  isLoading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<ICart | null>(null);
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

  // Initialize cart
  useEffect(() => {
    const initializeCart = async () => {
      if (authLoading) return;

      try {
        setIsLoading(true);

        // If user is logged in, fetch their cart
        if (user?.id) {
          const res = await fetch('/api/cart', {
            headers: getAuthHeader(),
          });

          if (res.ok) {
            const data = await res.json();
            if (data.data) {
              setCart(data.data);
            } else {
              // Create new cart if doesn't exist
              const createRes = await fetch('/api/cart', {
                method: 'POST',
                headers: getAuthHeader(),
              });
              if (createRes.ok) {
                const createData = await createRes.json();
                setCart(createData.data);
              }
            }
          }
        } else {
          // For guests, create a guest cart
          const guestSessionId = localStorage.getItem('guestSessionId') || `guest-${Date.now()}`;
          localStorage.setItem('guestSessionId', guestSessionId);

          const res = await fetch('/api/cart', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sessionId: guestSessionId }),
          });

          if (res.ok) {
            const data = await res.json();
            setCart(data.data);
          }
        }
      } catch (error) {
        console.error('Failed to initialize cart:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeCart();
  }, [user?.id, authLoading]);

  const addToCart = async (item: CartItem) => {
    if (!cart) return;

    try {
      const res = await fetch(`/api/cart/${cart._id}/items`, {
        method: 'POST',
        headers: getAuthHeader(),
        body: JSON.stringify(item),
      });

      if (res.ok) {
        const data = await res.json();
        setCart(data.data);
        toast.success('Added to cart');
      } else {
        const error = await res.json();
        toast.error(error.error || 'Failed to add to cart');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add to cart');
      throw error;
    }
  };

  const removeFromCart = async (productId: string) => {
    if (!cart) return;

    try {
      const res = await fetch(`/api/cart/${cart._id}/items/${productId}`, {
        method: 'DELETE',
        headers: getAuthHeader(),
      });

      if (res.ok) {
        const data = await res.json();
        setCart(data.data);
        toast.success('Removed from cart');
      } else {
        toast.error('Failed to remove item');
      }
    } catch (error) {
      console.error('Error removing from cart:', error);
      toast.error('Failed to remove item');
      throw error;
    }
  };

  const updateQuantity = async (productId: string, quantity: number) => {
    if (!cart) return;

    try {
      const res = await fetch(`/api/cart/${cart._id}/items/${productId}`, {
        method: 'PUT',
        headers: getAuthHeader(),
        body: JSON.stringify({ quantity }),
      });

      if (res.ok) {
        const data = await res.json();
        setCart(data.data);
      } else {
        toast.error('Failed to update quantity');
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
      toast.error('Failed to update quantity');
      throw error;
    }
  };

  const clearCart = async () => {
    if (!cart) return;

    try {
      const res = await fetch(`/api/cart/${cart._id}`, {
        method: 'DELETE',
        headers: getAuthHeader(),
      });

      if (res.ok) {
        setCart(null);
        toast.success('Cart cleared');
      } else {
        toast.error('Failed to clear cart');
      }
    } catch (error) {
      console.error('Error clearing cart:', error);
      toast.error('Failed to clear cart');
      throw error;
    }
  };

  const totalItems = cart?.items.reduce((sum, item) => sum + item.quantity, 0) || 0;
  const subtotal = cart?.items.reduce((sum, item) => sum + (item.price * item.quantity), 0) || 0;

  return (
    <CartContext.Provider
      value={{
        cart,
        items: cart?.items || [],
        totalItems,
        subtotal,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        isLoading,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
}
