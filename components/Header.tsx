'use client';

import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { useLanguage } from '@/context/LanguageContext';
import { ShoppingCart, Heart, Menu, X } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/provider/auth-provider';
import Image from 'next/image';
import { useState } from 'react';
import { LanguageSwitcher } from './LanguageSwitcher';
import { CurrencySwitcher } from './CurrencySwitcher';
import { t } from '@/lib/i18n';

export default function Header() {
  const { items: cartItems } = useCart();
  const { wishlistItems } = useWishlist();
  const { language } = useLanguage();
  const pathName = usePathname();
  const { user, logOut } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  return (
    <header className="bg-white border-b border-neutral-200 sticky top-0 z-40">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2" onClick={closeMenu}>
          <div className="w-10 h-10 my-auto relative">
            <Image src={"/brand/ruthies_logo.jpg"} alt="Logo" fill className="w-full h-full object-cover" />
          </div>
          <h1 className="text-2xl hidden md:flex font-bold font-playfair text-primary">Ruthies</h1>
        </Link>

        {/* Navigation - Desktop */}
        <div className="hidden md:flex items-center space-x-8">
          <Link href="/shop" className="text-neutral-700 hover:text-secondary font-medium">
            {t(language, 'nav.shop')}
          </Link>
          <Link href="/services" className="text-neutral-700 hover:text-secondary font-medium">
            {t(language, 'nav.services')}
          </Link>
          <Link href="/size-guide" className="text-neutral-700 hover:text-secondary font-medium">
            {t(language, 'nav.sizeGuide')}
          </Link>
          <Link href="/track-order" className="text-neutral-700 hover:text-secondary font-medium">
            {t(language, 'nav.trackOrder')}
          </Link>
        </div>

        {/* Right side - Language, Currency, Auth & Cart */}
        <div className="flex items-center space-x-2 md:space-x-4">
          {/* Language & Currency Switchers */}
          <LanguageSwitcher />
          <CurrencySwitcher />

          {/* Auth Links - Desktop */}
          <div className="hidden sm:flex items-center space-x-2">
            {user ? (
              <>
                {/* <span className="text-sm text-neutral-700">{user?.name}</span> */}
                <Link href="/orders" className="text-neutral-700 hover:text-secondary font-medium text-sm">
                  {t(language, 'nav.orders')}
                </Link>
                <Link href="/account" className="text-neutral-700 hover:text-secondary font-medium text-sm">
                  {t(language, 'nav.account')}
                </Link>
                <button
                  onClick={() => logOut({ redirectTo: `${pathName}` })}
                  className="text-neutral-700 hover:text-secondary font-medium text-sm cursor-pointer"
                >
                  {t(language, 'nav.logout')}
                </button>
              </>
            ) : (
              <>
                <Link
                  href={pathName !== "/" ? `/auth/login?from=${pathName}` : "/auth/login"}
                  className="text-neutral-700 hover:text-secondary font-medium text-sm"
                >
                  {t(language, 'nav.login')}
                </Link>
                <Link
                  href="/auth/register"
                  className="bg-primary text-light-bg px-4 py-2 rounded-lg hover:bg-primary/90 font-medium transition-all text-sm"
                >
                  {t(language, 'nav.register')}
                </Link>
              </>
            )}
          </div>

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

          {/* Hamburger Menu - Mobile */}
          <button
            onClick={toggleMenu}
            className="md:hidden text-neutral-700 hover:text-secondary transition-colors"
            aria-label={t(language, 'nav.menu')}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </nav>

      {/* Mobile Navigation Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-neutral-200 px-4 py-4 space-y-3">
          {/* Mobile Navigation Links */}
          <Link
            href="/shop"
            className="block text-neutral-700 hover:text-secondary font-medium py-2"
            onClick={closeMenu}
          >
            {t(language, 'nav.shop')}
          </Link>
          <Link
            href="/services"
            className="block text-neutral-700 hover:text-secondary font-medium py-2"
            onClick={closeMenu}
          >
            {t(language, 'nav.services')}
          </Link>
          <Link
            href="/size-guide"
            className="block text-neutral-700 hover:text-secondary font-medium py-2"
            onClick={closeMenu}
          >
            {t(language, 'nav.sizeGuide')}
          </Link>
          <Link
            href="/track-order"
            className="block text-neutral-700 hover:text-secondary font-medium py-2"
            onClick={closeMenu}
          >
            {t(language, 'nav.trackOrder')}
          </Link>

          <hr className="my-2" />

          {/* Mobile Auth Links */}
          {user ? (
            <>
              <div className="text-sm text-neutral-700 py-2 font-medium">{user?.name}</div>
              <Link
                href="/orders"
                className="block text-neutral-700 hover:text-secondary font-medium py-2"
                onClick={closeMenu}
              >
                {t(language, 'nav.orders')}
              </Link>
              <Link
                href="/account"
                className="block text-neutral-700 hover:text-secondary font-medium py-2"
                onClick={closeMenu}
              >
                {t(language, 'nav.account')}
              </Link>
              <button
                onClick={() => {
                  logOut({ redirectTo: `${pathName}` });
                  closeMenu();
                }}
                className="block w-full text-left text-neutral-700 hover:text-secondary font-medium py-2"
              >
                {t(language, 'nav.logout')}
              </button>
            </>
          ) : (
            <>
              <Link
                href={pathName !== "/" ? `/auth/login?from=${pathName}` : "/auth/login"}
                className="block text-neutral-700 hover:text-secondary font-medium py-2"
                onClick={closeMenu}
              >
                {t(language, 'nav.login')}
              </Link>
              <Link
                href="/auth/register"
                className="block bg-primary text-light-bg px-4 py-2 rounded-lg hover:bg-primary/90 font-medium transition-all text-center"
                onClick={closeMenu}
              >
                {t(language, 'nav.register')}
              </Link>
            </>
          )}
        </div>
      )}
    </header>
  );
}
