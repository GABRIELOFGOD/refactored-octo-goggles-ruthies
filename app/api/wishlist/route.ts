import { NextRequest, NextResponse } from 'next/server';
import { Wishlist } from '@/models/Wishlist';
import connectToDatabase from '@/lib/mongoose';
import { ApiResponse, IWishlist } from '@/types';
import { authenticateUser, AuthenticationError } from '@/lib/auth-helpers';

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    const user = await authenticateUser(request);

    let wishlist = await Wishlist.findOne({ user: user._id }).populate(
      'products',
      'name prices heroImage'
    );

    if (!wishlist) {
      wishlist = new Wishlist({ user: user._id, products: [] });
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
    if (error instanceof AuthenticationError) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
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

    const user = await authenticateUser(request);

    let wishlist = await Wishlist.findOne({ user: user._id });

    if (!wishlist) {
      wishlist = new Wishlist({
        user: user._id,
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
    if (error instanceof AuthenticationError) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
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
