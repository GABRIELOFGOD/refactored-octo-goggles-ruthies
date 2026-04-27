import { NextRequest, NextResponse } from 'next/server';
import { Category } from '@/models/Category';
import connectToDatabase from '@/lib/mongoose';
import { ApiResponse, ICategory } from '@/types';
import { authenticateUser } from '@/lib/auth-helpers';

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const user = await authenticateUser(request);
    if (!user || user.role !== "admin") return NextResponse.json<ApiResponse>({ success: false, error: "Unauthorized" }, { status: 403 });

    const page = parseInt(request.nextUrl.searchParams.get('page') || '1', 10);
    const limit = parseInt(request.nextUrl.searchParams.get('limit') || '20', 10);
    const search = request.nextUrl.searchParams.get('search');

    let query: any = { isDeleted: { $ne: true } };

    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    const total = await Category.countDocuments(query);
    const categories = await Category.find(query)
      .sort({ name: 1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return NextResponse.json<ApiResponse<ICategory[]>>(
      {
        success: true,
        data: categories,
        meta: { total, page, limit },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get categories error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const user = await authenticateUser(request);
    if (!user || user.role !== "admin") return NextResponse.json<ApiResponse>({ success: false, error: "Unauthorized" }, { status: 403 });

    const body = await request.json();
    const { name, description, image, parent } = body;

    // Generate slug
    const slug = name
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w-]/g, '');

    const category = new Category({
      name,
      slug,
      description,
      image,
      parent: parent || null,
    });

    await category.save();

    return NextResponse.json<ApiResponse<ICategory>>(
      {
        success: true,
        data: category,
        message: 'Category created successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create category error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Failed to create category' },
      { status: 500 }
    );
  }
}
