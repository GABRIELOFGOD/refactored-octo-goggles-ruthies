import { NextRequest, NextResponse } from 'next/server';
import { Cart } from '@/models/Cart';
import { Product } from '@/models/Product';
import connectToDatabase from '@/lib/mongoose';
import { ApiResponse, ICart, CartItem } from '@/types';

export async function PUT(
  request: NextRequest,
  { params }: { params: { cartId: string } }
) {
  try {
    const body = await request.json();
    await connectToDatabase();

    const cart = await Cart.findByIdAndUpdate(
      params.cartId,
      body,
      { new: true }
    ).populate({
      path: 'items.product',
      select: 'name prices heroImage',
    });

    if (!cart) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Cart not found',
        },
        { status: 404 }
      );
    }

    return NextResponse.json<ApiResponse<ICart>>(
      {
        success: true,
        data: cart,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Update cart error:', error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: 'Failed to update cart',
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { cartId: string } }
) {
  try {
    await connectToDatabase();

    const cart = await Cart.findByIdAndUpdate(
      params.cartId,
      { items: [] },
      { new: true }
    );

    if (!cart) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Cart not found',
        },
        { status: 404 }
      );
    }

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        message: 'Cart cleared',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Delete cart error:', error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: 'Failed to delete cart',
      },
      { status: 500 }
    );
  }
}

// Add item to cart
export async function POST(
  request: NextRequest,
  { params }: { params: { cartId: string } }
) {
  try {
    const body = await request.json();
    await connectToDatabase();

    const cart = await Cart.findById(params.cartId);
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
    console.error('Add to cart error:', error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: 'Failed to add item to cart',
      },
      { status: 500 }
    );
  }
}
