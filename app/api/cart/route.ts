import { NextRequest, NextResponse } from 'next/server';
import { Cart } from '@/models/Cart';
import connectToDatabase from '@/lib/mongoose';
import { ApiResponse, ICart } from '@/types';
import { auth } from '@/lib/auth';
import { authenticateUser } from '@/lib/auth-helpers';

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    const session = await auth();
    const sessionId = request.nextUrl.searchParams.get('sessionId');

    let cart;

    if (session?.user?.id) {
      // Logged-in user
      cart = await Cart.findOne({ user: session.user.id }).populate({
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
    const user = await authenticateUser(request);
    const userHasCart = await Cart.findOne({ user });
    if (!userHasCart) {
      const newCart = await Cart.create({
        user, item: []
      });
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

    // SEPARATED TO BE DELETED
    // const body = await request.json();

    // const session = await auth();

    // const cartData: any = {
    //   items: body.items || [],
    // };

    // if (session?.user?.id) {
    //   cartData.user = session.user.id;
    // } else if (body.sessionId) {
    //   cartData.sessionId = body.sessionId;
    // }

    // let cart = await Cart.findOne(
    //   session?.user?.id ? { user: session.user.id } : { sessionId: body.sessionId }
    // );

    // if (!cart) {
    //   cart = new Cart(cartData);
    //   await cart.save();
    // }

    // return NextResponse.json<ApiResponse>(
    //   {
    //     success: true,
    //     data: cart,
    //     message: 'Cart created',
    //   },
    //   { status: 201 }
    // );
  } catch (error: any) {
    console.error('Create cart error:', error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: error.error || 'Failed to create cart',
      },
      { status: 500 }
    );
  }
}
