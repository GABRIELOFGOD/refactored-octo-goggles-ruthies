'use client';

import AdminOrderManagement from '@/components/admin/AdminOrderManagement';

export default function AdminOrdersPage() {
  
  return (
    <div className="min-h-screen bg-light-bg py-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-display text-primary mb-2">Order Management</h1>
          <p className="text-neutral-600">View and manage all customer orders</p>
        </div>

        <AdminOrderManagement />
      </div>
    </div>
  );
}
