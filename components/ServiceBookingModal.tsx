'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { toast } from 'sonner';
import { IService } from '@/types';
import { useAuth } from '@/provider/auth-provider';
import { useLanguage } from '@/context/LanguageContext';
import { formatPrice, t } from '@/lib/i18n';
import { useCurrency } from '@/context/CurrencyContext';

interface ServiceBookingModalProps {
  isOpen: boolean;
  service: IService | null;
  onClose: () => void;
  onSuccess?: () => void;
}

export const ServiceBookingModal: React.FC<ServiceBookingModalProps> = ({
  isOpen,
  service,
  onClose,
  onSuccess,
}) => {
  const { user } = useAuth();
  const { language } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [note, setNote] = useState('');

  const { currency } = useCurrency();

  if (!isOpen || !service) return null;

  // Generate available time slots (9 AM to 5 PM in 1-hour intervals)
  const timeSlots = Array.from({ length: 9 }, (_, i) => {
    const hour = 9 + i;
    return `${String(hour).padStart(2, '0')}:00`;
  });

  // Get minimum date (today or tomorrow if time is past)
  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  // Get maximum date (30 days from now)
  const getMaxDate = () => {
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 30);
    return maxDate.toISOString().split('T')[0];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedDate || !selectedTime) {
      toast.error(t(language, 'common.error'));
      return;
    }

    if (!user) {
      toast.error('Please login to book a service');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
        },
        body: JSON.stringify({
          serviceId: service._id,
          scheduledDate: selectedDate,
          scheduledTime: selectedTime,
          notes: note,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || 'Failed to book service');
        return;
      }

      toast.success('Service booked successfully!');
      setSelectedDate('');
      setSelectedTime('');
      setNote('');
      onClose();
      onSuccess?.();
    } catch (error) {
      console.error('Booking error:', error);
      toast.error('Failed to book service');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed h-screen inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white h-full overflow-y-auto rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-200">
          <h2 className="text-xl font-bold text-primary">Book Service</h2>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Service Name */}
          <div>
            <label className="block text-sm font-semibold text-primary mb-2">Service</label>
            <input
              type="text"
              value={service.name}
              disabled
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg bg-neutral-50 text-neutral-700"
            />
          </div>

          {/* Service Duration */}
          <div>
            <label className="block text-sm font-semibold text-primary mb-2">Duration</label>
            <input
              type="text"
              value={`${service.duration} minutes`}
              disabled
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg bg-neutral-50 text-neutral-700"
            />
          </div>

          {/* Service Price */}
          {service.prices && Object.values(service.prices).some(p => p > 0) ? (
            <div>
              <label className="block text-sm font-semibold text-primary mb-2">Price</label>
              <input
                type="text"
                value={formatPrice(service.prices[currency as keyof typeof service.prices], currency) || 'Free'}
                disabled
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg bg-neutral-50 text-neutral-700"
              />
            </div>
          ) : (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm font-medium text-green-700">✓ Free Service</p>
            </div>
          )}

          {/* Date Picker */}
          <div>
            <label className="block text-sm font-semibold text-primary mb-2">
              Preferred Date
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              min={getMinDate()}
              max={getMaxDate()}
              required
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
            />
          </div>

          {/* Time Picker */}
          <div>
            <label className="block text-sm font-semibold text-primary mb-2">
              Preferred Time
            </label>
            <select
              value={selectedTime}
              onChange={(e) => setSelectedTime(e.target.value)}
              required
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
            >
              <option value="">Select a time</option>
              {timeSlots.map((time) => (
                <option key={time} value={time}>
                  {time}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-primary mb-2">Note</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add any special requests or notes..."
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
              rows={4}
            />
          </div>

          {/* Note */}
          <p className="text-xs text-neutral-600">
            Available time slots: 9:00 AM - 5:00 PM (local time). Each session is {service.duration} minutes.
          </p>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-neutral-300 rounded-lg text-neutral-700 font-medium hover:bg-neutral-50 transition-colors"
            >
              {t(language, 'common.cancel')}
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-secondary text-white rounded-lg font-medium hover:bg-secondary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? t(language, 'common.loading') : 'Book Now'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
