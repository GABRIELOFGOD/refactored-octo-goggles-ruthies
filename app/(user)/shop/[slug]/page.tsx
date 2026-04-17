'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import ProductImageGallery from '@/components/product/ProductImageGallery';
import ProductVariantSelector from '@/components/product/ProductVariantSelector';
import ProductGrid from '@/components/product/ProductGrid';
import { IProduct, ProductVariant } from '@/types';
import { toast } from 'sonner';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { Heart } from 'lucide-react';

export default function ProductDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { addToCart } = useCart();
  const { toggleWishlist, isWishlisted } = useWishlist();

  const [product, setProduct] = useState<IProduct | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<IProduct[]>([]);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isAddingToWishlist, setIsAddingToWishlist] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setIsLoading(true);
        const res = await fetch(`/api/products/${slug}`);
        if (!res.ok) throw new Error('Product not found');

        const data = await res.json();
        const productData = data.data as IProduct;
        setProduct(productData);

        // Set initial variant
        if (productData.variants.length > 0) {
          setSelectedVariant(productData.variants[0]);
        }

        // Fetch related products (same category)
        if (productData.category) {
          const categoryId = typeof productData.category === 'string' 
            ? productData.category 
            : productData.category._id;
          const relatedRes = await fetch(
            `/api/products?category=${categoryId}&limit=4`
          );
          if (relatedRes.ok) {
            const relatedData = await relatedRes.json();
            setRelatedProducts(
              (relatedData.data as IProduct[]).filter((p) => p._id !== productData._id)
            );
          }
        }
      } catch (error) {
        console.error('Failed to fetch product:', error);
        toast.error('Product not found');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [slug]);

  const handleAddToCart = async () => {
    if (!product || !selectedVariant) {
      toast.error('Please select a variant');
      return;
    }

    if (selectedVariant.stock === 0) {
      toast.error('This variant is out of stock');
      return;
    }

    setIsAddingToCart(true);
    try {
      const price = product.prices?.NGN || 0;
      await addToCart({
        product: product._id,
        quantity,
        price,
        currency: 'NGN',
        variant: selectedVariant,
      });
      toast.success(`${quantity} item(s) added to cart!`);
      setQuantity(1);
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add to cart');
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleAddToWishlist = async () => {
    if (!product) return;

    setIsAddingToWishlist(true);
    try {
      await toggleWishlist(product._id);
      const isWished = isWishlisted(product._id);
      toast.success(isWished ? 'Removed from wishlist' : 'Added to wishlist!');
    } catch (error) {
      console.error('Error toggling wishlist:', error);
      toast.error('Failed to update wishlist');
    } finally {
      setIsAddingToWishlist(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-48"></div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Product Not Found</h1>
          <p className="text-gray-600 mt-2">We couldn't find the product you're looking for.</p>
        </div>
      </div>
    );
  }

  const categoryName = typeof product.category === 'string' 
    ? product.category 
    : product.category?.name || 'Category';

  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 text-sm text-gray-600">
        <a href="/" className="hover:text-primary">Home</a>
        <span className="mx-2">/</span>
        <a href="/shop" className="hover:text-primary">Shop</a>
        <span className="mx-2">/</span>
        <span className="text-gray-900">{product.name}</span>
      </div>

      {/* Product Details */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Image Gallery */}
          <div>
            <ProductImageGallery product={product} />
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Category & Title */}
            <div>
              <p className="text-sm text-gray-500 font-medium">{categoryName}</p>
              <h1 className="text-4xl font-bold font-playfair text-primary mt-2">
                {product.name}
              </h1>
            </div>

            {/* Price & Stock */}
            <div className="space-y-2">
              <div className="flex items-baseline gap-2">
                <p className="text-3xl font-bold text-secondary">
                  ${product.prices.USD.toFixed(2)}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-gray-300">
                      ★
                    </span>
                  ))}
                </div>
                <span className="text-sm text-gray-600">
                  {product.totalSold} people have purchased this
                </span>
              </div>
            </div>

            {/* Description */}
            {product.description && (
              <div className="prose prose-sm max-w-none">
                <p className="text-gray-700">{product.description}</p>
              </div>
            )}

            {/* Divider */}
            <div className="border-t border-gray-200 pt-6"></div>

            {/* Variant Selector */}
            {product.variants.length > 0 && (
              <ProductVariantSelector
                variants={product.variants}
                onSelect={setSelectedVariant}
                selectedVariant={selectedVariant || undefined}
              />
            )}

            {/* Quantity & Add to Cart */}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <label className="font-medium text-gray-700">Quantity:</label>
                <div className="flex items-center border border-gray-300 rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-4 py-2 text-gray-600 hover:bg-gray-100"
                  >
                    −
                  </button>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-12 text-center border-0 focus:outline-none"
                    min="1"
                  />
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-4 py-2 text-gray-600 hover:bg-gray-100"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4">
                <button
                  onClick={handleAddToCart}
                  disabled={isAddingToCart || !selectedVariant || selectedVariant.stock === 0}
                  className="flex-1 bg-primary text-white py-4 rounded-lg font-bold hover:bg-opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isAddingToCart ? 'Adding...' : 'Add to Cart'}
                </button>
                <button
                  onClick={handleAddToWishlist}
                  disabled={isAddingToWishlist}
                  className={`px-6 py-4 border-2 rounded-lg font-bold transition-all disabled:opacity-50 ${
                    product && isWishlisted(product._id)
                      ? 'bg-red-500 text-white border-red-500 hover:bg-red-600'
                      : 'border-primary text-primary hover:bg-primary hover:text-white'
                  }`}
                >
                  <Heart
                    className="w-5 h-5"
                    fill={product && isWishlisted(product._id) ? 'currentColor' : 'none'}
                  />
                </button>
              </div>
            </div>

            {/* Shipping Info */}
            <div className="bg-neutral-50 p-4 rounded-lg space-y-2 text-sm text-gray-600">
              <p>
                <span className="font-medium">🚚 Free Shipping</span> on orders over $100
              </p>
              <p>
                <span className="font-medium">↩️ Easy Returns</span> 30-day return policy
              </p>
              <p>
                <span className="font-medium">🛡️ Guaranteed Safe</span> Checkout with SSL encryption
              </p>
            </div>

            {/* SEO Meta */}
            {product.metaDescription && (
              <div className="text-sm text-gray-600 italic">
                {product.metaDescription}
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-20 pt-12 border-t border-gray-200">
            <h2 className="text-4xl font-bold font-playfair mb-8">You Might Also Like</h2>
            <ProductGrid products={relatedProducts} />
          </div>
        )}
      </div>
    </div>
  );
}
