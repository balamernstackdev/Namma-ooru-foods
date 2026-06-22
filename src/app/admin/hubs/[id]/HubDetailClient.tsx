'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft, Building2, ShieldCheck, Mail, Phone, Users, Package,
  ShoppingBag, DollarSign, CreditCard, BarChart2, CheckCircle2,
  XCircle, AlertTriangle, ArrowUpRight, ArrowDownRight, Calendar,
  Loader2, RefreshCcw, UserCheck, Eye, Power
} from 'lucide-react';
import { API_URL } from '@/lib/api';
import { useToast } from '@/context/ToastContext';

interface HubDetailClientProps {
  id: string;
}

export default function HubDetailClient({ id }: HubDetailClientProps) {
  const router = useRouter();
  const { addToast } = useToast();

  const [hub, setHub] = useState<any>(null);
  const [dashboard, setDashboard] = useState<any>(null);
  const [vendors, setVendors] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [payouts, setPayouts] = useState<any[]>([]);

  const [activeTab, setActiveTab] = useState<'overview' | 'vendors' | 'users' | 'orders' | 'products' | 'payouts' | 'analytics'>('overview');
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingTab, setLoadingTab] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getAuthHeaders = (): Record<string, string> => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('namma_orru_token') : null;
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  };

  // Fetch Hub Profile Info
  const fetchHubProfile = async () => {
    try {
      setLoadingProfile(true);
      setError(null);
      const res = await fetch(`${API_URL}/api/head-vendors/${id}`, {
        headers: getAuthHeaders()
      });
      if (!res.ok) {
        if (res.status === 404) {
          throw new Error('Regional Hub not found');
        }
        throw new Error('Failed to load Regional Hub profile');
      }
      const data = await res.json();
      setHub(data);
    } catch (err: any) {
      setError(err.message || 'Error occurred fetching hub details.');
      addToast('Error', err.message || 'Failed to fetch hub profile');
    } finally {
      setLoadingProfile(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchHubProfile();
    }
  }, [id]);

  // Fetch Tab-Specific Data
  const fetchTabData = async () => {
    setLoadingTab(true);
    try {
      const headers = getAuthHeaders();
      if (activeTab === 'overview') {
        const res = await fetch(`${API_URL}/api/vendor-hub/dashboard?headVendorId=${id}`, { headers });
        if (res.ok) {
          const data = await res.json();
          setDashboard(data);
        }
      } else if (activeTab === 'vendors') {
        const res = await fetch(`${API_URL}/api/vendor-hub/sub-vendors?headVendorId=${id}`, { headers });
        if (res.ok) {
          const data = await res.json();
          setVendors(data.subVendors || []);
        }
      } else if (activeTab === 'users') {
        const res = await fetch(`${API_URL}/api/admin-ops/hub-users/${id}`, { headers });
        if (res.ok) {
          const data = await res.json();
          setUsers(data.hubUsers || []);
        }
      } else if (activeTab === 'orders') {
        const res = await fetch(`${API_URL}/api/vendor-hub/orders?headVendorId=${id}`, { headers });
        if (res.ok) {
          const data = await res.json();
          setOrders(data.orders || []);
        }
      } else if (activeTab === 'products') {
        const res = await fetch(`${API_URL}/api/vendor-hub/products?headVendorId=${id}`, { headers });
        if (res.ok) {
          const data = await res.json();
          setProducts(data.products || []);
        }
      } else if (activeTab === 'payouts') {
        const res = await fetch(`${API_URL}/api/vendor-hub/payouts?headVendorId=${id}`, { headers });
        if (res.ok) {
          const data = await res.json();
          setPayouts(data.payouts || []);
        }
      } else if (activeTab === 'analytics') {
        // Analytics will aggregate data from dashboard + sub-vendors + orders
        const [dashRes, vendRes] = await Promise.all([
          fetch(`${API_URL}/api/vendor-hub/dashboard?headVendorId=${id}`, { headers }),
          fetch(`${API_URL}/api/vendor-hub/sub-vendors?headVendorId=${id}`, { headers })
        ]);
        if (dashRes.ok) {
          const dData = await dashRes.json();
          setDashboard(dData);
        }
        if (vendRes.ok) {
          const vData = await vendRes.json();
          setVendors(vData.subVendors || []);
        }
      }
    } catch (err) {
      console.error('Failed to load tab data', err);
      addToast('Error', 'Failed to fetch tab data');
    } finally {
      setLoadingTab(false);
    }
  };

  useEffect(() => {
    if (hub) {
      fetchTabData();
    }
  }, [activeTab, hub]);

  if (loadingProfile) {
    return (
      <div className="w-full h-[60vh] flex flex-col items-center justify-center bg-white gap-6 rounded-[2.5rem] border border-slate-200 shadow-sm">
        <Loader2 className="h-10 w-10 text-emerald-600 animate-spin" />
        <p className="text-[10px] font-black uppercase tracking-widest text-[#022c22]">Syncing Hub credentials and metrics...</p>
      </div>
    );
  }

  if (error || !hub) {
    return (
      <div className="w-full min-h-[60vh] flex flex-col items-center justify-center p-8 text-center bg-white rounded-[2.5rem] border border-slate-200 shadow-sm">
        <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-amber-50 text-amber-600 mb-6">
          <AlertTriangle size={36} strokeWidth={1.5} />
        </div>
        <h3 className="text-2xl font-black text-slate-900 uppercase">Hub Profile Offline</h3>
        <p className="text-slate-500 font-bold text-xs mt-2 max-w-sm">
          {error || 'Unable to load regional hub details at this moment.'}
        </p>
        <button
          onClick={() => router.push('/admin/hubs')}
          className="mt-8 h-12 px-6 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-black uppercase tracking-widest flex items-center gap-2 transition-all active:scale-95 cursor-pointer border-none"
        >
          <ArrowLeft size={14} /> Back to Hubs List
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-20 animate-in fade-in slide-in-from-bottom-5 duration-700 font-sans">
      
      {/* ─── HUB HEADER METADATA PANEL ─────────────────────────────────────── */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 border-b border-slate-200 pb-8">
        <div className="space-y-2">
          <button
            onClick={() => router.push('/admin/hubs')}
            className="flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-emerald-600 hover:text-emerald-700 transition-colors bg-transparent border-none cursor-pointer p-0"
          >
            <ArrowLeft size={12} /> Back to Regional Hubs
          </button>
          <div className="flex flex-wrap items-center gap-4 mt-2">
            {hub.logo ? (
              <div className="h-16 w-16 bg-white border border-slate-200 rounded-[1.25rem] overflow-hidden shadow-sm flex items-center justify-center p-2 shrink-0">
                <img src={hub.logo} alt={hub.name} className="object-contain h-full w-full" />
              </div>
            ) : (
              <div className="h-16 w-16 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-[1.25rem] flex items-center justify-center p-2 shrink-0">
                <Building2 className="h-8 w-8" />
              </div>
            )}
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tighter uppercase italic leading-none">{hub.name}</h1>
                <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border ${
                  hub.status === 'Blocked' 
                    ? 'text-red-650 bg-red-50 border-red-100'
                    : hub.status === 'Inactive'
                    ? 'text-slate-500 bg-slate-50 border-slate-100'
                    : 'text-emerald-600 bg-emerald-50 border-emerald-100'
                }`}>
                  {hub.status || 'Active'}
                </span>
              </div>
              <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                  {hub.vendorHubId || `VEN-${hub.id.toString().padStart(3, '0')}`}
                </span>
                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-1">
                  Manager: {hub.managerName || 'Unassigned'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Info Badges */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50/50 border border-slate-200/60 rounded-2xl p-4 self-start xl:self-auto text-xs">
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-slate-400 shrink-0" />
            <span className="text-slate-600 font-medium truncate">{hub.email || 'No email registered'}</span>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-slate-400 shrink-0" />
            <span className="text-slate-600 font-mono">{hub.mobile || 'No mobile registered'}</span>
          </div>
        </div>
      </div>

      {/* ─── NAVIGATION TAB BAR ─────────────────────────────────────── */}
      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm p-6 space-y-8">
        <div className="flex flex-wrap gap-1.5 bg-slate-50 p-1.5 rounded-2xl">
          {([
            { id: 'overview', label: 'Overview', icon: Building2 },
            { id: 'vendors', label: 'Hub Vendors', icon: Users },
            { id: 'users', label: 'Hub Users', icon: UserCheck },
            { id: 'orders', label: 'Orders', icon: ShoppingBag },
            { id: 'products', label: 'Products', icon: Package },
            { id: 'payouts', label: 'Payouts', icon: CreditCard },
            { id: 'analytics', label: 'Analytics', icon: BarChart2 }
          ] as const).map((tab) => {
            const TabIcon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`h-10 px-4 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 border-0 transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/25 scale-[1.02]'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <TabIcon size={13} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* ─── TAB SUB-PANELS ────────────────────────────────────────── */}
        <div className="min-h-[350px]">
          {loadingTab ? (
            <div className="py-24 flex flex-col items-center justify-center gap-4">
              <Loader2 className="h-10 w-10 text-emerald-600 animate-spin" />
              <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Syncing Hub Registry data...</span>
            </div>
          ) : (
            <div className="animate-in fade-in duration-300">
              
              {/* 1. OVERVIEW TAB */}
              {activeTab === 'overview' && dashboard && (
                <div className="space-y-8">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    <StatCard title="Total Vendors" value={dashboard.totalVendors || 0} subtitle={`Active: ${dashboard.activeVendors || 0} • Pending: ${dashboard.pendingVendors || 0}`} color="bg-emerald-600" Icon={Users} />
                    <StatCard title="Total Products" value={dashboard.totalProducts || 0} subtitle="Registered under hub" color="bg-blue-600" Icon={Package} />
                    <StatCard title="Total Orders" value={dashboard.totalOrders || 0} subtitle="Ordered via subvendors" color="bg-violet-600" Icon={ShoppingBag} />
                    <StatCard title="Total Revenue" value={`₹${Number(dashboard.totalRevenue || 0).toLocaleString()}`} subtitle="Gross fulfillment value" color="bg-amber-600" Icon={DollarSign} />
                    <StatCard title="Total Payouts" value={`₹${Number(dashboard.totalPayouts || 0).toLocaleString()}`} subtitle="Settled + Pending payouts" color="bg-indigo-600" Icon={CreditCard} />
                    <StatCard title="Pending Payouts" value={`₹${Number(dashboard.pendingPayouts || 0).toLocaleString()}`} subtitle="Awaiting administrative release" color="bg-rose-600" Icon={RefreshCcw} />
                    <StatCard title="Total Customers" value={dashboard.totalCustomers || 0} subtitle="Unique consumer base" color="bg-teal-600" Icon={UserCheck} />
                    <StatCard title="Delivered Orders" value={dashboard.deliveredOrders || 0} subtitle={`Fulfilled: ${Math.round(((dashboard.deliveredOrders || 0) / (dashboard.totalOrders || 1)) * 100)}%`} color="bg-emerald-500" Icon={CheckCircle2} />
                    <StatCard title="Cancelled Orders" value={dashboard.cancelledOrders || 0} subtitle={`Ratio: ${Math.round(((dashboard.cancelledOrders || 0) / (dashboard.totalOrders || 1)) * 100)}%`} color="bg-red-500" Icon={XCircle} />
                  </div>

                  <div className="bg-slate-50 border border-slate-100 rounded-3xl p-6 flex flex-col md:flex-row justify-between gap-6 items-center">
                    <div>
                      <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider">Quick Hub Operations Performance Bar</h4>
                      <p className="text-slate-500 text-xs mt-1">Overall ratio of orders fulfillment and cancellation across active vendors.</p>
                    </div>
                    <div className="w-full md:w-96 space-y-3">
                      <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-600">
                        <span>Fulfillment Success</span>
                        <span>{Math.round(((dashboard.deliveredOrders || 0) / (dashboard.totalOrders || 1)) * 100)}%</span>
                      </div>
                      <div className="h-2.5 w-full bg-slate-200 rounded-full overflow-hidden flex">
                        <div className="bg-emerald-600 h-full rounded-l-full" style={{ width: `${((dashboard.deliveredOrders || 0) / (dashboard.totalOrders || 1)) * 100}%` }} />
                        <div className="bg-red-500 h-full" style={{ width: `${((dashboard.cancelledOrders || 0) / (dashboard.totalOrders || 1)) * 100}%` }} />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 2. HUB VENDORS TAB */}
              {activeTab === 'vendors' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Assigned Hub Vendors ({vendors.length})</h3>
                  
                  {/* Desktop View */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left border-separate border-spacing-y-1 admin-data-table">
                      <thead>
                        <tr className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                          <th className="py-4 px-6 rounded-l-xl">Vendor ID</th>
                          <th className="py-4 px-6">Vendor Name</th>
                          <th className="py-4 px-6">Owner Name</th>
                          <th className="py-4 px-6 text-center">Products</th>
                          <th className="py-4 px-6 text-center">Orders</th>
                          <th className="py-4 px-6 text-right">Revenue</th>
                          <th className="py-4 px-6 text-center">Status</th>
                          <th className="py-4 px-6 text-right rounded-r-xl">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {vendors.map(sv => (
                          <tr key={sv.id} className="hover:bg-slate-50/60 transition-colors">
                            <td className="py-5 px-6 font-mono text-xs font-black text-slate-900">
                              SEL-{sv.id.toString().padStart(3, '0')}
                            </td>
                            <td className="py-5 px-6">
                              <span className="text-sm font-black text-slate-900 block">{sv.name}</span>
                              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1 block">slug: {sv.slug}</span>
                            </td>
                            <td className="py-5 px-6">
                              <span className="text-xs font-black text-slate-700 block">{sv.owner?.name || 'Unassigned'}</span>
                              <span className="text-[10px] text-slate-400 mt-1 block">{sv.owner?.email || '-'}</span>
                            </td>
                            <td className="py-5 px-6 text-center text-xs font-bold text-slate-700">
                              {sv._count?.products || 0}
                            </td>
                            <td className="py-5 px-6 text-center text-xs font-bold text-slate-700 font-mono">
                              {sv.ordersCount || 0}
                            </td>
                            <td className="py-5 px-6 text-right text-xs font-black text-slate-900 font-mono">
                              ₹{Number(sv.revenue || 0).toLocaleString()}
                            </td>
                            <td className="py-5 px-6 text-center">
                              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black tracking-widest border ${
                                sv.userId ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-amber-50 text-amber-700 border-amber-100'
                              }`}>
                                {sv.userId ? 'ACTIVE' : 'PENDING'}
                              </span>
                            </td>
                            <td className="py-5 px-6 text-right">
                              <button
                                onClick={() => router.push(`/admin/marketplace-governance?select=${sv.id}`)}
                                className="h-9 px-3 rounded-lg bg-slate-900 text-white text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1 hover:bg-slate-800 transition-colors ml-auto"
                              >
                                <Eye size={12} /> Manage
                              </button>
                            </td>
                          </tr>
                        ))}
                        {vendors.length === 0 && (
                          <tr><td colSpan={8} className="py-20 text-center text-slate-400 font-bold text-xs uppercase tracking-widest">No Vendors Assigned to this Hub.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile View */}
                  <div className="block md:hidden divide-y divide-slate-150">
                    {vendors.map(sv => (
                      <div key={sv.id} className="py-4 space-y-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-xs font-mono font-black text-slate-400 block">SEL-{sv.id.toString().padStart(3, '0')}</span>
                            <span className="text-sm font-black text-slate-900 block">{sv.name}</span>
                          </div>
                          <span className={`inline-flex px-2 py-0.5 rounded text-[8px] font-black tracking-widest border ${
                            sv.userId ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-amber-50 text-amber-700 border-amber-100'
                          }`}>
                            {sv.userId ? 'ACTIVE' : 'PENDING'}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 bg-slate-50/50 rounded-2xl p-4 border border-slate-100/50 text-xs text-slate-500 font-semibold">
                          <div>
                            <span className="text-[9px] text-slate-400 font-black uppercase tracking-wider block">Owner</span>
                            <span className="text-slate-800 font-bold mt-0.5 block">{sv.owner?.name || 'Unassigned'}</span>
                          </div>
                          <div>
                            <span className="text-[9px] text-slate-400 font-black uppercase tracking-wider block">Revenue</span>
                            <span className="text-slate-900 font-black font-mono mt-0.5 block">₹{Number(sv.revenue || 0).toLocaleString()}</span>
                          </div>
                          <div className="pt-2 border-t border-slate-100 mt-2">
                            <span className="text-[9px] text-slate-400 font-black uppercase tracking-wider block">Products</span>
                            <span className="text-slate-800 font-bold mt-0.5 block">{sv._count?.products || 0} Products</span>
                          </div>
                          <div className="pt-2 border-t border-slate-100 mt-2">
                            <span className="text-[9px] text-slate-400 font-black uppercase tracking-wider block">Orders</span>
                            <span className="text-slate-800 font-bold font-mono mt-0.5 block">{sv.ordersCount || 0} Orders</span>
                          </div>
                        </div>
                        <button
                          onClick={() => router.push(`/admin/marketplace-governance?select=${sv.id}`)}
                          className="w-full h-10 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 hover:text-slate-900 text-xs font-bold transition-all flex items-center justify-center gap-1"
                        >
                          <Eye size={13} /> View Vendor
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 3. HUB USERS TAB */}
              {activeTab === 'users' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Hub Login Accounts ({users.length})</h3>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-separate border-spacing-y-1 admin-data-table">
                      <thead>
                        <tr className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                          <th className="py-4 px-6 rounded-l-xl">Username</th>
                          <th className="py-4 px-6">Name / Manager</th>
                          <th className="py-4 px-6">Email Address</th>
                          <th className="py-4 px-6">Mobile Phone</th>
                          <th className="py-4 px-6 text-center">Account Role</th>
                          <th className="py-4 px-6 text-center">Status</th>
                          <th className="py-4 px-6 text-right rounded-r-xl">Last Login</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {users.map(u => (
                          <tr key={u.id} className="hover:bg-slate-50/60 transition-colors">
                            <td className="py-5 px-6 font-mono text-xs font-bold text-slate-900">
                              {u.username}
                            </td>
                            <td className="py-5 px-6 text-xs font-black text-slate-800">
                              {u.managerName}
                              {u.vendorName && <span className="text-[9px] text-slate-400 block font-bold mt-1 uppercase">({u.vendorName})</span>}
                            </td>
                            <td className="py-5 px-6 text-xs text-slate-500">
                              {u.email}
                            </td>
                            <td className="py-5 px-6 text-xs text-slate-500 font-mono">
                              {u.mobile || '-'}
                            </td>
                            <td className="py-5 px-6 text-center">
                              <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                                u.role === 'Hub Manager' ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' : 'bg-slate-50 text-slate-600 border border-slate-200'
                              }`}>
                                {u.role}
                              </span>
                            </td>
                            <td className="py-5 px-6 text-center">
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black tracking-widest border bg-emerald-50 text-emerald-700 border-emerald-100">
                                {u.status}
                              </span>
                            </td>
                            <td className="py-5 px-6 text-right text-xs text-slate-400 font-mono">
                              {u.lastLogin ? new Date(u.lastLogin).toLocaleDateString('en-IN') : '--'}
                            </td>
                          </tr>
                        ))}
                        {users.length === 0 && (
                          <tr><td colSpan={7} className="py-20 text-center text-slate-400 font-bold text-xs uppercase tracking-widest">No User Accounts linked to this Hub.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* 4. ORDERS TAB */}
              {activeTab === 'orders' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Hub Transactions / Orders ({orders.length})</h3>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-separate border-spacing-y-1 admin-data-table">
                      <thead>
                        <tr className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                          <th className="py-4 px-6 rounded-l-xl">Order ID</th>
                          <th className="py-4 px-6">Vendor(s)</th>
                          <th className="py-4 px-6">Customer</th>
                          <th className="py-4 px-6 text-right">Subtotal</th>
                          <th className="py-4 px-6 text-center">Payment</th>
                          <th className="py-4 px-6 text-center">Fulfillment</th>
                          <th className="py-4 px-6 text-right rounded-r-xl">Order Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {orders.map(o => {
                          const vendorNames = Array.from(new Set(o.items?.map((item: any) => item.product?.subVendor?.name || 'Local Vendor'))).join(', ');
                          return (
                            <tr key={o.id} className="hover:bg-slate-50/60 transition-colors">
                              <td className="py-5 px-6 font-mono text-xs font-black text-slate-900">
                                {o.orderIdStr || `ORD-${o.id}`}
                              </td>
                              <td className="py-5 px-6 text-xs font-bold text-slate-700 max-w-[200px] truncate">
                                {vendorNames}
                              </td>
                              <td className="py-5 px-6 text-xs text-slate-800 font-semibold">
                                {o.customerName}
                              </td>
                              <td className="py-5 px-6 text-right text-xs font-black text-slate-900 font-mono">
                                ₹{Number(o.hubSubtotal || o.totalAmount).toLocaleString()}
                              </td>
                              <td className="py-5 px-6 text-center text-xs font-bold text-slate-500 font-mono">
                                {o.paymentMethod || 'ONLINE'}
                              </td>
                              <td className="py-5 px-6 text-center">
                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black tracking-widest border ${
                                  o.status === 'DELIVERED' 
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                                    : o.status === 'CANCELLED'
                                    ? 'bg-rose-50 text-rose-700 border-rose-100'
                                    : 'bg-amber-50 text-amber-700 border-amber-100'
                                }`}>
                                  {o.status}
                                </span>
                              </td>
                              <td className="py-5 px-6 text-right text-xs text-slate-400 font-mono">
                                {new Date(o.createdAt).toLocaleDateString('en-IN')}
                              </td>
                            </tr>
                          );
                        })}
                        {orders.length === 0 && (
                          <tr><td colSpan={7} className="py-20 text-center text-slate-400 font-bold text-xs uppercase tracking-widest">No order transactions found for this Hub.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* 5. PRODUCTS TAB */}
              {activeTab === 'products' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Active Hub Catalog Items ({products.length})</h3>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-separate border-spacing-y-1 admin-data-table">
                      <thead>
                        <tr className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                          <th className="py-4 px-6 rounded-l-xl">Product ID</th>
                          <th className="py-4 px-6">SKU Code</th>
                          <th className="py-4 px-6">Item Name</th>
                          <th className="py-4 px-6">Seller / Brand</th>
                          <th className="py-4 px-6">Category</th>
                          <th className="py-4 px-6 text-center">Stock</th>
                          <th className="py-4 px-6 text-right">Price</th>
                          <th className="py-4 px-6 text-center rounded-r-xl">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {products.map(p => (
                          <tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                            <td className="py-5 px-6 font-mono text-xs font-black text-slate-900">
                              PROD-{p.id.toString().padStart(3, '0')}
                            </td>
                            <td className="py-5 px-6 font-mono text-xs text-slate-500">
                              {p.sku || p.skuCode || `SKU-${p.id}`}
                            </td>
                            <td className="py-5 px-6 text-xs font-bold text-slate-900">
                              {p.name}
                            </td>
                            <td className="py-5 px-6 text-xs font-black text-slate-700">
                              {p.subVendor?.name || 'Local Seller'}
                            </td>
                            <td className="py-5 px-6 text-xs text-slate-500">
                              {p.category?.name || '-'}
                            </td>
                            <td className="py-5 px-6 text-center">
                              <span className={`text-xs font-bold ${p.stock <= 50 ? 'text-amber-600' : 'text-slate-500'}`}>
                                {p.stock} units
                              </span>
                            </td>
                            <td className="py-5 px-6 text-right text-xs font-black text-slate-900 font-mono">
                              ₹{Number(p.price).toLocaleString()}
                            </td>
                            <td className="py-5 px-6 text-center">
                              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black tracking-widest border ${
                                p.status === 'APPROVED' || p.status === 'PUBLISHED' 
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                                  : 'bg-rose-50 text-rose-700 border-rose-100'
                              }`}>
                                {p.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                        {products.length === 0 && (
                          <tr><td colSpan={8} className="py-20 text-center text-slate-400 font-bold text-xs uppercase tracking-widest">No products listed under this Hub's vendors.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* 6. PAYOUTS TAB */}
              {activeTab === 'payouts' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Sub-Vendor Payouts Ledger ({payouts.length})</h3>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-separate border-spacing-y-1 admin-data-table">
                      <thead>
                        <tr className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                          <th className="py-4 px-6 rounded-l-xl">Payout ID</th>
                          <th className="py-4 px-6">Brand / Subvendor</th>
                          <th className="py-4 px-6 text-right">Gross Sales</th>
                          <th className="py-4 px-6 text-right">Commission</th>
                          <th className="py-4 px-6 text-right">Net Payable</th>
                          <th className="py-4 px-6 text-center">Payout Date</th>
                          <th className="py-4 px-6 text-right">UTR reference</th>
                          <th className="py-4 px-6 text-center rounded-r-xl">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {payouts.map((pay, idx) => (
                          <tr key={pay.id} className="hover:bg-slate-50/60 transition-colors">
                            <td className="py-5 px-6 font-mono text-xs font-black text-slate-900">
                              PAY-{pay.id.toString().padStart(3, '0')}
                            </td>
                            <td className="py-5 px-6 text-xs font-bold text-slate-700">
                              {pay.subVendor?.name || 'Assigned Seller'}
                            </td>
                            <td className="py-5 px-6 text-right font-mono text-xs text-slate-900">
                              ₹{Number(pay.grossAmount || pay.amount).toFixed(2)}
                            </td>
                            <td className="py-5 px-6 text-right font-mono text-xs text-slate-500">
                              ₹{Number(pay.commission || 0).toFixed(2)}
                            </td>
                            <td className="py-5 px-6 text-right font-mono text-xs font-black text-slate-900">
                              ₹{Number(pay.payableAmount || pay.amount).toFixed(2)}
                            </td>
                            <td className="py-5 px-6 text-center text-xs text-slate-500">
                              {pay.payoutDate ? new Date(pay.payoutDate).toLocaleDateString('en-IN') : '--'}
                            </td>
                            <td className="py-5 px-6 text-right font-mono text-xs text-slate-400">
                              {pay.transactionRef || '--'}
                            </td>
                            <td className="py-5 px-6 text-center">
                              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black tracking-widest border ${
                                pay.status === 'SETTLED' || pay.status === 'COMPLETED'
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                                  : 'bg-amber-50 text-amber-700 border-amber-100'
                              }`}>
                                {pay.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                        {payouts.length === 0 && (
                          <tr><td colSpan={8} className="py-20 text-center text-slate-400 font-bold text-xs uppercase tracking-widest">No payout ledger files found.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* 7. ANALYTICS TAB */}
              {activeTab === 'analytics' && dashboard && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  
                  {/* Subvendor Revenue share */}
                  <div className="bg-slate-50/40 border border-slate-100 rounded-3xl p-8 space-y-6">
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest pb-3 border-b border-slate-200/60">
                      Sub-Vendor Revenue Distribution
                    </h3>
                    <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                      {vendors.map(sv => {
                        const totalRev = dashboard.totalRevenue || 1;
                        const pct = Math.min(100, Math.round(((sv.revenue || 0) / totalRev) * 100));
                        return (
                          <div key={sv.id} className="space-y-2">
                            <div className="flex justify-between text-xs font-bold text-slate-700">
                              <span className="truncate max-w-[200px]">{sv.name}</span>
                              <div className="font-mono text-right flex gap-3 text-slate-400">
                                <span className="text-slate-900 font-black">₹{Number(sv.revenue || 0).toLocaleString()}</span>
                                <span>({pct}%)</span>
                              </div>
                            </div>
                            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                              <div className="h-full bg-gradient-to-r from-emerald-600 to-emerald-500 rounded-full" style={{ width: `${pct}%` }} />
                            </div>
                          </div>
                        );
                      })}
                      {vendors.length === 0 && (
                        <p className="text-xs font-bold text-slate-400 text-center py-12">No active vendors linked to show distributions.</p>
                      )}
                    </div>
                  </div>

                  {/* Order metrics */}
                  <div className="bg-slate-50/40 border border-slate-100 rounded-3xl p-8 space-y-6">
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest pb-3 border-b border-slate-200/60">
                      Transaction Volume & Status Snapshot
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white border border-slate-100 p-5 rounded-2xl text-center shadow-sm">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Delivered Orders</span>
                        <span className="text-2xl font-black text-slate-800 font-mono">{dashboard.deliveredOrders || 0}</span>
                      </div>
                      <div className="bg-white border border-slate-100 p-5 rounded-2xl text-center shadow-sm">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Cancelled Orders</span>
                        <span className="text-2xl font-black text-slate-800 font-mono">{dashboard.cancelledOrders || 0}</span>
                      </div>
                    </div>
                    <div className="space-y-4 pt-4 border-t border-slate-100">
                      <div>
                        <div className="flex justify-between text-xs font-bold text-slate-600 mb-1">
                          <span>Successful Deliveries Ratio</span>
                          <span>{Math.round(((dashboard.deliveredOrders || 0) / (dashboard.totalOrders || 1)) * 100)}%</span>
                        </div>
                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div className="bg-emerald-600 h-full rounded-full" style={{ width: `${((dashboard.deliveredOrders || 0) / (dashboard.totalOrders || 1)) * 100}%` }} />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-xs font-bold text-slate-600 mb-1">
                          <span>Cancellations / Returns Ratio</span>
                          <span>{Math.round(((dashboard.cancelledOrders || 0) / (dashboard.totalOrders || 1)) * 100)}%</span>
                        </div>
                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div className="bg-rose-500 h-full rounded-full" style={{ width: `${((dashboard.cancelledOrders || 0) / (dashboard.totalOrders || 1)) * 100}%` }} />
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              )}

            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Stats & Card Helper subcomponents
function StatCard({ title, value, subtitle, color, Icon }: any) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:shadow-xl hover:shadow-slate-200/40 transition-all group relative overflow-hidden flex flex-col justify-between">
      <div className="flex items-center justify-between">
        <div className={`h-9 w-9 rounded-xl flex items-center justify-center text-white shadow-md ${color} shadow-slate-200`}>
          <Icon size={16} />
        </div>
      </div>
      <div className="space-y-0.5 mt-3">
        <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">{title}</span>
        <h3 className="text-xl font-black text-slate-950 tracking-tighter leading-none">{value}</h3>
        <p className="text-[9px] text-slate-400 font-bold mt-0.5 tracking-wide">{subtitle}</p>
      </div>
    </div>
  );
}
