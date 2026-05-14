import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { Notification } from '@/models/Notification';
import { connectDB } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // Check Bearer token for mobile authentication
    let userId = session?.user?.id;
    if (!userId) {
      const authHeader = req.headers.get('authorization');
      if (authHeader?.startsWith('Bearer ')) {
        const token = authHeader.slice(7);
        // You would decode the JWT token here and extract user ID
        // For now, we'll require session
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type'); // 'service', 'order', or null for all
    const isRead = searchParams.get('isRead'); // 'true', 'false', or null for all
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    // Build query
    let query: any = {
      user: userId,
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
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}
