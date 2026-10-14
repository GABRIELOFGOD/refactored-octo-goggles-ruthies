import ProductCard from '@/components/ProductCard';
import { IProduct } from '@/types';

interface ProductGridProps {
  products: IProduct[];
  isLoading?: boolean;
}

export default function ProductGrid({
  products,
  isLoading = false,
}: ProductGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-5 sm:gap-6 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="animate-pulse space-y-4">
            <div className="aspect-[4/5] rounded-2xl bg-primary/10"></div>
            <div className="h-4 w-3/4 rounded bg-primary/10"></div>
            <div className="h-4 w-1/2 rounded bg-primary/10"></div>
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="rounded-2xl border border-primary/10 bg-white px-6 py-16 text-center">
        <p className="font-playfair text-2xl text-primary">No pieces found just yet.</p>
        <p className="mt-2 text-sm text-neutral-600">Try adjusting your filters to find your next favourite.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-5 sm:gap-6 lg:grid-cols-3">
      {products.map((product) => (
        <ProductCard key={product._id} product={product} />
      ))}
    </div>
  );
}
