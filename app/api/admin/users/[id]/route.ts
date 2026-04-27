import { NextRequest, NextResponse } from 'next/server';
import { User } from '@/models/User';
import connectToDatabase from '@/lib/mongoose';
import { ApiResponse } from '@/types';
import { authenticateUser } from '@/lib/auth-helpers';

export async function GET(
  request: NextRequest,
  // { params }: { params: { id: string } }
) {
  try {
    // const { id } = await params;
    await connectToDatabase();
        
    const user = await authenticateUser(request);
    if (!user || user.role !== "admin") return NextResponse.json<ApiResponse>({ success: false, error: "Unauthorized" }, { status: 403 });

    if (user.isDeleted) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json<ApiResponse>(
      { success: true, data: user },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Failed to fetch user' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;
    await connectToDatabase();
    
    // const user = await authenticateUser(request);
    // if (!user || user.role !== "admin") return NextResponse.json<ApiResponse>({ success: false, error: "Unauthorized" }, { status: 403 });

    const body = await request.json();
    const { isActive } = body;

    const user = await User.findByIdAndUpdate(
      id,
      { isActive },
      { new: true }
    ).select('-password');

    if (!user) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: user,
        message: 'User updated successfully',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Update user error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Failed to update user' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;
    await connectToDatabase();
    
    // const user = await authenticateUser(request);
    // if (!user || user.role !== "admin") return NextResponse.json<ApiResponse>({ success: false, error: "Unauthorized" }, { status: 403 });

    const user = await User.findByIdAndUpdate(
      id,
      {
        isDeleted: true,
        deletedAt: new Date(),
      },
      { new: true }
    );

    if (!user) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json<ApiResponse>(
      { success: true, message: 'User deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Delete user error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Failed to delete user' },
      { status: 500 }
    );
  }
}
