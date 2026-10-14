"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { Download, LoaderCircle, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { adminFetch } from '@/lib/admin-helper';
import { useProducts } from '@/hooks/use-products';

export default function ProductsAdminPage() {
  const { products, refetch } = useProducts();
  const [isImporting, setIsImporting] = useState(false);

  const importCatalog = async () => {
    setIsImporting(true);
    try {
      const response = await adminFetch('/api/admin/products/import-catalog', {
        method: 'POST',
      });
      const result = await response.json() as {
        success: boolean;
        data?: { createdCount: number; skippedCount: number };
        error?: string;
      };
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Catalog import failed');
      }

      await refetch();
      toast.success(
        `Catalog ready: ${result.data.createdCount} added, ${result.data.skippedCount} already present.`
      );
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Catalog import failed');
      console.error('Catalog import failed:', error);
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display text-primary">Products</h1>
          <p className="text-neutral-600">Manage your product catalog</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button
            type="button"
            onClick={importCatalog}
            disabled={isImporting}
            variant="outline"
            className="border-primary text-primary hover:bg-light-bg"
          >
            {isImporting
              ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
              : <Download className="mr-2 h-4 w-4" />}
            {isImporting ? 'Importing catalog…' : 'Import 30 style references'}
          </Button>
          <Link href="/admin/products/new">
            <Button className="bg-secondary cursor-pointer text-light-bg hover:bg-secondary/90">
              <Plus className="w-4 h-4 mr-2" />
              New Product
            </Button>
          </Link>
        </div>
      </div>

      <p className="rounded-lg border border-secondary/40 bg-secondary/10 px-4 py-3 text-sm text-primary">
        The catalog import publishes 30 African-fashion references. Photos are licensed editorial references,
        and the listed sizes and quantities are demonstration inventory; product descriptions ask shoppers to
        confirm real availability with your stylist.
      </p>

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
              {products.map((product) => (
                <tr
                  key={product._id}
                  className="border-b border-neutral-200 hover:bg-light-bg/30 transition-colors"
                >
                  <td className="px-6 py-4 text-sm font-semibold text-primary">
                    {product.name}
                  </td>
                  <td className="px-6 py-4 text-sm text-neutral-600">
                    {typeof product.category === 'string'
                      ? 'Uncategorized'
                      : product.category?.name || 'Uncategorized'}
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
