import mongoose, { Schema, Document } from 'mongoose';
import { IService } from '@/types';

export interface ServiceDocument extends IService, Document {}

const serviceSchema = new Schema<ServiceDocument>(
  {
    name: {
      type: String,
      required: [true, 'Please provide a service name'],
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    type: {
      type: String,
      enum: ['consultation', 'styling', 'fashion-designing'],
      required: true,
    },
    consultationType: {
      type: String,
      enum: ['bridal', 'wardrobe-audit', 'personal-shopping', 'event-styling'],
    },
    description: String,
    shortDescription: String,
    image: String,
    prices: {
      NGN: {
        type: Number,
        required: true,
      },
      USD: {
        type: Number,
        required: true,
      },
      GBP: {
        type: Number,
        required: true,
      },
      EUR: {
        type: Number,
        required: true,
      },
    },
    duration: {
      type: Number,
      required: true,
    },
    isAvailable: {
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

serviceSchema.query.notDeleted = function () {
  return this.where({ isDeleted: { $ne: true } });
};

export const Service = mongoose.models.Service || mongoose.model<ServiceDocument>('Service', serviceSchema);
