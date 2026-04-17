import { NextRequest, NextResponse } from 'next/server';
import { Wishlist } from '@/models/Wishlist';
import connectToDatabase from '@/lib/mongoose';
import { ApiResponse, IWishlist } from '@/types';
import { auth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Unauthorized',
        },
        { status: 401 }
      );
    }

    let wishlist = await Wishlist.findOne({ user: session.user.id }).populate(
      'products',
      'name prices heroImage'
    );

    if (!wishlist) {
      wishlist = new Wishlist({ user: session.user.id, products: [] });
      await wishlist.save();
    }

    return NextResponse.json<ApiResponse<IWishlist>>(
      {
        success: true,
        data: wishlist,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get wishlist error:', error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: 'Failed to fetch wishlist',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    await connectToDatabase();

    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Unauthorized',
        },
        { status: 401 }
      );
    }

    let wishlist = await Wishlist.findOne({ user: session.user.id });

    if (!wishlist) {
      wishlist = new Wishlist({
        user: session.user.id,
        products: [body.productId],
      });
    } else {
      if (!wishlist.products.includes(body.productId)) {
        wishlist.products.push(body.productId);
      }
    }

    await wishlist.save();
    await wishlist.populate('products', 'name prices heroImage');

    return NextResponse.json<ApiResponse<IWishlist>>(
      {
        success: true,
        data: wishlist,
        message: 'Added to wishlist',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Add to wishlist error:', error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: 'Failed to add to wishlist',
      },
      { status: 500 }
    );
  }
}
