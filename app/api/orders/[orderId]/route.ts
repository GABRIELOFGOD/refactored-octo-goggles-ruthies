import { NextRequest, NextResponse } from 'next/server';
import { Order } from '@/models/Order';
import connectToDatabase from '@/lib/mongoose';
import { ApiResponse, IOrder } from '@/types';
import { authenticateUser, AuthenticationError } from '@/lib/auth-helpers';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params;
    await connectToDatabase();
    const user = request.headers.get('authorization')
      ? await authenticateUser(request)
      : null;

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
    if (order.user && !user) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (order.user && order.user.toString() !== user?._id.toString()) {
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
    if (error instanceof AuthenticationError) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
    console.error('Get order error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Failed to fetch order' },
      { status: 500 }
    );
  }
}
