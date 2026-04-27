'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { CartItem, ICart } from '@/types';
import { toast } from 'sonner';

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

  // Initialize cart from localStorage or create session cart
  useEffect(() => {
    const initializeCart = async () => {
      try {
        const sessionId = localStorage.getItem('sessionId') || `session-${Date.now()}`;
        localStorage.setItem('sessionId', sessionId);

        // Fetch cart from API
        const res = await fetch(`/api/cart?sessionId=${sessionId}`);
        if (res.ok) {
          const data = await res.json();
          setCart(data.data);
        } else {
          // Create new cart
          const createRes = await fetch('/api/cart', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sessionId }),
          });
          if (createRes.ok) {
            const data = await createRes.json();
            setCart(data.data);
          }
        }
      } catch (error) {
        console.error('Failed to initialize cart:', error);
      } finally {
        setIsLoading(false);
      }
    };

    // initializeCart();
  }, []);

  const addToCart = async (item: CartItem) => {
    if (!cart) return;

    try {
      const res = await fetch(`/api/cart/${cart._id}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item),
      });

      if (res.ok) {
        const data = await res.json();
        setCart(data.data);
        toast.success('Added to cart');
      }
    } catch (error) {
      toast.error('Failed to add to cart');
      throw error;
    }
  };

  const removeFromCart = async (productId: string) => {
    if (!cart) return;

    try {
      const res = await fetch(`/api/cart/${cart._id}/items/${productId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        const data = await res.json();
        setCart(data.data);
        toast.success('Removed from cart');
      }
    } catch (error) {
      toast.error('Failed to remove item');
      throw error;
    }
  };

  const updateQuantity = async (productId: string, quantity: number) => {
    if (!cart) return;

    try {
      const res = await fetch(`/api/cart/${cart._id}/items/${productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity }),
      });

      if (res.ok) {
        const data = await res.json();
        setCart(data.data);
      }
    } catch (error) {
      toast.error('Failed to update quantity');
      throw error;
    }
  };

  const clearCart = async () => {
    if (!cart) return;

    try {
      const res = await fetch(`/api/cart/${cart._id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setCart(null);
        toast.success('Cart cleared');
      }
    } catch (error) {
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
