import { NextRequest, NextResponse } from "next/server";
import { ApiResponse, JwtPayload } from '@/types';
import { User } from "@/models/User";
import { signToken, verifyPassword } from "@/lib/auth-helpers";

export const POST = async (request: NextRequest) => {
  try {
    const { email, password } = await request.json();

    if (!email || !password) return NextResponse.json<ApiResponse>({
      success: false,
      error: "Missing required field"
    });

    const user = await User.findOne({ email }).select("+passwordHash");

    if (!user) return NextResponse.json<ApiResponse>({
      success: false,
      error: "Invalid credentials"
    });

    const passwordMatch = await verifyPassword(password, user.passwordHash);
    if (!passwordMatch) return NextResponse.json<ApiResponse>({
      success: false,
      error: "Invalid credentials"
    });

    const tokenPayload: JwtPayload = { email: user.email, id: user._id }
    const token = signToken(tokenPayload);

    return NextResponse.json<ApiResponse<{token: string}>>({
      success: true,
      message: "User logged in successfully",
      data: {
        token
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: 'Registration failed. Please try again.',
      },
      { status: 500 }
    );
  }
}