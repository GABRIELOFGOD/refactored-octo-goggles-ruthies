'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { Trash2, Plus, Minus, ShoppingCart } from 'lucide-react';
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#fbf9f3] py-10 sm:py-14">
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
      <div className="min-h-screen bg-[#fbf9f3] py-10 sm:py-14">
        <div className="max-w-7xl mx-auto px-4">
          <div className="mx-auto max-w-xl rounded-3xl border border-primary/10 bg-white px-6 py-16 text-center shadow-sm">
            <ShoppingCart className="mx-auto mb-5 h-14 w-14 text-primary/25" />
            <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-primary/55">Your next favourite is waiting</p>
            <h1 className="font-playfair text-3xl text-primary">Your bag is taking a breather.</h1>
            <p className="mb-6 mt-3 text-sm text-neutral-600">
              Looks like you haven&apos;t added anything to your cart yet.
            </p>
            <Link href="/shop">
              <Button className="rounded-full bg-primary px-6 text-white hover:bg-primary/90">
                Find your look
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
        <div className="mb-8">
          <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-primary/55">Almost yours</p>
          <h1 className="mb-2 font-playfair text-4xl text-primary">Your bag</h1>
          <p className="text-sm text-neutral-600">
            {items.length} {items.length === 1 ? 'piece' : 'pieces'} ready for their new home
          </p>
        </div>

        <div className="grid grid-cols-1 gap-7 lg:grid-cols-3 lg:gap-9">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="overflow-hidden rounded-2xl border border-primary/10 bg-white shadow-sm">
              {items.filter((item) => isPopulatedProduct(item.product)).map((item) => {
                const product = item.product as IProduct;
                return (
                  <div
                    key={item._id}
                    className="border-b border-primary/10 p-4 transition-colors last:border-b-0 hover:bg-[#fbf9f3]/70 sm:p-6"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                      {/* Product Image */}
                      <div className="sm:col-span-3">
                        {product.heroImage && (
                          <div className="relative aspect-[4/5] overflow-hidden rounded-xl bg-[#eeeae0]">
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
                          className="transition-colors hover:text-primary/70"
                        >
                          <h3 className="mb-2 font-playfair text-lg text-primary">
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
                        <div className="text-lg font-semibold text-primary">
                          ₦{(item.price || product.prices.NGN || 0).toLocaleString()}
                        </div>
                      </div>

                      {/* Quantity & Actions */}
                      <div className="sm:col-span-4 flex flex-col justify-between">
                        <div className="flex items-center justify-between">
                          {/* Quantity Selector */}
                          <div className="flex items-center gap-2 rounded-full border border-primary/10 bg-[#fbf9f3] p-1">
                            <button
                              onClick={() =>
                                updateQuantity(product._id, item.quantity - 1)
                              }
                              className="rounded-full p-2 transition-colors hover:bg-white"
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
                              className="rounded-full p-2 transition-colors hover:bg-white"
                            >
                              <Plus className="w-4 h-4 text-primary" />
                            </button>
                          </div>

                          {/* Remove Button */}
                          <button
                            onClick={() => removeFromCart(product._id)}
                            className="rounded-full p-2 text-neutral-500 transition-colors hover:bg-red-50 hover:text-red-600"
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
            <div className="sticky top-28 rounded-2xl border border-primary/10 bg-white p-5 shadow-sm sm:p-6">
              <h2 className="mb-6 font-playfair text-2xl text-primary">Order summary</h2>

              <div className="space-y-4 mb-6 pb-6 border-b border-neutral-200">
                <div className="flex justify-between text-sm text-neutral-600">
                  <span>Subtotal</span>
                  <span>₦{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm text-neutral-600">
                  <span>Shipping</span>
                  <span className="text-xs font-medium text-primary/65">At checkout</span>
                </div>
                <div className="flex justify-between text-sm text-neutral-600">
                  <span>Tax</span>
                  <span className="text-xs font-medium text-primary/65">At checkout</span>
                </div>
              </div>

              <div className="flex justify-between items-center mb-6">
                <span className="text-lg font-semibold text-primary">Subtotal</span>
                <span className="font-playfair text-2xl text-primary">
                  ₦{subtotal.toLocaleString()}
                </span>
              </div>

              <Link href="/checkout">
                <Button className="mb-3 w-full rounded-full bg-secondary text-primary hover:bg-secondary/90">
                  Proceed to Checkout
                </Button>
              </Link>

              <Link href="/shop">
                <Button
                  variant="outline"
                  className="w-full rounded-full border-primary/20 text-primary hover:bg-[#fbf9f3]"
                >
                  Continue Shopping
                </Button>
              </Link>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
