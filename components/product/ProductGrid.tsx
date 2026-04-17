import ProductCard from '@/components/ProductCard';
import { IProduct } from '@/types';

interface ProductGridProps {
  products: IProduct[];
  isLoading?: boolean;
  onWishlistChange?: () => void;
}

export default function ProductGrid({
  products,
  isLoading = false,
  onWishlistChange,
}: ProductGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="animate-pulse space-y-4">
            <div className="h-72 bg-gray-200 rounded-lg"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-600 text-lg">No products found matching your filters.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
      {products.map((product) => (
        <ProductCard
          key={product._id}
          product={product}
          onWishlistChange={onWishlistChange}
        />
      ))}
    </div>
  );
}
