import { NextRequest, NextResponse } from 'next/server';
import { Cart } from '@/models/Cart';
import connectToDatabase from '@/lib/mongoose';
import { ApiResponse, ICart } from '@/types';

export async function PUT(
  request: NextRequest,
  { params }: { params: { cartId: string; productId: string } }
) {
  try {
    const { productId, cartId } = await params;
    const body = await request.json();
    await connectToDatabase();

    const cart = await Cart.findById(cartId);
    if (!cart) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Cart not found' },
        { status: 404 }
      );
    }

    const item = cart.items.find(
      (item: any) => item.product.toString() === productId
    );

    if (!item) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Item not found in cart' },
        { status: 404 }
      );
    }

    if (body.quantity > 0) {
      item.quantity = body.quantity;
    } else {
      cart.items = cart.items.filter(
        (item: any) => item.product.toString() !== productId
      );
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
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Update item error:', error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: 'Failed to update item',
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { cartId: string; productId: string } }
) {
  try {
    const { cartId, productId } = await params;
    await connectToDatabase();

    const cart = await Cart.findById(cartId);
    if (!cart) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Cart not found' },
        { status: 404 }
      );
    }

    cart.items = cart.items.filter(
      (item: any) => item.product.toString() !== productId
    );

    await cart.save();
    await cart.populate({
      path: 'items.product',
      select: 'name prices heroImage',
    });

    return NextResponse.json<ApiResponse<ICart>>(
      {
        success: true,
        data: cart,
        message: 'Item removed from cart',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Delete item error:', error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: 'Failed to remove item',
      },
      { status: 500 }
    );
  }
}
