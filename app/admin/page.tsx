'use client';

import { useEffect, useState } from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import StatCard from '@/components/admin/StatCard';
import { Users, Package, ShoppingCart, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import { adminFetch } from '@/lib/admin-helper';

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [chartData, setChartData] = useState<any[]>([]);
  const [statusData, setStatusData] = useState<any[]>([]);
  const [range, setRange] = useState('30');
  const [isLoading, setIsLoading] = useState(true);

  const COLORS = ['#1a1a1a', '#c0a080', '#8b7355', '#e0d5c7', '#b8a892', '#7a6b5f', '#4a4a4a'];

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    fetchChartData();
  }, [range]);

  const fetchStats = async () => {
    try {
      const res = await adminFetch('/api/admin/stats');
      const data = await res.json();

      if (data.success) {
        setStats(data.data);

        // Fetch status distribution
        const statusRes = await adminFetch('/api/admin/stats/status-distribution');
        const statusData = await statusRes.json();
        if (statusData.success) {
          setStatusData(statusData.data);
        }
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
      toast.error('Failed to load dashboard stats');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchChartData = async () => {
    try {
      const res = await adminFetch(`/api/admin/stats/chart?range=${range}`);
      const data = await res.json();

      if (data.success) {
        setChartData(data.data);
      }
    } catch (error) {
      console.error('Error fetching chart data:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg border border-neutral-200 p-6 animate-pulse">
              <div className="h-4 bg-neutral-200 rounded w-20 mb-2"></div>
              <div className="h-8 bg-neutral-200 rounded w-32"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-4xl font-display text-primary mb-2">Dashboard</h1>
        <p className="text-neutral-600">Welcome to your admin panel</p>
      </div>

      {/* Top Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Total Users"
            value={stats.stats.totalUsers}
            subtext={`${stats.stats.activeUsers} active`}
            icon={<Users className="w-8 h-8" />}
          />
          <StatCard
            label="Total Products"
            value={stats.stats.totalProducts}
            icon={<Package className="w-8 h-8" />}
          />
          <StatCard
            label="Total Orders"
            value={stats.stats.totalOrders}
            subtext={`${stats.stats.pendingOrders} pending`}
            icon={<ShoppingCart className="w-8 h-8" />}
          />
          <StatCard
            label="Total Revenue"
            value={`₦${(stats.stats.totalRevenue / 1000000).toFixed(1)}M`}
            subtext={`₦${(stats.stats.recentRevenue / 1000).toFixed(0)}K last 30 days`}
            icon={<TrendingUp className="w-8 h-8" />}
            trend="up"
            trendValue="+12.5%"
          />
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-white rounded-lg border border-neutral-200 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-primary">Revenue Over Time</h2>
            <select
              value={range}
              onChange={(e) => setRange(e.target.value)}
              className="px-3 py-1 text-sm border border-neutral-300 rounded-lg"
            >
              <option value="30">Last 30 Days</option>
              <option value="365">Last Year</option>
            </select>
          </div>

          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis
                  dataKey="date"
                  stroke="#999"
                  style={{ fontSize: '12px' }}
                />
                <YAxis stroke="#999" style={{ fontSize: '12px' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px',
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#c0a080"
                  dot={false}
                  name="Revenue (₦)"
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-80 flex items-center justify-center text-neutral-500">
              No data available
            </div>
          )}
        </div>

        {/* Status Distribution */}
        <div className="bg-white rounded-lg border border-neutral-200 p-6">
          <h2 className="text-lg font-semibold text-primary mb-6">Orders by Status</h2>

          {statusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ status, value }: any) => `${status}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-80 flex items-center justify-center text-neutral-500">
              No order data
            </div>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        {stats && (
          <div className="bg-white rounded-lg border border-neutral-200 p-6">
            <h2 className="text-lg font-semibold text-primary mb-4">Recent Orders</h2>
            <div className="space-y-3">
              {stats.recentOrders.length > 0 ? (
                stats.recentOrders.map((order: any) => (
                  <div key={order._id} className="flex justify-between items-center py-3 border-b border-neutral-100 last:border-b-0">
                    <div className="flex-1">
                      <p className="font-semibold text-sm text-primary">{order.orderNumber}</p>
                      <p className="text-xs text-neutral-600">{order.email}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-sm">₦{order.total?.toLocaleString()}</p>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        order.status === 'delivered'
                          ? 'bg-green-100 text-green-700'
                          : order.status === 'shipped'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-neutral-500 text-sm">No orders yet</p>
              )}
            </div>
          </div>
        )}

        {/* Recent Users */}
        {stats && (
          <div className="bg-white rounded-lg border border-neutral-200 p-6">
            <h2 className="text-lg font-semibold text-primary mb-4">Recent Users</h2>
            <div className="space-y-3">
              {stats.recentUsers.length > 0 ? (
                stats.recentUsers.map((user: any) => (
                  <div key={user._id} className="flex justify-between items-center py-3 border-b border-neutral-100 last:border-b-0">
                    <div className="flex-1">
                      <p className="font-semibold text-sm text-primary">{user.name}</p>
                      <p className="text-xs text-neutral-600">{user.email}</p>
                    </div>
                    <div className="text-right text-xs text-neutral-600">
                      {new Date(user.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-neutral-500 text-sm">No users yet</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
