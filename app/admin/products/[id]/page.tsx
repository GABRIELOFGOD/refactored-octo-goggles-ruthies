'use client';

import ProductForm from '@/components/admin/ProductForm';
import { useAuth } from '@/provider/auth-provider';
import { getClientAuthHeaders } from '@/lib/client-auth';
import { ApiResponse, ICategory, IProduct } from '@/types';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export default function EditProductPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [product, setProduct] = useState<IProduct | null>(null);
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.replace('/auth/login');
      return;
    }
    if (user.role !== 'admin') {
      router.replace('/');
      return;
    }

    let cancelled = false;
    const headers = getClientAuthHeaders();

    const loadProductData = async () => {
      try {
        const [productResponse, categoriesResponse] = await Promise.all([
          fetch(`/api/admin/products/${id}`, { headers }),
          fetch('/api/admin/categories', { headers }),
        ]);
        const [productResult, categoriesResult] = await Promise.all([
          productResponse.json() as Promise<ApiResponse<IProduct>>,
          categoriesResponse.json() as Promise<ApiResponse<ICategory[]>>,
        ]);

        if (!productResponse.ok || !productResult.success || !productResult.data) {
          throw new Error(productResult.error || 'Failed to fetch product');
        }
        if (!categoriesResponse.ok || !categoriesResult.success || !categoriesResult.data) {
          throw new Error(categoriesResult.error || 'Failed to fetch categories');
        }

        if (!cancelled) {
          setProduct(productResult.data);
          setCategories(categoriesResult.data);
        }
      } catch (error) {
        console.error('Failed to load product editor data:', error);
        toast.error(error instanceof Error ? error.message : 'Failed to load product');
        if (!cancelled) setHasError(true);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    void loadProductData();
    return () => {
      cancelled = true;
    };
  }, [authLoading, id, router, user]);

  if (authLoading || isLoading) {
    return (
      <div className="flex min-h-64 items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-primary" />
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return null;
  }

  if (hasError) {
    return (
      <div className="space-y-4">
        <p className="text-neutral-600">Unable to load this product for editing.</p>
        <button className="text-primary underline" onClick={() => window.location.reload()}>
          Try again
        </button>
      </div>
    );
  }

  if (!product || product.isDeleted) {
    return (
      <div className="h-screen flex justify-center items-center">
        <p>Product not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-display text-primary">Edit Product</h1>
        <p className="text-neutral-600">{product.name}</p>
      </div>

      <ProductForm product={product} categories={categories} isEditing />
    </div>
  );
}
