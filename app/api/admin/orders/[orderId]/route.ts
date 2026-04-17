import { NextRequest, NextResponse } from 'next/server';
import { Order } from '@/models/Order';
import connectToDatabase from '@/lib/mongoose';
import { ApiResponse, IOrder } from '@/types';
import { auth } from '@/lib/auth';
import { sendOrderStatusUpdateEmail, sendOrderShippedEmail } from '@/lib/email';

// Admin only - update order status and tracking
export async function PUT(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    await connectToDatabase();
    const session = await auth();

    // Check if user is admin
    if (!session?.user?.role || session.user.role !== 'admin') {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { status, trackingNumber, trackingUrl, timelineEvent, sendEmail } = body;

    const order = await Order.findById(params.orderId);

    if (!order) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    const oldStatus = order.status;

    // Update status
    if (status) {
      order.status = status;
    }

    // Update tracking info
    if (trackingNumber) {
      order.trackingNumber = trackingNumber;
    }

    if (trackingUrl) {
      order.trackingUrl = trackingUrl;
    }

    // Add timeline event
    if (timelineEvent) {
      if (!order.timeline) {
        order.timeline = [];
      }
      order.timeline.push({
        status: timelineEvent.status,
        message: timelineEvent.message,
        timestamp: new Date(),
        updatedBy: session.user.id,
      });
    }

    await order.save();
    await order.populate('items.product');

    // Send email notification if requested
    if (sendEmail && status && status !== oldStatus) {
      try {
        if (status === 'shipped' && trackingNumber) {
          await sendOrderShippedEmail(order.orderNumber, order.email, trackingNumber, trackingUrl);
        } else if (status !== oldStatus) {
          await sendOrderStatusUpdateEmail(
            order.orderNumber,
            order.email,
            status,
            timelineEvent?.message || `Your order status has been updated to ${status}`
          );
        }
      } catch (emailError) {
        console.error('Failed to send status email:', emailError);
        // Don't fail the request if email fails
      }
    }

    return NextResponse.json<ApiResponse<IOrder>>(
      {
        success: true,
        data: order,
        message: 'Order updated successfully',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Update order error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Failed to update order' },
      { status: 500 }
    );
  }
}

// Admin only - get order for admin panel
export async function GET(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    await connectToDatabase();
    const session = await auth();

    if (!session?.user?.role || session.user.role !== 'admin') {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const order = await Order.findById(params.orderId).populate('items.product');

    if (!order) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    return NextResponse.json<ApiResponse<IOrder>>(
      { success: true, data: order },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get order error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Failed to fetch order' },
      { status: 500 }
    );
  }
}
