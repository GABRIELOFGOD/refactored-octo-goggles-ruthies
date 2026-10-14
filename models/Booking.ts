import mongoose, { Schema } from 'mongoose';
import { IBooking } from '@/types';

export type BookingDocument = Omit<IBooking, '_id' | 'user' | 'service'> & {
  _id: mongoose.Types.ObjectId;
  user?: mongoose.Types.ObjectId;
  service: mongoose.Types.ObjectId;
};

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

export const Booking = mongoose.models.Booking || mongoose.model<BookingDocument>('Booking', bookingSchema);
