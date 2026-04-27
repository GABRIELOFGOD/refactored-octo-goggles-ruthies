import { NextRequest, NextResponse } from 'next/server';
import { Order } from '@/models/Order';
import connectToDatabase from '@/lib/mongoose';
import { ApiResponse, IOrder } from '@/types';
import { auth } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const { orderId } = await params;
    await connectToDatabase();
    const session = await auth();

    const order = await Order.findOne({
      _id: orderId,
      isDeleted: { $ne: true },
    }).populate('items.product');

    if (!order) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    // Check authorization
    if (session?.user?.id && order.user?.toString() !== session.user.id) {
      // User can only see their own orders
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      );
    }

    return NextResponse.json<ApiResponse<IOrder>>(
      { success: true, data: order },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get order error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Failed to fetch order' },
      { status: 500 }
    );
  }
}
