import { NextRequest, NextResponse } from 'next/server';
import { Category } from '@/models/Category';
import connectToDatabase from '@/lib/mongoose';
import { ApiResponse, ICategory } from '@/types';
import { auth } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();
    const session = await auth();

    if (!session?.user?.role || session.user.role !== 'admin') {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const category = await Category.findById(params.id);

    if (!category || category.isDeleted) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Category not found' },
        { status: 404 }
      );
    }

    return NextResponse.json<ApiResponse<ICategory>>(
      { success: true, data: category },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get category error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Failed to fetch category' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();
    const session = await auth();

    if (!session?.user?.role || session.user.role !== 'admin') {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name, description, image, parent } = body;

    const category = await Category.findByIdAndUpdate(
      params.id,
      {
        name,
        description,
        image,
        parent: parent || null,
      },
      { new: true }
    );

    if (!category) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Category not found' },
        { status: 404 }
      );
    }

    return NextResponse.json<ApiResponse<ICategory>>(
      {
        success: true,
        data: category,
        message: 'Category updated successfully',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Update category error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Failed to update category' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();
    const session = await auth();

    if (!session?.user?.role || session.user.role !== 'admin') {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const category = await Category.findByIdAndUpdate(
      params.id,
      {
        isDeleted: true,
        deletedAt: new Date(),
      },
      { new: true }
    );

    if (!category) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Category not found' },
        { status: 404 }
      );
    }

    return NextResponse.json<ApiResponse>(
      { success: true, message: 'Category deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Delete category error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Failed to delete category' },
      { status: 500 }
    );
  }
}
