'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import ProductFilters from '@/components/product/ProductFilters';
import ProductGrid from '@/components/product/ProductGrid';
import { IProduct, ICategory } from '@/types';
import { toast } from 'sonner';

export default function ShopPage() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<IProduct[]>([]);
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);

  const limit = 12;

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch categories
        const categoriesRes = await fetch('/api/categories');
        if (categoriesRes.ok) {
          const data = await categoriesRes.json();
          setCategories(data.data || []);
        }

        // Build query params
        const params = new URLSearchParams();
        params.set('page', currentPage.toString());
        params.set('limit', limit.toString());

        // Add filters from URL
        if (searchParams.get('category')) {
          params.set('category', searchParams.get('category') || '');
        }
        if (searchParams.get('search')) {
          params.set('search', searchParams.get('search') || '');
        }

        // Fetch products
        const productsRes = await fetch(`/api/products?${params.toString()}`);
        if (productsRes.ok) {
          const data = await productsRes.json();
          setProducts(data.data || []);
          setTotalProducts(data.meta?.total || 0);
        }
      } catch (error) {
        console.error('Failed to fetch shop data:', error);
        toast.error('Failed to load products');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [searchParams, currentPage]);

  const handleFilterChange = (filters: any) => {
    setCurrentPage(1); // Reset to first page when filters change
    // In a real implementation, you'd update URL params here
  };

  const totalPages = Math.ceil(totalProducts / limit);

  return (
    <div className="min-h-screen bg-light-bg">
      {/* Page Header */}
      <div className="bg-white border-b border-neutral-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold font-display text-primary">Shop</h1>
          <p className="text-neutral-600 mt-2">
            Explore our curated collection of premium pieces
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <ProductFilters
              onFilterChange={handleFilterChange}
              availableCategories={categories}
            />
          </div>

          {/* Products Grid */}
          <div className="lg:col-span-3">
            {/* Results Header */}
            <div className="mb-8 flex items-center justify-between">
              <div className="text-neutral-600">
                Showing{' '}
                <span className="font-bold text-neutral-900">
                  {products.length > 0 ? (currentPage - 1) * limit + 1 : 0}
                </span>
                -
                <span className="font-bold text-neutral-900">
                  {Math.min(currentPage * limit, totalProducts)}
                </span>
                of <span className="font-bold text-neutral-900">{totalProducts}</span> products
              </div>
            </div>

            {/* Products */}
            <ProductGrid products={products} isLoading={isLoading} />

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-12 flex items-center justify-center gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-neutral-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-light-bg transition-colors"
                >
                  Previous
                </button>

                {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                  const pageNum = currentPage > 3 ? currentPage - 2 + i : i + 1;
                  if (pageNum > totalPages) return null;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`px-4 py-2 rounded-lg transition-all ${
                        currentPage === pageNum
                          ? 'bg-primary text-light-bg'
                          : 'border border-neutral-300 hover:bg-light-bg'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border border-neutral-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-light-bg transition-colors"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
