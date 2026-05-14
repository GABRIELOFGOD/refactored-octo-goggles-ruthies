'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { formatDate } from '@/lib/utils';

interface Booking {
  _id: string;
  bookingNumber: string;
  service?: {
    name: string;
  };
  scheduledDate: string;
  scheduledTime: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  total: number;
  currency: string;
  notes?: string;
}

interface ApiResponse {
  data: Booking[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export default function MyBookingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState<string>('');

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  // Fetch bookings
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        const query = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
          ...(statusFilter && { status: statusFilter }),
        });

        const response = await fetch(`/api/bookings?${query}`);

        if (!response.ok) {
          if (response.status === 401) {
            router.push('/login');
            return;
          }
          throw new Error('Failed to fetch bookings');
        }

        const data: ApiResponse = await response.json();
        setBookings(data.data);
        setTotal(data.pagination.total);
      } catch (error) {
        console.error('Error fetching bookings:', error);
        toast.error('Failed to load bookings');
      } finally {
        setLoading(false);
      }
    };

    if (session?.user?.id) {
      fetchBookings();
    }
  }, [page, statusFilter, session?.user?.id, router]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return '⏱️';
      case 'confirmed':
        return '✓';
      case 'completed':
        return '✓✓';
      case 'cancelled':
        return '✕';
      default:
        return '?';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const pages = Math.ceil(total / limit);

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">
            My Bookings
          </h1>
          <p className="text-slate-600">View and manage your service bookings</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="w-full md:w-64">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Filter by Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">All Bookings</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div className="text-sm text-slate-600">
              Total Bookings:{' '}
              <span className="font-semibold text-slate-900">{total}</span>
            </div>
          </div>
        </div>

        {/* Bookings List */}
        <div className="space-y-4">
          {bookings.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <div className="text-slate-500">
                <p className="text-lg font-medium mb-2">No bookings yet</p>
                <p className="text-sm mb-6">
                  {statusFilter
                    ? 'No bookings match your filter'
                    : 'Start booking services to see them here'}
                </p>
                {!statusFilter && (
                  <button
                    onClick={() => router.push('/(user)/services')}
                    className="inline-flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-600 transition-colors font-medium"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                      />
                    </svg>
                    Browse Services
                  </button>
                )}
              </div>
            </div>
          ) : (
            bookings.map((booking) => (
              <div
                key={booking._id}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <code className="text-xs font-mono text-slate-500 block mb-1">
                        {booking.bookingNumber}
                      </code>
                      <h3 className="text-xl font-bold text-slate-900">
                        {booking.service?.name || 'Service'}
                      </h3>
                    </div>
                    <div
                      className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(
                        booking.status
                      )}`}
                    >
                      {getStatusIcon(booking.status)}{' '}
                      {booking.status.charAt(0).toUpperCase() +
                        booking.status.slice(1)}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-slate-600 font-medium mb-1">
                        Date
                      </p>
                      <p className="text-sm font-semibold text-slate-900">
                        {formatDate(new Date(booking.scheduledDate))}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-600 font-medium mb-1">
                        Time
                      </p>
                      <p className="text-sm font-semibold text-slate-900">
                        {booking.scheduledTime || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-600 font-medium mb-1">
                        Total
                      </p>
                      <p className="text-sm font-semibold text-slate-900">
                        {booking.currency} {booking.total}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-600 font-medium mb-1">
                        Booking ID
                      </p>
                      <p className="text-xs font-mono text-slate-900 truncate">
                        {booking._id}
                      </p>
                    </div>
                  </div>

                  {booking.notes && (
                    <div className="bg-slate-50 p-3 rounded mb-4">
                      <p className="text-xs text-slate-600 font-medium mb-1">
                        Notes
                      </p>
                      <p className="text-sm text-slate-900">{booking.notes}</p>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <button className="flex-1 px-4 py-2 border border-primary text-primary rounded-lg hover:bg-primary hover:text-white transition-colors font-medium text-sm">
                      View Details
                    </button>
                    {booking.status === 'pending' && (
                      <button className="flex-1 px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors font-medium text-sm">
                        Cancel Booking
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {pages > 1 && (
          <div className="mt-8 flex justify-center items-center gap-2">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="px-4 py-2 border border-slate-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
            >
              Previous
            </button>

            {Array.from({ length: pages }, (_, i) => i + 1)
              .filter(
                (p) =>
                  p === 1 ||
                  p === pages ||
                  (p >= page - 1 && p <= page + 1)
              )
              .map((p, idx, arr) => (
                <div key={p}>
                  {idx > 0 && arr[idx - 1] !== p - 1 && (
                    <span className="px-2">...</span>
                  )}
                  <button
                    onClick={() => setPage(p)}
                    className={`px-4 py-2 rounded-lg ${
                      page === p
                        ? 'bg-primary text-white'
                        : 'border border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    {p}
                  </button>
                </div>
              ))}

            <button
              onClick={() => setPage(Math.min(pages, page + 1))}
              disabled={page === pages}
              className="px-4 py-2 border border-slate-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
