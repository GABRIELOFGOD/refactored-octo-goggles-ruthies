import { NextRequest, NextResponse } from 'next/server';
import { Cart } from '@/models/Cart';
import connectToDatabase from '@/lib/mongoose';
import { ApiResponse, ICart } from '@/types';

export async function POST(
  request: NextRequest,
  { params }: { params: { cartId: string } }
) {
  try {
    const { cartId } = await params;
    const body = await request.json();
    await connectToDatabase();

    const cart = await Cart.findById(cartId);
    if (!cart) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Cart not found' },
        { status: 404 }
      );
    }

    // Check if item already in cart
    const existingItem = cart.items.find(
      (item: any) =>
        item.product.toString() === body.product &&
        item.variant?.sku === body.variant?.sku
    );

    if (existingItem) {
      existingItem.quantity += body.quantity || 1;
    } else {
      cart.items.push(body);
    }

    await cart.save();
    await cart.populate({
      path: 'items.product',
      select: 'name prices heroImage',
    });

    return NextResponse.json<ApiResponse<ICart>>(
      {
        success: true,
        data: cart,
        message: 'Item added to cart',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Add item to cart error:', error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: 'Failed to add item to cart',
      },
      { status: 500 }
    );
  }
}
