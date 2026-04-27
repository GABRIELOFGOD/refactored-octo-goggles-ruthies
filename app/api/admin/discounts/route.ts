import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongoose';
import { Discount } from '@/models/Discount';
import { ApiResponse } from '@/types';
import { authenticateUser } from '@/lib/auth-helpers';

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    const discounts = await Discount.find({ isDeleted: { $ne: true } })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    return NextResponse.json({ success: true, data: discounts });
  } catch (error) {
    console.error('[DISCOUNTS_GET]', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {

    await connectToDatabase();
        
    const user = await authenticateUser(request);
    if (!user || user.role !== "admin") return NextResponse.json<ApiResponse>({ success: false, error: "Unauthorized" }, { status: 403 });
    const body = await request.json();

    const discount = new Discount({
      ...body,
      validFrom: new Date(body.validFrom),
      validUntil: body.validUntil ? new Date(body.validUntil) : undefined,
    });

    await discount.save();

    return NextResponse.json({ success: true, data: discount });
  } catch (error) {
    console.error('[DISCOUNTS_POST]', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
