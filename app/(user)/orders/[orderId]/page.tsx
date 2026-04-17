'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { IOrder } from '@/types';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Download, Package, Truck, CheckCircle2 } from 'lucide-react';

export default function OrderDetailPage() {
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
      <div className="min-h-screen bg-light-bg py-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-neutral-200 rounded w-1/4"></div>
            <div className="h-96 bg-neutral-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-light-bg py-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-3xl font-display text-primary mb-4">Order Not Found</h1>
          <Link href="/orders">
            <Button className="bg-primary text-light-bg hover:bg-primary/90">
              Back to Orders
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle2 className="w-6 h-6 text-green-600" />;
      case 'shipped':
        return <Truck className="w-6 h-6 text-blue-600" />;
      case 'processing':
        return <Package className="w-6 h-6 text-yellow-600" />;
      default:
        return <Package className="w-6 h-6 text-neutral-600" />;
    }
  };

  return (
    <div className="min-h-screen bg-light-bg py-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <Link href="/orders" className="flex items-center gap-2 text-secondary hover:text-secondary/80 mb-4">
            ← Back to Orders
          </Link>
          <h1 className="text-4xl font-display text-primary">{order.orderNumber}</h1>
          <p className="text-neutral-600 mt-2">
            Placed on{' '}
            {new Date(order.createdAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Order Items */}
            <div className="bg-white rounded-lg border border-neutral-200 p-8">
              <h2 className="text-2xl font-display text-primary mb-6">Order Items</h2>
              <div className="space-y-6">
                {order.items.map((item: any, idx: number) => (
                  <div key={idx} className="border-b border-neutral-200 last:border-b-0 pb-6 last:pb-0">
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-primary mb-2">
                          {item.product?.name}
                        </h3>
                        {item.variant && (
                          <div className="text-sm text-neutral-600 space-y-1">
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
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-secondary">
                          ₦{(item.unitPrice * item.quantity).toLocaleString()}
                        </p>
                        <p className="text-sm text-neutral-600">
                          ₦{item.unitPrice.toLocaleString()} × {item.quantity}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-white rounded-lg border border-neutral-200 p-8">
              <h2 className="text-2xl font-display text-primary mb-4">Shipping Address</h2>
              <div className="text-neutral-700 space-y-2">
                <p className="font-semibold">{order.shippingAddress?.name}</p>
                <p>{order.shippingAddress?.street}</p>
                <p>
                  {order.shippingAddress?.city}, {order.shippingAddress?.state}{' '}
                  {order.shippingAddress?.postalCode}
                </p>
                <p>{order.shippingAddress?.country}</p>
                <p className="font-semibold mt-4">{order.shippingAddress?.phone}</p>
              </div>

              {order.trackingNumber && (
                <div className="mt-6 p-4 bg-light-bg rounded-lg">
                  <p className="text-sm text-neutral-600 mb-2">Tracking Number</p>
                  <p className="font-monospace font-semibold">{order.trackingNumber}</p>
                  {order.trackingUrl && (
                    <a href={order.trackingUrl} target="_blank" rel="noopener noreferrer">
                      <Button variant="outline" size="sm" className="mt-3">
                        Track Package
                      </Button>
                    </a>
                  )}
                </div>
              )}
            </div>

            {/* Timeline */}
            {order.timeline && order.timeline.length > 0 && (
              <div className="bg-white rounded-lg border border-neutral-200 p-8">
                <h2 className="text-2xl font-display text-primary mb-6">Order Timeline</h2>
                <div className="space-y-6">
                  {order.timeline.map((event: any, idx: number) => (
                    <div key={idx} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-10 h-10 rounded-full bg-secondary text-light-bg flex items-center justify-center font-semibold text-sm">
                          ✓
                        </div>
                        {idx < order.timeline.length - 1 && (
                          <div className="w-0.5 h-16 bg-neutral-200 mt-2"></div>
                        )}
                      </div>
                      <div className="pt-2">
                        <p className="font-semibold text-primary">{event.status}</p>
                        <p className="text-neutral-600 text-sm">{event.message}</p>
                        <p className="text-xs text-neutral-500 mt-1">
                          {new Date(event.timestamp).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Order Summary */}
            <div className="bg-white rounded-lg border border-neutral-200 p-8 mb-8">
              <h3 className="text-xl font-display text-primary mb-6">Order Summary</h3>

              <div className="space-y-4 mb-6 pb-6 border-b border-neutral-200">
                <div className="flex justify-between text-neutral-600">
                  <span>Subtotal</span>
                  <span>₦{order.subtotal?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-neutral-600">
                  <span>Shipping</span>
                  <span>₦{order.shippingFee?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-neutral-600">
                  <span>Tax</span>
                  <span>₦{((order as any).tax?.toLocaleString() || 0)}</span>
                </div>
              </div>

              <div className="flex justify-between items-center mb-8">
                <span className="font-semibold text-primary">Total</span>
                <span className="text-2xl font-display text-secondary">
                  ₦{order.total?.toLocaleString()}
                </span>
              </div>

              {/* Status Badge */}
              <div className="bg-light-bg rounded-lg p-4 mb-6">
                <div className="flex items-center gap-3">
                  {getStatusIcon(order.status)}
                  <div>
                    <p className="text-xs text-neutral-600 uppercase">Status</p>
                    <p className="font-semibold text-primary">
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Payment Status */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-xs text-green-700 uppercase font-semibold mb-1">
                  Payment
                </p>
                <p className="text-green-800 font-semibold">
                  {order.paymentStatus === 'paid' ? '✓ Paid' : 'Pending'}
                </p>
              </div>
            </div>

            {/* Actions */}
            <Button
              variant="outline"
              className="w-full border-primary text-primary hover:bg-light-bg mb-3"
              onClick={() => window.print()}
            >
              <Download className="w-4 h-4 mr-2" />
              Print Receipt
            </Button>

            <Link href="/shop">
              <Button className="w-full bg-primary text-light-bg hover:bg-primary/90">
                Continue Shopping
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
