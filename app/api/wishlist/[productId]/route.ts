import { NextRequest, NextResponse } from 'next/server';
import { Wishlist } from '@/models/Wishlist';
import connectToDatabase from '@/lib/mongoose';
import { ApiResponse, IWishlist } from '@/types';
import { auth } from '@/lib/auth';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { productId: string } }
) {
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

    const wishlist = await Wishlist.findOne({ user: session.user.id });

    if (!wishlist) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Wishlist not found',
        },
        { status: 404 }
      );
    }

    wishlist.products = wishlist.products.filter(
      (id: any) => id.toString() !== params.productId
    );

    await wishlist.save();
    await wishlist.populate('products', 'name prices heroImage');

    return NextResponse.json<ApiResponse<IWishlist>>(
      {
        success: true,
        data: wishlist,
        message: 'Removed from wishlist',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Remove from wishlist error:', error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: 'Failed to remove from wishlist',
      },
      { status: 500 }
    );
  }
}
