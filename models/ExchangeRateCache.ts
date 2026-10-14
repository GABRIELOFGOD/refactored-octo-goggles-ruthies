import mongoose, { Schema } from 'mongoose';
import { IExchangeRateCache } from '@/types';

export type ExchangeRateCacheDocument = Omit<IExchangeRateCache, '_id'> & {
  _id: mongoose.Types.ObjectId;
};

const exchangeRateCacheSchema = new Schema<ExchangeRateCacheDocument>(
  {
    baseCurrency: {
      type: String,
      default: 'USD',
    },
    rates: {
      NGN: Number,
      GBP: Number,
      EUR: Number,
      USD: {
        type: Number,
        default: 1,
      },
    },
    fetchedAt: {
      type: Date,
      default: () => new Date(),
      expires: 21600, // 6 hours TTL
    },
  },
  {
    timestamps: false,
  }
);

export const ExchangeRateCache = mongoose.models.ExchangeRateCache || mongoose.model<ExchangeRateCacheDocument>('ExchangeRateCache', exchangeRateCacheSchema);
