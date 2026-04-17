'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { IProduct, ICategory } from '@/types';
import { Upload, X, Plus, Trash2 } from 'lucide-react';
import Image from 'next/image';

interface ProductFormProps {
  product?: IProduct;
  categories: ICategory[];
  isEditing?: boolean;
}

export default function ProductForm({
  product,
  categories,
  isEditing = false,
}: ProductFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [images, setImages] = useState<string[]>(product?.gallery || []);
  const [heroImage, setHeroImage] = useState(product?.heroImage || '');
  const [formData, setFormData] = useState({
    name: product?.name || '',
    slug: product?.slug || '',
    category: product?.category || '',
    description: product?.description || '',
    heroImageUrl: product?.heroImage || '',
    prices: {
      NGN: product?.prices?.NGN || 0,
      USD: product?.prices?.USD || 0,
      GBP: product?.prices?.GBP || 0,
      EUR: product?.prices?.EUR || 0,
    },
    variants: product?.variants || [],
    tags: product?.tags || [],
    isFeatured: product?.isFeatured || false,
    isNewArrival: product?.isNewArrival || false,
    isPublished: product?.isPublished || false,
    metaTitle: product?.metaTitle || '',
    metaDescription: product?.metaDescription || '',
  });

  const [newVariant, setNewVariant] = useState({
    size: '',
    color: '',
    material: '',
    stock: 0,
    sku: '',
  });

  const [newTag, setNewTag] = useState('');

  // Auto-generate slug from name
  useEffect(() => {
    if (!isEditing) {
      const generatedSlug = formData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      setFormData((prev) => ({ ...prev, slug: generatedSlug }));
    }
  }, [formData.name, isEditing]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const formDataObj = new FormData();
    for (const file of files) {
      formDataObj.append('files', file);
    }

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formDataObj,
      });

      if (!response.ok) throw new Error('Upload failed');

      const data = await response.json();
      if (data.urls) {
        const newImages = [...images, ...data.urls];
        setImages(newImages);
        if (!heroImage && data.urls.length > 0) {
          setHeroImage(data.urls[0]);
          setFormData((prev) => ({
            ...prev,
            heroImageUrl: data.urls[0],
          }));
        }
      }
    } catch (error) {
      toast.error('Failed to upload images');
    }
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);
    if (heroImage === images[index]) {
      setHeroImage(newImages[0] || '');
      setFormData((prev) => ({
        ...prev,
        heroImageUrl: newImages[0] || '',
      }));
    }
  };

  const addVariant = () => {
    if (!newVariant.size || !newVariant.sku) {
      toast.error('Size and SKU are required');
      return;
    }
    setFormData((prev) => ({
      ...prev,
      variants: [...prev.variants, { ...newVariant, _id: Math.random().toString() }],
    }));
    setNewVariant({ size: '', color: '', material: '', stock: 0, sku: '' });
  };

  const removeVariant = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== index),
    }));
  };

  const addTag = () => {
    if (!newTag.trim()) return;
    if (!formData.tags.includes(newTag)) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, newTag],
      }));
    }
    setNewTag('');
  };

  const removeTag = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.name ||
      !formData.category ||
      !formData.description ||
      !heroImage ||
      Object.values(formData.prices).every((p) => p === 0)
    ) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsLoading(true);

    try {
      const endpoint = isEditing ? `/api/admin/products/${product?._id}` : '/api/admin/products';
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          heroImage,
          gallery: images,
        }),
      });

      if (!response.ok) throw new Error('Failed to save product');

      toast.success(isEditing ? 'Product updated' : 'Product created');
      router.push('/admin/products');
    } catch (error) {
      toast.error('Failed to save product');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Basic Info */}
      <div className="bg-white border border-neutral-200 rounded-lg p-6">
        <h2 className="text-xl font-display text-primary mb-4">Basic Information</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-semibold text-primary mb-2">
              Product Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
              placeholder="Enter product name"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-primary mb-2">
              Slug *
            </label>
            <input
              type="text"
              value={formData.slug}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, slug: e.target.value }))
              }
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
              placeholder="auto-generated"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-primary mb-2">
              Category *
            </label>
            <select
              value={typeof formData.category === 'string' ? formData.category : formData.category?._id || ''}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, category: e.target.value }))
              }
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
            >
              <option value="">Select a category</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="bg-white border border-neutral-200 rounded-lg p-6">
        <h2 className="text-xl font-display text-primary mb-4">Description</h2>
        <textarea
          value={formData.description}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, description: e.target.value }))
          }
          rows={6}
          className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
          placeholder="Product description"
        />
      </div>

      {/* Images */}
      <div className="bg-white border border-neutral-200 rounded-lg p-6">
        <h2 className="text-xl font-display text-primary mb-4">Product Images</h2>

        <div className="mb-6">
          <label className="block text-sm font-semibold text-primary mb-3">
            Upload Images *
          </label>
          <label className="flex items-center justify-center w-full h-32 border-2 border-dashed border-neutral-300 rounded-lg cursor-pointer hover:bg-light-bg transition-colors">
            <div className="flex flex-col items-center justify-center">
              <Upload className="w-8 h-8 text-secondary mb-2" />
              <span className="text-sm text-neutral-600">Click to upload</span>
            </div>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </label>
        </div>

        {images.length > 0 && (
          <div className="mb-6">
            <label className="block text-sm font-semibold text-primary mb-3">
              Gallery ({images.length})
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {images.map((img, idx) => (
                <div
                  key={idx}
                  className={`relative aspect-square rounded-lg overflow-hidden border-2 cursor-pointer ${
                    heroImage === img ? 'border-secondary' : 'border-neutral-200'
                  }`}
                  onClick={() => {
                    setHeroImage(img);
                    setFormData((prev) => ({ ...prev, heroImageUrl: img }));
                  }}
                >
                  <Image
                    src={img}
                    alt={`Product ${idx}`}
                    fill
                    className="object-cover"
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeImage(idx);
                    }}
                    className="absolute top-2 right-2 bg-red-600 p-1 rounded-full text-white hover:bg-red-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Pricing */}
      <div className="bg-white border border-neutral-200 rounded-lg p-6">
        <h2 className="text-xl font-display text-primary mb-4">Pricing</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {(['NGN', 'USD', 'GBP', 'EUR'] as const).map((currency) => (
            <div key={currency}>
              <label className="block text-sm font-semibold text-primary mb-2">
                {currency} *
              </label>
              <input
                type="number"
                value={formData.prices[currency]}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    prices: {
                      ...prev.prices,
                      [currency]: parseFloat(e.target.value) || 0,
                    },
                  }))
                }
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
                placeholder="0"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Variants */}
      <div className="bg-white border border-neutral-200 rounded-lg p-6">
        <h2 className="text-xl font-display text-primary mb-4">Variants</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <input
            type="text"
            value={newVariant.size}
            onChange={(e) =>
              setNewVariant((prev) => ({ ...prev, size: e.target.value }))
            }
            placeholder="Size (S, M, L...)"
            className="px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
          />
          <input
            type="text"
            value={newVariant.color}
            onChange={(e) =>
              setNewVariant((prev) => ({ ...prev, color: e.target.value }))
            }
            placeholder="Color"
            className="px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
          />
          <input
            type="text"
            value={newVariant.material}
            onChange={(e) =>
              setNewVariant((prev) => ({ ...prev, material: e.target.value }))
            }
            placeholder="Material"
            className="px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
          />
          <input
            type="number"
            value={newVariant.stock}
            onChange={(e) =>
              setNewVariant((prev) => ({
                ...prev,
                stock: parseInt(e.target.value) || 0,
              }))
            }
            placeholder="Stock"
            className="px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
          />
          <input
            type="text"
            value={newVariant.sku}
            onChange={(e) =>
              setNewVariant((prev) => ({ ...prev, sku: e.target.value }))
            }
            placeholder="SKU"
            className="px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
          />
          <button
            type="button"
            onClick={addVariant}
            className="bg-secondary text-light-bg rounded-lg hover:bg-secondary/90 flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add
          </button>
        </div>

        {formData.variants.length > 0 && (
          <div className="space-y-2">
            {formData.variants.map((variant, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between bg-light-bg p-3 rounded-lg"
              >
                <div className="text-sm">
                  <span className="font-semibold">{variant.size}</span>
                  {variant.color && <span className="mx-1">•</span>}
                  {variant.color && <span>{variant.color}</span>}
                  {variant.material && <span className="mx-1">•</span>}
                  {variant.material && <span>{variant.material}</span>}
                  <span className="mx-1">•</span>
                  <span className="text-neutral-600">Stock: {variant.stock}</span>
                  <span className="mx-1">•</span>
                  <span className="text-neutral-600 font-mono">{variant.sku}</span>
                </div>
                <button
                  type="button"
                  onClick={() => removeVariant(idx)}
                  className="text-red-600 hover:bg-red-50 p-2 rounded"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tags & SEO */}
      <div className="bg-white border border-neutral-200 rounded-lg p-6">
        <h2 className="text-xl font-display text-primary mb-4">Tags & SEO</h2>

        <div className="mb-6">
          <label className="block text-sm font-semibold text-primary mb-2">
            Tags
          </label>
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
              placeholder="Add a tag"
              className="flex-1 px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
            />
            <button
              type="button"
              onClick={addTag}
              className="bg-secondary text-light-bg px-4 rounded-lg hover:bg-secondary/90"
            >
              Add
            </button>
          </div>

          {formData.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {formData.tags.map((tag, idx) => (
                <div
                  key={idx}
                  className="bg-secondary/10 border border-secondary text-secondary px-3 py-1 rounded-full flex items-center gap-2 text-sm"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(idx)}
                    className="hover:text-secondary/70"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-primary mb-2">
              Meta Title
            </label>
            <input
              type="text"
              value={formData.metaTitle}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, metaTitle: e.target.value }))
              }
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
              placeholder="SEO title"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-primary mb-2">
              Meta Description
            </label>
            <textarea
              value={formData.metaDescription}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  metaDescription: e.target.value,
                }))
              }
              rows={3}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
              placeholder="SEO description"
            />
          </div>
        </div>
      </div>

      {/* Options */}
      <div className="bg-white border border-neutral-200 rounded-lg p-6">
        <h2 className="text-xl font-display text-primary mb-4">Options</h2>

        <div className="space-y-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.isFeatured}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  isFeatured: e.target.checked,
                }))
              }
              className="w-4 h-4"
            />
            <span className="text-sm font-semibold text-primary">
              Featured Product
            </span>
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.isNewArrival}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  isNewArrival: e.target.checked,
                }))
              }
              className="w-4 h-4"
            />
            <span className="text-sm font-semibold text-primary">
              New Arrival
            </span>
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.isPublished}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  isPublished: e.target.checked,
                }))
              }
              className="w-4 h-4"
            />
            <span className="text-sm font-semibold text-primary">
              Publish Product
            </span>
          </label>
        </div>
      </div>

      {/* Submit */}
      <div className="flex gap-4 justify-end">
        <Button
          type="button"
          variant="outline"
          className="border-primary text-primary hover:bg-light-bg"
          onClick={() => router.back()}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isLoading}
          className="bg-secondary text-light-bg hover:bg-secondary/90"
        >
          {isLoading ? 'Saving...' : isEditing ? 'Update Product' : 'Create Product'}
        </Button>
      </div>
    </form>
  );
}
