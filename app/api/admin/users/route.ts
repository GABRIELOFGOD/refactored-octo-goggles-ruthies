import { NextRequest, NextResponse } from 'next/server';
import { User } from '@/models/User';
import connectToDatabase from '@/lib/mongoose';
import { ApiResponse } from '@/types';
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
    const search = request.nextUrl.searchParams.get('search');

    let query: any = { isDeleted: { $ne: true } };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: users,
        meta: { total, page, limit },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get users error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}
