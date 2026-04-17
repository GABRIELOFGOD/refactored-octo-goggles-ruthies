import { NextRequest, NextResponse } from 'next/server';
import { Order } from '@/models/Order';
import connectToDatabase from '@/lib/mongoose';
import { ApiResponse } from '@/types';

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    const range = request.nextUrl.searchParams.get('range') || '30'; // 30 or 365 days
    const rangeNum = parseInt(range, 10);
    const now = new Date();
    const startDate = new Date(now.getTime() - rangeNum * 24 * 60 * 60 * 1000);

    // Revenue and order timeline data
    const data: { [key: string]: { revenue: number; orders: number } } = {};

    // Group orders by date
    const orders = await Order.find({
      isDeleted: { $ne: true },
      paymentStatus: 'paid',
      createdAt: { $gte: startDate },
    })
      .select('total createdAt status')
      .lean();

    orders.forEach((order: any) => {
      const date = new Date(order.createdAt).toISOString().split('T')[0];
      if (!data[date]) {
        data[date] = { revenue: 0, orders: 0 };
      }
      data[date].revenue += order.total || 0;
      data[date].orders += 1;
    });

    // Format for chart
    const chartData = Object.entries(data)
      .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
      .map(([date, values]) => ({
        date,
        revenue: values.revenue,
        orders: values.orders,
      }));

    return NextResponse.json<ApiResponse>(
      { success: true, data: chartData },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get chart data error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Failed to fetch chart data' },
      { status: 500 }
    );
  }
}
