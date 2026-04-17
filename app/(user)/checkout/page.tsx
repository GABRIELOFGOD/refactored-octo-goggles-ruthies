'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import PaystackButton from '@/components/PaystackButton';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Image from 'next/image';
import Link from 'next/link';

const shippingSchema = z.object({
  name: z.string().min(2, 'Name required'),
  email: z.string().email('Valid email required'),
  phone: z.string().min(10, 'Valid phone required'),
  street: z.string().min(5, 'Street address required'),
  city: z.string().min(2, 'City required'),
  state: z.string().min(2, 'State required'),
  country: z.string().min(2, 'Country required'),
  postalCode: z.string().min(3, 'Postal code required'),
});

type ShippingFormData = z.infer<typeof shippingSchema>;

const SHIPPING_FEE = 2500; // 25 NGN in kobo
const TAX_RATE = 0.075; // 7.5%

export default function CheckoutPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { items, subtotal, clearCart } = useCart();
  const [isProcessing, setIsProcessing] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [orderNumber, setOrderNumber] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [showPayment, setShowPayment] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<ShippingFormData>({
    resolver: zodResolver(shippingSchema),
  });

  const emailValue = watch('email');

  useEffect(() => {
    setMounted(true);
    // Prefill email for logged-in users
    if (session?.user?.email) {
      setValue('email', session.user.email);
      setEmail(session.user.email);
      if (session.user.name) {
        setValue('name', session.user.name);
      }
    }
  }, [session, setValue]);

  useEffect(() => {
    setEmail(emailValue || '');
  }, [emailValue]);

  if (!mounted) return null;

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-light-bg py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center py-12">
            <h1 className="text-3xl font-display text-primary mb-4">
              Your cart is empty
            </h1>
            <p className="text-neutral-600 mb-6">
              Add items to your cart before checking out
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

  const subtotalInKobo = Math.round(subtotal * 100);
  const shippingInKobo = SHIPPING_FEE;
  const taxAmount = subtotal * TAX_RATE;
  const taxInKobo = Math.round(taxAmount * 100);
  const totalInKobo = subtotalInKobo + shippingInKobo + taxInKobo;

  const onSubmit = async (data: ShippingFormData) => {
    setIsProcessing(true);

    try {
      // Generate order number (simple implementation)
      const newOrderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substring(7).toUpperCase()}`;
      setOrderNumber(newOrderNumber);

      // Store shipping data for use after payment
      localStorage.setItem(
        'checkoutData',
        JSON.stringify({
          shippingAddress: data,
          subtotal,
          total: totalInKobo / 100,
          shippingFee: shippingInKobo / 100,
          tax: taxAmount,
          orderNumber: newOrderNumber,
          items: items.map((item) => ({
            product: item.product,
            variant: item.variant,
            quantity: item.quantity,
            unitPrice: item.price,
            currency: 'NGN',
            sku: item.variant?.sku,
          })),
        })
      );

      setShowPayment(true);
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error('Failed to process checkout');
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePaymentSuccess = async (reference: string) => {
    try {
      const checkoutData = JSON.parse(
        localStorage.getItem('checkoutData') || '{}'
      );

      // Create order after successful payment
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...checkoutData,
          paymentReference: reference,
          paystackTransactionId: reference,
          email: checkoutData.shippingAddress.email,
        }),
      });

      const data = await res.json();

      if (data.success) {
        localStorage.removeItem('checkoutData');
        await clearCart();
        router.push(`/checkout/confirmation/${data.data._id}`);
      } else {
        toast.error('Failed to create order');
      }
    } catch (error) {
      console.error('Order creation error:', error);
      toast.error('Failed to create order');
    }
  };

  return (
    <div className="min-h-screen bg-light-bg py-12">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-4xl font-display text-primary mb-12">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Shipping Address Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg border border-neutral-200 p-8">
              <h2 className="text-2xl font-display text-primary mb-6">
                Shipping Address
              </h2>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Name & Email */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-primary mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      placeholder="Enter your full name"
                      {...register('name')}
                      className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
                    />
                    {errors.name && (
                      <p className="text-red-600 text-sm mt-1">{errors.name.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-primary mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      placeholder="your@email.com"
                      {...register('email')}
                      className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
                    />
                    {errors.email && (
                      <p className="text-red-600 text-sm mt-1">{errors.email.message}</p>
                    )}
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-semibold text-primary mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    placeholder="e.g. +234 801 234 5678"
                    {...register('phone')}
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
                  />
                  {errors.phone && (
                    <p className="text-red-600 text-sm mt-1">{errors.phone.message}</p>
                  )}
                </div>

                {/* Street Address */}
                <div>
                  <label className="block text-sm font-semibold text-primary mb-2">
                    Street Address
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 123 Main Street"
                    {...register('street')}
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
                  />
                  {errors.street && (
                    <p className="text-red-600 text-sm mt-1">{errors.street.message}</p>
                  )}
                </div>

                {/* City, State, Postal Code */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-primary mb-2">
                      City
                    </label>
                    <input
                      type="text"
                      placeholder="City"
                      {...register('city')}
                      className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
                    />
                    {errors.city && (
                      <p className="text-red-600 text-sm mt-1">{errors.city.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-primary mb-2">
                      State/Province
                    </label>
                    <input
                      type="text"
                      placeholder="State"
                      {...register('state')}
                      className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
                    />
                    {errors.state && (
                      <p className="text-red-600 text-sm mt-1">{errors.state.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-primary mb-2">
                      Postal Code
                    </label>
                    <input
                      type="text"
                      placeholder="Postal code"
                      {...register('postalCode')}
                      className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
                    />
                    {errors.postalCode && (
                      <p className="text-red-600 text-sm mt-1">
                        {errors.postalCode.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Country */}
                <div>
                  <label className="block text-sm font-semibold text-primary mb-2">
                    Country
                  </label>
                  <input
                    type="text"
                    placeholder="Country"
                    {...register('country')}
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
                  />
                  {errors.country && (
                    <p className="text-red-600 text-sm mt-1">{errors.country.message}</p>
                  )}
                </div>

                {/* Submit Button for Form */}
                <Button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full bg-primary text-light-bg hover:bg-primary/90 py-3 text-lg font-semibold"
                >
                  {isProcessing ? 'Processing...' : 'Review & Pay'}
                </Button>
              </form>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg border border-neutral-200 p-8 sticky top-24 h-fit">
              <h2 className="text-2xl font-display text-primary mb-6">Order Summary</h2>

              {/* Items */}
              <div className="space-y-4 mb-6 pb-6 border-b border-neutral-200">
                {items.map((item) => (
                  <div
                    key={item._id}
                    className="flex justify-between items-start gap-3"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-primary truncate">
                        {typeof item.product === 'object' && item.product?.name ? item.product.name : 'Product'}
                      </p>
                      {item.variant && (
                        <p className="text-xs text-neutral-600 mt-1">
                          {item.variant.size && `Size: ${item.variant.size}`}
                          {item.variant.color && ` • ${item.variant.color}`}
                        </p>
                      )}
                      <p className="text-sm text-neutral-600 mt-2">
                        ×{item.quantity}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-secondary">
                        ₦{(item.price * item.quantity).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Costs */}
              <div className="space-y-3 mb-6 pb-6 border-b border-neutral-200">
                <div className="flex justify-between text-neutral-600">
                  <span>Subtotal</span>
                  <span>₦{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-neutral-600">
                  <span>Shipping</span>
                  <span>₦{(shippingInKobo / 100).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-neutral-600">
                  <span>Tax (7.5%)</span>
                  <span>₦{taxAmount.toLocaleString()}</span>
                </div>
              </div>

              {/* Total */}
              <div className="flex justify-between items-center mb-8">
                <span className="text-lg font-semibold text-primary">Total</span>
                <span className="text-3xl font-display text-secondary">
                  ₦{(totalInKobo / 100).toLocaleString()}
                </span>
              </div>

              {/* Payment Info */}
              <div className="bg-light-bg rounded-lg p-4 mb-6">
                <p className="text-xs text-neutral-600 text-center">
                  Secure payment powered by Paystack
                </p>
              </div>

              {/* Payment Button - Only show after form submission */}
              {showPayment && orderNumber && (
                <PaystackButton
                  amount={totalInKobo}
                  email={email || session?.user?.email || ''}
                  orderNumber={orderNumber}
                  onSuccess={handlePaymentSuccess}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
