'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Plus, Edit2, Trash2, Search } from 'lucide-react';
import { ICategory } from '@/types';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', description: '', image: '', parent: '' });

  const limit = 20;

  useEffect(() => {
    fetchCategories();
  }, [page, search]);

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      let query = `/api/admin/categories?page=${page}&limit=${limit}`;
      if (search) query += `&search=${encodeURIComponent(search)}`;

      const res = await fetch(query, {
        method: "GET",
        headers: {
          "authorization": `Bearer ${localStorage.getItem("token")}`
        }
      });
      const data = await res.json();

      if (data.success) {
        setCategories(data.data);
        setTotal(data.meta.total);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Failed to load categories');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error('Category name is required');
      return;
    }

    try {
      const url = editingId
        ? `/api/admin/categories/${editingId}`
        : '/api/admin/categories';
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          "authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (data.success) {
        toast.success(editingId ? 'Category updated' : 'Category created');
        setShowForm(false);
        setEditingId(null);
        setFormData({ name: '', description: '', image: '', parent: '' });
        fetchCategories();
      } else {
        toast.error(data.error || 'Failed to save category');
      }
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Failed to save category');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"?`)) return;

    try {
      const res = await fetch(`/api/admin/categories/${id}`, { method: 'DELETE' });
      const data = await res.json();

      if (data.success) {
        toast.success('Category deleted');
        fetchCategories();
      } else {
        toast.error(data.error || 'Failed to delete category');
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete category');
    }
  };

  const startEdit = (cat: ICategory) => {
    setFormData({
      name: cat.name,
      description: cat.description || '',
      image: cat.image || '',
      parent: cat.parentCategory || '',
    });
    setEditingId(cat._id);
    setShowForm(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-display text-primary">Categories</h1>
          <p className="text-neutral-600">Manage product categories</p>
        </div>
        <Button
          onClick={() => {
            setShowForm(true);
            setEditingId(null);
            setFormData({ name: '', description: '', image: '', parent: '' });
          }}
          className="flex items-center gap-2 bg-primary text-light-bg hover:bg-primary/90"
        >
          <Plus className="w-4 h-4" />
          New Category
        </Button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-lg border border-neutral-200 p-6">
          <form onSubmit={handleSave} className="space-y-4 max-w-2xl">
            <div>
              <label className="block text-sm font-semibold text-primary mb-2">
                Category Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-primary mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-secondary"
                rows={3}
              />
            </div>

            <div className="flex gap-4">
              <Button
                type="submit"
                className="bg-primary text-light-bg hover:bg-primary/90"
              >
                {editingId ? 'Update' : 'Create'} Category
              </Button>
              <Button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                }}
                variant="outline"
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Search */}
      <div className="bg-white rounded-lg border border-neutral-200 p-6">
        <div className="relative">
          <Search className="absolute left-3 top-3 w-5 h-5 text-neutral-400" />
          <input
            type="text"
            placeholder="Search categories..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-neutral-500">Loading categories...</div>
        ) : categories.length === 0 ? (
          <div className="p-8 text-center text-neutral-500">No categories found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-neutral-200 bg-light-bg">
                  <th className="px-6 py-3 text-left text-sm font-semibold text-primary">Name</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-primary">Slug</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-primary">Description</th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-primary">Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((cat) => (
                  <tr key={cat._id} className="border-b border-neutral-100 hover:bg-light-bg/30">
                    <td className="px-6 py-4 font-semibold text-sm text-primary">{cat.name}</td>
                    <td className="px-6 py-4 text-sm text-neutral-700">{cat.slug}</td>
                    <td className="px-6 py-4 text-sm text-neutral-600 truncate max-w-xs">
                      {cat.description || '-'}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => startEdit(cat)}
                          className="p-2 text-primary hover:bg-light-bg rounded-lg transition"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(cat._id, cat.name)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                        >
                          <Trash2 className="w-4 h-4" />
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
