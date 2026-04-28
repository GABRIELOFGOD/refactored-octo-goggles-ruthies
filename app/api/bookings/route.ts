import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongoose';
import { Booking } from '@/models/Booking';
import { Service } from '@/models/Service';
import { authenticateUser } from '@/lib/auth-helpers';
import { generateBookingNumber } from '@/lib/auth-helpers';
import { ApiResponse, IBooking } from '@/types';

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    const user = await authenticateUser(request);

    const body = await request.json();
    const { serviceId, scheduledDate, scheduledTime, notes } = body;

    // Validate required fields
    if (!serviceId || !scheduledDate || !scheduledTime) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Missing required fields: serviceId, scheduledDate, scheduledTime',
        },
        { status: 400 }
      );
    }

    // Get service details
    const service = await Service.findById(serviceId);
    if (!service || service.isDeleted) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Service not found',
        },
        { status: 404 }
      );
    }

    if (!service.isAvailable) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Service is currently unavailable',
        },
        { status: 400 }
      );
    }

    // Parse scheduled date
    const bookingDate = new Date(scheduledDate);
    const now = new Date();

    if (bookingDate < now) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Cannot book for a date in the past',
        },
        { status: 400 }
      );
    }

    // Check for conflicting bookings (prevent double-booking same time slot)
    // Create a time window (assuming each booking occupies service duration minutes)
    const timeStart = new Date(bookingDate);
    const [hours, minutes] = scheduledTime.split(':').map(Number);
    timeStart.setHours(hours, minutes, 0, 0);

    const timeEnd = new Date(timeStart);
    timeEnd.setMinutes(timeEnd.getMinutes() + service.duration);

    // Find any confirmed bookings that overlap with this time slot
    const conflictingBooking = await Booking.findOne({
      service: serviceId,
      scheduledDate: {
        $gte: new Date(bookingDate.toDateString()),
        $lt: new Date(new Date(bookingDate).setDate(bookingDate.getDate() + 1)),
      },
      scheduledTime: scheduledTime,
      status: { $in: ['confirmed', 'completed'] },
      isDeleted: { $ne: true },
    });

    if (conflictingBooking) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'This time slot is already booked. Please select another time.',
        },
        { status: 409 }
      );
    }

    // Calculate booking total
    const total = service.prices.USD || 0; // Default to USD, will be converted based on user preference
    const currency = user.preferredCurrency || 'USD';

    // Create booking
    const booking = new Booking({
      bookingNumber: generateBookingNumber(),
      user: user._id,
      service: serviceId,
      scheduledDate: bookingDate,
      scheduledTime: scheduledTime,
      status: 'pending',
      notes: notes || '',
      total: service.prices[currency as keyof typeof service.prices] || service.prices.USD,
      currency: currency,
      paymentStatus: total === 0 ? 'paid' : 'pending', // Free services are automatically "paid"
    });

    await booking.save();

    // Populate service details in response
    await booking.populate('service');

    return NextResponse.json<ApiResponse<IBooking>>(
      {
        success: true,
        data: booking as IBooking,
        message: 'Booking created successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Service booking error:', error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: 'Failed to create booking',
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    const user = await authenticateUser(request);

    // Get user's bookings
    const bookings = await Booking.find({
      user: user._id,
      isDeleted: { $ne: true },
    })
      .populate('service')
      .sort({ createdAt: -1 });

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: bookings,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get bookings error:', error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: 'Failed to fetch bookings',
      },
      { status: 500 }
    );
  }
}
