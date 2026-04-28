import { NextRequest, NextResponse } from 'next/server';
import { Order } from '@/models/Order';
import connectToDatabase from '@/lib/mongoose';
import { ApiResponse } from '@/types';
import { authenticateUser } from '@/lib/auth-helpers';

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const user = await authenticateUser(request);
    if (!user || user.role !== 'admin') {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get order status distribution
    const statuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'completed', 'cancelled'];

    const data = await Promise.all(
      statuses.map(async (status) => ({
        status: status.charAt(0).toUpperCase() + status.slice(1),
        value: await Order.countDocuments({
          isDeleted: { $ne: true },
          status,
        }),
      }))
    );

    return NextResponse.json<ApiResponse>(
      { success: true, data: data.filter((item) => item.value > 0) },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get status distribution error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Failed to fetch status distribution' },
      { status: 500 }
    );
  }
}
