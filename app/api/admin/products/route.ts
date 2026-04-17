import { NextRequest, NextResponse } from 'next/server';
import { Product } from '@/models/Product';
import connectToDatabase from '@/lib/mongoose';
import { ApiResponse, IProduct } from '@/types';
import { auth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    const session = await auth();

    if (!session?.user?.role || session.user.role !== 'admin') {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const page = parseInt(request.nextUrl.searchParams.get('page') || '1', 10);
    const limit = parseInt(request.nextUrl.searchParams.get('limit') || '20', 10);
    const category = request.nextUrl.searchParams.get('category');
    const status = request.nextUrl.searchParams.get('status');
    const search = request.nextUrl.searchParams.get('search');

    let query: any = { isDeleted: { $ne: true } };

    if (category) {
      query.category = category;
    }

    if (status === 'published') {
      query.published = true;
    } else if (status === 'draft') {
      query.published = false;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .populate('category')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return NextResponse.json<ApiResponse<IProduct[]>>(
      {
        success: true,
        data: products,
        meta: { total, page, limit },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get products error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    const session = await auth();

    if (!session?.user?.role || session.user.role !== 'admin') {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name, category, description, prices, images, variants, tags, featured, newArrival, published, seo } = body;

    // Generate slug
    const slug = name
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w-]/g, '');

    const product = new Product({
      name,
      slug,
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
    });

    await product.save();
    await product.populate('category');

    return NextResponse.json<ApiResponse<IProduct>>(
      {
        success: true,
        data: product,
        message: 'Product created successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create product error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Failed to create product' },
      { status: 500 }
    );
  }
}
