import { NextRequest, NextResponse } from 'next/server';
import { Booking } from '@/models/Booking';
import connectToDatabase from '@/lib/mongoose';
import { authenticateUser, AuthenticationError } from '@/lib/auth-helpers';

export async function GET(req: NextRequest) {
  try {
    const user = await authenticateUser(req);

    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    // Build query - fetch user's bookings
    const query = {
      user: user._id,
      isDeleted: { $ne: true },
      ...(status ? { status } : {}),
    };

    // Get total count
    const total = await Booking.countDocuments(query);

    // Fetch bookings with pagination and populate service
    const bookings = await Booking.find(query)
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
    if (error instanceof AuthenticationError) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Error fetching user bookings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bookings' },
      { status: 500 }
    );
  }
}
