import { NextRequest, NextResponse } from 'next/server';
import { ApiResponse } from '@/types';

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

interface InitializePaymentRequest {
  email: string;
  amount: number; // in kobo
  orderNumber: string;
  metadata?: Record<string, any>;
}

export async function POST(request: NextRequest) {
  try {
    const body: InitializePaymentRequest = await request.json();

    const { email, amount, orderNumber, metadata } = body;

    if (!email || !amount || !orderNumber) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Email, amount, and order number are required',
        },
        { status: 400 }
      );
    }

    // Initialize transaction with Paystack
    const response = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
      },
      body: JSON.stringify({
        email,
        amount, // in kobo
        reference: orderNumber,
        metadata,
      }),
    });

    const data = await response.json();

    if (!response.ok || !data.status) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Failed to initialize payment',
        },
        { status: 400 }
      );
    }

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: data.data,
        message: 'Payment initialized',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Payment initialization error:', error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: 'Failed to initialize payment',
      },
      { status: 500 }
    );
  }
}
