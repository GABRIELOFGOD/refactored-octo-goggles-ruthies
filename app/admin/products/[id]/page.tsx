import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth';
import { redirect, notFound } from 'next/navigation';
import connectToDatabase from '@/lib/mongoose';
import { Product } from '@/models/Product';
import { Category } from '@/models/Category';
import ProductForm from '@/components/admin/ProductForm';

interface EditProductPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProductPage({
  params,
}: EditProductPageProps) {
  const session = await getServerSession(authConfig);

  if (!session || session.user.role !== 'admin') {
    redirect('/auth/login');
  }

  await connectToDatabase();

  const { id } = await params;
  const productData: any = await Product.findById(id).populate('category').lean();

  if (!productData || productData?.isDeleted) {
    notFound();
  }

  const categories = await Category.find({ isDeleted: { $ne: true } }).lean() as any[];

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
