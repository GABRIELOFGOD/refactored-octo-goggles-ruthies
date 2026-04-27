import { NextRequest, NextResponse } from 'next/server';
import { authConfig } from '@/lib/auth';
import connectToDatabase from '@/lib/mongoose';
import { Banner } from '@/models/Banner';
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
    const banner = await Banner.findByIdAndUpdate(id, body, { new: true }).lean();

    return NextResponse.json({ success: true, data: banner });
  } catch (error) {
    console.error('[BANNER_PUT]', error);
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

    await Banner.findByIdAndUpdate(id, {
      isDeleted: true,
      deletedAt: new Date(),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[BANNER_DELETE]', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
