import { NextRequest, NextResponse } from 'next/server';
import { Notification } from '@/models/Notification';
import connectToDatabase from '@/lib/mongoose';
import { authenticateUser, AuthenticationError } from '@/lib/auth-helpers';

export async function GET(req: NextRequest) {
  try {
    const user = await authenticateUser(req);

    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type'); // 'service', 'order', or null for all
    const isRead = searchParams.get('isRead'); // 'true', 'false', or null for all
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    // Build query
    const query = {
      user: user._id,
      isDeleted: { $ne: true },
      ...(type ? { type } : {}),
      ...(isRead !== null ? { isRead: isRead === 'true' } : {}),
    };

    // Get total count
    const total = await Notification.countDocuments(query);

    // Fetch notifications with pagination
    const notifications = await Notification.find(query)
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
    if (error instanceof AuthenticationError) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}
