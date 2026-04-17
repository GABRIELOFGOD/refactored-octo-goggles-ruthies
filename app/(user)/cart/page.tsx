'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { Trash2, Plus, Minus, ShoppingCart } from 'lucide-react';
import { toast } from 'sonner';
import { IProduct } from '@/types';

// Type guard to ensure product is populated
function isPopulatedProduct(product: unknown): product is IProduct {
  return (
    typeof product === 'object' &&
    product !== null &&
    '_id' in product &&
    'name' in product &&
    'heroImage' in product
  );
}

export default function CartPage() {
  const { items, isLoading, removeFromCart, updateQuantity, subtotal } = useCart();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-linear-to-b from-light-bg to-light-bg/50 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="animate-pulse">
            <div className="h-8 bg-neutral-200 rounded w-1/4 mb-8"></div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 bg-neutral-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-linear-to-b from-light-bg to-light-bg/50 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center py-12">
            <ShoppingCart className="w-16 h-16 mx-auto text-neutral-300 mb-4" />
            <h1 className="text-3xl font-display mb-2">Your Cart is Empty</h1>
            <p className="text-neutral-600 mb-6">
              Looks like you haven't added anything to your cart yet.
            </p>
            <Link href="/shop">
              <Button className="bg-primary text-light-bg hover:bg-primary/90">
                Continue Shopping
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
        <div className="mb-8">
          <h1 className="text-4xl font-display text-primary mb-2">Shopping Cart</h1>
          <p className="text-neutral-600">
            {items.length} {items.length === 1 ? 'item' : 'items'} in your cart
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white border border-neutral-200 rounded-lg overflow-hidden">
              {items.filter((item) => isPopulatedProduct(item.product)).map((item) => {
                const product = item.product as IProduct;
                return (
                  <div
                    key={item._id}
                    className="border-b border-neutral-200 last:border-b-0 p-6 hover:bg-light-bg/30 transition-colors"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                      {/* Product Image */}
                      <div className="sm:col-span-3">
                        {product.heroImage && (
                          <div className="relative aspect-square rounded-lg overflow-hidden bg-neutral-100">
                            <Image
                              src={product.heroImage}
                              alt={product.name || 'Product'}
                              fill
                              className="object-cover hover:scale-105 transition-transform"
                            />
                          </div>
                        )}
                      </div>

                      {/* Product Details */}
                      <div className="sm:col-span-5">
                        <Link
                          href={`/shop/${product.slug || product._id}`}
                          className="hover:text-secondary transition-colors"
                        >
                          <h3 className="text-lg font-semibold text-primary mb-2">
                            {product.name}
                          </h3>
                        </Link>

                        {/* Variant Info */}
                        {item.variant && (
                          <div className="text-sm text-neutral-600 space-y-1 mb-4">
                            {item.variant.size && (
                              <p>
                                <span className="font-semibold">Size:</span> {item.variant.size}
                              </p>
                            )}
                            {item.variant.color && (
                              <p>
                                <span className="font-semibold">Color:</span> {item.variant.color}
                              </p>
                            )}
                            {item.variant.material && (
                              <p>
                                <span className="font-semibold">Material:</span>{' '}
                                {item.variant.material}
                              </p>
                            )}
                          </div>
                        )}

                        {/* Price */}
                        <div className="text-lg font-semibold text-secondary">
                          ₦{(item.price || product.prices.NGN || 0).toLocaleString()}
                        </div>
                      </div>

                      {/* Quantity & Actions */}
                      <div className="sm:col-span-4 flex flex-col justify-between">
                        <div className="flex items-center justify-between">
                          {/* Quantity Selector */}
                          <div className="flex items-center gap-2 bg-light-bg rounded-lg p-1">
                            <button
                              onClick={() =>
                                updateQuantity(product._id, item.quantity - 1)
                              }
                              className="p-1 hover:bg-neutral-200 rounded transition-colors"
                              disabled={item.quantity <= 1}
                            >
                              <Minus className="w-4 h-4 text-primary" />
                            </button>
                            <span className="w-8 text-center font-semibold">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() =>
                                updateQuantity(product._id, item.quantity + 1)
                              }
                              className="p-1 hover:bg-neutral-200 rounded transition-colors"
                            >
                              <Plus className="w-4 h-4 text-primary" />
                            </button>
                          </div>

                          {/* Remove Button */}
                          <button
                            onClick={() => removeFromCart(product._id)}
                            className="p-2 hover:bg-red-50 rounded transition-colors text-red-600"
                            title="Remove from cart"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>

                        {/* Subtotal for this item */}
                        <div className="text-right text-sm text-neutral-600">
                          ₦{((item.price || 0) * item.quantity).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-neutral-200 rounded-lg p-6 sticky top-24">
              <h2 className="text-xl font-display text-primary mb-6">Order Summary</h2>

              <div className="space-y-4 mb-6 pb-6 border-b border-neutral-200">
                <div className="flex justify-between text-neutral-600">
                  <span>Subtotal</span>
                  <span>₦{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-neutral-600">
                  <span>Shipping</span>
                  <span className="text-secondary font-semibold">Calculated at checkout</span>
                </div>
                <div className="flex justify-between text-neutral-600">
                  <span>Tax</span>
                  <span className="text-secondary font-semibold">Calculated at checkout</span>
                </div>
              </div>

              <div className="flex justify-between items-center mb-6">
                <span className="text-lg font-semibold text-primary">Total</span>
                <span className="text-2xl font-display text-secondary">
                  ₦{subtotal.toLocaleString()}
                </span>
              </div>

              <Link href="/checkout">
                <Button className="w-full bg-secondary text-light-bg hover:bg-secondary/90 mb-3">
                  Proceed to Checkout
                </Button>
              </Link>

              <Link href="/shop">
                <Button
                  variant="outline"
                  className="w-full border-primary text-primary hover:bg-light-bg"
                >
                  Continue Shopping
                </Button>
              </Link>

              {/* Promo Code Section */}
              <div className="mt-6 pt-6 border-t border-neutral-200">
                <label className="block text-sm font-semibold text-primary mb-2">
                  Promo Code
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter code"
                    className="flex-1 px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-secondary"
                  />
                  <Button
                    variant="outline"
                    className="border-primary text-primary hover:bg-light-bg text-sm"
                  >
                    Apply
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
