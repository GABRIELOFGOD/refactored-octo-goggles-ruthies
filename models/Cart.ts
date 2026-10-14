import mongoose, { Schema } from 'mongoose';
import { ICart, CartItem } from '@/types';

type CartItemDocument = Omit<CartItem, 'product'> & {
  product: mongoose.Types.ObjectId;
};

export type CartDocument = Omit<ICart, '_id' | 'user' | 'items'> & {
  _id: mongoose.Types.ObjectId;
  user?: mongoose.Types.ObjectId;
  items: CartItemDocument[];
};

const cartItemSchema = new Schema<CartItemDocument>({
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

export const Cart = mongoose.models.Cart || mongoose.model<CartDocument>('Cart', cartSchema);
