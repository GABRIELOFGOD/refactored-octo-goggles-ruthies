import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth';
import { redirect } from 'next/navigation';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authConfig);

  // Redirect to login if not authenticated
  if (!session) {
    redirect('/auth/login');
  }

  // Redirect to home if not admin
  if (session.user.role !== 'admin') {
    redirect('/');
  }

  return (
    <div className="flex">
      <AdminSidebar />
      <div className="flex-1 md:ml-64 bg-light-bg min-h-screen">
        <AdminHeader />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
