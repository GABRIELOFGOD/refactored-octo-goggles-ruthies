'use client';

import { useState, useEffect } from 'react';
import { IOrder } from '@/types';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { ChevronDown, Loader2, Mail } from 'lucide-react';
import { adminFetch } from '@/lib/admin-helper';

export default function OrderManagementCard({ orderId }: { orderId: string }) {
  const [order, setOrder] = useState<IOrder | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showStatusForm, setShowStatusForm] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [trackingUrl, setTrackingUrl] = useState('');
  const [timelineMessage, setTimelineMessage] = useState('');
  const [sendEmail, setSendEmail] = useState(true);

  const statuses = [
    'pending',
    'confirmed',
    'processing',
    'shipped',
    'delivered',
    'completed',
    'cancelled',
  ];

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await adminFetch(`/api/admin/orders/${orderId}`);
        const data = await res.json();
        if (data.success) {
          setOrder(data.data);
          setNewStatus(data.data.status);
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

  const handleUpdateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);

    try {
      const res = await adminFetch(`/api/admin/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          trackingNumber: trackingNumber || undefined,
          trackingUrl: trackingUrl || undefined,
          timelineEvent: timelineMessage
            ? {
                status: newStatus,
                message: timelineMessage,
              }
            : undefined,
          sendEmail,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setOrder(data.data);
        setShowStatusForm(false);
        setTrackingNumber('');
        setTrackingUrl('');
        setTimelineMessage('');
        toast.success('Order updated successfully');
      } else {
        toast.error(data.error || 'Failed to update order');
      }
    } catch (error) {
      console.error('Update error:', error);
      toast.error('Failed to update order');
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border border-neutral-200 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-neutral-200 rounded w-1/3"></div>
          <div className="h-4 bg-neutral-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="bg-white rounded-lg border border-neutral-200 p-6">
        <p className="text-neutral-600">Order not found</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-neutral-200 p-6">
      <div className="mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-xl font-bold text-primary">{order.orderNumber}</h3>
            <p className="text-sm text-neutral-600">{order.email}</p>
          </div>
          <span className="px-3 py-1 bg-light-bg text-primary rounded-full text-sm font-semibold">
            {order.status.toUpperCase()}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-xs text-neutral-600 uppercase">Amount</p>
            <p className="font-bold">₦{order.total?.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs text-neutral-600 uppercase">Payment</p>
            <p className="font-semibold text-green-600">
              {order.paymentStatus === 'paid' ? '✓ Paid' : 'Pending'}
            </p>
          </div>
          <div>
            <p className="text-xs text-neutral-600 uppercase">Items</p>
            <p className="font-bold">{order.items.length}</p>
          </div>
          <div>
            <p className="text-xs text-neutral-600 uppercase">Ordered</p>
            <p className="text-sm">
              {new Date(order.createdAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
              })}
            </p>
          </div>
        </div>

        {order.trackingNumber && (
          <div className="p-3 bg-light-bg rounded-lg mb-4">
            <p className="text-xs text-neutral-600 uppercase">Tracking</p>
            <p className="font-monospace font-semibold">{order.trackingNumber}</p>
          </div>
        )}
      </div>

      <div className="border-t border-neutral-200 pt-4">
        <button
          onClick={() => setShowStatusForm(!showStatusForm)}
          className="w-full flex items-center justify-between py-2 px-3 hover:bg-light-bg rounded-lg transition-colors"
        >
          <span className="font-semibold text-primary">Update Order</span>
          <ChevronDown
            className={`w-4 h-4 transition-transform ${
              showStatusForm ? 'rotate-180' : ''
            }`}
          />
        </button>

        {showStatusForm && (
          <form onSubmit={handleUpdateOrder} className="mt-4 space-y-4 pt-4 border-t border-neutral-200">
            <div>
              <label className="text-sm font-semibold text-primary mb-2 block">
                Order Status
              </label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
              >
                {statuses.map((status) => (
                  <option key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-semibold text-primary mb-2 block">
                Tracking Number (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g., TRACK-123456"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-primary mb-2 block">
                Tracking URL (Optional)
              </label>
              <input
                type="url"
                placeholder="https://track.courier.com/..."
                value={trackingUrl}
                onChange={(e) => setTrackingUrl(e.target.value)}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-primary mb-2 block">
                Timeline Message
              </label>
              <textarea
                placeholder="e.g., Your package is on the way..."
                value={timelineMessage}
                onChange={(e) => setTimelineMessage(e.target.value)}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary resize-none"
                rows={3}
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="sendEmail"
                checked={sendEmail}
                onChange={(e) => setSendEmail(e.target.checked)}
                className="w-4 h-4 rounded border-neutral-300 text-secondary"
              />
              <label htmlFor="sendEmail" className="text-sm text-neutral-700 cursor-pointer">
                Send notification email to customer
              </label>
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                type="submit"
                disabled={isUpdating}
                className="flex-1 bg-primary text-light-bg hover:bg-primary/90 disabled:opacity-50"
              >
                {isUpdating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Update Order'
                )}
              </Button>
              <Button
                type="button"
                onClick={() => setShowStatusForm(false)}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
