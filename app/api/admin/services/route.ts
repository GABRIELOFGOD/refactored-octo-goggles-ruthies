import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongoose';
import { Service } from '@/models/Service';
import { authenticateUser } from '@/lib/auth-helpers';
import { ApiResponse } from '@/types';

export async function GET(request: NextRequest) {
  try {

    await connectToDatabase();
        
    const user = await authenticateUser(request);
    if (!user || user.role !== "admin") return NextResponse.json<ApiResponse>({ success: false, error: "Unauthorized" }, { status: 403 });

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    const skip = (page - 1) * limit;

    const query = {
      isDeleted: { $ne: true },
      ...(search && {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
        ],
      }),
    };

    const services = await Service.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    return NextResponse.json({
      success: true,
      data: services,
    });
  } catch (error) {
    console.error('[SERVICES_GET]', error);
    return NextResponse.json(
      { error: 'Failed to fetch services' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {

    await connectToDatabase();
        
    const user = await authenticateUser(request);
    if (!user || user.role !== "admin") return NextResponse.json<ApiResponse>({ success: false, error: "Unauthorized" }, { status: 403 });

    const body = await request.json();

    const service = new Service({
      ...body,
      slug: body.slug || body.name.toLowerCase().replace(/\s+/g, '-'),
    });

    await service.save();

    return NextResponse.json({
      success: true,
      data: service,
    });
  } catch (error) {
    console.error('[SERVICES_POST]', error);
    return NextResponse.json(
      { error: 'Failed to create service' },
      { status: 500 }
    );
  }
}
