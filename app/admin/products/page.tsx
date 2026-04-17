import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth';
import { redirect } from 'next/navigation';
import connectToDatabase from '@/lib/mongoose';
import { Product } from '@/models/Product';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export default async function ProductsAdminPage() {
  const session = await getServerSession(authConfig);

  if (!session || session.user.role !== 'admin') {
    redirect('/auth/login');
  }

  await connectToDatabase();

  const products = await Product.find({ isDeleted: { $ne: true } })
    .populate('category', 'name')
    .select('name heroImage category prices isPublished createdAt')
    .sort({ createdAt: -1 })
    .limit(50)
    .lean();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display text-primary">Products</h1>
          <p className="text-neutral-600">Manage your product catalog</p>
        </div>
        <Link href="/admin/products/new">
          <Button className="bg-secondary text-light-bg hover:bg-secondary/90">
            <Plus className="w-4 h-4 mr-2" />
            New Product
          </Button>
        </Link>
      </div>

      <div className="bg-white border border-neutral-200 rounded-lg overflow-hidden">
        {products.length === 0 ? (
          <div className="p-8 text-center text-neutral-600">No products found</div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-200 bg-light-bg">
                <th className="px-6 py-3 text-left text-sm font-semibold text-primary">Name</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-primary">Category</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-primary">Price (NGN)</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-primary">Status</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-primary">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product: any) => (
                <tr
                  key={product._id}
                  className="border-b border-neutral-200 hover:bg-light-bg/30 transition-colors"
                >
                  <td className="px-6 py-4 text-sm font-semibold text-primary">
                    {product.name}
                  </td>
                  <td className="px-6 py-4 text-sm text-neutral-600">
                    {product.category?.name || 'Uncategorized'}
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-secondary">
                    ₦{product.prices?.NGN?.toLocaleString() || '0'}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                        product.isPublished
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {product.isPublished ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <Link href={`/admin/products/${product._id}`}>
                      <Button
                        variant="outline"
                        className="border-primary text-primary hover:bg-light-bg text-sm"
                      >
                        Edit
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
