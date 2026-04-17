import { NextRequest, NextResponse } from 'next/server';
import { Banner } from '@/models/Banner';
import connectToDatabase from '@/lib/mongoose';
import { ApiResponse, IBanner } from '@/types';

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    const searchParams = request.nextUrl.searchParams;
    const position = searchParams.get('position');
    const isActive = searchParams.get('isActive');

    let query: any = { isDeleted: { $ne: true } };

    if (position) {
      query.position = position;
    }
    if (isActive === 'true') {
      query.isActive = true;
    }

    const banners = await Banner.find(query).sort({ sortOrder: 1 });

    return NextResponse.json<ApiResponse<IBanner[]>>(
      {
        success: true,
        data: banners,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get banners error:', error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: 'Failed to fetch banners',
      },
      { status: 500 }
    );
  }
}
