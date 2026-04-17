'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { IOrder } from '@/types';
import { toast } from 'sonner';
import {
  CheckCircle2,
  Truck,
  Package,
  Clock,
  MapPin,
  Mail,
} from 'lucide-react';

export default function TrackOrderPage() {
  const [orderNumber, setOrderNumber] = useState('');
  const [email, setEmail] = useState('');
  const [order, setOrder] = useState<IOrder | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!orderNumber || !email) {
      toast.error('Please enter both order number and email');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch(
        `/api/track-order?orderNumber=${encodeURIComponent(orderNumber)}&email=${encodeURIComponent(email)}`
      );
      const data = await res.json();

      if (data.success) {
        setOrder(data.data);
      } else {
        toast.error('Order not found. Please check your details.');
        setOrder(null);
      }
    } catch (error) {
      console.error('Tracking error:', error);
      toast.error('Failed to track order');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle2 className="w-6 h-6 text-green-600" />;
      case 'shipped':
        return <Truck className="w-6 h-6 text-blue-600" />;
      case 'processing':
        return <Package className="w-6 h-6 text-yellow-600" />;
      case 'confirmed':
        return <Clock className="w-6 h-6 text-purple-600" />;
      default:
        return <Package className="w-6 h-6 text-neutral-600" />;
    }
  };

  return (
    <div className="min-h-screen bg-light-bg py-12">
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-4xl font-display text-primary mb-2">Track Your Order</h1>
        <p className="text-neutral-600 mb-12">
          Enter your order number and email address to track your package
        </p>

        {!order ? (
          <div className="bg-white rounded-lg border border-neutral-200 p-8">
            <form onSubmit={handleTrack} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-primary mb-2">
                  Order Number
                </label>
                <input
                  type="text"
                  placeholder="e.g. ORD-1704067200000-ABC123"
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value)}
                  className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
                />
                <p className="text-xs text-neutral-600 mt-2">
                  You can find this in your order confirmation email
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-primary mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
                />
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary text-light-bg hover:bg-primary/90 py-3 text-lg font-semibold"
              >
                {isLoading ? 'Tracking...' : 'Track Order'}
              </Button>
            </form>

            <div className="mt-8 p-6 bg-light-bg rounded-lg border border-neutral-200">
              <h3 className="font-semibold text-primary mb-3">How to find your order number:</h3>
              <ol className="space-y-2 text-sm text-neutral-600 list-decimal list-inside">
                <li>Check your email inbox for order confirmation</li>
                <li>Look for the subject "Order Confirmed"</li>
                <li>The order number is displayed at the top of the email</li>
              </ol>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Order Found */}
            <div className="bg-white rounded-lg border border-neutral-200 p-8">
              <div className="mb-8">
                <p className="text-sm text-neutral-600 mb-2">Order Number</p>
                <h2 className="text-3xl font-bold text-primary">{order.orderNumber}</h2>
              </div>

              {/* Status */}
              <div className="mb-8 p-6 bg-light-bg rounded-lg">
                <div className="flex items-center gap-4">
                  {getStatusIcon(order.status)}
                  <div>
                    <p className="text-xs text-neutral-600 uppercase font-semibold">
                      Current Status
                    </p>
                    <p className="text-xl font-bold text-primary">
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Tracking Number */}
              {order.trackingNumber && (
                <div className="mb-8 p-6 border-2 border-secondary rounded-lg bg-light-bg">
                  <div className="flex items-center gap-2 mb-3">
                    <Truck className="w-5 h-5 text-secondary" />
                    <p className="font-semibold text-primary">Tracking Information</p>
                  </div>
                  <p className="text-sm text-neutral-600 mb-2">Tracking Number:</p>
                  <p className="font-monospace font-bold text-lg mb-4">
                    {order.trackingNumber}
                  </p>
                  {order.trackingUrl && (
                    <a href={order.trackingUrl} target="_blank" rel="noopener noreferrer">
                      <Button
                        variant="outline"
                        className="border-secondary text-secondary hover:bg-light-bg"
                      >
                        View on Courier Website
                      </Button>
                    </a>
                  )}
                </div>
              )}

              {/* Timeline */}
              {order.timeline && order.timeline.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-primary mb-6">Order Timeline</h3>
                  <div className="space-y-6">
                    {order.timeline.map((event: any, idx: number) => (
                      <div key={idx} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className="w-10 h-10 rounded-full bg-secondary text-light-bg flex items-center justify-center font-semibold text-sm">
                            ✓
                          </div>
                          {idx < order.timeline.length - 1 && (
                            <div className="w-0.5 h-20 bg-neutral-200 mt-2"></div>
                          )}
                        </div>
                        <div className="pt-2">
                          <p className="font-semibold text-primary">{event.status}</p>
                          <p className="text-neutral-600 text-sm">{event.message}</p>
                          <p className="text-xs text-neutral-500 mt-1">
                            {new Date(event.timestamp).toLocaleDateString('en-US', {
                              weekday: 'short',
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

              {/* Shipping Address */}
              <div className="p-6 bg-light-bg rounded-lg">
                <div className="flex items-center gap-2 mb-4">
                  <MapPin className="w-5 h-5 text-primary" />
                  <h4 className="font-semibold text-primary">Shipping To</h4>
                </div>
                <div className="text-neutral-700 space-y-1 text-sm">
                  <p className="font-semibold">{order.shippingAddress?.name}</p>
                  <p>{order.shippingAddress?.street}</p>
                  <p>
                    {order.shippingAddress?.city}, {order.shippingAddress?.state}{' '}
                    {order.shippingAddress?.postalCode}
                  </p>
                  <p>{order.shippingAddress?.country}</p>
                </div>
              </div>
            </div>

            {/* Order Details Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg border border-neutral-200 p-6">
                <h3 className="font-semibold text-primary mb-4">Order Summary</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Items:</span>
                    <span className="font-semibold">{order.items?.length || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Subtotal:</span>
                    <span className="font-semibold">₦{order.subtotal?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Shipping:</span>
                    <span className="font-semibold">₦{order.shippingFee?.toLocaleString()}</span>
                  </div>
                  <div className="border-t border-neutral-200 pt-3 flex justify-between">
                    <span className="font-semibold">Total Paid:</span>
                    <span className="font-bold text-secondary">
                      ₦{order.total?.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg border border-neutral-200 p-6">
                <h3 className="font-semibold text-primary mb-4">Contact Information</h3>
                <div className="space-y-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-neutral-600" />
                    <div>
                      <p className="text-neutral-600">Email</p>
                      <p className="font-semibold break-all">{order.email}</p>
                    </div>
                  </div>
                  {order.shippingAddress?.phone && (
                    <div className="flex items-center gap-2">
                      <p className="text-neutral-600">Phone</p>
                      <p className="font-semibold">{order.shippingAddress.phone}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Back Button */}
            <div className="text-center">
              <Button
                onClick={() => {
                  setOrder(null);
                  setOrderNumber('');
                  setEmail('');
                }}
                variant="outline"
                className="border-primary text-primary hover:bg-light-bg"
              >
                Track Another Order
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
