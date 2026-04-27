'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';
import { FormDataType, IDiscount } from '@/types';

export default function DiscountsPage() {
  const [discounts, setDiscounts] = useState<IDiscount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormDataType>({
    code: '',
    type: 'percentage' as const,
    value: 0,
    currency: 'NGN' as const,
    minimumOrderValue: 0,
    maxUsageCount: undefined,
    validFrom: new Date().toISOString().split('T')[0],
    validUntil: '',
    isActive: true,
  });

  useEffect(() => {
    fetchDiscounts();
  }, [page]);

  const fetchDiscounts = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/admin/discounts?page=${page}&limit=10`);
      const data = await response.json();
      if (data.success) {
        setDiscounts(data.data);
      }
    } catch (error) {
      toast.error('Failed to fetch discounts');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.code || formData.value <= 0) {
      toast.error('Code and value required');
      return;
    }

    try {
      const url = editingId
        ? `/api/admin/discounts/${editingId}`
        : '/api/admin/discounts';
      const method = editingId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          code: formData.code.toUpperCase(),
        }),
      });

      if (!response.ok) throw new Error();

      toast.success(editingId ? 'Updated' : 'Created');
      setShowForm(false);
      setEditingId(null);
      fetchDiscounts();
    } catch (error) {
      toast.error('Failed to save discount');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete?')) return;

    try {
      const response = await fetch(`/api/admin/discounts/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error();
      toast.success('Deleted');
      fetchDiscounts();
    } catch {
      toast.error('Failed');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display text-primary">Discounts</h1>
          <p className="text-neutral-600">Manage discount codes</p>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="bg-secondary text-light-bg hover:bg-secondary/90"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Discount
        </Button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-white border border-neutral-200 rounded-lg p-6 space-y-4"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-display">
              {editingId ? 'Edit' : 'New'} Discount
            </h2>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setEditingId(null);
              }}
            >
              <X className="w-6 h-6 text-neutral-400" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Code</label>
              <input
                type="text"
                value={formData.code}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    code: e.target.value.toUpperCase(),
                  }))
                }
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
                placeholder="PROMO2024"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Type</label>
              <select
                value={formData.type}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    type: e.target.value as any,
                  }))
                }
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
              >
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Value</label>
              <input
                type="number"
                value={formData.value}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    value: parseFloat(e.target.value) || 0,
                  }))
                }
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Currency</label>
              <select
                value={formData.currency}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    currency: e.target.value as any,
                  }))
                }
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
              >
                <option value="NGN">NGN</option>
                <option value="USD">USD</option>
                <option value="GBP">GBP</option>
                <option value="EUR">EUR</option>
                <option value="all">All Currencies</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Min Order Value</label>
              <input
                type="number"
                value={formData.minimumOrderValue}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    minimumOrderValue: parseFloat(e.target.value) || 0,
                  }))
                }
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Max Usage</label>
              <input
                type="number"
                value={formData.maxUsageCount || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    maxUsageCount: e.target.value ? parseInt(e.target.value) : undefined,
                  })
                }
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Valid From</label>
              <input
                type="date"
                value={formData.validFrom}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, validFrom: e.target.value }))
                }
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Valid Until</label>
              <input
                type="date"
                value={formData.validUntil}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, validUntil: e.target.value }))
                }
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
              />
            </div>
          </div>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.isActive}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, isActive: e.target.checked }))
              }
              className="w-4 h-4"
            />
            <span className="text-sm font-semibold">Active</span>
          </label>

          <div className="flex gap-3 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowForm(false)}
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
          {discounts.length === 0 ? (
            <div className="p-8 text-center text-neutral-600">No discounts</div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-neutral-200 bg-light-bg">
                  <th className="px-6 py-3 text-left text-sm font-semibold">Code</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Discount</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Min Order</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {discounts.map((discount) => (
                  <tr key={discount._id} className="border-b border-neutral-200 hover:bg-light-bg/30">
                    <td className="px-6 py-4 text-sm font-mono font-bold text-secondary">
                      {discount.code}
                    </td>
                    <td className="px-6 py-4 text-sm text-primary font-semibold">
                      {discount.type === 'percentage'
                        ? `${discount.value}%`
                        : `${discount.currency} ${discount.value}`}
                    </td>
                    <td className="px-6 py-4 text-sm text-neutral-600">
                      {discount.currency} {discount.minimumOrderValue}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                          discount.isActive
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {discount.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 flex gap-2">
                      <button className="p-2 hover:bg-blue-100 rounded text-blue-600">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(discount._id)}
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
