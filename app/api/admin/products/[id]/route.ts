import { NextRequest, NextResponse } from 'next/server';
import { Product } from '@/models/Product';
import connectToDatabase from '@/lib/mongoose';
import { ApiResponse, IProduct } from '@/types';
import { authenticateUser } from '@/lib/auth-helpers';
import { Category } from '@/models/Category';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectToDatabase();
        
    const user = await authenticateUser(request);
    if (!user || user.role !== "admin") return NextResponse.json<ApiResponse>({ success: false, error: "Unauthorized" }, { status: 403 });

    const body = await request.json();
    const product = await Product.findById(id);

    if (!product) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    const categoryValue = body.category;
    const categoryId = typeof categoryValue === 'object'
      ? categoryValue?._id
      : categoryValue;
    if (categoryId) {
      const category = await Category.findById(categoryId);
      if (!category || category.isDeleted) {
        return NextResponse.json<ApiResponse>(
          { success: false, error: 'Invalid product category.' },
          { status: 400 }
        );
      }
      product.category = category._id.toString();
    }

    product.name = body.name ?? product.name;
    product.slug = body.slug ?? product.slug;
    product.description = body.description ?? product.description;
    product.prices = body.prices ?? product.prices;
    product.heroImage = body.heroImage ?? body.images?.hero ?? product.heroImage;
    product.gallery = body.gallery ?? body.images?.gallery ?? product.gallery;
    product.photoCredits = body.photoCredits ?? product.photoCredits;
    product.variants = body.variants ?? product.variants;
    product.tags = body.tags ?? product.tags;
    product.isFeatured = body.isFeatured ?? body.featured ?? product.isFeatured;
    product.isNewArrival = body.isNewArrival ?? body.newArrival ?? product.isNewArrival;
    product.isPublished = body.isPublished ?? body.published ?? product.isPublished;
    product.metaTitle = body.metaTitle ?? body.seo?.title ?? product.metaTitle;
    product.metaDescription = body.metaDescription ?? body.seo?.description ?? product.metaDescription;

    await product.save();
    await product.populate('category');

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
  { params }: { params: Promise<{ id: string }> }
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
