import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongoose';
import { Product } from '@/models/Product';
import { Category } from '@/models/Category';
import { User } from '@/models/User';
import { Service } from '@/models/Service';
import { Discount } from '@/models/Discount';
import { Banner } from '@/models/Banner';
import { authenticateUser } from '@/lib/auth-helpers';
import { ApiResponse } from '@/types';

const modelMap: { [key: string]: any } = {
  product: Product,
  category: Category,
  user: User,
  service: Service,
  discount: Discount,
  banner: Banner,
};

export async function POST(request: NextRequest) {
  try {

    await connectToDatabase();
        
    const user = await authenticateUser(request);
    if (!user || user.role !== "admin") return NextResponse.json<ApiResponse>({ success: false, error: "Unauthorized" }, { status: 403 });

    const { id, type } = await request.json();
    const Model = modelMap[type];

    if (!Model) {
      return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
    }

    await Model.findByIdAndUpdate(id, {
      isDeleted: false,
      deletedAt: null,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[TRASH_RESTORE]', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
