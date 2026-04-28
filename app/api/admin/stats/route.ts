import { NextRequest, NextResponse } from 'next/server';
import { Order } from '@/models/Order';
import { User } from '@/models/User';
import { Product } from '@/models/Product';
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

    // Get date range (last 30 days)
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Stats
    const totalUsers = await User.countDocuments({ isDeleted: { $ne: true } });
    const activeUsers = await User.countDocuments({
      isDeleted: { $ne: true },
      lastLogin: { $gte: thirtyDaysAgo },
    });

    const totalProducts = await Product.countDocuments({ isDeleted: { $ne: true } });
    const totalOrders = await Order.countDocuments({ isDeleted: { $ne: true } });
    const pendingOrders = await Order.countDocuments({
      isDeleted: { $ne: true },
      status: 'pending',
    });

    // Revenue calculation
    const paidOrders = await Order.find({
      isDeleted: { $ne: true },
      paymentStatus: 'paid',
    });
    const totalRevenue = paidOrders.reduce((sum, order) => sum + (order.total || 0), 0);
    const recentRevenue = paidOrders
      .filter((order) => new Date(order.createdAt) >= thirtyDaysAgo)
      .reduce((sum, order) => sum + (order.total || 0), 0);

    // Recent orders (last 10)
    const recentOrders = await Order.find({ isDeleted: { $ne: true } })
      .sort({ createdAt: -1 })
      .limit(10)
      .select('_id orderNumber email total status paymentStatus createdAt')
      .lean();

    // Recent users (last 10)
    const recentUsers = await User.find({ isDeleted: { $ne: true } })
      .sort({ createdAt: -1 })
      .limit(10)
      .select('_id name email createdAt lastLogin')
      .lean();

    return NextResponse.json<
      ApiResponse<{
        stats: any;
        recentOrders: any[];
        recentUsers: any[];
      }>
    >(
      {
        success: true,
        data: {
          stats: {
            totalUsers,
            activeUsers,
            totalProducts,
            totalOrders,
            pendingOrders,
            totalRevenue,
            recentRevenue,
          },
          recentOrders,
          recentUsers,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
