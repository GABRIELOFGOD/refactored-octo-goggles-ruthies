import mongoose, { Schema } from 'mongoose';
import { ICategory } from '@/types';

export type CategoryDocument = Omit<ICategory, '_id' | 'parentCategory'> & {
  _id: mongoose.Types.ObjectId;
  parentCategory?: mongoose.Types.ObjectId;
};

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

export const Category = mongoose.models.Category || mongoose.model<CategoryDocument>('Category', categorySchema);
