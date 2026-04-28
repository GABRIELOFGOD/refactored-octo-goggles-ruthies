'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/provider/auth-provider';
import { Currency } from '@/types';

export default function AccountPage() {
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: {
      street: '',
      city: '',
      state: '',
      country: '',
      postalCode: '',
    },
    preferredCurrency: 'NGN',
    preferredLanguage: 'en',
  });
  
  const { user, refreshUserData, isLoading } = useAuth();
  // const fetchUserData = async () => {
  //   try {
  //     setIsLoading(true);
  //     const response = await fetch('/api/user/profile');
  //     if (response.ok) {
  //       const data = await response.json();
  //       setUser(data.data);
  //       setFormData({
  //         name: data.data.name || '',
  //         phone: data.data.phone || '',
  //         address: data.data.address || {
  //           street: '',
  //           city: '',
  //           state: '',
  //           country: '',
  //           postalCode: '',
  //         },
  //         preferredCurrency: data.data.preferredCurrency || 'NGN',
  //         preferredLanguage: data.data.preferredLanguage || 'en',
  //       });
  //     } else {
  //       toast.error('Failed to load profile');
  //     }
  //   } catch (error) {
  //     console.error('Error fetching user data:', error);
  //     toast.error('Error loading profile');
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  useEffect(()=>{
    if (user) {
      setFormData({
        name: user.name || '',
        phone: user.phone || '',
        address: user.address || {
          street: '',
          city: '',
          state: '',
          country: '',
          postalCode: '',
        },
        preferredCurrency: user.preferredCurrency || "NGN",
        preferredLanguage: user.preferredLanguage || "en",
      });
    }
  },[user]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name.startsWith('address.')) {
      const field = name.split('.')[1];
      setFormData((prev) => ({
        ...prev,
        address: {
          ...prev.address,
          [field]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'authorization': `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success('Profile updated successfully');
        await refreshUserData();
      } else {
        toast.error('Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Error updating profile');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-light-bg py-16">
        <div className="max-w-2xl mx-auto px-4">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-neutral-300 rounded w-1/3"></div>
            <div className="h-64 bg-neutral-300 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-light-bg py-16">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-playfair font-bold text-primary mb-2">My Account</h1>
          <p className="text-neutral-600">Manage your profile and preferences</p>
        </div>

        {/* Account Card */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* User Info Summary */}
          <div className="mb-8 pb-8 border-b border-neutral-200">
            <h2 className="text-lg font-bold text-primary mb-4">Account Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-neutral-600">Email</p>
                <p className="font-semibold text-neutral-900">{user?.email}</p>
              </div>
              <div>
                <p className="text-sm text-neutral-600">Member Since</p>
                <p className="font-semibold text-neutral-900">
                  {new Date(user?.createdAt.toString() || "").toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          {/* Edit Profile Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <h2 className="text-lg font-bold text-primary">Edit Profile</h2>

            {/* Name */}
            <div>
              <label className="block text-sm font-semibold text-primary mb-2">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-semibold text-primary mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
              />
            </div>

            {/* Address */}
            <div className="space-y-4">
              <h3 className="font-semibold text-primary">Shipping Address</h3>

              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2">
                  Street Address
                </label>
                <input
                  type="text"
                  name="address.street"
                  value={formData.address.street}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-2">
                    City
                  </label>
                  <input
                    type="text"
                    name="address.city"
                    value={formData.address.city}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-2">
                    State
                  </label>
                  <input
                    type="text"
                    name="address.state"
                    value={formData.address.state}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-2">
                    Country
                  </label>
                  <input
                    type="text"
                    name="address.country"
                    value={formData.address.country}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-2">
                    Postal Code
                  </label>
                  <input
                    type="text"
                    name="address.postalCode"
                    value={formData.address.postalCode}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
                  />
                </div>
              </div>
            </div>

            {/* Preferences */}
            <div className="space-y-4">
              <h3 className="font-semibold text-primary">Preferences</h3>

              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2">
                  Preferred Currency
                </label>
                <select
                  name="preferredCurrency"
                  value={formData.preferredCurrency}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
                >
                  <option value="NGN">Nigerian Naira (₦)</option>
                  <option value="USD">US Dollar ($)</option>
                  <option value="GBP">British Pound (£)</option>
                  <option value="EUR">Euro (€)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2">
                  Preferred Language
                </label>
                <select
                  name="preferredLanguage"
                  value={formData.preferredLanguage}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
                >
                  <option value="en">English</option>
                  <option value="fr">Français</option>
                </select>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSaving}
              className="w-full bg-primary text-white py-3 rounded-lg hover:bg-primary/90 transition-colors font-bold disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
