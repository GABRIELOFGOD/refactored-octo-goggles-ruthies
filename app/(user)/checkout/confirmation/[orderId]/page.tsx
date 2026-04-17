'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { IOrder } from '@/types';

export default function OrderConfirmationPage() {
  const params = useParams();
  const orderId = params.orderId as string;
  const [order, setOrder] = useState<IOrder | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await fetch(`/api/orders/${orderId}`);
        const data = await res.json();

        if (data.success) {
          setOrder(data.data);
        } else {
          toast.error('Failed to load order');
        }
      } catch (error) {
        console.error('Error fetching order:', error);
        toast.error('Failed to load order');
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-light-bg flex items-center justify-center py-12">
        <div className="max-w-2xl mx-auto px-4">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-neutral-200 rounded w-1/2 mx-auto"></div>
            <div className="h-48 bg-neutral-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-light-bg py-12">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h1 className="text-3xl font-display text-primary mb-4">Order Not Found</h1>
          <p className="text-neutral-600 mb-6">
            We couldn't find your order. Please check your email for a confirmation link.
          </p>
          <Link href="/shop">
            <Button className="bg-primary text-light-bg hover:bg-primary/90">
              Back to Shop
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-light-bg py-12">
      <div className="max-w-2xl mx-auto px-4">
        {/* Success Message */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <CheckCircle2 className="w-20 h-20 text-green-600" />
          </div>
          <h1 className="text-4xl font-display text-primary mb-4">
            Thank You for Your Order!
          </h1>
          <p className="text-lg text-neutral-600">
            Payment received and your order has been confirmed.
          </p>
        </div>

        {/* Order Details Card */}
        <div className="bg-white rounded-lg border border-neutral-200 p-8 mb-8">
          <div className="mb-8 pb-8 border-b border-neutral-200">
            <p className="text-sm text-neutral-600 mb-2">Order Number</p>
            <h2 className="text-3xl font-bold text-primary">{order.orderNumber}</h2>
            <p className="text-sm text-neutral-600 mt-2">
              Order Confirmation email sent to {order.email}
            </p>
          </div>

          {/* Order Items */}
          <div className="mb-8 pb-8 border-b border-neutral-200">
            <h3 className="text-lg font-semibold text-primary mb-4">Order Items</h3>
            <div className="space-y-4">
              {order.items.map((item: any, idx: number) => (
                <div key={idx} className="flex gap-4">
                  <div className="flex-1">
                    <p className="font-semibold text-primary">
                      {item.product?.name || 'Product'}
                    </p>
                    {item.variant && (
                      <p className="text-sm text-neutral-600">
                        {item.variant.size && `Size: ${item.variant.size}`}
                        {item.variant.color && ` • Color: ${item.variant.color}`}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">
                      ₦{(item.unitPrice * item.quantity).toLocaleString()}
                    </p>
                    <p className="text-sm text-neutral-600">×{item.quantity}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Summary */}
          <div className="space-y-3 mb-8 pb-8 border-b border-neutral-200">
            <div className="flex justify-between">
              <span className="text-neutral-600">Subtotal</span>
              <span>₦{order.subtotal?.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-600">Shipping</span>
              <span>₦{order.shippingFee?.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-600">Tax</span>
              <span>₦{((order as any).tax?.toLocaleString() || 0)}</span>
            </div>
          </div>

          {/* Total */}
          <div className="flex justify-between items-center mb-8">
            <span className="text-lg font-semibold text-primary">Total Paid</span>
            <span className="text-3xl font-display text-secondary">
              ₦{order.total?.toLocaleString()}
            </span>
          </div>

          {/* Shipping Address */}
          <div className="mb-8">
            <h4 className="font-semibold text-primary mb-3">Shipping Address</h4>
            <div className="bg-light-bg p-4 rounded-lg text-sm text-neutral-700">
              <p className="font-semibold mb-1">{order.shippingAddress?.name}</p>
              <p>{order.shippingAddress?.street}</p>
              <p>
                {order.shippingAddress?.city}, {order.shippingAddress?.state}{' '}
                {order.shippingAddress?.postalCode}
              </p>
              <p>{order.shippingAddress?.country}</p>
              <p className="mt-2 font-semibold">{order.shippingAddress?.phone}</p>
            </div>
          </div>

          {/* Status */}
          <div className="mb-8">
            <h4 className="font-semibold text-primary mb-3">Order Status</h4>
            <div className="bg-light-bg p-4 rounded-lg">
              <p className="text-sm">
                <span className="inline-block bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold mr-2">
                  ✓ CONFIRMED
                </span>
              </p>
              <p className="text-sm text-neutral-600 mt-2">
                Your order has been confirmed. You'll receive a shipping notification soon.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link href={`/orders/${order._id}`}>
            <Button
              variant="outline"
              className="w-full border-primary text-primary hover:bg-light-bg"
            >
              View Order Details
            </Button>
          </Link>
          <Link href="/shop">
            <Button className="w-full bg-primary text-light-bg hover:bg-primary/90">
              Continue Shopping
            </Button>
          </Link>
        </div>

        {/* Help Section */}
        <div className="mt-12 text-center">
          <p className="text-neutral-600 text-sm">
            Have questions?{' '}
            <a href="mailto:support@ruthiesafrica.com" className="text-secondary font-semibold">
              Contact our support team
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
