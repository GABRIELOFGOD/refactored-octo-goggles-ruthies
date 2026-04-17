'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';
import { IBanner } from '@/types';

export default function BannersPage() {
  const [banners, setBanners] = useState<IBanner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    ctaText: '',
    ctaLink: '',
    image: '',
    mobileImage: '',
    position: 'hero' as const,
    sortOrder: 0,
    isActive: true,
    startDate: '',
    endDate: '',
  });

  useEffect(() => {
    fetchBanners();
  }, [page]);

  const fetchBanners = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/admin/banners?page=${page}&limit=10`);
      const data = await response.json();
      if (data.success) {
        setBanners(data.data);
      }
    } catch (error) {
      toast.error('Failed to fetch banners');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.image) {
      toast.error('Title and image required');
      return;
    }

    try {
      const url = editingId ? `/api/admin/banners/${editingId}` : '/api/admin/banners';
      const method = editingId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          startDate: formData.startDate ? new Date(formData.startDate) : undefined,
          endDate: formData.endDate ? new Date(formData.endDate) : undefined,
        }),
      });

      if (!response.ok) throw new Error('Failed to save');

      toast.success(editingId ? 'Updated' : 'Created');
      setShowForm(false);
      setEditingId(null);
      setFormData({
        title: '',
        subtitle: '',
        ctaText: '',
        ctaLink: '',
        image: '',
        mobileImage: '',
        position: 'hero',
        sortOrder: 0,
        isActive: true,
        startDate: '',
        endDate: '',
      });
      fetchBanners();
    } catch (error) {
      toast.error('Failed to save banner');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete banner?')) return;

    try {
      const response = await fetch(`/api/admin/banners/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error();
      toast.success('Deleted');
      fetchBanners();
    } catch {
      toast.error('Failed to delete');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display text-primary">Banners</h1>
          <p className="text-neutral-600">Manage promotional banners</p>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="bg-secondary text-light-bg hover:bg-secondary/90"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Banner
        </Button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white border border-neutral-200 rounded-lg p-6 space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-display text-primary">
              {editingId ? 'Edit' : 'New'} Banner
            </h2>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setEditingId(null);
              }}
            >
              <X className="w-6 h-6 text-neutral-400 hover:text-neutral-600" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Subtitle</label>
              <input
                type="text"
                value={formData.subtitle}
                onChange={(e) => setFormData((prev) => ({ ...prev, subtitle: e.target.value }))}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2">CTA Text</label>
              <input
                type="text"
                value={formData.ctaText}
                onChange={(e) => setFormData((prev) => ({ ...prev, ctaText: e.target.value }))}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">CTA Link</label>
              <input
                type="text"
                value={formData.ctaLink}
                onChange={(e) => setFormData((prev) => ({ ...prev, ctaLink: e.target.value }))}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Position</label>
              <select
                value={formData.position}
                onChange={(e) => setFormData((prev) => ({ ...prev, position: e.target.value as any }))}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
              >
                <option value="hero">Hero</option>
                <option value="mid-page">Mid-page</option>
                <option value="sidebar">Sidebar</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Sort Order</label>
              <input
                type="number"
                value={formData.sortOrder}
                onChange={(e) => setFormData((prev) => ({ ...prev, sortOrder: parseInt(e.target.value) }))}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
              />
            </div>
          </div>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.isActive}
              onChange={(e) => setFormData((prev) => ({ ...prev, isActive: e.target.checked }))}
              className="w-4 h-4"
            />
            <span className="text-sm font-semibold">Active</span>
          </label>

          <div className="flex gap-3 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowForm(false);
                setEditingId(null);
              }}
              className="border-primary text-primary hover:bg-light-bg"
            >
              Cancel
            </Button>
            <Button type="submit" className="bg-secondary text-light-bg hover:bg-secondary/90">
              {editingId ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      )}

      {isLoading ? (
        <div className="text-center py-8">Loading...</div>
      ) : (
        <div className="bg-white border border-neutral-200 rounded-lg overflow-hidden">
          {banners.length === 0 ? (
            <div className="p-8 text-center text-neutral-600">No banners</div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-neutral-200 bg-light-bg">
                  <th className="px-6 py-3 text-left text-sm font-semibold">Title</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Position</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {banners.map((banner) => (
                  <tr key={banner._id} className="border-b border-neutral-200 hover:bg-light-bg/30">
                    <td className="px-6 py-4 text-sm font-semibold text-primary">{banner.title}</td>
                    <td className="px-6 py-4 text-sm text-neutral-600 capitalize">{banner.position}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                          banner.isActive
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {banner.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 flex gap-2">
                      <button
                        className="p-2 hover:bg-blue-100 rounded text-blue-600"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(banner._id)}
                        className="p-2 hover:bg-red-100 rounded text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
