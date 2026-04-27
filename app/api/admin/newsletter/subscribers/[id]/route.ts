import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongoose';
import { Newsletter } from '@/models/Newsletter';
import { authenticateUser } from '@/lib/auth-helpers';
import { ApiResponse } from '@/types';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {

    const { id } = await params;
    await connectToDatabase();
        
    const user = await authenticateUser(request);
    if (!user || user.role !== "admin") return NextResponse.json<ApiResponse>({ success: false, error: "Unauthorized" }, { status: 403 });

    await Newsletter.findByIdAndUpdate(id, {
      isDeleted: true,
      isSubscribed: false,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[SUBSCRIBER_DELETE]', error);
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}
