import { NextRequest, NextResponse } from 'next/server';
import { Category } from '@/models/Category';
import connectToDatabase from '@/lib/mongoose';
import { ApiResponse, ICategory } from '@/types';

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    const query = { isDeleted: { $ne: true } };

    const categories = await Category.find(query).sort({ sortOrder: 1 });

    return NextResponse.json<ApiResponse<ICategory[]>>(
      {
        success: true,
        data: categories,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get categories error:', error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: 'Failed to fetch categories',
      },
      { status: 500 }
    );
  }
}
