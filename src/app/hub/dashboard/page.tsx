'use client';

import React, { useState } from 'react';
import { 
  Users, 
  Package, 
  ShoppingBag, 
  TrendingUp, 
  ClipboardList, 
  Megaphone, 
  AlertCircle, 
  Loader2, 
  ChevronRight,
  Bell,
  Sparkles,
  ArrowUpRight
} from 'lucide-react';
import useSWR from 'swr';
import Link from 'next/link';
import { API_URL } from '@/lib/api';

const fetcher = (url: string) => fetch(url, {
  headers: { Authorization: `Bearer ${typeof window !== 'undefined' ? localStorage.getItem('namma_orru_token') || '' : ''}` }
}).then(res => res.json());

const STATUS_COLORS: Record<string, string> = {
  DELIVERED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  COMPLETED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  PROCESSING: 'bg-blue-50 text-blue-700 border-blue-200',
  PENDING: 'bg-amber-50 text-amber-700 border-amber-200',
  SHIPPED: 'bg-purple-50 text-purple-700 border-purple-200',
  CANCELLED: 'bg-rose-50 text-rose-700 border-rose-200',
};

export default function VendorHubDashboard() {
  const { data: dashboardData, isLoading, error } = useSWR(
    `${API_URL}/api/vendor-hub/dashboard`, 
    fetcher, 
    { refreshInterval: 30000 }
  );

  const [activeTab, setActiveTab] = useState<'announcements' | 'products' | 'system'>('announcements');

  if (isLoading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-emerald-600" />
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest animate-pulse">Loading dashboard metrics...</p>
        </div>
      </div>
    );
  }

  if (error || !dashboardData) {
    return (
      <div className="flex h-[70vh] items-center justify-center p-8">
        <div className="max-w-md text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-rose-50 text-rose-500 rounded-3xl flex items-center justify-center border border-rose-100 shadow-sm">
            <AlertCircle size={28} />
          </div>
          <h2 className="text-xl font-black text-slate-900 uppercase">Dashboard Failed to Load</h2>
          <p className="text-sm text-slate-500 font-semibold leading-relaxed">
            There was an error communicating with the backend server. Please verify your internet connection or check your authentication session.
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="h-12 px-6 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-wider hover:bg-slate-800 active:scale-95 transition-all shadow-md"
          >
            Retry Loading
          </button>
        </div>
      </div>
    );
  }

  const { topCards, pendingActivities, recentOrders, notifications } = dashboardData;

  const formatAmount = (amount: number) =>
    `₹${amount?.toLocaleString('en-IN') ?? 0}`;

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
  };

  const notificationTabs = [
    { id: 'announcements', label: '📢 Admin Announcements', count: notifications?.adminAnnouncements?.length || 0 },
    { id: 'products', label: '📦 Product Updates', count: notifications?.productUpdates?.length || 0 },
    { id: 'system', label: '🔔 System Alerts', count: notifications?.systemNotifications?.length || 0 }
  ];

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-slate-400 mb-1">
            <Sparkles size={14} className="text-amber-500 fill-amber-500" />
            <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.25em]">Regional Control Center</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tighter uppercase italic leading-none">
            Hub <span className="text-emerald-600">Dashboard</span>
          </h1>
          <p className="text-slate-400 font-bold uppercase tracking-wider text-[10px] mt-2">
            Overview of your connected brands, products, sales performance, and operations.
          </p>
        </div>
        <div className="text-xs font-bold text-slate-500 bg-slate-100 px-4 py-2 rounded-xl border border-slate-200 flex items-center gap-2 self-start md:self-auto">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" /> Live Updating
        </div>
      </div>

      {/* 📊 Top Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">

        {/* Total Sellers */}
        <Link href="/hub/sub-vendors" className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col gap-4 hover:shadow-md hover:-translate-y-1 transition-all group min-h-[140px]">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Users className="h-6 w-6" />
            </div>
            <ArrowUpRight className="h-4 w-4 text-slate-300 group-hover:text-emerald-500 transition-colors" />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Sellers</p>
            <h3 className="text-3xl font-black text-slate-900 leading-none">{topCards?.totalSellers ?? 0}</h3>
          </div>
        </Link>

        {/* Active Products */}
        <Link href="/hub/products" className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col gap-4 hover:shadow-md hover:-translate-y-1 transition-all group min-h-[140px]">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Package className="h-6 w-6" />
            </div>
            <ArrowUpRight className="h-4 w-4 text-slate-300 group-hover:text-blue-500 transition-colors" />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Active Products</p>
            <h3 className="text-3xl font-black text-slate-900 leading-none">{topCards?.activeProducts ?? 0}</h3>
          </div>
        </Link>

        {/* Total Orders */}
        <Link href="/hub/orders" className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col gap-4 hover:shadow-md hover:-translate-y-1 transition-all group min-h-[140px]">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <ShoppingBag className="h-6 w-6" />
            </div>
            <ArrowUpRight className="h-4 w-4 text-slate-300 group-hover:text-purple-500 transition-colors" />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Orders</p>
            <h3 className="text-3xl font-black text-slate-900 leading-none">{topCards?.totalOrders ?? 0}</h3>
          </div>
        </Link>

        {/* This Week Sales */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col gap-4 hover:shadow-md hover:-translate-y-1 transition-all group min-h-[140px]">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <TrendingUp className="h-6 w-6" />
            </div>
            <span className="text-[8px] font-black uppercase bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-md border border-emerald-200/50">Active</span>
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">This Week Sales</p>
            <h3 className="text-3xl font-black text-emerald-600 leading-none tracking-tight">{formatAmount(topCards?.thisWeekSales ?? 0)}</h3>
          </div>
        </div>

      </div>

      {/* Single Column Layout (Recent Orders) */}
      <div className="w-full">
        
        {/* 🛒 Recent Orders (Full Width) */}
        <div className="bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-center justify-center text-emerald-600">
                <ShoppingBag size={20} />
              </div>
              <div>
                <h2 className="text-lg font-black text-slate-900 uppercase">Recent Orders</h2>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Latest 10 order entries under this hub</p>
              </div>
            </div>
            <Link href="/hub/orders" className="h-9 px-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100 text-[10px] font-black uppercase tracking-wider transition-colors flex items-center">
              View All
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <div className="py-20 text-center font-bold text-slate-300 uppercase tracking-widest text-xs">
              No orders found yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left min-w-[600px] border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-[9px] font-black uppercase tracking-widest text-slate-400">
                    <th className="pb-4">Order ID</th>
                    <th className="pb-4">Customer</th>
                    <th className="pb-4">Received At</th>
                    <th className="pb-4">Status</th>
                    <th className="pb-4">Items</th>
                    <th className="pb-4 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="text-xs font-bold text-slate-700 divide-y divide-slate-50">
                  {recentOrders.map((order: any) => (
                    <tr key={order.id} className="group hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 font-black text-slate-900">{order.orderIdStr || `#${order.id}`}</td>
                      <td className="py-4 font-semibold text-slate-600">{order.customerName}</td>
                      <td className="py-4 text-slate-500 font-medium whitespace-nowrap">{formatDate(order.createdAt)}</td>
                      <td className="py-4">
                        <span className={`px-2.5 py-1 text-[9px] font-black uppercase tracking-wider rounded-lg border ${STATUS_COLORS[order.status] || 'bg-slate-100 text-slate-600'}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="py-4 text-slate-500 font-medium">{order.itemsCount} {order.itemsCount === 1 ? 'item' : 'items'}</td>
                      <td className="py-4 text-right text-slate-900 font-black">{formatAmount(order.hubSubtotal)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
