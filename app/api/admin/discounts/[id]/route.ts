import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongoose';
import { Discount } from '@/models/Discount';
import { authenticateUser } from '@/lib/auth-helpers';
import { ApiResponse } from '@/types';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {

    const { id } = await params;
    await connectToDatabase();
    
    const user = await authenticateUser(request);
    if (!user || user.role !== "admin") return NextResponse.json<ApiResponse>({ success: false, error: "Unauthorized" }, { status: 403 });

    const body = await request.json();
    const discount = await Discount.findByIdAndUpdate(id, body, { new: true }).lean();

    return NextResponse.json({ success: true, data: discount });
  } catch (error) {
    console.error('[DISCOUNT_PUT]', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {

    const { id } = await params;
    await connectToDatabase();
    
    const user = await authenticateUser(request);
    if (!user || user.role !== "admin") return NextResponse.json<ApiResponse>({ success: false, error: "Unauthorized" }, { status: 403 });

    await Discount.findByIdAndUpdate(id, {
      isDeleted: true,
      deletedAt: new Date(),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[DISCOUNT_DELETE]', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
