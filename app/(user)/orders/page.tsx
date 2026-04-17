'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { IOrder } from '@/types';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Package } from 'lucide-react';

export default function OrdersPage() {
  const { data: session, status } = useSession();
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      window.location.href = '/auth/login';
      return;
    }

    if (status === 'authenticated') {
      fetchOrders();
    }
  }, [status]);

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/orders');
      const data = await res.json();

      if (data.success) {
        setOrders(data.data);
      } else {
        toast.error('Failed to load orders');
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-light-bg py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-neutral-200 rounded w-1/4"></div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 bg-neutral-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="min-h-screen bg-light-bg py-12">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-4xl font-display text-primary mb-12">My Orders</h1>

          <div className="text-center py-16">
            <Package className="w-16 h-16 mx-auto text-neutral-300 mb-4" />
            <h2 className="text-2xl font-display text-primary mb-2">No Orders Yet</h2>
            <p className="text-neutral-600 mb-6">
              You haven't placed any orders yet. Start shopping!
            </p>
            <Link href="/shop">
              <Button className="bg-primary text-light-bg hover:bg-primary/90">
                Start Shopping
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-light-bg py-12">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-4xl font-display text-primary mb-8">My Orders</h1>

        <div className="space-y-4">
          {orders.map((order) => (
            <Link key={order._id} href={`/orders/${order._id}`}>
              <div className="bg-white border border-neutral-200 rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {/* Order Number */}
                  <div>
                    <p className="text-xs text-neutral-600 uppercase tracking-wider mb-1">
                      Order
                    </p>
                    <p className="font-semibold text-primary">{order.orderNumber}</p>
                  </div>

                  {/* Date */}
                  <div>
                    <p className="text-xs text-neutral-600 uppercase tracking-wider mb-1">
                      Date
                    </p>
                    <p className="text-primary">
                      {new Date(order.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </p>
                  </div>

                  {/* Total */}
                  <div>
                    <p className="text-xs text-neutral-600 uppercase tracking-wider mb-1">
                      Total
                    </p>
                    <p className="font-semibold text-secondary">
                      ₦{order.total?.toLocaleString()}
                    </p>
                  </div>

                  {/* Status */}
                  <div className="flex items-end justify-between md:justify-start">
                    <div>
                      <p className="text-xs text-neutral-600 uppercase tracking-wider mb-1">
                        Status
                      </p>
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                          order.status === 'delivered'
                            ? 'bg-green-100 text-green-800'
                            : order.status === 'shipped'
                            ? 'bg-blue-100 text-blue-800'
                            : order.status === 'processing'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-neutral-100 text-neutral-800'
                        }`}
                      >
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </div>
                    <div className="md:hidden">
                      <span className="text-secondary font-semibold">→</span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
