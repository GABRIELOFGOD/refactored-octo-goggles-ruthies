'use client';

import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { ShoppingCart, Heart } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/provider/auth-provider';
import Image from 'next/image';

export default function Header() {
  const { items: cartItems } = useCart();
  const { wishlistItems } = useWishlist();
  const pathName = usePathname();
  const { user, logOut } = useAuth();

  return (
    <header className="bg-white border-b border-neutral-200 sticky top-0 z-40">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
        <div className='w-10 h-10 my-auto relative'>
          <Image
            src={"/brand/ruthies_logo.jpg"}
            alt='Logo'
            fill
            className='w-full h-full object-cover'
          />
        </div>
          <h1 className="text-2xl font-bold font-playfair text-primary">
            Ruthies
          </h1>
        </Link>

        {/* Navigation */}
        <div className="hidden md:flex items-center space-x-8">
          <Link href="/shop" className="text-neutral-700 hover:text-secondary font-medium">
            Shop
          </Link>
          <Link href="/services" className="text-neutral-700 hover:text-secondary font-medium">
            Services
          </Link>
          <Link href="/size-guide" className="text-neutral-700 hover:text-secondary font-medium">
            Size Guide
          </Link>
          <Link href="/track-order" className="text-neutral-700 hover:text-secondary font-medium">
            Track Order
          </Link>
        </div>

        {/* Right side - Auth & Cart */}
        <div className="flex items-center space-x-4">
          {user ? (
            <>
              <span className="text-sm text-neutral-700 hidden sm:inline">
                {user?.name}
              </span>
              <Link
                href="/orders"
                className="text-neutral-700 hover:text-secondary font-medium hidden sm:flex"
              >
                Orders
              </Link>
              <Link
                href="/account"
                className="text-neutral-700 hover:text-secondary font-medium hidden sm:flex"
              >
                Account
              </Link>
              <button
                onClick={() => logOut({ redirectTo: `${pathName}` })}
                className="text-neutral-700 hover:text-secondary font-medium hidden sm:flex cursor-pointer"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                href={pathName !== "/" ? `/auth/login?from=${pathName}` : "/auth/login"}
                className="text-neutral-700 hover:text-secondary font-medium hidden sm:flex"
              >
                Login
              </Link>
              <Link
                href="/auth/register"
                className="bg-primary text-light-bg px-4 py-2 rounded-lg hover:bg-primary/90 font-medium transition-all hidden sm:flex"
              >
                Register
              </Link>
            </>
          )}

          {/* Cart Icon */}
          <Link
            href="/cart"
            className="relative text-neutral-700 hover:text-secondary transition-colors"
          >
            <ShoppingCart className="w-6 h-6" />
            {cartItems.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-secondary text-light-bg text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {cartItems.length}
              </span>
            )}
          </Link>

          {/* Wishlist Icon */}
          <Link
            href="/wishlist"
            className="relative text-neutral-700 hover:text-secondary transition-colors"
          >
            <Heart className="w-6 h-6" />
            {wishlistItems.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-secondary text-light-bg text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {wishlistItems.length}
              </span>
            )}
          </Link>
        </div>
      </nav>
    </header>
  );
}
