'use client';

import { useTranslation } from '@/hooks/useTranslation';
import { formatDate, formatTime } from '@/lib/utils';

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

interface Props {
  bookings: Booking[];
  onStatusChange: (bookingId: string, status: string) => void;
  onEmailClick: (booking: Booking) => void;
}

export default function BookingManagementTable({
  bookings,
  onStatusChange,
  onEmailClick,
}: Props) {
  const { t } = useTranslation();

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

  const getStatusLabel = (status: string) => {
    const statusMap: { [key: string]: string } = {
      pending: 'Pending',
      confirmed: 'Confirmed',
      completed: 'Completed',
      cancelled: 'Cancelled',
    };
    return statusMap[status] || status;
  };

  if (bookings.length === 0) {
    return (
      <div className="p-8 text-center">
        <div className="text-slate-500">
          <p className="text-lg font-medium">No bookings found</p>
          <p className="text-sm">No bookings match your current filters</p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-slate-50 border-b border-slate-200">
          <tr>
            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">
              Booking #
            </th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">
              Customer
            </th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">
              Service
            </th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">
              Date & Time
            </th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">
              Status
            </th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">
              Amount
            </th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {bookings.map((booking) => (
            <tr
              key={booking._id}
              className="hover:bg-slate-50 transition-colors"
            >
              <td className="px-6 py-4">
                <code className="text-sm font-mono font-semibold text-slate-900">
                  {booking.bookingNumber}
                </code>
              </td>
              <td className="px-6 py-4">
                <div>
                  <p className="font-medium text-slate-900">
                    {booking.user?.name || booking.guestInfo?.name}
                  </p>
                  <p className="text-sm text-slate-500">
                    {booking.user?.email || booking.guestInfo?.email}
                  </p>
                </div>
              </td>
              <td className="px-6 py-4 text-slate-900">
                {booking.service?.name || 'N/A'}
              </td>
              <td className="px-6 py-4 text-sm text-slate-600">
                <div>
                  {formatDate(new Date(booking.scheduledDate))}
                  {booking.scheduledTime && (
                    <>
                      <br />
                      <span className="text-xs">{booking.scheduledTime}</span>
                    </>
                  )}
                </div>
              </td>
              <td className="px-6 py-4">
                <select
                  value={booking.status}
                  onChange={(e) =>
                    onStatusChange(booking._id, e.target.value)
                  }
                  className={`px-3 py-1 rounded-full text-xs font-medium cursor-pointer ${getStatusColor(
                    booking.status
                  )}`}
                >
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </td>
              <td className="px-6 py-4 font-semibold text-slate-900">
                {booking.currency} {booking.total}
              </td>
              <td className="px-6 py-4">
                <button
                  onClick={() => onEmailClick(booking)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600 transition-colors text-sm font-medium"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  Send Email
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
