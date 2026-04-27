import { NextRequest, NextResponse } from 'next/server';
import { Product } from '@/models/Product';
import connectToDatabase from '@/lib/mongoose';
import { ApiResponse, IProduct } from '@/types';
import { authenticateUser } from '@/lib/auth-helpers';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;
    await connectToDatabase();

    console.log("Product ID", id);
            
    const user = await authenticateUser(request);
    if (!user || user.role !== "admin") return NextResponse.json<ApiResponse>({ success: false, error: "Unauthorized" }, { status: 403 });

    const product = await Product.findById(id).populate('category');

    if (!product || product.isDeleted) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json<ApiResponse<IProduct>>(
      { success: true, data: product },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get product error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Failed to fetch product' },
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
    await connectToDatabase();
        
    const user = await authenticateUser(request);
    if (!user || user.role !== "admin") return NextResponse.json<ApiResponse>({ success: false, error: "Unauthorized" }, { status: 403 });

    const body = await request.json();
    const { name, category, description, prices, images, variants, tags, featured, newArrival, published, seo } = body;

    const product = await Product.findByIdAndUpdate(
      id,
      {
        name,
        category,
        description,
        prices,
        images: {
          hero: images?.hero,
          gallery: images?.gallery || [],
        },
        variants: variants || [],
        tags: tags || [],
        featured: featured || false,
        newArrival: newArrival || false,
        published: published || false,
        seo: seo || {},
      },
      { new: true }
    ).populate('category');

    if (!product) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json<ApiResponse<IProduct>>(
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
      { success: false, error: 'Failed to update product' },
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
    await connectToDatabase();
        
    const user = await authenticateUser(request);
    if (!user || user.role !== "admin") return NextResponse.json<ApiResponse>({ success: false, error: "Unauthorized" }, { status: 403 });

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
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json<ApiResponse>(
      { success: true, message: 'Product deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Delete product error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Failed to delete product' },
      { status: 500 }
    );
  }
}
