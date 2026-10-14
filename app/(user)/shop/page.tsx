'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import ProductFilters, { ProductFilterValues } from '@/components/product/ProductFilters';
import ProductGrid from '@/components/product/ProductGrid';
import { IProduct, ICategory } from '@/types';
import { toast } from 'sonner';
import { useCurrency } from '@/context/CurrencyContext';

export default function ShopPage() {
  const searchParams = useSearchParams();
  const { currency } = useCurrency();
  const [products, setProducts] = useState<IProduct[]>([]);
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [filters, setFilters] = useState<ProductFilterValues>({
    sort: 'newest',
    currency,
  });

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
        const category = filters.category || searchParams.get('category');
        if (category) {
          params.set('category', category);
        }
        if (searchParams.get('search')) {
          params.set('search', searchParams.get('search') || '');
        }
        if (searchParams.get('featured') === 'true') {
          params.set('featured', 'true');
        }
        if (searchParams.get('new') === 'true') {
          params.set('newArrival', 'true');
        }
        params.set('sort', filters.sort);
        params.set('currency', currency);
        if (filters.priceRange) {
          params.set('minPrice', String(filters.priceRange[0]));
          params.set('maxPrice', String(filters.priceRange[1]));
        }
        if (filters.sizes?.length) params.set('sizes', filters.sizes.join(','));
        if (filters.colors?.length) params.set('colors', filters.colors.join(','));

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
  }, [searchParams, currentPage, filters, currency]);

  const handleFilterChange = (nextFilters: ProductFilterValues) => {
    setCurrentPage(1);
    setFilters(nextFilters);
  };

  const totalPages = Math.ceil(totalProducts / limit);

  return (
    <div className="min-h-screen bg-[#fbf9f3]">
      <div className="bg-primary px-4 py-12 text-white sm:px-6 sm:py-16 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-secondary">
            Ruthie&apos;s Africa · The collection
          </p>
          <h1 className="font-playfair text-4xl sm:text-5xl">Find your next favourite.</h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-white/70 sm:text-base">
            Considered pieces with a little something extra. Find a look that feels like you.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <div className="grid grid-cols-1 gap-7 lg:grid-cols-[250px_1fr] lg:gap-10">
          <aside>
            <ProductFilters
              onFilterChange={handleFilterChange}
              availableCategories={categories}
            />
          </aside>

          <section>
            <div className="mb-5 flex min-h-12 flex-wrap items-center justify-between gap-3 border-b border-primary/10 pb-4">
              <p className="text-sm text-neutral-600">
                Showing <span className="font-semibold text-primary">
                  {products.length > 0 ? (currentPage - 1) * limit + 1 : 0}
                </span>{' '}
                – <span className="font-semibold text-primary">
                  {Math.min(currentPage * limit, totalProducts)}
                </span>{' '}
                of <span className="font-semibold text-primary">{totalProducts}</span> pieces
              </p>
              <p className="text-xs font-medium uppercase tracking-[0.12em] text-primary/55">
                {searchParams.get('search') ? `Searching “${searchParams.get('search')}”` : 'Curated for you'}
              </p>
            </div>

            <ProductGrid products={products} isLoading={isLoading} />

            {totalPages > 1 && (
              <div className="mt-10 flex items-center justify-center gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="rounded-full border border-primary/20 px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
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
                      className={`h-10 min-w-10 rounded-full px-3 text-sm font-medium transition-all ${
                        currentPage === pageNum
                          ? 'bg-primary text-white'
                          : 'border border-primary/15 text-primary hover:bg-white'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="rounded-full border border-primary/20 px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
