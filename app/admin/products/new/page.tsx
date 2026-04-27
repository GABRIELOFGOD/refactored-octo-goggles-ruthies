
import connectToDatabase from '@/lib/mongoose';
import { Category } from '@/models/Category';
import ProductForm from '@/components/admin/ProductForm';

export default async function NewProductPage() {

  await connectToDatabase();
  const categories = await Category.find({ isDeleted: { $ne: true } }).lean() as any[];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-display text-primary">Create New Product</h1>
        <p className="text-neutral-600">Add a new product to your catalog</p>
      </div>

      <ProductForm categories={categories as any} />
    </div>
  );
}
