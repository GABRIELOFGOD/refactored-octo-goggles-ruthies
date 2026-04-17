import mongoose, { Schema } from 'mongoose';
import { INewsletter } from '@/types';

export type NewsletterDocument = INewsletter & mongoose.Document;

const newsletterSchema = new Schema<NewsletterDocument>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    name: String,
    isSubscribed: {
      type: Boolean,
      default: true,
    },
    subscribedAt: {
      type: Date,
      default: () => new Date(),
    },
    unsubscribedAt: Date,
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
    deletedAt: Date,
  },
  {
    timestamps: { createdAt: false, updatedAt: false },
  }
);

newsletterSchema.query.notDeleted = function (this: any) {
  return this.where({ isDeleted: { $ne: true } });
} as any;

export const Newsletter = mongoose.models.Newsletter || mongoose.model<NewsletterDocument>('Newsletter', newsletterSchema);
