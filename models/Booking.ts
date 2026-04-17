import mongoose, { Schema, Document } from 'mongoose';
import { IBooking } from '@/types';

export interface BookingDocument extends IBooking, Document {}

const bookingSchema = new Schema<BookingDocument>(
  {
    bookingNumber: {
      type: String,
      required: true,
      unique: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    guestInfo: {
      name: String,
      email: String,
      phone: String,
    },
    service: {
      type: Schema.Types.ObjectId,
      ref: 'Service',
      required: true,
    },
    scheduledDate: {
      type: Date,
      required: true,
    },
    scheduledTime: String,
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'completed', 'cancelled'],
      default: 'pending',
    },
    notes: String,
    adminNotes: String,
    total: Number,
    currency: {
      type: String,
      enum: ['NGN', 'USD', 'GBP', 'EUR'],
      default: 'USD',
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed'],
      default: 'pending',
    },
    paymentReference: String,
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
    deletedAt: Date,
  },
  {
    timestamps: true,
  }
);

bookingSchema.query.notDeleted = function () {
  return this.where({ isDeleted: { $ne: true } });
};

export const Booking = mongoose.models.Booking || mongoose.model<BookingDocument>('Booking', bookingSchema);
