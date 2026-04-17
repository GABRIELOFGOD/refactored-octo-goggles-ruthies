import mongoose, { Schema } from 'mongoose';
import { INewsletterCampaign } from '@/types';

export type NewsletterCampaignDocument = INewsletterCampaign & mongoose.Document;

const newsletterCampaignSchema = new Schema<NewsletterCampaignDocument>(
  {
    subject: {
      type: String,
      required: true,
    },
    previewText: String,
    htmlContent: {
      type: String,
      required: true,
    },
    sentAt: Date,
    recipientCount: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['draft', 'sending', 'sent', 'failed'],
      default: 'draft',
    },
    sentBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    } as any,
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

newsletterCampaignSchema.query.notDeleted = function (this: any) {
  return this.where({ isDeleted: { $ne: true } });
} as any;

export const NewsletterCampaign = mongoose.models.NewsletterCampaign || mongoose.model<NewsletterCampaignDocument>('NewsletterCampaign', newsletterCampaignSchema);
