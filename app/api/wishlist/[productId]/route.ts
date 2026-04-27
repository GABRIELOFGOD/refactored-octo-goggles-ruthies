import { NextRequest, NextResponse } from 'next/server';
import { Wishlist } from '@/models/Wishlist';
import connectToDatabase from '@/lib/mongoose';
import { ApiResponse, IWishlist } from '@/types';
import { authenticateUser } from '@/lib/auth-helpers';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { productId: string } }
) {
  try {
    const { productId } = await params;
    await connectToDatabase();
            
    const user = await authenticateUser(request);

    const wishlist = await Wishlist.findOne({ user: user._id });

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
      (id: any) => id.toString() !== productId
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
