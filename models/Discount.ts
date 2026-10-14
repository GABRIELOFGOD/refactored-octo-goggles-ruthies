import mongoose, { Schema } from 'mongoose';
import { IDiscount } from '@/types';

export type DiscountDocument = Omit<IDiscount, '_id' | 'usedBy'> & {
  _id: mongoose.Types.ObjectId;
  usedBy: mongoose.Types.ObjectId[];
};

const discountSchema = new Schema<DiscountDocument>(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
    },
    type: {
      type: String,
      enum: ['percentage', 'fixed'],
      required: true,
    },
    value: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      enum: ['NGN', 'USD', 'GBP', 'EUR', 'all'],
      default: 'all',
    },
    minimumOrderValue: {
      type: Number,
      default: 0,
    },
    maxUsageCount: Number,
    usedCount: {
      type: Number,
      default: 0,
    },
    usedBy: {
      type: [Schema.Types.ObjectId],
      ref: 'User',
      default: [],
    },
    validFrom: {
      type: Date,
      required: true,
    },
    validUntil: Date,
    isActive: {
      type: Boolean,
      default: true,
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

export const Discount = mongoose.models.Discount || mongoose.model<DiscountDocument>('Discount', discountSchema);
