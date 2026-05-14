'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface Notification {
  _id: string;
  type: 'service' | 'order';
  title: string;
  message: string;
  description?: string;
  isRead: boolean;
  icon: string;
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

export default function NotificationsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [unreadCount, setUnreadCount] = useState(0);

  // Redirect if not authenticated
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
        });

        const response = await fetch(`/api/notifications?${query}`);

        if (!response.ok) {
          if (response.status === 401) {
            router.push('/login');
            return;
          }
          throw new Error('Failed to fetch notifications');
        }

        const data: ApiResponse = await response.json();
        setNotifications(data.data);
        setTotal(data.pagination.total);

        // Calculate unread count
        const unread = data.data.filter((n) => !n.isRead).length;
        setUnreadCount(unread);
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
  }, [page, typeFilter, session?.user?.id, router]);

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isRead: true }),
      });

      if (!response.ok) {
        throw new Error('Failed to update notification');
      }

      // Update local state
      setNotifications((prev) =>
        prev.map((n) =>
          n._id === notificationId ? { ...n, isRead: true } : n
        )
      );

      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error updating notification:', error);
      toast.error('Failed to update notification');
    }
  };

  const handleDeleteNotification = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: 'DELETE',
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
        return 'border-blue-200 bg-blue-50';
      case 'order':
        return 'border-purple-200 bg-purple-50';
      default:
        return 'border-gray-200 bg-gray-50';
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
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-4xl font-bold text-slate-900">Notifications</h1>
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                {unreadCount} Unread
              </span>
            )}
          </div>
          <p className="text-slate-600">
            Stay updated with your service and order notifications
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="w-full md:w-64">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Filter by Type
              </label>
              <select
                value={typeFilter}
                onChange={(e) => {
                  setTypeFilter(e.target.value);
                  setPage(1);
                }}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">All Notifications</option>
                <option value="service">Service Notifications</option>
                <option value="order">Order Notifications</option>
              </select>
            </div>

            <div className="text-sm text-slate-600">
              Total: <span className="font-semibold text-slate-900">{total}</span>
            </div>
          </div>
        </div>

        {/* Notifications List */}
        <div className="space-y-4">
          {notifications.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <div className="text-slate-500">
                <p className="text-lg font-medium mb-2">No notifications yet</p>
                <p className="text-sm">
                  {typeFilter
                    ? 'No notifications of this type'
                    : 'You will receive notifications about your bookings and orders here'}
                </p>
              </div>
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification._id}
                className={`border-l-4 rounded-lg shadow-md hover:shadow-lg transition-all ${
                  notification.isRead
                    ? 'border-slate-200 bg-slate-50'
                    : 'border-primary bg-white'
                }`}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start gap-4 flex-1">
                      <span className="text-2xl">
                        {getTypeIcon(notification.type)}
                      </span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-semibold text-slate-900">
                            {notification.title}
                          </h3>
                          {!notification.isRead && (
                            <span className="inline-block w-2 h-2 bg-primary rounded-full"></span>
                          )}
                        </div>
                        <p className="text-slate-700 mb-2">
                          {notification.message}
                        </p>
                        {notification.description && (
                          <p className="text-sm text-slate-600 mb-2">
                            {notification.description}
                          </p>
                        )}
                        <p className="text-xs text-slate-500">
                          {formatDate(notification.createdAt)}
                        </p>
                      </div>
                    </div>

                    <div className="ml-4">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                          notification.type === 'service'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-purple-100 text-purple-800'
                        }`}
                      >
                        {notification.type === 'service'
                          ? 'Service'
                          : 'Order'}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-3 justify-end">
                    {!notification.isRead && (
                      <button
                        onClick={() => handleMarkAsRead(notification._id)}
                        className="text-sm font-medium text-primary hover:text-primary-600 transition-colors"
                      >
                        Mark as Read
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteNotification(notification._id)}
                      className="text-sm font-medium text-red-600 hover:text-red-800 transition-colors"
                    >
                      Delete
                    </button>
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
