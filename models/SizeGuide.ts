import mongoose, { Schema } from 'mongoose';
import { ISizeGuide, SizeChartRow } from '@/types';

export type SizeGuideDocument = Omit<ISizeGuide, '_id'> & {
  _id: mongoose.Types.ObjectId;
};

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

export const SizeGuide = mongoose.models.SizeGuide || mongoose.model<SizeGuideDocument>('SizeGuide', sizeGuideSchema);
