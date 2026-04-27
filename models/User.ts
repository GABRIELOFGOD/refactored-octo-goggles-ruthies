import mongoose, { Schema, Document, Query } from 'mongoose';
import { IUser } from '@/types';

interface UserQueryHelpers {
  notDeleted(): Query<any, UserDocument> & UserQueryHelpers;
}
export interface UserDocument extends IUser, Document {}

const userSchema = new Schema<UserDocument, mongoose.Model<UserDocument, UserQueryHelpers>, {}, UserQueryHelpers>(
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

// Soft delete middleware
userSchema.query.notDeleted = function (this: Query<any, UserDocument> & UserQueryHelpers) {
  return this.where({ isDeleted: { $ne: true } });
};

export const User = mongoose.models.User || mongoose.model<UserDocument>('User', userSchema);
