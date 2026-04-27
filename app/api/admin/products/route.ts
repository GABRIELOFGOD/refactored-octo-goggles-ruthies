import { NextRequest, NextResponse } from 'next/server';
import { Product } from '@/models/Product';
import connectToDatabase from '@/lib/mongoose';
import { ApiResponse, IProduct } from '@/types';
import { authenticateUser } from '@/lib/auth-helpers';
import { Category } from '@/models/Category';

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    const user = await authenticateUser(request);
    if (!user || user.role !== "admin") return NextResponse.json<ApiResponse>({ success: false, error: "Unauthorized" }, { status: 403 });

    const page = parseInt(request.nextUrl.searchParams.get('page') || '1', 10);
    const limit = parseInt(request.nextUrl.searchParams.get('limit') || '20', 10);
    const category = request.nextUrl.searchParams.get('category');
    const status = request.nextUrl.searchParams.get('status');
    const search = request.nextUrl.searchParams.get('search');

    let query: any = { isDeleted: { $ne: true } };

    if (category) {
      query.category = category;
    }

    if (status === 'published') {
      query.published = true;
    } else if (status === 'draft') {
      query.published = false;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    console.log("got here");

    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .populate({
        path: "category",
        select: "name", // optional
        options: { strictPopulate: false } // 👈 prevents errors
      })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return NextResponse.json<ApiResponse<IProduct[]>>(
      {
        success: true,
        data: products,
        meta: { total, page, limit },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Get products error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: error, message: error.error || 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

// export const GET = async (request: NextRequest) => {
//   try {
//     const user = await authenticateUser(request);
//     if (!user || user.role !== "admin") return NextResponse.json<ApiResponse>({ success: false, error: "Unauthorized" }, { status: 403 });

//     const page = parseInt(request.nextUrl.searchParams.get('page') || '1', 10);
    
//     const limit = parseInt(request.nextUrl.searchParams.get('limit') || '20', 10);

//     const category = request.nextUrl.searchParams.get('category');

//     const status = request.nextUrl.searchParams.get('status');
//     const search = request.nextUrl.searchParams.get('search');

//     const products = await Product.find()
//       // .populate('category')
//       .sort({ createdAt: -1 })
//       .skip((page - 1) * limit)
//       .limit(limit);

//       console.log("found products", products);
    
//     // const products = await Product.find();
//     return NextResponse.json<ApiResponse>({ success: true, message: "All products", data: products });
//   } catch (error: any) {
//     NextResponse.json<ApiResponse>({
//       success: false, error, message: error.error || error.message || "unknown error has occured"
//     });
//   }
// }

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();

    const user = await authenticateUser(request);
    if (!user || user.role !== "admin") return NextResponse.json<ApiResponse>({ success: false, error: "Unauthorized" }, { status: 403 });

    const body = await request.json();
    // const { name, category, description, prices, images, variants, tags, featured, newArrival, published, seo } = body;
    const { name, category, description, prices, heroImage, gallery, variants, tags, isFeatured, isNewArrival, isPublished, metaTitle, metaDescription } = body;

    // Generate slug
    const slug = name
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w-]/g, '');

    const existingProductSlug = await Product.findOne({ slug });
    const existingProductName = await Product.findOne({ name });

    if (existingProductSlug) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'A product with the same slug already exists. Please choose a different name.' },
        { status: 400 }
      );
    }

    if (existingProductName) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'A product with the same name already exists. Please choose a different name.' },
        { status: 400 }
      );
    }

    const productCategory = await Category.findById(category);
    if (!productCategory) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Invalid product category.' },
        { status: 400 }
      );
    }

    // const product = new Product({
    //   name,
    //   slug,
    //   category,
    //   description,
    //   prices,
    //   images: {
    //     hero: images?.hero,
    //     gallery: images?.gallery || [],
    //   },
    //   variants: variants || [],
    //   tags: tags || [],
    //   featured: featured || false,
    //   newArrival: newArrival || false,
    //   published: published || false,
    //   seo: seo || {},
    // });
    const product = new Product({
      name,
      slug,
      category: productCategory._id,
      description,
      prices,
      heroImage,
      gallery: gallery || [],
      variants: variants || [],
      tags: tags || [],
      isFeatured: isFeatured || false,
      isNewArrival: isNewArrival || false,
      isPublished: isPublished || false,
      metaTitle: metaTitle || '',
      metaDescription: metaDescription || '',
    });

    await product.save();
    await product.populate('category');

    return NextResponse.json<ApiResponse<IProduct>>(
      {
        success: true,
        data: product,
        message: 'Product created successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create product error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Failed to create product' },
      { status: 500 }
    );
  }
}
