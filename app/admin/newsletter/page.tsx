'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Mail, Download, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface Newsletter {
  _id: string;
  email: string;
  name?: string;
  isSubscribed: boolean;
  subscribedAt: Date;
}

export default function NewsletterPage() {
  const [activeTab, setActiveTab] = useState<'subscribers' | 'campaigns' | 'compose'>('subscribers');
  const [subscribers, setSubscribers] = useState<Newsletter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [composeData, setComposeData] = useState({
    subject: '',
    previewText: '',
    htmlContent: '',
  });

  useEffect(() => {
    if (activeTab === 'subscribers') {
      fetchSubscribers();
    }
  }, [activeTab, page, searchQuery]);

  const fetchSubscribers = async () => {
    try {
      setIsLoading(true);
      const query = new URLSearchParams({
        page: page.toString(),
        search: searchQuery,
        limit: '20',
      });

      const response = await fetch(`/api/admin/newsletter/subscribers?${query}`);
      const data = await response.json();

      if (data.success) {
        setSubscribers(data.data);
      }
    } catch (error) {
      toast.error('Failed to fetch subscribers');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const allSubscribers: Newsletter[] = [];
      let currentPage = 1;
      let hasMore = true;

      while (hasMore) {
        const query = new URLSearchParams({
          page: currentPage.toString(),
          limit: '100',
        });

        const response = await fetch(`/api/admin/newsletter/subscribers?${query}`);
        const data = await response.json();

        if (data.success) {
          allSubscribers.push(...data.data);
          hasMore = data.data.length === 100;
          currentPage++;
        } else {
          hasMore = false;
        }
      }

      const csv = `Email,Name,Subscribed Date\n${allSubscribers
        .map(
          (s) =>
            `"${s.email}","${s.name || ''}","${new Date(s.subscribedAt).toLocaleDateString()}"`
        )
        .join('\n')}`;

      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `subscribers-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();

      toast.success(`Exported ${allSubscribers.length} subscribers`);
    } catch (error) {
      toast.error('Failed to export subscribers');
    }
  };

  const handleSendCampaign = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!composeData.subject || !composeData.htmlContent) {
      toast.error('Subject and content are required');
      return;
    }

    try {
      const response = await fetch('/api/admin/newsletter/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(composeData),
      });

      if (!response.ok) throw new Error('Failed to send campaign');

      toast.success('Campaign sent successfully');
      setComposeData({ subject: '', previewText: '', htmlContent: '' });
    } catch (error) {
      toast.error('Failed to send campaign');
    }
  };

  const handleDeleteSubscriber = async (id: string) => {
    if (!confirm('Remove this subscriber?')) return;

    try {
      const response = await fetch(`/api/admin/newsletter/subscribers/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete');

      toast.success('Subscriber removed');
      fetchSubscribers();
    } catch (error) {
      toast.error('Failed to remove subscriber');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-display text-primary">Newsletter</h1>
        <p className="text-neutral-600">Manage your email campaigns</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-neutral-200">
        {(['subscribers', 'campaigns', 'compose'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 font-semibold border-b-2 transition-colors ${
              activeTab === tab
                ? 'border-secondary text-secondary'
                : 'border-transparent text-neutral-600 hover:text-primary'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Subscribers Tab */}
      {activeTab === 'subscribers' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <input
              type="text"
              placeholder="Search subscribers..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              className="flex-1 px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
            />
            <Button
              onClick={handleExport}
              variant="outline"
              className="border-primary text-primary ml-4 hover:bg-light-bg"
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>

          {isLoading ? (
            <div className="text-center py-8">Loading...</div>
          ) : (
            <div className="bg-white border border-neutral-200 rounded-lg overflow-hidden">
              {subscribers.length === 0 ? (
                <div className="p-8 text-center text-neutral-600">No subscribers</div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-neutral-200 bg-light-bg">
                      <th className="px-6 py-3 text-left text-sm font-semibold text-primary">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-primary">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-primary">
                        Subscribed
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-primary">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {subscribers.map((sub) => (
                      <tr key={sub._id} className="border-b border-neutral-200 hover:bg-light-bg/30">
                        <td className="px-6 py-4 text-sm text-primary">{sub.email}</td>
                        <td className="px-6 py-4 text-sm text-neutral-600">{sub.name || '-'}</td>
                        <td className="px-6 py-4 text-sm text-neutral-600">
                          {new Date(sub.subscribedAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => handleDeleteSubscriber(sub._id)}
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
      )}

      {/* Campaigns Tab */}
      {activeTab === 'campaigns' && (
        <div className="text-center py-12 text-neutral-600">
          <Mail className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>Campaign history coming soon</p>
        </div>
      )}

      {/* Compose Tab */}
      {activeTab === 'compose' && (
        <form onSubmit={handleSendCampaign} className="bg-white border border-neutral-200 rounded-lg p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-primary mb-2">Subject</label>
            <input
              type="text"
              value={composeData.subject}
              onChange={(e) =>
                setComposeData((prev) => ({ ...prev, subject: e.target.value }))
              }
              className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
              placeholder="Email subject"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-primary mb-2">Preview Text</label>
            <input
              type="text"
              value={composeData.previewText}
              onChange={(e) =>
                setComposeData((prev) => ({ ...prev, previewText: e.target.value }))
              }
              className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
              placeholder="Preview text shown in inbox"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-primary mb-2">HTML Content</label>
            <textarea
              value={composeData.htmlContent}
              onChange={(e) =>
                setComposeData((prev) => ({ ...prev, htmlContent: e.target.value }))
              }
              rows={10}
              className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary font-mono text-sm"
              placeholder="HTML email template"
            />
          </div>

          <div className="flex gap-4 justify-end">
            <Button
              type="button"
              variant="outline"
              className="border-primary text-primary hover:bg-light-bg"
              onClick={() =>
                setComposeData({
                  subject: '',
                  previewText: '',
                  htmlContent: '',
                })
              }
            >
              Clear
            </Button>
            <Button type="submit" className="bg-secondary text-light-bg hover:bg-secondary/90">
              <Mail className="w-4 h-4 mr-2" />
              Send Campaign
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
