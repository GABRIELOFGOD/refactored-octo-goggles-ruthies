import { NextRequest, NextResponse } from 'next/server';
import { Order } from '@/models/Order';
import { Cart } from '@/models/Cart';
import connectToDatabase from '@/lib/mongoose';
import { ApiResponse, IOrder } from '@/types';
import { authenticateUser, AuthenticationError, generateOrderNumber } from '@/lib/auth-helpers';
import { sendOrderConfirmationEmail } from '@/lib/email';

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    const user = await authenticateUser(request);

    const page = parseInt(request.nextUrl.searchParams.get('page') || '1', 10);
    const limit = parseInt(request.nextUrl.searchParams.get('limit') || '10', 10);

    const orders = await Order.find({
      user: user._id,
      isDeleted: { $ne: true },
    })
      .populate('items.product')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await Order.countDocuments({
      user: user._id,
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
    if (error instanceof AuthenticationError) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
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

    const user = request.headers.get('authorization')
      ? await authenticateUser(request)
      : null;

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
      user: user?._id || null,
      email: user?.email || body.email,
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
    if (user?._id) {
      await Cart.updateOne(
        { user: user._id },
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
    if (error instanceof AuthenticationError) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
    console.error('Create order error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Failed to create order' },
      { status: 500 }
    );
  }
}
