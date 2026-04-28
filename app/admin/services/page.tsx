'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';
import { IService } from '@/types';
import Image from 'next/image';
import { adminFetch } from '@/lib/admin-helper';

export default function ServicesPage() {
  const [services, setServices] = useState<IService[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    type: 'consultation' as const,
    consultationType: '' as any,
    shortDescription: '',
    description: '',
    image: '',
    prices: { NGN: 0, USD: 0, GBP: 0, EUR: 0 },
    duration: 60,
    isAvailable: true,
  });

  useEffect(() => {
    fetchServices();
  }, [page, searchQuery]);

  const fetchServices = async () => {
    try {
      setIsLoading(true);
      const query = new URLSearchParams({
        page: page.toString(),
        search: searchQuery,
        limit: '10',
      });

      const response = await adminFetch(`/api/admin/services?${query}`);
      const data = await response.json();

      if (data.success) {
        setServices(data.data);
      }
    } catch (error) {
      toast.error('Failed to fetch services');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.description || Object.values(formData.prices).every((p) => p === 0)) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const url = editingId ? `/api/admin/services/${editingId}` : '/api/admin/services';
      const method = editingId ? 'PUT' : 'POST';

      const response = await adminFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Failed to save service');

      toast.success(editingId ? 'Service updated' : 'Service created');
      setShowForm(false);
      setEditingId(null);
      setFormData({
        name: '',
        slug: '',
        type: 'consultation',
        consultationType: '',
        shortDescription: '',
        description: '',
        image: '',
        prices: { NGN: 0, USD: 0, GBP: 0, EUR: 0 },
        duration: 60,
        isAvailable: true,
      });
      fetchServices();
    } catch (error) {
      toast.error('Failed to save service');
    }
  };

  const handleEdit = (service: IService) => {
    setFormData({
      name: service.name,
      slug: service.slug,
      type: service.type as any,
      consultationType: service.consultationType || '',
      shortDescription: service.shortDescription,
      description: service.description,
      image: service.image,
      prices: service.prices,
      duration: service.duration,
      isAvailable: service.isAvailable,
    });
    setEditingId(service._id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure?')) return;

    try {
      const response = await adminFetch(`/api/admin/services/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete service');

      toast.success('Service deleted');
      fetchServices();
    } catch (error) {
      toast.error('Failed to delete service');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display text-primary">Services</h1>
          <p className="text-neutral-600">Manage your services</p>
        </div>
        <Button
          onClick={() => {
            setShowForm(!showForm);
            setEditingId(null);
          }}
          className="bg-secondary text-light-bg hover:bg-secondary/90"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Service
        </Button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="bg-white border border-neutral-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-display text-primary">
              {editingId ? 'Edit Service' : 'New Service'}
            </h2>
            <button
              onClick={() => {
                setShowForm(false);
                setEditingId(null);
              }}
              className="text-neutral-400 hover:text-neutral-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-primary mb-2">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      name: e.target.value,
                      slug: e.target.value.toLowerCase().replace(/\s+/g, '-'),
                    }))
                  }
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
                  placeholder="Service name"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-primary mb-2">Type</label>
                <select
                  value={formData.type}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, type: e.target.value as any }))
                  }
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
                >
                  <option value="consultation">Consultation</option>
                  <option value="styling">Styling</option>
                  <option value="fashion-designing">Fashion Designing</option>
                </select>
              </div>
            </div>

            {formData.type === 'consultation' && (
              <div>
                <label className="block text-sm font-semibold text-primary mb-2">
                  Consultation Type
                </label>
                <select
                  value={formData.consultationType}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      consultationType: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
                >
                  <option value="">Select type</option>
                  <option value="bridal">Bridal</option>
                  <option value="wardrobe-audit">Wardrobe Audit</option>
                  <option value="personal-shopping">Personal Shopping</option>
                  <option value="event-styling">Event Styling</option>
                </select>
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-primary mb-2">
                Short Description
              </label>
              <input
                type="text"
                value={formData.shortDescription}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    shortDescription: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
                placeholder="Brief description"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-primary mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                rows={4}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
                placeholder="Full description"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {(['NGN', 'USD', 'GBP', 'EUR'] as const).map((currency) => (
                <div key={currency}>
                  <label className="block text-sm font-semibold text-primary mb-2">
                    {currency}
                  </label>
                  <input
                    type="number"
                    value={formData.prices[currency]}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        prices: {
                          ...prev.prices,
                          [currency]: parseFloat(e.target.value) || 0,
                        },
                      }))
                    }
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
                  />
                </div>
              ))}
            </div>

            <div>
              <label className="block text-sm font-semibold text-primary mb-2">Duration (minutes)</label>
              <input
                type="number"
                value={formData.duration}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    duration: parseInt(e.target.value) || 60,
                  }))
                }
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
              />
            </div>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isAvailable}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    isAvailable: e.target.checked,
                  }))
                }
                className="w-4 h-4"
              />
              <span className="text-sm font-semibold text-primary">Available for booking</span>
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
              <Button
                type="submit"
                className="bg-secondary text-light-bg hover:bg-secondary/90"
              >
                {editingId ? 'Update' : 'Create'}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Search */}
      <div>
        <input
          type="text"
          placeholder="Search services..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setPage(1);
          }}
          className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
        />
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="text-center py-8">Loading...</div>
      ) : (
        <div className="bg-white border border-neutral-200 rounded-lg overflow-hidden">
          {services.length === 0 ? (
            <div className="p-8 text-center text-neutral-600">No services found</div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-neutral-200 bg-light-bg">
                  <th className="px-6 py-3 text-left text-sm font-semibold text-primary">Service</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-primary">Type</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-primary">Price (NGN)</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-primary">Duration</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-primary">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-primary">Actions</th>
                </tr>
              </thead>
              <tbody>
                {services.map((service) => (
                  <tr key={service._id} className="border-b border-neutral-200 hover:bg-light-bg/30 transition-colors">
                    <td className="px-6 py-4 text-sm text-primary font-semibold">{service.name}</td>
                    <td className="px-6 py-4 text-sm text-neutral-600">{service.type}</td>
                    <td className="px-6 py-4 text-sm text-secondary font-semibold">
                      ₦{service.prices.NGN.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-neutral-600">{service.duration} min</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                          service.isAvailable
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {service.isAvailable ? 'Available' : 'Unavailable'}
                      </span>
                    </td>
                    <td className="px-6 py-4 flex gap-2">
                      <button
                        onClick={() => handleEdit(service)}
                        className="p-2 hover:bg-blue-100 rounded text-blue-600 transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(service._id)}
                        className="p-2 hover:bg-red-100 rounded text-red-600 transition-colors"
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
