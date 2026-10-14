import { NextRequest, NextResponse } from 'next/server';
import { Booking } from '@/models/Booking';
import { Notification } from '@/models/Notification';
import connectToDatabase from '@/lib/mongoose';
import mongoose from 'mongoose';
import { authenticateUser, AuthenticationError } from '@/lib/auth-helpers';

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await authenticateUser(req);
    if (!user?._id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectToDatabase();

    // Verify user is admin
    if (user?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    const { id } = await params;
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
    if (error instanceof AuthenticationError) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Error updating booking:', error);
    return NextResponse.json(
      { error: 'Failed to update booking' },
      { status: 500 }
    );
  }
}
