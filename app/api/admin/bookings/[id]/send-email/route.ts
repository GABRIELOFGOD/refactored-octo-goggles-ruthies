import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { User } from '@/models/User';
import { Booking } from '@/models/Booking';
import { Notification } from '@/models/Notification';
import { connectDB } from '@/lib/db';
import { sendCustomNotificationEmail } from '@/lib/email';
import mongoose from 'mongoose';

export async function POST(
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
    const admin = await User.findById(session.user.id);
    if (admin?.role !== 'admin') {
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
    const { subject, title, message, details } = body;

    if (!subject || !title || !message) {
      return NextResponse.json(
        { error: 'Missing required fields: subject, title, message' },
        { status: 400 }
      );
    }

    // Find booking and populate user
    const booking = await Booking.findById(id).populate('user', 'name email');
    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    const recipientEmail = booking.user?.email || booking.guestInfo?.email;
    const recipientName = booking.user?.name || booking.guestInfo?.name || 'Valued Customer';

    if (!recipientEmail) {
      return NextResponse.json(
        { error: 'No email address found for booking' },
        { status: 400 }
      );
    }

    // Send email
    await sendCustomNotificationEmail({
      email: recipientEmail,
      userName: recipientName,
      subject,
      title,
      message,
      details,
    });

    // Create notification in database
    if (booking.user) {
      await Notification.create({
        type: 'service',
        user: booking.user,
        booking: booking._id,
        title,
        message,
        description: details,
        icon: 'info',
        isRead: false,
      });
    }

    return NextResponse.json(
      {
        message: 'Email sent successfully',
        email: recipientEmail,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    );
  }
}
