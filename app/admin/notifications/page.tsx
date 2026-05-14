'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface Notification {
  _id: string;
  type: 'service' | 'order';
  user?: {
    name: string;
    email: string;
  };
  title: string;
  message: string;
  icon: string;
  isRead: boolean;
  createdAt: string;
}

interface ApiResponse {
  data: Notification[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export default function AdminNotificationsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit] = useState(15);
  const [total, setTotal] = useState(0);
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [readFilter, setReadFilter] = useState<string>('');

  // Check authentication
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  // Fetch notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        const query = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
          ...(typeFilter && { type: typeFilter }),
          ...(readFilter && { isRead: readFilter }),
        });

        const response = await fetch(`/api/admin/notifications?${query}`, {
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
          throw new Error('Failed to fetch notifications');
        }

        const data: ApiResponse = await response.json();
        setNotifications(data.data);
        setTotal(data.pagination.total);
      } catch (error) {
        console.error('Error fetching notifications:', error);
        toast.error('Failed to load notifications');
      } finally {
        setLoading(false);
      }
    };

    if (session?.user?.id) {
      fetchNotifications();
    }
  }, [page, typeFilter, readFilter, session?.user?.id, router]);

  const handleDeleteNotification = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${session?.user?.id}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete notification');
      }

      toast.success('Notification deleted');
      setPage(1);
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast.error('Failed to delete notification');
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'service':
        return '🔔';
      case 'order':
        return '📦';
      default:
        return 'ℹ️';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'service':
        return 'bg-blue-100 text-blue-800';
      case 'order':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
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
            Notifications Dashboard
          </h1>
          <p className="text-slate-600">View all user notifications</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Type Filter */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Type
              </label>
              <select
                value={typeFilter}
                onChange={(e) => {
                  setTypeFilter(e.target.value);
                  setPage(1);
                }}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">All Types</option>
                <option value="service">Service</option>
                <option value="order">Order</option>
              </select>
            </div>

            {/* Read Status Filter */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Status
              </label>
              <select
                value={readFilter}
                onChange={(e) => {
                  setReadFilter(e.target.value);
                  setPage(1);
                }}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">All Notifications</option>
                <option value="false">Unread</option>
                <option value="true">Read</option>
              </select>
            </div>

            {/* Stats */}
            <div className="md:col-span-2 flex items-end">
              <div className="text-sm w-full">
                <p className="text-slate-600">
                  Total:{' '}
                  <span className="font-semibold text-slate-900">{total}</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Notifications List */}
        <div className="space-y-4">
          {notifications.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <div className="text-slate-500">
                <p className="text-lg font-medium">No notifications found</p>
                <p className="text-sm">No notifications match your filters</p>
              </div>
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification._id}
                className={`bg-white rounded-lg shadow-md p-6 border-l-4 ${
                  notification.type === 'service'
                    ? 'border-blue-500'
                    : 'border-purple-500'
                } hover:shadow-lg transition-shadow`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div
                      className={`px-3 py-1 rounded-full text-sm font-medium ${getTypeColor(
                        notification.type
                      )}`}
                    >
                      {getTypeIcon(notification.type)}{' '}
                      {notification.type.charAt(0).toUpperCase() +
                        notification.type.slice(1)}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-slate-900 mb-1">
                        {notification.title}
                      </h3>
                      <p className="text-slate-600 mb-2">
                        {notification.message}
                      </p>
                      {notification.user && (
                        <div className="text-sm text-slate-500 space-y-1">
                          <p>
                            <span className="font-medium">User:</span>{' '}
                            {notification.user.name}
                          </p>
                          <p>
                            <span className="font-medium">Email:</span>{' '}
                            {notification.user.email}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-xs text-slate-500 mb-3">
                      {formatDate(notification.createdAt)}
                    </p>
                    <button
                      onClick={() => handleDeleteNotification(notification._id)}
                      className="text-red-600 hover:text-red-800 text-sm font-medium"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                {!notification.isRead && (
                  <div className="inline-block px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded">
                    Unread
                  </div>
                )}
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
