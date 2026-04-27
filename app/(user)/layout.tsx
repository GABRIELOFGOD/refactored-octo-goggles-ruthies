"use client";

import Header from '@/components/Header';
import { useAuth } from '@/provider/auth-provider';
import Link from 'next/link';

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <main className="grow">{children}</main>

      {/* Footer */}
      <footer className="bg-primary text-white py-12 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-playfair text-lg font-bold mb-4">Ruthies Africa</h3>
              <p className="text-neutral-300">We style, you slay</p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Shop</h4>
              <ul className="space-y-2 text-sm text-neutral-300">
                <li>
                  <a href="/shop" className="hover:text-light-bg transition-colors">All Products</a>
                </li>
                <li>
                  <a href="/shop?featured=true" className="hover:text-light-bg transition-colors">Featured</a>
                </li>
                <li>
                  <a href="/shop?new=true" className="hover:text-light-bg transition-colors">New Arrivals</a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Services</h4>
              <ul className="space-y-2 text-sm text-neutral-300">
                <li>
                  <a href="/services" className="hover:text-light-bg transition-colors">Our Services</a>
                </li>
                <li>
                  <a href="/services" className="hover:text-light-bg transition-colors">Book Now</a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Account</h4>
              <ul className="space-y-2 text-sm text-neutral-300">
                <li>
                  <Link href={user ? '/account' : '/auth/login'} className="hover:text-light-bg transition-colors">
                    {user ? 'My Account' : 'Login'}
                  </Link>
                </li>
                <li>
                  <Link href="/orders" className="hover:text-light-bg transition-colors">Orders</Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-neutral-700 pt-8 text-center text-sm text-neutral-300">
            <p>&copy; {new Date().getFullYear()} Ruthies Africa. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
