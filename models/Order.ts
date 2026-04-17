import mongoose, { Schema } from 'mongoose';
import { IOrder, OrderItem, OrderTimeline } from '@/types';

export type OrderDocument = IOrder & mongoose.Document;

const orderItemSchema = new Schema<OrderItem>(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    } as any,
    name: String,
    heroImage: String,
    variant: {
      size: String,
      color: String,
      material: String,
      sku: String,
    },
    quantity: Number,
    unitPrice: Number,
    currency: {
      type: String,
      enum: ['NGN', 'USD', 'GBP', 'EUR'],
    },
  },
  { _id: false }
);

const orderTimelineSchema = new Schema<OrderTimeline>(
  {
    status: String,
    message: String,
    timestamp: {
      type: Date,
      default: () => new Date(),
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    } as any,
  },
  { _id: false }
);

const orderSchema = new Schema<OrderDocument>(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    email: {
      type: String,
      required: true,
      index: true,
    },
    guestInfo: {
      name: String,
      email: String,
      phone: String,
    },
    items: {
      type: [orderItemSchema],
      required: true,
    },
    shippingAddress: {
      name: String,
      phone: String,
      street: String,
      city: String,
      state: String,
      country: String,
      postalCode: String,
    },
    subtotal: Number,
    discount: {
      type: Number,
      default: 0,
    },
    tax: {
      type: Number,
      default: 0,
    },
    shippingFee: {
      type: Number,
      default: 0,
    },
    total: Number,
    currency: {
      type: String,
      enum: ['NGN', 'USD', 'GBP', 'EUR'],
      default: 'USD',
    },
    discountCode: String,
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending',
    },
    paymentReference: String,
    paystackTransactionId: String,
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'completed', 'cancelled'],
      default: 'pending',
    },
    trackingNumber: String,
    trackingUrl: String,
    timeline: {
      type: [orderTimelineSchema],
      default: [],
    },
    notes: String,
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

orderSchema.query.notDeleted = function (this: any) {
  return this.where({ isDeleted: { $ne: true } });
} as any;

export const Order = mongoose.models.Order || mongoose.model<OrderDocument>('Order', orderSchema);
