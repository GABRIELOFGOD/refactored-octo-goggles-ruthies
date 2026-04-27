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

export async function GET(request: NextRequest) {
  try {

    await connectToDatabase();
        
    const user = await authenticateUser(request);
    if (!user || user.role !== "admin") return NextResponse.json<ApiResponse>({ success: false, error: "Unauthorized" }, { status: 403 });

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'all';

    const types = type === 'all' ? Object.keys(modelMap) : [type];
    const allItems: any[] = [];

    for (const modelType of types) {
      const Model = modelMap[modelType];
      if (!Model) continue;

      const items = await Model.find({ isDeleted: true })
        .select('name deletedAt')
        .lean();

      allItems.push(
        ...items.map((item: any) => ({
          ...item,
          type: modelType,
        }))
      );
    }

    return NextResponse.json({ success: true, data: allItems });
  } catch (error) {
    console.error('[TRASH_GET]', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
