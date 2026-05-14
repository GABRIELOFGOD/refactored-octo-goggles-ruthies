import mongoose, { Schema, Document } from 'mongoose';
import { INotification } from '@/types';

export interface NotificationDocument extends INotification, Document {}

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

notificationSchema.query.notDeleted = function () {
  return this.where({ isDeleted: { $ne: true } });
};

export const Notification =
  mongoose.models.Notification ||
  mongoose.model<NotificationDocument>('Notification', notificationSchema);
