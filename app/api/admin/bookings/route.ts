import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { Booking } from '@/models/Booking';
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
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    // Build query
    let query: any = {
      isDeleted: { $ne: true },
    };

    if (status) {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { bookingNumber: { $regex: search, $options: 'i' } },
        { 'guestInfo.name': { $regex: search, $options: 'i' } },
        { 'guestInfo.email': { $regex: search, $options: 'i' } },
      ];
    }

    // Get total count
    const total = await Booking.countDocuments(query);

    // Fetch bookings with pagination and populate details
    const bookings = await Booking.find(query)
      .populate('user', 'name email phone')
      .populate('service', 'name price duration')
      .sort({ scheduledDate: -1 })
      .limit(limit)
      .skip((page - 1) * limit)
      .lean();

    return NextResponse.json(
      {
        data: bookings,
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
    console.error('Error fetching admin bookings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bookings' },
      { status: 500 }
    );
  }
}
