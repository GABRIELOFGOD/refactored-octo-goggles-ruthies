import { NextRequest, NextResponse } from 'next/server';
import { Service } from '@/models/Service';
import connectToDatabase from '@/lib/mongoose';
import { ApiResponse, IService } from '@/types';

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    const query = { isDeleted: { $ne: true }, isAvailable: true };

    const services = await Service.find(query).sort({ createdAt: -1 });

    return NextResponse.json<ApiResponse<IService[]>>(
      {
        success: true,
        data: services,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get services error:', error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: 'Failed to fetch services',
      },
      { status: 500 }
    );
  }
}
