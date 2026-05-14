'use client';

import { useState } from 'react';

interface Booking {
  _id: string;
  bookingNumber: string;
  user?: {
    name: string;
    email: string;
  };
  guestInfo?: {
    name: string;
    email: string;
  };
  service?: {
    name: string;
  };
}

interface Props {
  booking: Booking;
  onClose: () => void;
  onSend: (data: {
    subject: string;
    title: string;
    message: string;
    details?: string;
  }) => Promise<void>;
}

export default function EmailNotificationModal({
  booking,
  onClose,
  onSend,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    subject: `Booking Update - ${booking.bookingNumber}`,
    title: 'Booking Update',
    message: '',
    details: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSend(formData);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
        {/* Header */}
        <div className="bg-linear-to-r from-primary to-primary-600 text-white px-6 py-4">
          <h2 className="text-2xl font-bold">Send Email Notification</h2>
          <p className="text-sm text-primary-100 mt-1">
            To: {booking.user?.email || booking.guestInfo?.email}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Booking Info */}
          <div className="bg-slate-50 p-4 rounded-lg mb-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-slate-600">Booking Number</p>
                <p className="font-semibold text-slate-900">
                  {booking.bookingNumber}
                </p>
              </div>
              <div>
                <p className="text-slate-600">Service</p>
                <p className="font-semibold text-slate-900">
                  {booking.service?.name}
                </p>
              </div>
            </div>
          </div>

          {/* Subject */}
          <div>
            <label className="block text-sm font-medium text-slate-900 mb-2">
              Email Subject *
            </label>
            <input
              type="text"
              value={formData.subject}
              onChange={(e) =>
                setFormData({ ...formData, subject: e.target.value })
              }
              placeholder="Email subject line"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-slate-900 mb-2">
              Email Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder="Main title in the email"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>

          {/* Message */}
          <div>
            <label className="block text-sm font-medium text-slate-900 mb-2">
              Message *
            </label>
            <textarea
              value={formData.message}
              onChange={(e) =>
                setFormData({ ...formData, message: e.target.value })
              }
              placeholder="Main message for the customer"
              rows={6}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              required
            />
          </div>

          {/* Additional Details */}
          <div>
            <label className="block text-sm font-medium text-slate-900 mb-2">
              Additional Details (Optional)
            </label>
            <textarea
              value={formData.details}
              onChange={(e) =>
                setFormData({ ...formData, details: e.target.value })
              }
              placeholder="Any additional information or instructions"
              rows={4}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            />
          </div>

          {/* Preview */}
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
            <p className="text-sm font-semibold text-slate-900 mb-2">
              Preview
            </p>
            <div className="bg-white p-4 rounded border border-slate-300 text-sm">
              <p className="font-semibold text-slate-900 mb-2">
                {formData.title}
              </p>
              <p className="text-slate-700 whitespace-pre-wrap mb-2">
                {formData.message}
              </p>
              {formData.details && (
                <p className="text-slate-600 text-xs whitespace-pre-wrap">
                  {formData.details}
                </p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-6 py-2 border border-slate-300 rounded-lg text-slate-900 hover:bg-slate-50 disabled:opacity-50 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 transition-colors font-medium flex items-center gap-2"
            >
              {loading && (
                <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
              )}
              Send Email
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
