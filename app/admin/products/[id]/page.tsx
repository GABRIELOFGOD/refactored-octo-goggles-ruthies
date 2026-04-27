import ProductForm from '@/components/admin/ProductForm';
import { getProduct } from '@/lib/products';
import { getCategories } from '@/lib/categories';
// import { useEffect, useState } from 'react';

interface EditProductPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProductPage({
  params,
}: EditProductPageProps) {
  const { id } = await params;
  
  const [productData, categories] = await Promise.all([
    getProduct(id),
    getCategories(),
  ]);

  if (!productData || productData.isDeleted) {
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
        <p className="text-neutral-600">{productData?.name}</p>
      </div>

      <ProductForm product={productData} categories={categories} isEditing />
    </div>
  );
}
