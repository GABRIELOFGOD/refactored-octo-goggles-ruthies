import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth';
import connectToDatabase from '@/lib/mongoose';
import { Newsletter } from '@/models/Newsletter';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authConfig);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { id } = await params;
    await connectToDatabase();

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
