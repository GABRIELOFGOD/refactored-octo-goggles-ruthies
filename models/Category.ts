import mongoose, { Schema, Document } from 'mongoose';
import { ICategory } from '@/types';

export interface CategoryDocument extends ICategory, Document {}

const categorySchema = new Schema<CategoryDocument>(
  {
    name: {
      type: String,
      required: [true, 'Please provide a category name'],
      unique: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    description: String,
    image: String,
    parentCategory: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
    },
    sortOrder: {
      type: Number,
      default: 0,
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

categorySchema.query.notDeleted = function () {
  return this.where({ isDeleted: { $ne: true } });
};

export const Category = mongoose.models.Category || mongoose.model<CategoryDocument>('Category', categorySchema);
