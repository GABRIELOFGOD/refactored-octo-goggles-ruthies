import { NextRequest, NextResponse } from 'next/server';
import { ApiResponse } from '@/types';

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

export async function GET(request: NextRequest) {
  try {
    const reference = request.nextUrl.searchParams.get('reference');

    if (!reference) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Reference required' },
        { status: 400 }
      );
    }

    // Verify with Paystack API
    const response = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    const data = await response.json();

    if (!response.ok || !data.status) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Payment verification failed' },
        { status: 400 }
      );
    }

    // Check if payment was successful
    if (data.data.status === 'success') {
      return NextResponse.json<ApiResponse>(
        {
          success: true,
          data: data.data,
          message: 'Payment verified successfully',
        },
        { status: 200 }
      );
    } else {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Payment not successful' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Payment verification error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Verification failed' },
      { status: 500 }
    );
  }
}
