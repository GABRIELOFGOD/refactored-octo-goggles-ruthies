import mongoose, { Schema } from 'mongoose';
import { INotification } from '@/types';

export type NotificationDocument = Omit<
  INotification,
  '_id' | 'user' | 'booking' | 'order'
> & {
  _id: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  booking?: mongoose.Types.ObjectId;
  order?: mongoose.Types.ObjectId;
};

const notificationSchema = new Schema<NotificationDocument>(
  {
    type: {
      type: String,
      enum: ['service', 'order'],
      required: true,
      index: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    booking: {
      type: Schema.Types.ObjectId,
      ref: 'Booking',
      sparse: true,
    },
    order: {
      type: Schema.Types.ObjectId,
      ref: 'Order',
      sparse: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    description: String,
    actionUrl: String,
    icon: {
      type: String,
      enum: ['booking', 'order', 'payment', 'delivery', 'alert', 'info'],
      default: 'info',
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
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

export const Notification =
  mongoose.models.Notification ||
  mongoose.model<NotificationDocument>('Notification', notificationSchema);
