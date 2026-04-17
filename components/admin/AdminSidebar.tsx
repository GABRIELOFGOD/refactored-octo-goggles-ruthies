'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import {
  BarChart3,
  Package,
  Folder,
  ShoppingCart,
  Users,
  Mail,
  Zap,
  Percent,
  Maximize2,
  Trash2,
  LogOut,
  Menu,
} from 'lucide-react';
import { useState } from 'react';

const menuItems = [
  { label: 'Dashboard', href: '/admin', icon: BarChart3 },
  { label: 'Products', href: '/admin/products', icon: Package },
  { label: 'Categories', href: '/admin/categories', icon: Folder },
  { label: 'Orders', href: '/admin/orders', icon: ShoppingCart },
  { label: 'Users', href: '/admin/users', icon: Users },
  { label: 'Services', href: '/admin/services', icon: Zap },
  { label: 'Newsletter', href: '/admin/newsletter', icon: Mail },
  { label: 'Banners', href: '/admin/banners', icon: Maximize2 },
  { label: 'Discounts', href: '/admin/discounts', icon: Percent },
  { label: 'Trash', href: '/admin/trash', icon: Trash2 },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === '/admin') {
      return pathname === '/admin' || pathname === '/admin/';
    }
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile Toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-40 md:hidden bg-primary text-light-bg p-3 rounded-full shadow-lg"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen w-64 bg-white border-r border-neutral-200 z-30 transition-transform md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo */}
        <div className="p-6 border-b border-neutral-200">
          <Link href="/admin" className="block">
            <h1 className="text-2xl font-bold font-display text-primary">Ruthies</h1>
            <p className="text-xs text-secondary">Admin Panel</p>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <Link key={item.href} href={item.href}>
                <button
                  onClick={() => setIsOpen(false)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    active
                      ? 'bg-light-bg text-primary font-semibold'
                      : 'text-neutral-700 hover:bg-light-bg hover:text-primary'
                  }`}
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  <span className="text-sm">{item.label}</span>
                </button>
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-neutral-200">
          <Button
            onClick={() => signOut({ redirectTo: '/' })}
            variant="outline"
            className="w-full flex items-center justify-center gap-2 border-primary text-primary hover:bg-light-bg"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
