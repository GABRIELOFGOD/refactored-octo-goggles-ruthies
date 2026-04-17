'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { RotateCcw, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface DeletedItem {
  _id: string;
  name: string;
  type: 'product' | 'category' | 'user' | 'service' | 'discount' | 'banner';
  deletedAt: string;
}

export default function TrashPage() {
  const [items, setItems] = useState<DeletedItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterType, setFilterType] = useState<'all' | DeletedItem['type']>('all');

  useEffect(() => {
    fetchDeletedItems();
  }, [filterType]);

  const fetchDeletedItems = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/admin/trash?type=${filterType}`);
      const data = await response.json();

      if (data.success) {
        setItems(data.data);
      }
    } catch (error) {
      toast.error('Failed to fetch deleted items');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestore = async (id: string, type: string) => {
    try {
      const response = await fetch(`/api/admin/trash/restore`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, type }),
      });

      if (!response.ok) throw new Error();

      toast.success('Restored');
      fetchDeletedItems();
    } catch {
      toast.error('Failed to restore');
    }
  };

  const handlePermanentDelete = async (id: string, type: string) => {
    if (!confirm('Permanently delete? This cannot be undone.')) return;

    try {
      const response = await fetch(`/api/admin/trash/permanent`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, type }),
      });

      if (!response.ok) throw new Error();

      toast.success('Permanently deleted');
      fetchDeletedItems();
    } catch {
      toast.error('Failed to delete');
    }
  };

  const types: Array<'all' | DeletedItem['type']> = [
    'all',
    'product',
    'category',
    'user',
    'service',
    'discount',
    'banner',
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-display text-primary">Trash</h1>
        <p className="text-neutral-600">Restore or permanently delete items</p>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 flex-wrap">
        {types.map((type) => (
          <button
            key={type}
            onClick={() => setFilterType(type)}
            className={`px-4 py-2 rounded-full font-semibold text-sm transition-colors ${
              filterType === type
                ? 'bg-secondary text-light-bg'
                : 'bg-light-bg text-primary hover:bg-neutral-200'
            }`}
          >
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </button>
        ))}
      </div>

      {/* Deleted Items */}
      {isLoading ? (
        <div className="text-center py-8">Loading...</div>
      ) : (
        <div className="bg-white border border-neutral-200 rounded-lg overflow-hidden">
          {items.length === 0 ? (
            <div className="p-8 text-center text-neutral-600">
              <p>No deleted items</p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-neutral-200 bg-light-bg">
                  <th className="px-6 py-3 text-left text-sm font-semibold">Name</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Type</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Deleted</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item._id} className="border-b border-neutral-200 hover:bg-light-bg/30">
                    <td className="px-6 py-4 text-sm font-semibold text-primary">
                      {item.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-neutral-600 capitalize">
                      {item.type}
                    </td>
                    <td className="px-6 py-4 text-sm text-neutral-600">
                      {new Date(item.deletedAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 flex gap-2">
                      <button
                        onClick={() => handleRestore(item._id, item.type)}
                        className="p-2 hover:bg-green-100 rounded text-green-600 transition-colors"
                        title="Restore"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handlePermanentDelete(item._id, item.type)}
                        className="p-2 hover:bg-red-100 rounded text-red-600 transition-colors"
                        title="Permanently delete"
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
