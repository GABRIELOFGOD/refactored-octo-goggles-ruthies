import { NextRequest, NextResponse } from 'next/server';
import { Product } from '@/models/Product';
import connectToDatabase from '@/lib/mongoose';
import { ApiResponse, IProduct } from '@/types';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();

    // Try to find by ID or slug
    let product = await Product.findOne({
      $or: [
        { _id: params.id },
        { slug: params.id },
      ],
      isDeleted: { $ne: true },
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
    // TODO: Add admin authentication
    const body = await request.json();
    await connectToDatabase();

    const product = await Product.findByIdAndUpdate(params.id, body, {
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
    // TODO: Add admin authentication
    await connectToDatabase();

    const product = await Product.findByIdAndUpdate(
      params.id,
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
