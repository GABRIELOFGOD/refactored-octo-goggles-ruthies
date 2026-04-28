'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { IProduct, IBanner, IService } from '@/types';
import { useCurrency } from '@/context/CurrencyContext';
import { formatPrice } from '@/lib/i18n';

export default function HomePage() {
  const [banners, setBanners] = useState<IBanner[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<IProduct[]>([]);
  const [newArrivals, setNewArrivals] = useState<IProduct[]>([]);
  const [services, setServices] = useState<IService[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const { currency } = useCurrency();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [bannersRes, featuredRes, newRes, servicesRes] = await Promise.all([
          fetch('/api/banners?position=hero&isActive=true'),
          fetch('/api/products?featured=true&limit=8'),
          fetch('/api/products?newArrival=true&limit=8'),
          fetch('/api/services'),
        ]);

        if (bannersRes.ok) {
          const data = await bannersRes.json();
          setBanners(data.data || []);
        }
        if (featuredRes.ok) {
          const data = await featuredRes.json();
          setFeaturedProducts(data.data || []);
        }
        if (newRes.ok) {
          const data = await newRes.json();
          setNewArrivals(data.data || []);
        }
        if (servicesRes.ok) {
          const data = await servicesRes.json();
          setServices(data.data || []);
        }
      } catch (error) {
        console.error('Failed to fetch homepage data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div>
      {/* Hero Banner */}
      <section className="relative h-96 md:h-screen bg-gray-900 text-white flex items-center justify-center">
        {banners.length > 0 ? (
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${banners[0].image})` }}
          >
            <div className="absolute inset-0 bg-black/40"></div>
          </div>
        ) : (
          <div className="absolute inset-0 bg-linear-to-r from-primary to-accent"></div>
        )}
        <div className="relative z-10 max-w-4xl mx-auto text-center px-4">
          <h1 className="text-5xl md:text-7xl font-bold font-playfair mb-4">
            {banners[0]?.title || 'We Style, You Slay'}
          </h1>
          <p className="text-xl md:text-2xl mb-8">
            {banners[0]?.subtitle || 'Premium African Fashion'}
          </p>
          <Link
            href={banners[0]?.ctaLink || '/shop'}
            className="bg-secondary text-primary px-8 py-3 rounded-lg font-bold hover:bg-opacity-90 transition-all inline-block"
          >
            {banners[0]?.ctaText || 'Shop Now'}
          </Link>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold font-playfair mb-12 text-center">Featured Pieces</h2>
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-64 bg-gray-200 rounded-lg animate-pulse"></div>
              ))}
            </div>
          ) : featuredProducts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {featuredProducts.map((product) => (
                <Link
                  key={product._id}
                  href={`/shop/${product.slug}`}
                  className="group cursor-pointer"
                >
                  <div className="relative h-64 bg-gray-200 rounded-lg overflow-hidden mb-4">
                    <img
                      src={product.heroImage}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <h3 className="font-playfair text-lg font-bold text-primary">
                    {product.name}
                  </h3>
                  <p className="text-secondary font-bold mt-2">
                    {formatPrice(product.prices[currency as keyof typeof product.prices], currency)}
                  </p>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500">No featured products available</p>
          )}
        </div>
      </section>

      {/* New Arrivals */}
      <section className="py-16 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold font-playfair mb-12 text-center">New Arrivals</h2>
          {newArrivals.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {newArrivals.map((product) => (
                <Link
                  key={product._id}
                  href={`/shop/${product.slug}`}
                  className="group cursor-pointer"
                >
                  <div className="relative h-64 bg-gray-200 rounded-lg overflow-hidden mb-4">
                    <img
                      src={product.heroImage}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <h3 className="font-playfair text-lg font-bold text-primary">
                    {product.name}
                  </h3>
                  <p className="text-secondary font-bold mt-2">
                    {formatPrice(product.prices[currency as keyof typeof product.prices], currency)}
                  </p>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500">No new arrivals available</p>
          )}
        </div>
      </section>

      {/* Services */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold font-playfair mb-12 text-center">Our Services</h2>
          {services.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {services.map((service) => (
                <Link
                  key={service._id}
                  href={`/services/${service.slug}`}
                  className="group border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="h-48 bg-gray-200 overflow-hidden">
                    {service.image && (
                      <img
                        src={service.image}
                        alt={service.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    )}
                  </div>
                  <div className="p-6">
                    <h3 className="font-playfair text-lg font-bold text-primary mb-2">
                      {service.name}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4">{service.shortDescription}</p>
                    <p className="text-secondary font-bold">
                      {formatPrice(service.prices[currency as keyof typeof service.prices], currency)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500">No services available</p>
          )}
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-16 bg-primary text-white">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold font-playfair mb-4">Stay Updated</h2>
          <p className="text-gray-300 mb-8">Subscribe to our newsletter for the latest collections and exclusive offers.</p>
          <form className="flex gap-2" onSubmit={(e) => e.preventDefault()}>
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-lg text-primary"
              required
            />
            <button className="bg-secondary text-primary px-8 py-3 rounded-lg font-bold hover:bg-opacity-90 transition-all">
              Subscribe
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
