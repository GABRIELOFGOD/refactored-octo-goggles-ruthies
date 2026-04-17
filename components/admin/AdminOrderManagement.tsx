'use client';

import { useEffect, useState } from 'react';
import { IOrder } from '@/types';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import OrderManagementCard from './OrderManagementCard';
import { Loader2, Search } from 'lucide-react';

export default function AdminOrderManagement() {
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const limit = 10;

  useEffect(() => {
    fetchOrders();
  }, [page, statusFilter]);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      let query = `/api/admin/orders?page=${page}&limit=${limit}`;
      if (statusFilter) query += `&status=${statusFilter}`;
      if (searchTerm) query += `&search=${encodeURIComponent(searchTerm)}`;

      const res = await fetch(query);
      const data = await res.json();

      if (data.success) {
        setOrders(data.data);
        setTotal(data.meta.total);
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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchOrders();
  };

  const statuses = ['', 'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'completed', 'cancelled'];

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white rounded-lg border border-neutral-200 p-6">
        <h2 className="text-xl font-bold text-primary mb-4">Order Filters</h2>

        <form onSubmit={handleSearch} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-primary mb-2">Search</label>
              <input
                type="text"
                placeholder="Order #, Email, Customer name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-primary mb-2">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
              >
                {statuses.map((status) => (
                  <option key={status} value={status}>
                    {status ? status.charAt(0).toUpperCase() + status.slice(1) : 'All Statuses'}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="flex items-center gap-2 px-4 py-2 bg-primary text-light-bg rounded-lg hover:bg-primary/90"
          >
            <Search className="w-4 h-4" />
            Search Orders
          </button>
        </form>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-primary">
            Orders ({total})
          </h2>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <Loader2 className="w-6 h-6 animate-spin text-secondary" />
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-lg border border-neutral-200 p-8 text-center">
            <p className="text-neutral-600">No orders found</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4">
              {orders.map((order) => (
                <OrderManagementCard key={order._id} orderId={order._id} />
              ))}
            </div>

            {/* Pagination */}
            {total > limit && (
              <div className="flex justify-center items-center gap-4 mt-8">
                <Button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  variant="outline"
                >
                  Previous
                </Button>

                <span className="text-sm text-neutral-600">
                  Page {page} of {Math.ceil(total / limit)}
                </span>

                <Button
                  onClick={() => setPage(p => p + 1)}
                  disabled={page >= Math.ceil(total / limit)}
                  variant="outline"
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
