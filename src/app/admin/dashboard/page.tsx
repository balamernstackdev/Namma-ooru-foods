'use client';

import React from 'react';
import { TrendingUp, Users, ShoppingBag, DollarSign, ArrowUpRight, ArrowDownRight, Loader2 } from 'lucide-react';
import useSWR from 'swr';
import { API_URL } from '@/lib/api';

const fetcher = (url: string) => fetch(url, {
  headers: { Authorization: `Bearer ${typeof window !== 'undefined' ? localStorage.getItem('namma_orru_token') || '' : ''}` }
}).then(res => res.json());

const STATUS_COLORS: Record<string, string> = {
  DELIVERED: 'bg-green-100 text-green-700',
  COMPLETED: 'bg-green-100 text-green-700',
  PROCESSING: 'bg-blue-100 text-blue-700',
  PENDING: 'bg-yellow-100 text-yellow-700',
  SHIPPED: 'bg-purple-100 text-purple-700',
  CANCELLED: 'bg-red-100 text-red-700',
};

export default function DashboardPage() {
  const { data: ordersData, isLoading: ordersLoading } = useSWR(`${API_URL}/api/orders?limit=10`, fetcher, { refreshInterval: 30000 });
  const { data: stats, isLoading: statsLoading } = useSWR(`${API_URL}/api/admin/stats`, fetcher, { refreshInterval: 30000 });

  const orders = Array.isArray(ordersData) ? ordersData : (ordersData?.orders || []);

  const formatAmount = (amount: number) =>
    `₹${amount?.toLocaleString('en-IN') ?? 0}`;

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    const diff = Math.floor((Date.now() - d.getTime()) / 60000);
    if (diff < 60) return `${diff} min${diff !== 1 ? 's' : ''} ago`;
    const hrs = Math.floor(diff / 60);
    if (hrs < 24) return `${hrs} hour${hrs !== 1 ? 's' : ''} ago`;
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
  };

  return (
    <div className="flex flex-col gap-10">
      <div>
        <h1 className="text-3xl font-bold">Dashboard Overview</h1>
        <p className="text-[var(--muted-foreground)]">Welcome back, Admin. Here's what's happening today.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {statsLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 animate-pulse h-28" />
          ))
        ) : (
          <>
            <StatCard
              title="Total Revenue"
              value={formatAmount(stats?.totalRevenue ?? 0)}
              change={stats?.revenueChange ?? '—'}
              isPositive={(stats?.revenueChange ?? 0) >= 0}
              Icon={DollarSign}
            />
            <StatCard
              title="Active Orders"
              value={stats?.activeOrders ?? 0}
              change={stats?.ordersChange ?? '—'}
              isPositive={(stats?.ordersChange ?? 0) >= 0}
              Icon={ShoppingBag}
            />
            <StatCard
              title="Total Users"
              value={stats?.totalUsers ?? 0}
              change={stats?.usersChange ?? '—'}
              isPositive={(stats?.usersChange ?? 0) >= 0}
              Icon={Users}
            />
            <StatCard
              title="Products Listed"
              value={stats?.totalProducts ?? 0}
              change={stats?.productsChange ?? '—'}
              isPositive={(stats?.productsChange ?? 0) >= 0}
              Icon={TrendingUp}
            />
          </>
        )}
      </div>

      {/* Recent Orders */}
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-8">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold">Recent Orders</h2>
          <a href="/admin/orders" className="text-sm font-semibold text-[var(--primary)] hover:underline">View All</a>
        </div>

        {ordersLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
          </div>
        ) : orders.length === 0 ? (
          <div className="py-16 text-center text-slate-400 font-medium">
            No orders yet. Orders will appear here once customers start placing them.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[1000px] admin-data-table">
              <thead>
                <tr className="border-b border-[var(--border)] text-sm font-semibold text-[var(--muted-foreground)]">
                  <th className="pb-4">Order ID</th>
                  <th className="pb-4">Customer</th>
                  <th className="pb-4">Status</th>
                  <th className="pb-4">Amount</th>
                  <th className="pb-4">Date</th>
                </tr>
              </thead>
              <tbody className="text-sm text-[var(--foreground)]">
                {orders.slice(0, 10).map((order: any) => (
                  <tr key={order.id} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-4 font-medium">#{order.id}</td>
                    <td className="py-4">{order.user?.name || order.customerName || 'Guest'}</td>
                    <td className="py-4">
                      <span className={`rounded-full px-2 py-1 text-xs font-bold ${STATUS_COLORS[order.status] || 'bg-slate-100 text-slate-600'}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="py-4 font-bold">{formatAmount(order.totalAmount ?? order.total ?? 0)}</td>
                    <td className="py-4 text-[var(--muted-foreground)]">{formatDate(order.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ title, value, change, isPositive, Icon }: {
  title: string; value: any; change: any; isPositive: boolean; Icon: any;
}) {
  const changeStr = typeof change === 'number' ? `${change >= 0 ? '+' : ''}${change}%` : String(change);
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm transition-all hover:shadow-md">
      <div className="flex items-center justify-between">
        <div className="rounded-xl bg-[var(--primary)]/10 p-3 text-[var(--primary)]">
          <Icon className="h-6 w-6" />
        </div>
        {change !== '—' && (
          <div className={`flex items-center gap-1 text-xs font-bold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {changeStr} {isPositive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
          </div>
        )}
      </div>
      <div className="mt-4">
        <p className="text-sm font-medium text-[var(--muted-foreground)] uppercase tracking-wider">{title}</p>
        <h3 className="mt-1 text-3xl font-bold">{value}</h3>
      </div>
    </div>
  );
}
