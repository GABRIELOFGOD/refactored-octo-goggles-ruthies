import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { Notification } from '@/models/Notification';
import { User } from '@/models/User';
import { connectDB } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    // Verify user is admin
    const user = await User.findById(session.user.id);
    if (user?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');
    const isRead = searchParams.get('isRead');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    // Build query
    let query: any = {
      isDeleted: { $ne: true },
    };

    if (type) {
      query.type = type;
    }

    if (isRead !== null) {
      query.isRead = isRead === 'true';
    }

    // Get total count
    const total = await Notification.countDocuments(query);

    // Fetch notifications with pagination and populate user details
    const notifications = await Notification.find(query)
      .populate('user', 'name email phone')
      .populate('booking', 'bookingNumber status scheduledDate')
      .populate('order', 'orderNumber status total')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit)
      .lean();

    return NextResponse.json(
      {
        data: notifications,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching admin notifications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}
