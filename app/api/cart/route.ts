import { NextRequest, NextResponse } from 'next/server';
import { Cart } from '@/models/Cart';
import connectToDatabase from '@/lib/mongoose';
import { ApiResponse, ICart } from '@/types';
import { authenticateUser, AuthenticationError } from '@/lib/auth-helpers';

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    const user = request.headers.get('authorization')
      ? await authenticateUser(request)
      : null;
    const sessionId = request.nextUrl.searchParams.get('sessionId');

    let cart;

    if (user?._id) {
      // Logged-in user
      cart = await Cart.findOne({ user: user._id }).populate({
        path: 'items.product',
        select: 'name prices heroImage',
      });
    } else if (sessionId) {
      // Guest user
      cart = await Cart.findOne({ sessionId }).populate({
        path: 'items.product',
        select: 'name prices heroImage',
      });
    }

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
    if (error instanceof AuthenticationError) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
    console.error('Get cart error:', error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: 'Failed to fetch cart',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    const user = request.headers.get('authorization')
      ? await authenticateUser(request)
      : null;
    const body = user ? {} : await request.json();
    const filter = user?._id
      ? { user: user._id }
      : { sessionId: body.sessionId };
    if (!user && !body.sessionId) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Session ID is required' },
        { status: 400 }
      );
    }

    const userHasCart = await Cart.findOne(filter);
    if (!userHasCart) {
      const newCart = await Cart.create({ ...filter, items: [] });
      return NextResponse.json<ApiResponse>(
        {
          success: true,
          data: newCart,
          message: 'Cart created',
        },
        { status: 201 }
      );
    }

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: userHasCart,
        message: 'User already has cart',
      },
      { status: 200 }
    );

  } catch (error) {
    if (error instanceof AuthenticationError) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
    console.error('Create cart error:', error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: 'Failed to create cart',
      },
      { status: 500 }
    );
  }
}
