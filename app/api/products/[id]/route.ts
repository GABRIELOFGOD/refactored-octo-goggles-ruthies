import { NextRequest, NextResponse } from 'next/server';
import { Product } from '@/models/Product';
import connectToDatabase from '@/lib/mongoose';
import { ApiResponse, IProduct } from '@/types';
import { authenticateUser } from '@/lib/auth-helpers';
import { isValidObjectId } from 'mongoose';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;
    console.log('Fetched product slug:', id);
    await connectToDatabase();

    let product: IProduct | null = null;
    if (id && isValidObjectId(id)) {
      product = await Product.findOne({
        _id: id,
        isDeleted: { $ne: true },
      }).populate('category');
    } else {
      product = await Product.findOne({
      slug: id,
      isDeleted: { $ne: true },
    }).populate('category');
    }

    if (!product) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Product not found',
        },
        { status: 404 }
      );
    }

    return NextResponse.json<ApiResponse<IProduct>>(
      {
        success: true,
        data: product,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get product error:', error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: 'Failed to fetch product',
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;
    // TODO: Add admin authentication
    const body = await request.json();
    await connectToDatabase();

    const user = await authenticateUser(request);
    if (!user || user.role === "admin") return NextResponse.json<ApiResponse>({ success: false, error: "Unauthorized" });

    const product = await Product.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    }).populate('category');

    if (!product) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Product not found',
        },
        { status: 404 }
      );
    }

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: product,
        message: 'Product updated successfully',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Update product error:', error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: 'Failed to update product',
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;
    // TODO: Add admin authentication
    await connectToDatabase();

    const user = await authenticateUser(request);
    if (!user || user.role === "admin") return NextResponse.json<ApiResponse>({ success: false, error: "Unauthorized" });

    const product = await Product.findByIdAndUpdate(
      id,
      {
        isDeleted: true,
        deletedAt: new Date(),
      },
      { new: true }
    );

    if (!product) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Product not found',
        },
        { status: 404 }
      );
    }

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        message: 'Product deleted successfully',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Delete product error:', error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: 'Failed to delete product',
      },
      { status: 500 }
    );
  }
}
