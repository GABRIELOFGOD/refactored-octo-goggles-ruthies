import { NextRequest, NextResponse } from 'next/server';
import catalog from '@/data/african-wear-catalog.json';
import connectToDatabase from '@/lib/mongoose';
import { authenticateUser } from '@/lib/auth-helpers';
import { Category } from '@/models/Category';
import { Product } from '@/models/Product';
import type { ApiResponse } from '@/types';

const categoryDetails: Record<string, { name: string; description: string; sortOrder: number }> = {
  dresses: {
    name: 'Dresses',
    description: 'African-inspired occasion and everyday dresses.',
    sortOrder: 1,
  },
  tops: {
    name: 'Tops',
    description: 'African-inspired blouses, shirts and statement tops.',
    sortOrder: 2,
  },
  'skirts-trousers': {
    name: 'Skirts & Trousers',
    description: 'African-inspired skirts and trousers.',
    sortOrder: 3,
  },
  'sets-co-ords': {
    name: 'Sets & Co-ords',
    description: 'Coordinated African-inspired outfit sets.',
    sortOrder: 4,
  },
  outerwear: {
    name: 'Outerwear',
    description: 'African-inspired jackets, capes and layering pieces.',
    sortOrder: 5,
  },
};

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();

    const user = await authenticateUser(request);
    if (!user || user.role !== 'admin') {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      );
    }

    if (
      catalog.length !== 30 ||
      catalog.some((item) => !item.heroImage || item.gallery.length < 2 || item.photoCredits.length < 3)
    ) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'The catalog data is incomplete and cannot be imported.' },
        { status: 500 }
      );
    }

    const categoryIds = new Map<string, string>();
    let createdCount = 0;
    let skippedCount = 0;

    for (const item of catalog) {
      const rawCategorySlug: unknown = item.categorySlug;
      if (typeof rawCategorySlug !== 'string' || rawCategorySlug.length === 0) {
        throw new Error(`Catalog product ${item.slug} is missing a category.`);
      }
      const categorySlug = rawCategorySlug;

      const details = categoryDetails[categorySlug];
      if (!details) {
        throw new Error(`Unknown catalog category: ${categorySlug}`);
      }

      let categoryId = categoryIds.get(categorySlug);
      if (!categoryId) {
        let category = await Category.findOne({
          $or: [{ slug: categorySlug }, { name: details.name }],
        });
        if (!category) {
          category = await Category.create({
            name: details.name,
            slug: categorySlug,
            description: details.description,
            sortOrder: details.sortOrder,
          });
        } else if (category.isDeleted) {
          category.isDeleted = false;
          category.deletedAt = undefined;
          await category.save();
        }
        const resolvedCategoryId = category._id.toString();
        categoryId = resolvedCategoryId;
        categoryIds.set(categorySlug, resolvedCategoryId);
      }

      const existingProduct = await Product.findOne({ slug: item.slug });
      if (existingProduct) {
        skippedCount += 1;
        continue;
      }

      await Product.create({
        name: item.name,
        slug: item.slug,
        description: item.description,
        prices: item.prices,
        heroImage: item.heroImage,
        gallery: item.gallery,
        photoCredits: item.photoCredits,
        variants: item.variants,
        tags: item.tags,
        isFeatured: item.isFeatured,
        isNewArrival: item.isNewArrival,
        category: categoryId,
        isPublished: true,
        metaTitle: item.metaTitle,
        metaDescription: item.metaDescription,
        totalSold: item.totalSold,
        isDeleted: item.isDeleted,
      });
      createdCount += 1;
    }

    return NextResponse.json<ApiResponse<{ createdCount: number; skippedCount: number }>>(
      {
        success: true,
        data: { createdCount, skippedCount },
        message: 'Catalog import completed.',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Catalog import error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Failed to import catalog.' },
      { status: 500 }
    );
  }
}
