'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import BookingManagementTable from '@/components/admin/BookingManagementTable';
import EmailNotificationModal from '@/components/admin/EmailNotificationModal';

interface Booking {
  _id: string;
  bookingNumber: string;
  user?: {
    name: string;
    email: string;
  };
  service?: {
    name: string;
  };
  scheduledDate: string;
  scheduledTime: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  total: number;
  currency: string;
  guestInfo?: {
    name: string;
    email: string;
  };
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

export default function AdminBookingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showEmailModal, setShowEmailModal] = useState(false);

  // Check authentication
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
          ...(searchTerm && { search: searchTerm }),
        });

        const response = await fetch(`/api/admin/bookings?${query}`, {
          headers: {
            Authorization: `Bearer ${session?.user?.id}`,
          },
        });

        if (!response.ok) {
          if (response.status === 403) {
            toast.error('Admin access required');
            router.push('/');
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
  }, [page, statusFilter, searchTerm, session?.user?.id, router]);

  const handleStatusChange = async (bookingId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/admin/bookings/${bookingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.user?.id}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update booking');
      }

      toast.success(`Booking marked as ${newStatus}`);
      // Refresh bookings
      setPage(1);
    } catch (error) {
      console.error('Error updating booking:', error);
      toast.error('Failed to update booking');
    }
  };

  const handleEmailClick = (booking: Booking) => {
    setSelectedBooking(booking);
    setShowEmailModal(true);
  };

  const handleSendEmail = async (emailData: {
    subject: string;
    title: string;
    message: string;
    details?: string;
  }) => {
    if (!selectedBooking) return;

    try {
      const response = await fetch(
        `/api/admin/bookings/${selectedBooking._id}/send-email`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session?.user?.id}`,
          },
          body: JSON.stringify(emailData),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to send email');
      }

      toast.success('Email sent successfully');
      setShowEmailModal(false);
      setSelectedBooking(null);
    } catch (error) {
      console.error('Error sending email:', error);
      toast.error('Failed to send email');
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
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">
            Service Bookings
          </h1>
          <p className="text-slate-600">Manage and track all service bookings</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Search
              </label>
              <input
                type="text"
                placeholder="Booking #, Name, Email..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(1);
                }}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            {/* Stats */}
            <div className="flex items-end">
              <div className="text-sm">
                <p className="text-slate-600">
                  Showing{' '}
                  <span className="font-semibold text-slate-900">
                    {(page - 1) * limit + 1}
                  </span>
                  -
                  <span className="font-semibold text-slate-900">
                    {Math.min(page * limit, total)}
                  </span>
                  of
                  <span className="font-semibold text-slate-900">{total}</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bookings Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <BookingManagementTable
            bookings={bookings}
            onStatusChange={handleStatusChange}
            onEmailClick={handleEmailClick}
          />
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

      {/* Email Modal */}
      {showEmailModal && selectedBooking && (
        <EmailNotificationModal
          booking={selectedBooking}
          onClose={() => {
            setShowEmailModal(false);
            setSelectedBooking(null);
          }}
          onSend={handleSendEmail}
        />
      )}
    </div>
  );
}
