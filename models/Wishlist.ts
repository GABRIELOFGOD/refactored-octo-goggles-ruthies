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
  },
  {
    timestamps: { createdAt: false, updatedAt: 'updatedAt' },
  }
);

export const Wishlist = mongoose.models.Wishlist || mongoose.model<WishlistDocument>('Wishlist', wishlistSchema);
