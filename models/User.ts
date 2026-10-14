import mongoose, { Schema, Document } from 'mongoose';
import { IUser } from '@/types';

type UserDocumentType = Omit<IUser, '_id'>;

export interface UserDocument extends UserDocumentType, Document {
  _id: mongoose.Types.ObjectId;
}

const userSchema = new Schema<UserDocument>(
  {
    name: {
      type: String,
      required: [true, 'Please provide your name'],
    },
    email: {
      type: String,
      required: [true, 'Please provide your email'],
      unique: true,
      lowercase: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email'],
    },
    passwordHash: {
      type: String,
      select: false,
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    avatar: String,
    phone: String,
    address: {
      street: String,
      city: String,
      state: String,
      country: String,
      postalCode: String,
    },
    preferredCurrency: {
      type: String,
      enum: ['NGN', 'USD', 'GBP', 'EUR'],
      default: 'USD',
    },
    preferredLanguage: {
      type: String,
      enum: ['en', 'fr'],
      default: 'en',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLoginAt: Date,
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

export const User = mongoose.models.User || mongoose.model<UserDocument>('User', userSchema);
