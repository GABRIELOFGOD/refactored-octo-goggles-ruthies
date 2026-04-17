'use client';

import { useState } from 'react';
import { IProduct } from '@/types';

interface ProductImageGalleryProps {
  product: IProduct;
}

export default function ProductImageGallery({ product }: ProductImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const allImages = [product.heroImage, ...product.gallery];

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div
        className="relative h-96 sm:h-[500px] bg-gray-100 rounded-lg overflow-hidden cursor-zoom-in"
        onClick={() => setIsLightboxOpen(true)}
      >
        <img
          src={allImages[selectedIndex]}
          alt={`${product.name} - Image ${selectedIndex + 1}`}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Thumbnail Gallery */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {allImages.map((image, index) => (
          <button
            key={index}
            onClick={() => setSelectedIndex(index)}
            className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
              selectedIndex === index ? 'border-primary' : 'border-gray-200 hover:border-primary'
            }`}
          >
            <img src={image} alt={`Thumbnail ${index + 1}`} className="w-full h-full object-cover" />
          </button>
        ))}
      </div>

      {/* Lightbox Modal */}
      {isLightboxOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setIsLightboxOpen(false)}
        >
          <div className="relative max-w-4xl w-full max-h-screen flex items-center justify-center">
            <img
              src={allImages[selectedIndex]}
              alt={`${product.name} - Full resolution`}
              className="w-full h-auto max-h-screen object-contain"
              onClick={(e) => e.stopPropagation()}
            />

            {/* Lightbox Controls */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedIndex((prev) => (prev === 0 ? allImages.length - 1 : prev - 1));
              }}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white w-10 h-10 rounded-full flex items-center justify-center transition-all"
            >
              ←
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedIndex((prev) => (prev === allImages.length - 1 ? 0 : prev + 1));
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white w-10 h-10 rounded-full flex items-center justify-center transition-all"
            >
              →
            </button>

            <button
              onClick={() => setIsLightboxOpen(false)}
              className="absolute top-4 right-4 bg-white/80 hover:bg-white w-10 h-10 rounded-full flex items-center justify-center transition-all text-xl font-bold"
            >
              ✕
            </button>

            {/* Image Counter */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 text-white px-4 py-2 rounded-full text-sm">
              {selectedIndex + 1} / {allImages.length}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
