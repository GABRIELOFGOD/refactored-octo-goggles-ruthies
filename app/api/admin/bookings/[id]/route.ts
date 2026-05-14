import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { Booking } from '@/models/Booking';
import { Notification } from '@/models/Notification';
import { User } from '@/models/User';
import { connectDB } from '@/lib/db';
import mongoose from 'mongoose';

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const { id } = await Promise.resolve(params);
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid booking ID' },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { status, adminNotes } = body;

    // Find booking
    const booking = await Booking.findById(id).populate('user', 'name email');
    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    // Update booking status
    if (status) {
      booking.status = status;
    }

    if (adminNotes) {
      booking.adminNotes = adminNotes;
    }

    await booking.save();

    // Create notification for user if booking is completed
    if (status === 'completed' && booking.user) {
      await Notification.create({
        type: 'service',
        user: booking.user,
        booking: booking._id,
        title: 'Service Completed',
        message: `Your service booking has been completed.`,
        description: `Your booking #${booking.bookingNumber} has been marked as completed.`,
        icon: 'booking',
        isRead: false,
      });
    }

    return NextResponse.json(
      { data: booking },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating booking:', error);
    return NextResponse.json(
      { error: 'Failed to update booking' },
      { status: 500 }
    );
  }
}
