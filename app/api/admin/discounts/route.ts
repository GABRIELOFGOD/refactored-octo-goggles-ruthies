import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth';
import connectToDatabase from '@/lib/mongoose';
import { Discount } from '@/models/Discount';

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
    const session = await getServerSession(authConfig);
    if (!session?.user?.role?.includes('admin')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    await connectToDatabase();
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
