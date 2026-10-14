import { NextRequest, NextResponse } from 'next/server';
import type { QueryFilter } from 'mongoose';
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
    const currencyParam = searchParams.get('currency');
    const currency = ['NGN', 'USD', 'GBP', 'EUR'].find((value) => value === currencyParam) || 'NGN';
    const sortBy = searchParams.get('sort');

    const query: QueryFilter<IProduct> = { isDeleted: { $ne: true }, isPublished: true };

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

      const minPriceParam = searchParams.get('minPrice');
      const maxPriceParam = searchParams.get('maxPrice');
      const minPrice = minPriceParam === null ? undefined : Number(minPriceParam);
      const maxPrice = maxPriceParam === null ? undefined : Number(maxPriceParam);
      if (
        (minPrice !== undefined && Number.isFinite(minPrice)) ||
        (maxPrice !== undefined && Number.isFinite(maxPrice))
      ) {
        const priceFilter: { $gte?: number; $lte?: number } = {};
        if (minPrice !== undefined && Number.isFinite(minPrice)) priceFilter.$gte = minPrice;
        if (maxPrice !== undefined && Number.isFinite(maxPrice)) priceFilter.$lte = maxPrice;
        query[`prices.${currency}`] = priceFilter;
      }

      const sizes = searchParams.get('sizes')?.split(',').filter(Boolean) || [];
      const colors = searchParams.get('colors')?.split(',').filter(Boolean) || [];
      if (sizes.length || colors.length) {
        const variantFilter: Record<string, { $in: string[] }> = {};
        if (sizes.length) variantFilter.size = { $in: sizes };
        if (colors.length) variantFilter.color = { $in: colors };
        query.variants = { $elemMatch: variantFilter };
      }
    }

    const sortOptions: Record<string, Record<string, 1 | -1>> = {
      newest: { createdAt: -1 },
      'price-low': { [`prices.${currency}`]: 1 },
      'price-high': { [`prices.${currency}`]: -1 },
      popular: { totalSold: -1, createdAt: -1 },
    };
    const sort = sortOptions[sortBy || 'newest'] || sortOptions.newest;

    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      // .populate('category')
      .limit(limit)
      .skip((page - 1) * limit)
      .sort(sort);

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
