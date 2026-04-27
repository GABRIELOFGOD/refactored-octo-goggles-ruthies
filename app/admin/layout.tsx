"use client";

import { redirect } from 'next/navigation';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import { useAuth } from '@/provider/auth-provider';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth()

  if (!user || user === null) {
    redirect('/auth/login');
  }

  if (user.role !== 'admin') {
    redirect('/');
  }

  return (
    <div className="max-w-screen overflow-x-hidden flex flex-row">
      <AdminSidebar />
      <div className="flex-1 w-full bg-light-bg min-h-screen">
        <AdminHeader />
        <main className="p-6 md:ml-64">{children}</main>
      </div>
    </div>
  );
}
