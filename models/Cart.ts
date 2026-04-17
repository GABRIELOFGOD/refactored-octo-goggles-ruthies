import mongoose, { Schema, Document } from 'mongoose';
import { ICart, CartItem } from '@/types';

export interface CartDocument extends ICart, Document {}

const cartItemSchema = new Schema<CartItem>({
  product: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  variant: {
    size: String,
    color: String,
    material: String,
    sku: String,
  },
  quantity: {
    type: Number,
    required: true,
    default: 1,
  },
});

const cartSchema = new Schema<CartDocument>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      sparse: true,
    },
    items: {
      type: [cartItemSchema],
      default: [],
    },
  },
  {
    timestamps: { createdAt: false, updatedAt: 'updatedAt' },
  }
);

export const Cart = mongoose.models.Cart || mongoose.model<CartDocument>('Cart', cartSchema);
