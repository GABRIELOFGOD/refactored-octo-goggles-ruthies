import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth';
import connectToDatabase from '@/lib/mongoose';
import { Product } from '@/models/Product';
import { Category } from '@/models/Category';
import { User } from '@/models/User';
import { Service } from '@/models/Service';
import { Discount } from '@/models/Discount';
import { Banner } from '@/models/Banner';

const modelMap: { [key: string]: any } = {
  product: Product,
  category: Category,
  user: User,
  service: Service,
  discount: Discount,
  banner: Banner,
};

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.user?.role?.includes('admin')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    await connectToDatabase();

    const { id, type } = await request.json();
    const Model = modelMap[type];

    if (!Model) {
      return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
    }

    await Model.findByIdAndRemove(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[TRASH_PERMANENT_DELETE]', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
