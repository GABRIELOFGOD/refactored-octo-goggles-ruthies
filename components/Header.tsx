'use client';

import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { useLanguage } from '@/context/LanguageContext';
import { ShoppingCart, Heart, Menu, X, ArrowUpRight } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/provider/auth-provider';
import Image from 'next/image';
import { useState } from 'react';
import { LanguageSwitcher } from './LanguageSwitcher';
import { CurrencySwitcher } from './CurrencySwitcher';
import { t } from '@/lib/i18n';

export default function Header() {
  const { totalItems } = useCart();
  const { wishlistItems } = useWishlist();
  const { language } = useLanguage();
  const pathName = usePathname();
  const { user, logOut } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  return (
    <header className="sticky top-0 z-40 border-b border-primary/10 bg-[#fffdf9]/95 shadow-sm shadow-primary/5 backdrop-blur-xl">
      <div className="bg-primary px-4 py-2 text-center text-[10px] font-medium tracking-[0.16em] text-white/90 sm:text-xs">
        AFRICAN STYLE, STYLED FOR YOU
      </div>
      <nav className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex shrink-0 items-center gap-2.5" onClick={closeMenu}>
          <div className="relative my-auto h-10 w-10 overflow-hidden rounded-full ring-1 ring-primary/10">
            <Image src="/brand/ruthies_logo.jpg" alt="Ruthie&apos;s Africa" fill className="h-full w-full object-cover" />
          </div>
          <div className="hidden sm:block">
            <p className="font-playfair text-xl font-semibold leading-none tracking-tight text-primary">Ruthie&apos;s</p>
            <p className="mt-1 text-[9px] font-semibold uppercase tracking-[0.19em] text-primary/60">Africa · Wear your story</p>
          </div>
        </Link>

        {/* Navigation - Desktop */}
        <div className="hidden items-center gap-7 md:flex">
          <Link href="/shop" className={`text-sm font-medium transition-colors hover:text-primary ${pathName.startsWith('/shop') ? 'text-primary' : 'text-neutral-600'}`}>
            {t(language, 'nav.shop')}
          </Link>
          <Link href="/services" className={`text-sm font-medium transition-colors hover:text-primary ${pathName.startsWith('/services') ? 'text-primary' : 'text-neutral-600'}`}>
            {t(language, 'nav.services')}
          </Link>
          <Link href="/size-guide" className="text-sm font-medium text-neutral-600 transition-colors hover:text-primary">
            {t(language, 'nav.sizeGuide')}
          </Link>
          <Link href="/track-order" className="text-sm font-medium text-neutral-600 transition-colors hover:text-primary">
            {t(language, 'nav.trackOrder')}
          </Link>
        </div>

        {/* Right side - Language, Currency, Auth & Cart */}
        <div className="flex items-center gap-2 md:gap-3">
          {/* Language & Currency Switchers */}
          <LanguageSwitcher />
          <CurrencySwitcher />

          {/* Auth Links - Desktop */}
          <div className="hidden sm:flex items-center space-x-2">
            {user ? (
              <>
                {/* <span className="text-sm text-neutral-700">{user?.name}</span> */}
                <Link href="/orders" className="text-sm font-medium text-neutral-600 transition-colors hover:text-primary">
                  {t(language, 'nav.orders')}
                </Link>
                <Link href="/account" className="text-sm font-medium text-neutral-600 transition-colors hover:text-primary">
                  {t(language, 'nav.account')}
                </Link>
                <button
                  onClick={() => logOut({ redirectTo: `${pathName}` })}
                  className="cursor-pointer text-sm font-medium text-neutral-600 transition-colors hover:text-primary"
                >
                  {t(language, 'nav.logout')}
                </button>
              </>
            ) : (
              <>
                <Link
                  href={pathName !== "/" ? `/auth/login?from=${pathName}` : "/auth/login"}
                  className="text-sm font-medium text-neutral-600 transition-colors hover:text-primary"
                >
                  {t(language, 'nav.login')}
                </Link>
                <Link
                  href="/auth/register"
                  className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary/90"
                >
                  {t(language, 'nav.register')}
                </Link>
              </>
            )}
          </div>

          {/* Cart Icon */}
          <Link
            href="/cart"
            aria-label={`Shopping bag${totalItems > 0 ? `, ${totalItems} items` : ''}`}
            className="relative flex h-10 w-10 items-center justify-center rounded-full text-primary transition-colors hover:bg-primary/5"
          >
            <ShoppingCart className="h-[19px] w-[19px]" />
            {totalItems > 0 && (
              <span className="absolute right-0 top-0 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-secondary px-1 text-[10px] font-bold text-primary ring-2 ring-[#fffdf9]">
                {totalItems}
              </span>
            )}
          </Link>

          {/* Wishlist Icon */}
          <Link
            href="/wishlist"
            aria-label={`Wishlist${wishlistItems.length > 0 ? `, ${wishlistItems.length} items` : ''}`}
            className="relative flex h-10 w-10 items-center justify-center rounded-full text-primary transition-colors hover:bg-primary/5"
          >
            <Heart className="h-[19px] w-[19px]" />
            {wishlistItems.length > 0 && (
              <span className="absolute right-0 top-0 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-secondary px-1 text-[10px] font-bold text-primary ring-2 ring-[#fffdf9]">
                {wishlistItems.length}
              </span>
            )}
          </Link>

          {/* Hamburger Menu - Mobile */}
          <button
            onClick={toggleMenu}
            aria-expanded={isMenuOpen}
            className="flex h-10 w-10 items-center justify-center rounded-full text-primary transition-colors hover:bg-primary/5 md:hidden"
            aria-label={t(language, 'nav.menu')}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </nav>

      {/* Mobile Navigation Menu */}
      {isMenuOpen && (
        <div className="space-y-3 border-t border-primary/10 bg-[#fffdf9] px-4 py-4 md:hidden">
          {/* Mobile Navigation Links */}
          <Link
            href="/shop"
            className="flex items-center justify-between py-2 font-medium text-neutral-700 transition-colors hover:text-primary"
            onClick={closeMenu}
          >
            {t(language, 'nav.shop')}
            <ArrowUpRight className="h-4 w-4" />
          </Link>
          <Link
            href="/services"
            className="block py-2 font-medium text-neutral-700 transition-colors hover:text-primary"
            onClick={closeMenu}
          >
            {t(language, 'nav.services')}
          </Link>
          <Link
            href="/size-guide"
            className="block py-2 font-medium text-neutral-700 transition-colors hover:text-primary"
            onClick={closeMenu}
          >
            {t(language, 'nav.sizeGuide')}
          </Link>
          <Link
            href="/track-order"
            className="block py-2 font-medium text-neutral-700 transition-colors hover:text-primary"
            onClick={closeMenu}
          >
            {t(language, 'nav.trackOrder')}
          </Link>

          <hr className="my-2 border-primary/10" />

          {/* Mobile Auth Links */}
          {user ? (
            <>
              <div className="py-2 text-sm font-medium text-neutral-700">{user?.name}</div>
              <Link
                href="/orders"
                className="block py-2 font-medium text-neutral-700 transition-colors hover:text-primary"
                onClick={closeMenu}
              >
                {t(language, 'nav.orders')}
              </Link>
              <Link
                href="/account"
                className="block py-2 font-medium text-neutral-700 transition-colors hover:text-primary"
                onClick={closeMenu}
              >
                {t(language, 'nav.account')}
              </Link>
              <button
                onClick={() => {
                  logOut({ redirectTo: `${pathName}` });
                  closeMenu();
                }}
                className="block w-full py-2 text-left font-medium text-neutral-700 transition-colors hover:text-primary"
              >
                {t(language, 'nav.logout')}
              </button>
            </>
          ) : (
            <>
              <Link
                href={pathName !== "/" ? `/auth/login?from=${pathName}` : "/auth/login"}
                className="block py-2 font-medium text-neutral-700 transition-colors hover:text-primary"
                onClick={closeMenu}
              >
                {t(language, 'nav.login')}
              </Link>
              <Link
                href="/auth/register"
                className="block rounded-full bg-primary px-4 py-2 text-center font-medium text-white transition-all hover:bg-primary/90"
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
