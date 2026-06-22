'use client';

import React from 'react';
import {
   TrendingUp,
   Users,
   ShoppingBag,
   ArrowUpRight,
   ArrowDownRight,
   MoreVertical,
   Calendar,
   RefreshCw,
   Download,
   Plus,
   ExternalLink,
   Package,
   Clock,
   Shield,
   Ticket,
   Megaphone,
   ArrowRight,
   AlertTriangle
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';
import { useAuth } from '@/context/AuthContext';
import { API_URL } from '@/lib/api';

const fetcher = (url: string) => fetch(url).then(res => res.json());

function PendingApprovalsWidget() {
  const router = useRouter();
  const { data: couponsData } = useSWR<any>(`${API_URL}/api/coupons?createdByType=VENDOR&limit=500`, fetcher, { refreshInterval: 30000 });
  const { data: annData }     = useSWR<any>(`${API_URL}/api/offer-announcements?createdByType=VENDOR`, fetcher, { refreshInterval: 30000 });

  const coupons       = couponsData?.coupons || [];
  const announcements = Array.isArray(annData) ? annData : [];

  const pendingCoupons = coupons.filter((c: any) => c.status === 'PENDING').length;
  const pendingAnn     = announcements.filter((a: any) => a.status === 'PENDING').length;
  const total          = pendingCoupons + pendingAnn;

  if (total === 0) return null;

  return (
    <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-3xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 bg-amber-400 rounded-xl flex items-center justify-center">
            <AlertTriangle className="text-white h-4 w-4" />
          </div>
          <h3 className="text-[13px] font-black uppercase tracking-widest text-amber-800">Vendor Approvals Pending</h3>
        </div>
        <button onClick={() => router.push('/admin/marketing/vendor-approvals')}
          className="text-[10px] font-black uppercase tracking-widest text-amber-700 hover:text-amber-900 flex items-center gap-1 bg-amber-100 hover:bg-amber-200 px-3 py-1.5 rounded-xl transition-all cursor-pointer">
          Review All <ArrowRight size={11} />
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
        {[
          { label: 'Pending Coupon Requests', value: pendingCoupons, icon: Ticket,    href: '/admin/marketing/vendor-approvals', color: 'emerald' },
          { label: 'Pending Banner Requests', value: pendingAnn,     icon: Megaphone, href: '/admin/marketing/vendor-approvals', color: 'blue' },
        ].map(card => (
          <button key={card.label} onClick={() => router.push(card.href)}
            className="bg-white border border-amber-100 rounded-2xl p-4 flex items-center justify-between hover:shadow-md transition-all cursor-pointer text-left group">
            <div>
              <div className="text-2xl font-black text-slate-900">{card.value}</div>
              <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">{card.label}</div>
            </div>
            <div className="flex flex-col items-end gap-2 shrink-0 ml-4">
              <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${card.color === 'emerald' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'}`}>
                <card.icon size={18} />
              </div>
              <ArrowRight size={13} className="text-slate-300 group-hover:text-slate-600 group-hover:translate-x-1 transition-all" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

export default function AdminDashboard() {
   const { user } = useAuth();
   const router = useRouter();
   const startTime = React.useRef(Date.now());
   const [latency, setLatency] = React.useState<number>(42);
   const { data, error } = useSWR(`${API_URL}/api/admin/analytics`, fetcher, {
      onSuccess: () => {
         setLatency(Math.min(Math.max(Date.now() - startTime.current, 10), 500));
      }
   });

   const loading = !data && !error;

   if (loading) {
      return (
         <div className="flex flex-col items-center justify-center py-40 gap-4">
            <div className="w-10 h-10 border-4 border-slate-200 border-t-emerald-600 rounded-full animate-spin"></div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Syncing Intelligence Network...</p>
         </div>
      );
   }

   const { stats, recentOrders, topProducts, systemAlerts } = data || { stats: [], recentOrders: [], topProducts: [], systemAlerts: [] };

   return (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000 ease-out p-1">

         {/* Header Section */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
             <div>
                <h1 className="text-2xl md:text-3xl lg:text-5xl font-black text-slate-900 tracking-tighter italic flex items-center gap-2 flex-wrap">
                   Admin <span className="text-emerald-600">Dashboard</span>
                   <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse mt-1" />
                </h1>
                <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px] mt-2">
                   Welcome back, <span className="text-emerald-600">{user?.name}!</span>
                </p>
             </div>
             <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto shrink-0">
                <button
                   onClick={() => router.push('/admin/marketplace-governance')}
                   className="h-12 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[11px] uppercase tracking-widest shadow-xl shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 active:scale-95 group border-0 cursor-pointer w-full sm:w-auto"
                >
                   <Shield size={16} className="group-hover:scale-110 transition-transform shrink-0" />
                   <span className="truncate">Vendor Management</span>
                </button>
                <button
                   onClick={() => router.push('/admin/analytics')}
                   className="h-12 px-6 rounded-xl bg-white border border-slate-200 text-slate-500 font-extrabold text-xs uppercase tracking-wider shadow-sm hover:shadow-md hover:bg-slate-50 transition-all flex items-center justify-center gap-2 cursor-pointer w-full sm:w-auto"
                >
                   <Download size={16} className="shrink-0" />
                   <span className="truncate">Export Analysis</span>
                </button>
                <button
                   onClick={() => router.push('/admin/products')}
                   className="h-12 px-6 rounded-xl bg-[var(--admin-sidebar)] text-white font-black text-[11px] uppercase tracking-widest shadow-xl shadow-slate-900/10 hover:bg-slate-800 transition-all flex items-center justify-center gap-2 active:scale-95 group border-0 cursor-pointer w-full sm:w-auto"
                >
                   <Plus size={16} className="group-hover:rotate-90 transition-transform shrink-0" />
                   <span className="truncate">New Initiative</span>
                </button>
             </div>
          </div>

         {/* Metrics Grid */}
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
            {stats.map((stat: any, i: number) => (
               <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-xl hover:shadow-slate-200/40 transition-all group relative overflow-hidden">
                  <div className="flex items-center justify-between mb-6">
                     <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 duration-500 ${i === 0 ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' :
                        i === 1 ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' :
                           i === 2 ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20' :
                              'bg-rose-500 text-white shadow-lg shadow-rose-500/20'
                        }`}>
                        {i === 0 ? <TrendingUp size={20} /> : i === 1 ? <ShoppingBag size={20} /> : i === 2 ? <Users size={20} /> : <TrendingUp size={20} />}
                     </div>
                     <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black tracking-tighter ${stat.isUp ? 'text-emerald-600 bg-emerald-50' : 'text-rose-600 bg-rose-50'
                        }`}>
                        {stat.isUp ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                        {stat.trend}
                     </div>
                  </div>
                  <div className="space-y-1">
                     <span className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">{stat.label}</span>
                     <h3 className="text-3xl font-black text-slate-950 tracking-tighter">{stat.value}</h3>
                  </div>
                  <div className={`absolute -bottom-6 -right-6 w-24 h-24 rounded-full opacity-[0.03] transition-transform group-hover:scale-150 duration-700 ${i === 0 ? 'bg-emerald-600' : i === 1 ? 'bg-indigo-600' : i === 2 ? 'bg-amber-600' : 'bg-rose-600'
                     }`} />
               </div>
            ))}
         </div>

         {/* System Alerts Row */}
         {systemAlerts && systemAlerts.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
               {systemAlerts.map((alert: any, i: number) => (
                  <div key={i} className={`p-4 md:p-5 rounded-2xl border-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 transition-all hover:scale-[1.01] ${alert.type === 'danger' ? 'bg-rose-50/50 border-rose-100/50 text-rose-700' : 'bg-amber-50/50 border-amber-100/50 text-amber-700'
                     }`}>
                     <div className="flex items-center gap-4 min-w-0">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-sm shrink-0 ${alert.type === 'danger' ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-600'
                           }`}>
                           {alert.type === 'danger' ? <Package size={22} /> : <Clock size={22} />}
                        </div>
                        <div className="min-w-0">
                           <div className="text-[10px] font-black uppercase tracking-[0.15em] opacity-60 mb-0.5 truncate">{alert.label}</div>
                           <div className="text-base md:text-lg font-black tracking-tight truncate">{alert.value} Tasks Pending</div>
                        </div>
                     </div>
                     <button
                        onClick={() => router.push(alert.label.includes('Approvals') ? '/admin/products/approvals' : '/admin/products')}
                        className={`h-10 px-6 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all shadow-sm active:scale-95 shrink-0 ${alert.type === 'danger' ? 'bg-rose-600 text-white hover:bg-rose-700 shadow-rose-200' : 'bg-amber-600 text-white hover:bg-amber-700 shadow-amber-200'
                           }`}
                     >
                        Take Action
                     </button>
                  </div>
               ))}
            </div>
         )}


         {/* Pending Approvals Widget */}
         <PendingApprovalsWidget />

         <div className="w-full">

            {/* Recent Orders */}
            <div className="bg-white rounded-3xl border border-slate-200/60 p-8 shadow-sm">
               <div className="flex items-center justify-between mb-8">
                  <div>
                     <h3 className="text-xl font-black text-slate-950 tracking-tight">Recent Conversions</h3>
                     <p className="text-[12px] text-slate-400 font-bold mt-0.5 uppercase tracking-wider">Direct Transaction Stream</p>
                  </div>
                  <button
                     onClick={() => router.push('/admin/orders')}
                     className="h-9 px-4 rounded-full text-[11px] font-black text-emerald-600 bg-emerald-50 hover:bg-emerald-100 transition-all flex items-center gap-2"
                  >
                     Live Ledger <ExternalLink size={14} />
                  </button>
               </div>
               <div className="overflow-x-auto w-full border border-slate-100 rounded-2xl">
                  <table className="w-full min-w-[700px] text-left border-separate border-spacing-y-2 px-2 min-w-[1200px] admin-data-table">
                     <thead>
                        <tr className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                           <th className="pb-4 px-4">Identity</th>
                           <th className="pb-4 px-4">Customer</th>
                           <th className="pb-4 px-4 text-center">Status</th>
                           <th className="pb-4 px-4 text-right">Value</th>
                        </tr>
                     </thead>
                     <tbody>
                        {recentOrders.length > 0 ? recentOrders.map((order: any, i: number) => (
                           <tr key={i} className="group hover:bg-slate-50/80 transition-all cursor-pointer" onClick={() => router.push(`/admin/orders?id=${order.id}`)}>
                              <td className="py-4 px-4 bg-slate-50/30 group-hover:bg-transparent rounded-l-2xl">
                                 <span className="text-[14px] font-black text-slate-900 tabular-nums leading-none">#ORD-{order.id.toString().padStart(4, '0')}</span>
                                 <p className="text-[11px] text-slate-400 font-bold mt-1.5 flex items-center gap-1">
                                    <Clock size={10} /> {order.date}
                                 </p>
                              </td>
                              <td className="py-4 px-4">
                                 <span className="text-[14px] font-black text-slate-700 block">{order.customer}</span>
                                 <p className="text-[11px] text-slate-400 font-bold truncate max-w-[150px] mt-1">{order.product}</p>
                              </td>
                              <td className="py-4 px-4 text-center">
                                 <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black tracking-widest ${order.status === 'DELIVERED' ? 'bg-emerald-100 text-emerald-700' :
                                    order.status === 'SHIPPED' ? 'bg-indigo-100 text-indigo-700' :
                                       order.status === 'CANCELLED' ? 'bg-rose-100 text-rose-700' :
                                          'bg-amber-100 text-amber-700'
                                    }`}>
                                    <span className={`h-1.5 w-1.5 rounded-full ${order.status === 'DELIVERED' ? 'bg-emerald-500' :
                                       order.status === 'SHIPPED' ? 'bg-indigo-500' :
                                          order.status === 'CANCELLED' ? 'bg-rose-500' :
                                             'bg-amber-500'
                                       }`} />
                                    {order.status}
                                 </span>
                              </td>
                              <td className="py-4 px-4 text-right rounded-r-2xl">
                                 <span className="text-[15px] font-black text-slate-950 tabular-nums">{order.amount}</span>
                              </td>
                           </tr>
                        )) : (
                           <tr>
                              <td colSpan={4} className="py-32 text-center">
                                 <div className="flex flex-col items-center gap-4 opacity-10">
                                    <ShoppingBag size={64} strokeWidth={1.5} />
                                    <span className="text-xs font-black uppercase tracking-[0.3em]">Stream Offline</span>
                                 </div>
                              </td>
                           </tr>
                        )}
                     </tbody>
                  </table>
               </div>
            </div>
         </div>
      </div>
   );
}


