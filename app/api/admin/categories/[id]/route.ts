import { NextRequest, NextResponse } from 'next/server';
import { Category } from '@/models/Category';
import connectToDatabase from '@/lib/mongoose';
import { ApiResponse, ICategory } from '@/types';
import { authenticateUser } from '@/lib/auth-helpers';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;
    await connectToDatabase();
        
    const user = await authenticateUser(request);
    if (!user || user.role !== "admin") return NextResponse.json<ApiResponse>({ success: false, error: "Unauthorized" }, { status: 403 });

    const category = await Category.findById(id);

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
    const { id } = await params;
    await connectToDatabase();
    
    const user = await authenticateUser(request);
    if (!user || user.role !== "admin") return NextResponse.json<ApiResponse>({ success: false, error: "Unauthorized" }, { status: 403 });

    const body = await request.json();
    const { name, description, image, parent } = body;

    const category = await Category.findByIdAndUpdate(
      id,
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
    const { id } = await params;
    await connectToDatabase();
    
    const user = await authenticateUser(request);
    if (!user || user.role !== "admin") return NextResponse.json<ApiResponse>({ success: false, error: "Unauthorized" }, { status: 403 });

    const category = await Category.findByIdAndUpdate(
      id,
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
