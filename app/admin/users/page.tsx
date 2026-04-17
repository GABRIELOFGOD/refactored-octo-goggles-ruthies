'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Search, TrashIcon, Eye } from 'lucide-react';

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');

  const limit = 20;

  useEffect(() => {
    fetchUsers();
  }, [page, search]);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      let query = `/api/admin/users?page=${page}&limit=${limit}`;
      if (search) query += `&search=${encodeURIComponent(search)}`;

      const res = await fetch(query);
      const data = await res.json();

      if (data.success) {
        setUsers(data.data);
        setTotal(data.meta.total);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentStatus }),
      });

      const data = await res.json();

      if (data.success) {
        toast.success(`User ${!currentStatus ? 'activated' : 'deactivated'}`);
        fetchUsers();
      } else {
        toast.error(data.error || 'Failed to update user');
      }
    } catch (error) {
      console.error('Toggle error:', error);
      toast.error('Failed to update user');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;

    try {
      const res = await fetch(`/api/admin/users/${id}`, { method: 'DELETE' });
      const data = await res.json();

      if (data.success) {
        toast.success('User deleted successfully');
        fetchUsers();
      } else {
        toast.error(data.error || 'Failed to delete user');
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete user');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-display text-primary">Users</h1>
        <p className="text-neutral-600">Manage customer accounts</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-neutral-200 p-6">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-neutral-400" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
            />
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-neutral-500">Loading users...</div>
        ) : users.length === 0 ? (
          <div className="p-8 text-center text-neutral-500">No users found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-neutral-200 bg-light-bg">
                  <th className="px-6 py-3 text-left text-sm font-semibold text-primary">Name</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-primary">Email</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-primary">Role</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-primary">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-primary">Joined</th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-primary">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user._id} className="border-b border-neutral-100 hover:bg-light-bg/30">
                    <td className="px-6 py-4">
                      <p className="font-semibold text-sm text-primary">{user.name}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-neutral-700">{user.email}</td>
                    <td className="px-6 py-4">
                      <span className="text-xs px-3 py-1 rounded-full bg-neutral-100 text-neutral-700 font-semibold">
                        {user.role === 'admin' ? 'Admin' : 'Customer'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggleActive(user._id, user.isActive)}
                        className={`text-xs px-3 py-1 rounded-full font-semibold transition-colors ${
                          user.isActive
                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                            : 'bg-red-100 text-red-700 hover:bg-red-200'
                        }`}
                      >
                        {user.isActive ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-sm text-neutral-600">
                      {new Date(user.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex justify-center gap-2">
                        <button className="p-2 text-primary hover:bg-light-bg rounded-lg transition">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(user._id, user.name)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {total > limit && (
          <div className="px-6 py-4 border-t border-neutral-200 flex justify-center gap-4">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="px-4 py-2 border border-neutral-300 rounded-lg hover:bg-light-bg disabled:opacity-50"
            >
              Previous
            </button>
            <span className="py-2 text-sm text-neutral-600">
              Page {page} of {Math.ceil(total / limit)}
            </span>
            <button
              onClick={() => setPage(page + 1)}
              disabled={page >= Math.ceil(total / limit)}
              className="px-4 py-2 border border-neutral-300 rounded-lg hover:bg-light-bg disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
