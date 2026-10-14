'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Globe2, Scissors, ShieldCheck, Sparkles } from 'lucide-react';
import { IProduct, IBanner } from '@/types';
import ProductCard from '@/components/ProductCard';
import ServiceGrid from '@/components/ServiceGrid';

export default function HomePage() {
  const [banners, setBanners] = useState<IBanner[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<IProduct[]>([]);
  const [newArrivals, setNewArrivals] = useState<IProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [bannersRes, featuredRes, newRes] = await Promise.all([
          fetch('/api/banners?position=hero&isActive=true'),
          fetch('/api/products?featured=true&limit=8'),
          fetch('/api/products?newArrival=true&limit=8'),
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
      } catch (error) {
        console.error('Failed to fetch homepage data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const heroImage = banners[0]?.image || featuredProducts[0]?.heroImage;

  return (
    <div className="bg-[#fbf9f3]">
      <section className="px-4 pb-12 pt-5 sm:px-6 lg:px-8 lg:pb-16 lg:pt-8">
        <div className="mx-auto grid max-w-7xl overflow-hidden rounded-[2rem] bg-primary text-white shadow-xl shadow-primary/10 lg:min-h-[590px] lg:grid-cols-[0.9fr_1.1fr]">
          <div className="relative z-10 flex flex-col items-start justify-center px-7 py-14 sm:px-12 lg:px-16 lg:py-20">
            <span className="mb-7 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/85">
              <Sparkles className="h-4 w-4 text-secondary" />
              Ruthie&apos;s Africa · Wear your story
            </span>
            <h1 className="max-w-xl font-playfair text-5xl font-medium leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
              {banners[0]?.title || 'Made to move the room.'}
            </h1>
            <p className="mt-6 max-w-md text-base leading-7 text-white/75 sm:text-lg">
              {banners[0]?.subtitle ||
                'Thoughtful African style, beautifully made for every version of you.'}
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-4">
              <Link
                href={banners[0]?.ctaLink || '/shop'}
                className="inline-flex min-h-12 items-center gap-3 rounded-full bg-secondary px-7 py-3 font-semibold text-primary transition-transform hover:-translate-y-0.5 hover:shadow-lg"
              >
                {banners[0]?.ctaText || 'Shop the collection'}
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/services"
                className="inline-flex min-h-12 items-center gap-2 px-3 py-3 text-sm font-medium text-white/85 transition-colors hover:text-secondary"
              >
                Meet your stylist
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="mt-12 flex items-center gap-3 border-t border-white/15 pt-6">
              <div className="flex -space-x-2" aria-hidden="true">
                <span className="h-8 w-8 rounded-full border-2 border-primary bg-secondary" />
                <span className="h-8 w-8 rounded-full border-2 border-primary bg-[#d8b6a0]" />
                <span className="h-8 w-8 rounded-full border-2 border-primary bg-[#f2dfbd]" />
              </div>
              <p className="text-xs leading-5 text-white/65">
                Personal style, with an<br />African point of view.
              </p>
            </div>
          </div>
          <div
            className="relative min-h-[360px] bg-[#6d7650] bg-cover bg-center sm:min-h-[480px] lg:min-h-full"
            style={heroImage ? { backgroundImage: `url("${heroImage}")` } : undefined}
            role={heroImage ? 'img' : undefined}
            aria-label={heroImage ? 'Featured Ruthie’s Africa fashion collection' : undefined}
          >
            <div className="absolute inset-0 bg-linear-to-t from-primary/45 via-transparent to-primary/10 lg:bg-linear-to-r lg:from-primary/20 lg:to-transparent" />
            {!heroImage && (
              <div className="absolute inset-0 flex items-center justify-center p-8 text-center">
                <span className="font-playfair text-4xl text-white/80 sm:text-6xl">
                  Style that<br />feels like you.
                </span>
              </div>
            )}
            <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between gap-4 sm:bottom-9 sm:left-9 sm:right-9">
              <div className="rounded-2xl border border-white/30 bg-white/90 p-4 text-primary shadow-lg backdrop-blur-sm sm:p-5">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-primary/60">
                  The Ruthie&apos;s edit
                </p>
                <p className="mt-1 font-playfair text-xl sm:text-2xl">A little extra, always.</p>
              </div>
              <Link
                href="/shop"
                aria-label="Explore the collection"
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-secondary text-primary transition-transform hover:scale-105"
              >
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-primary/10 bg-white">
        <div className="mx-auto grid max-w-7xl grid-cols-1 divide-y divide-primary/10 px-4 sm:grid-cols-3 sm:divide-x sm:divide-y-0 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 py-5 sm:justify-center sm:py-6">
            <Scissors className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium text-primary">Personal styling, made easy</span>
          </div>
          <div className="flex items-center gap-4 py-5 sm:justify-center sm:py-6">
            <Globe2 className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium text-primary">An African point of view</span>
          </div>
          <div className="flex items-center gap-4 py-5 sm:justify-center sm:py-6">
            <ShieldCheck className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium text-primary">Thoughtful pieces, made to last</span>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex items-end justify-between gap-4 sm:mb-10">
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-primary/60">A Ruthie&apos;s favourite</p>
              <h2 className="font-playfair text-3xl text-primary sm:text-4xl">The pieces to know</h2>
            </div>
            <Link href="/shop?featured=true" className="hidden items-center gap-2 text-sm font-semibold text-primary hover:text-primary/70 sm:inline-flex">
              Shop featured <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          {isLoading ? (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
              {[1, 2, 3, 4].map((item) => (
                <div key={item} className="animate-pulse">
                  <div className="aspect-[4/5] rounded-2xl bg-primary/10" />
                  <div className="mt-4 h-4 w-3/4 rounded bg-primary/10" />
                  <div className="mt-3 h-4 w-1/3 rounded bg-primary/10" />
                </div>
              ))}
            </div>
          ) : featuredProducts.length > 0 ? (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
              {featuredProducts.slice(0, 4).map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-primary/10 bg-white px-6 py-12 text-center">
              <p className="font-playfair text-xl text-primary">A fresh edit is on its way.</p>
              <p className="mt-2 text-sm text-neutral-600">Explore the full collection in the meantime.</p>
              <Link href="/shop" className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-primary">
                Shop all pieces <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          )}
          <Link href="/shop?featured=true" className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-primary sm:hidden">
            Shop featured <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <section className="bg-[#f1eee4] py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex items-end justify-between gap-4 sm:mb-10">
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-primary/60">Just landed</p>
              <h2 className="font-playfair text-3xl text-primary sm:text-4xl">New ways to show up</h2>
            </div>
            <Link href="/shop?new=true" className="hidden items-center gap-2 text-sm font-semibold text-primary hover:text-primary/70 sm:inline-flex">
              Explore new arrivals <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          {newArrivals.length > 0 ? (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
              {newArrivals.slice(0, 4).map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-primary/10 bg-white/70 px-6 py-12 text-center">
              <p className="font-playfair text-xl text-primary">New arrivals are coming soon.</p>
            </div>
          )}
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-2 text-center">
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-primary/60">The finishing touch</p>
            <h2 className="font-playfair text-3xl text-primary sm:text-4xl">Style, your way</h2>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-neutral-600 sm:text-base">
              From a wardrobe refresh to a look for your biggest moment, let our stylists help you feel like yourself.
            </p>
          </div>
          <ServiceGrid length={6} />
        </div>
      </section>

      <section className="px-4 pb-16 sm:px-6 lg:px-8 lg:pb-20">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 rounded-[2rem] bg-primary px-7 py-10 text-white sm:flex-row sm:items-center sm:px-12 sm:py-12">
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-secondary">Your next favourite is here</p>
            <h2 className="font-playfair text-3xl sm:text-4xl">Dress like you mean it.</h2>
            <p className="mt-3 max-w-lg text-sm leading-6 text-white/70">Find the piece that feels unmistakably yours.</p>
          </div>
          <Link href="/shop" className="inline-flex min-h-12 shrink-0 items-center gap-3 rounded-full bg-secondary px-7 py-3 font-semibold text-primary transition-transform hover:-translate-y-0.5">
            Explore the shop <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
