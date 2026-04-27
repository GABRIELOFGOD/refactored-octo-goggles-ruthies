import { NextRequest, NextResponse } from 'next/server';
import { Order } from '@/models/Order';
import connectToDatabase from '@/lib/mongoose';
import { ApiResponse, IOrder } from '@/types';
import { authenticateUser } from '@/lib/auth-helpers';

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const user = await authenticateUser(request);
    if (!user || user.role !== "admin") return NextResponse.json<ApiResponse>({ success: false, error: "Unauthorized" }, { status: 403 });

    const page = parseInt(request.nextUrl.searchParams.get('page') || '1', 10);
    const limit = parseInt(request.nextUrl.searchParams.get('limit') || '20', 10);
    const status = request.nextUrl.searchParams.get('status');
    const search = request.nextUrl.searchParams.get('search');

    let query: any = { isDeleted: { $ne: true } };

    if (status) {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { orderNumber: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { 'shippingAddress.name': { $regex: search, $options: 'i' } },
      ];
    }

    const total = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .populate('items.product')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return NextResponse.json<ApiResponse<IOrder[]>>(
      {
        success: true,
        data: orders,
        meta: { total, page, limit },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get admin orders error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}
