import mongoose, { Schema, Document } from 'mongoose';
import { IProduct, ProductVariant } from '@/types';

export interface ProductDocument extends IProduct, Document {}

const productVariantSchema = new Schema<ProductVariant>({
  size: {
    type: String,
    required: true,
  },
  color: String,
  material: String,
  stock: {
    type: Number,
    required: true,
    default: 0,
  },
  sku: {
    type: String,
    required: true,
  },
});

const productSchema = new Schema<ProductDocument>(
  {
    name: {
      type: String,
      required: [true, 'Please provide a product name'],
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    description: String,
    category: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },
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
    heroImage: {
      type: String,
      required: true,
    },
    gallery: {
      type: [String],
      default: [],
    },
    variants: {
      type: [productVariantSchema],
      default: [],
    },
    tags: {
      type: [String],
      default: [],
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isNewArrival: {
      type: Boolean,
      default: false,
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    metaTitle: String,
    metaDescription: String,
    totalSold: {
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

productSchema.query.notDeleted = function () {
  return this.where({ isDeleted: { $ne: true } });
};

export const Product = mongoose.models.Product || mongoose.model<ProductDocument>('Product', productSchema);
