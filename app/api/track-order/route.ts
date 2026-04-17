import { NextRequest, NextResponse } from 'next/server';
import { Order } from '@/models/Order';
import connectToDatabase from '@/lib/mongoose';
import { ApiResponse, IOrder } from '@/types';

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    const orderNumber = request.nextUrl.searchParams.get('orderNumber');
    const email = request.nextUrl.searchParams.get('email');

    if (!orderNumber || !email) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Order number and email required' },
        { status: 400 }
      );
    }

    const order = await Order.findOne({
      orderNumber,
      email,
      isDeleted: { $ne: true },
    }).populate('items.product');

    if (!order) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    return NextResponse.json<ApiResponse<IOrder>>(
      { success: true, data: order },
      { status: 200 }
    );
  } catch (error) {
    console.error('Track order error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Failed to track order' },
      { status: 500 }
    );
  }
}
