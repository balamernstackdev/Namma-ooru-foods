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
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        
        {/* Total Sellers */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 flex flex-col justify-between hover:shadow-md transition-all group relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50/30 rounded-bl-[4rem] group-hover:scale-110 transition-transform pointer-events-none" />
          <div className="flex items-start justify-between">
            <div className="rounded-2xl bg-emerald-50 text-emerald-600 p-3.5 border border-emerald-100/50">
              <Users className="h-6 w-6" />
            </div>
            <Link href="/hub/sub-vendors" className="text-slate-400 hover:text-emerald-600 transition-colors">
              <ArrowUpRight className="h-5 w-5" />
            </Link>
          </div>
          <div className="mt-6">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Sellers</p>
            <h3 className="mt-1.5 text-3xl font-black text-slate-900">{topCards?.totalSellers ?? 0}</h3>
          </div>
        </div>

        {/* Active Products */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 flex flex-col justify-between hover:shadow-md transition-all group relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50/30 rounded-bl-[4rem] group-hover:scale-110 transition-transform pointer-events-none" />
          <div className="flex items-start justify-between">
            <div className="rounded-2xl bg-blue-50 text-blue-600 p-3.5 border border-blue-100/50">
              <Package className="h-6 w-6" />
            </div>
            <Link href="/hub/products" className="text-slate-400 hover:text-blue-600 transition-colors">
              <ArrowUpRight className="h-5 w-5" />
            </Link>
          </div>
          <div className="mt-6">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Products</p>
            <h3 className="mt-1.5 text-3xl font-black text-slate-900">{topCards?.activeProducts ?? 0}</h3>
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 flex flex-col justify-between hover:shadow-md transition-all group relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-50/30 rounded-bl-[4rem] group-hover:scale-110 transition-transform pointer-events-none" />
          <div className="flex items-start justify-between">
            <div className="rounded-2xl bg-purple-50 text-purple-600 p-3.5 border border-purple-100/50">
              <ShoppingBag className="h-6 w-6" />
            </div>
            <Link href="/hub/orders" className="text-slate-400 hover:text-purple-600 transition-colors">
              <ArrowUpRight className="h-5 w-5" />
            </Link>
          </div>
          <div className="mt-6">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Orders</p>
            <h3 className="mt-1.5 text-3xl font-black text-slate-900">{topCards?.totalOrders ?? 0}</h3>
          </div>
        </div>

        {/* This Week Sales */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-3xl border border-slate-800 shadow-xl p-6 flex flex-col justify-between hover:shadow-2xl transition-all group relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-bl-[4rem] group-hover:scale-110 transition-transform pointer-events-none" />
          <div className="flex items-start justify-between">
            <div className="rounded-2xl bg-white/10 text-emerald-400 p-3.5 border border-white/5">
              <TrendingUp className="h-6 w-6" />
            </div>
            <span className="text-[9px] font-black uppercase bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-md border border-emerald-500/30">
              Active
            </span>
          </div>
          <div className="mt-6">
            <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">This Week Sales</p>
            <h3 className="mt-1.5 text-3xl font-black text-emerald-400 tracking-tight">
              {formatAmount(topCards?.thisWeekSales ?? 0)}
            </h3>
          </div>
        </div>

      </div>

      {/* 📋 Pending Activities */}
      <div className="bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 bg-amber-50 rounded-2xl border border-amber-100 flex items-center justify-center text-amber-600">
            <ClipboardList size={20} />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-900 uppercase">Pending Activities</h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Action required items demanding attention</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Pending Seller Registrations */}
          <Link href="/hub/sub-vendors" className="group p-5 bg-slate-50 hover:bg-emerald-50 border border-slate-100 hover:border-emerald-200 rounded-3xl transition-all flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[10px] font-black text-slate-400 group-hover:text-emerald-700 uppercase tracking-wider transition-colors">Pending Sellers</p>
              <h4 className="text-2xl font-black text-slate-800 group-hover:text-emerald-950 transition-colors">
                {pendingActivities?.pendingSellerRegistrations ?? 0}
              </h4>
            </div>
            <div className="h-12 w-12 rounded-2xl bg-white border border-slate-200 text-slate-400 group-hover:text-emerald-600 group-hover:border-emerald-300 shadow-sm flex items-center justify-center transition-all group-hover:scale-105">
              <ChevronRight size={18} />
            </div>
          </Link>

          {/* Pending Product Submissions */}
          <Link href="/hub/products" className="group p-5 bg-slate-50 hover:bg-amber-50 border border-slate-100 hover:border-amber-200 rounded-3xl transition-all flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[10px] font-black text-slate-400 group-hover:text-amber-700 uppercase tracking-wider transition-colors">Pending Products</p>
              <h4 className="text-2xl font-black text-slate-800 group-hover:text-amber-950 transition-colors">
                {pendingActivities?.pendingProductSubmissions ?? 0}
              </h4>
            </div>
            <div className="h-12 w-12 rounded-2xl bg-white border border-slate-200 text-slate-400 group-hover:text-amber-600 group-hover:border-amber-300 shadow-sm flex items-center justify-center transition-all group-hover:scale-105">
              <ChevronRight size={18} />
            </div>
          </Link>

          {/* Products Returned for Correction */}
          <Link href="/hub/products" className="group p-5 bg-slate-50 hover:bg-rose-50 border border-slate-100 hover:border-rose-200 rounded-3xl transition-all flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[10px] font-black text-slate-400 group-hover:text-rose-700 uppercase tracking-wider transition-colors">Needs Correction</p>
              <h4 className="text-2xl font-black text-slate-800 group-hover:text-rose-950 transition-colors">
                {pendingActivities?.productsReturnedForCorrection ?? 0}
              </h4>
            </div>
            <div className="h-12 w-12 rounded-2xl bg-white border border-slate-200 text-slate-400 group-hover:text-rose-600 group-hover:border-rose-300 shadow-sm flex items-center justify-center transition-all group-hover:scale-105">
              <ChevronRight size={18} />
            </div>
          </Link>

        </div>
      </div>

      {/* Two Column Layout (Recent Orders & Notifications) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* 🛒 Recent Orders (Left 2 Columns) */}
        <div className="bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-sm lg:col-span-2 space-y-6">
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

        {/* 🔔 Notifications (Right 1 Column) */}
        <div className="bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-sm flex flex-col space-y-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-indigo-50 rounded-2xl border border-indigo-100 flex items-center justify-center text-indigo-600">
              <Bell size={20} />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 uppercase">Operational Center</h2>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Operational updates & announcements</p>
            </div>
          </div>

          {/* Quick Tabs */}
          <div className="grid grid-cols-3 gap-1 bg-slate-50 p-1 rounded-2xl border border-slate-100">
            {notificationTabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-2 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all flex flex-col items-center justify-center gap-1 ${
                  activeTab === tab.id 
                    ? 'bg-white text-slate-900 shadow-sm border border-slate-200/50' 
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <span>{tab.id === 'announcements' ? '📢 Admin' : tab.id === 'products' ? '📦 Product' : '🔔 System'}</span>
                <span className={`px-1.5 py-0.5 rounded-full text-[8px] ${activeTab === tab.id ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-200/70 text-slate-500'}`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Tab Content List */}
          <div className="flex-1 overflow-y-auto max-h-[360px] pr-1 space-y-4 no-scrollbar">
            
            {activeTab === 'announcements' && (
              <>
                {(!notifications?.adminAnnouncements || notifications.adminAnnouncements.length === 0) ? (
                  <div className="py-12 text-center text-slate-300 font-bold text-xs uppercase tracking-wider">
                    No Announcements
                  </div>
                ) : (
                  notifications.adminAnnouncements.map((ann: any) => (
                    <div key={ann.id} className="p-4 bg-amber-50/50 border border-amber-100 rounded-2xl space-y-2 hover:shadow-sm transition-all">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-xs font-black text-amber-950 uppercase leading-snug">{ann.title}</h4>
                        <span className="text-[8px] font-black bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded uppercase">
                          {ann.offerType || 'Offer'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 font-medium leading-relaxed whitespace-pre-wrap">{ann.message}</p>
                      {ann.couponCode && (
                        <div className="inline-block bg-white border border-amber-200 rounded-lg px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-amber-700">
                          Code: {ann.couponCode}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </>
            )}

            {activeTab === 'products' && (
              <>
                {(!notifications?.productUpdates || notifications.productUpdates.length === 0) ? (
                  <div className="py-12 text-center text-slate-300 font-bold text-xs uppercase tracking-wider">
                    No Product Updates
                  </div>
                ) : (
                  notifications.productUpdates.map((notif: any) => (
                    <div key={notif.id} className="p-4 bg-slate-50 border border-slate-100 rounded-2xl space-y-1.5 hover:bg-slate-100/50 transition-colors">
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-black uppercase text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                          {notif.notificationType?.replace(/_/g, ' ') || 'Update'}
                        </span>
                        <span className="text-[8px] text-slate-400 font-bold">{formatDate(notif.createdAt)}</span>
                      </div>
                      <h4 className="text-xs font-black text-slate-900 leading-tight">{notif.title}</h4>
                      <p className="text-xs text-slate-500 font-medium leading-normal">{notif.message}</p>
                    </div>
                  ))
                )}
              </>
            )}

            {activeTab === 'system' && (
              <>
                {(!notifications?.systemNotifications || notifications.systemNotifications.length === 0) ? (
                  <div className="py-12 text-center text-slate-300 font-bold text-xs uppercase tracking-wider">
                    No System Alerts
                  </div>
                ) : (
                  notifications.systemNotifications.map((notif: any) => (
                    <div key={notif.id} className="p-4 bg-slate-50 border border-slate-100 rounded-2xl space-y-1.5 hover:bg-slate-100/50 transition-colors">
                      <div className="flex items-center justify-between">
                        <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded ${
                          notif.priority === 'HIGH' || notif.priority === 'CRITICAL' 
                            ? 'bg-rose-50 text-rose-600' 
                            : 'bg-slate-200/80 text-slate-600'
                        }`}>
                          {notif.priority}
                        </span>
                        <span className="text-[8px] text-slate-400 font-bold">{formatDate(notif.createdAt)}</span>
                      </div>
                      <h4 className="text-xs font-black text-slate-900 leading-tight">{notif.title}</h4>
                      <p className="text-xs text-slate-500 font-medium leading-normal">{notif.message}</p>
                    </div>
                  ))
                )}
              </>
            )}

          </div>
        </div>

      </div>

    </div>
  );
}
