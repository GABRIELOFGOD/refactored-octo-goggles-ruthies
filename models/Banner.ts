import mongoose, { Schema } from 'mongoose';
import { IBanner } from '@/types';

export type BannerDocument = Omit<IBanner, '_id'> & {
  _id: mongoose.Types.ObjectId;
};

const bannerSchema = new Schema<BannerDocument>(
  {
    title: {
      type: String,
      required: true,
    },
    subtitle: String,
    ctaText: String,
    ctaLink: String,
    image: {
      type: String,
      required: true,
    },
    mobileImage: String,
    position: {
      type: String,
      enum: ['hero', 'mid-page', 'sidebar'],
      required: true,
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    startDate: Date,
    endDate: Date,
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

export const Banner = mongoose.models.Banner || mongoose.model<BannerDocument>('Banner', bannerSchema);
