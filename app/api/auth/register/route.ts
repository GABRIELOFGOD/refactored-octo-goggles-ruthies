import { NextRequest, NextResponse } from 'next/server';
import { User } from '@/models/User';
import connectToDatabase from '@/lib/mongoose';
import { hashPassword, generateSlug } from '@/lib/auth-helpers';
import { ApiResponse } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const { name, email, password, confirmPassword, phone } = await request.json();

    // Validation
    if (!name || !email || !password || !confirmPassword) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Missing required fields',
        },
        { status: 400 }
      );
    }

    if (password !== confirmPassword) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Passwords do not match',
        },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Password must be at least 8 characters',
        },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Check if user exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Email already registered',
        },
        { status: 409 }
      );
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user
    const user = new User({
      name,
      email: email.toLowerCase(),
      passwordHash,
      phone: phone || undefined,
      preferredCurrency: 'USD',
      preferredLanguage: 'en',
      isActive: true,
    });

    await user.save();

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        message: 'Registration successful',
        data: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
        },
      },
      { status: 201 }
    );
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
