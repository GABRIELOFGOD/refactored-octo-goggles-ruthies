import { NextRequest, NextResponse } from 'next/server';
import { Product } from '@/models/Product';
import connectToDatabase from '@/lib/mongoose';
import { ApiResponse, IProduct } from '@/types';

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    const searchParams = request.nextUrl.searchParams;
    const ids = searchParams.get('ids');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '12', 10);
    const featured = searchParams.get('featured');
    const newArrival = searchParams.get('newArrival');
    const category = searchParams.get('category');
    const search = searchParams.get('search');

    let query: any = { isDeleted: { $ne: true }, isPublished: true };

    // Support fetching by IDs (for wishlist)
    if (ids) {
      const idArray = ids.split(',');
      query._id = { $in: idArray };
    } else {
      if (featured === 'true') {
        query.isFeatured = true;
      }
      if (newArrival === 'true') {
        query.isNewArrival = true;
      }
      if (category) {
        query.category = category;
      }
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { tags: { $in: [new RegExp(search, 'i')] } },
        ];
      }
    }

    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .populate('category')
      .limit(limit)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    return NextResponse.json<ApiResponse<IProduct[]>>(
      {
        success: true,
        data: products,
        meta: {
          total,
          page,
          limit,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get products error:', error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: 'Failed to fetch products',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // TODO: Add authentication check for admin
    const body = await request.json();
    await connectToDatabase();

    const product = new Product(body);
    await product.save();
    await product.populate('category');

    return NextResponse.json<ApiResponse>(
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
      {
        success: false,
        error: 'Failed to create product',
      },
      { status: 500 }
    );
  }
}
