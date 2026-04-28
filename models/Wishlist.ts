import mongoose, { Schema } from 'mongoose';
import { IWishlist } from '@/types';

export type WishlistDocument = IWishlist & mongoose.Document;

const wishlistSchema = new Schema<WishlistDocument>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    } as any,
    products: {
      type: [Schema.Types.ObjectId],
      ref: 'Product',
      default: [],
    } as any,
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

wishlistSchema.query.notDeleted = function (this: any) {
  return this.where({ isDeleted: { $ne: true } });
} as any;

export const Wishlist = mongoose.models.Wishlist || mongoose.model<WishlistDocument>('Wishlist', wishlistSchema);
