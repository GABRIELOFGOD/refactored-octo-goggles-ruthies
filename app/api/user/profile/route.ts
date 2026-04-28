
import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongoose';
import { User } from '@/models/User';
import { ApiResponse, JwtPayload } from '@/types';
import { authenticateUser, verifyToken } from '@/lib/auth-helpers';

// GET - Fetch user profile
export async function GET(request: NextRequest) {
  try {
    const tokenHeader = request.headers.get("authorization");
    if (!tokenHeader) return NextResponse.json<ApiResponse>({
      success: false,
      error: "Please please login"
    });

    const splitHeader = tokenHeader.split(" ");
    if (splitHeader[0] !== "Bearer") return NextResponse.json<ApiResponse>({
      success: false,
      error: "Please send a Bearer token"
    });

    const decodedToken = verifyToken(splitHeader[1]) as JwtPayload;

    await connectToDatabase();

    const user = await User.findById(decodedToken.id).select('-passwordHash');

    if (!user || user.isDeleted) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: user,
    });
  } catch (error: any) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json({ error: error.error || 'Internal server error' }, { status: 500 });
  }
}

// PUT - Update user profile
export async function PUT(request: NextRequest) {
  try {
    const user = await authenticateUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, phone, address, preferredCurrency, preferredLanguage } = body;

    await connectToDatabase();

    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      {
        name,
        phone,
        address,
        preferredCurrency,
        preferredLanguage,
        updatedAt: new Date(),
      },
      { new: true, runValidators: true }
    ).select('-passwordHash');

    if (!updatedUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: updatedUser,
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
