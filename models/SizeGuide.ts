import mongoose, { Schema, Document } from 'mongoose';
import { ISizeGuide, SizeChartRow } from '@/types';

export interface SizeGuideDocument extends ISizeGuide, Document {}

const sizeChartRowSchema = new Schema<SizeChartRow>({
  size: String,
  chest_cm: Number,
  waist_cm: Number,
  hips_cm: Number,
  chest_in: Number,
  waist_in: Number,
  hips_in: Number,
});

const sizeGuideSchema = new Schema<SizeGuideDocument>(
  {
    title: {
      type: String,
      required: true,
    },
    description: String,
    chart: {
      type: [sizeChartRowSchema],
      default: [],
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
    deletedAt: Date,
  },
  {
    timestamps: { createdAt: false, updatedAt: 'updatedAt' },
  }
);

sizeGuideSchema.query.notDeleted = function () {
  return this.where({ isDeleted: { $ne: true } });
};

export const SizeGuide = mongoose.models.SizeGuide || mongoose.model<SizeGuideDocument>('SizeGuide', sizeGuideSchema);
