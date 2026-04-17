import { NextRequest, NextResponse } from 'next/server';
import { Order } from '@/models/Order';
import { Cart } from '@/models/Cart';
import connectToDatabase from '@/lib/mongoose';
import { ApiResponse, IOrder } from '@/types';
import { auth } from '@/lib/auth';
import { generateOrderNumber } from '@/lib/auth-helpers';
import { sendOrderConfirmationEmail } from '@/lib/email';

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const page = parseInt(request.nextUrl.searchParams.get('page') || '1', 10);
    const limit = parseInt(request.nextUrl.searchParams.get('limit') || '10', 10);

    const orders = await Order.find({
      user: session.user.id,
      isDeleted: { $ne: true },
    })
      .populate('items.product')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await Order.countDocuments({
      user: session.user.id,
      isDeleted: { $ne: true },
    });

    return NextResponse.json<ApiResponse<IOrder[]>>(
      {
        success: true,
        data: orders,
        meta: { total, page, limit },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get orders error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    await connectToDatabase();

    const session = await auth();

    const {
      items,
      shippingAddress,
      subtotal,
      shippingFee,
      tax,
      total,
      currency,
      paymentReference,
      paystackTransactionId,
    } = body;

    // Create order
    const orderNumber = generateOrderNumber();

    const order = new Order({
      orderNumber,
      user: session?.user?.id || null,
      email: session?.user?.email || body.email,
      items,
      shippingAddress,
      subtotal,
      shippingFee,
      tax,
      total,
      currency,
      paymentStatus: 'paid',
      paymentReference,
      paystackTransactionId,
      status: 'confirmed',
      timeline: [
        {
          status: 'confirmed',
          message: 'Payment received. Your order is confirmed.',
          timestamp: new Date(),
        },
      ],
    });

    await order.save();
    await order.populate('items.product');

    // Clear cart if user is logged in
    if (session?.user?.id) {
      await Cart.updateOne(
        { user: session.user.id },
        { items: [] }
      );
    }

    // Send confirmation email
    try {
      await sendOrderConfirmationEmail(order);
    } catch (emailError) {
      console.error('Email send failed (non-blocking):', emailError);
    }

    return NextResponse.json<ApiResponse<IOrder>>(
      {
        success: true,
        data: order,
        message: 'Order created successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create order error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Failed to create order' },
      { status: 500 }
    );
  }
}
