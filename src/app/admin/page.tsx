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
   Clock
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';
import { useAuth } from '@/context/AuthContext';
import { API_URL } from '@/lib/api';

const fetcher = (url: string) => fetch(url).then(res => res.json());

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
         <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
               <h1 className="text-3xl font-black text-slate-950 tracking-tight flex items-center gap-3">
                  Admin Dashboard
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
               </h1>
               <p className="text-[14px] text-slate-500 font-semibold mt-1 tracking-wide">
                  <span className="text-emerald-800">Welcome Back, {user?.name}!</span>
               </p>
            </div>
            <div className="flex items-center gap-3">
               <button
                  onClick={() => router.push('/admin/analytics')}
                  className="h-10 px-4 rounded-xl bg-white border border-slate-200 text-slate-600 font-bold text-[12px] shadow-sm hover:shadow-md hover:bg-slate-50 transition-all flex items-center gap-2"
               >
                  <Download size={16} />
                  Export Analysis
               </button>
               <button
                  onClick={() => router.push('/admin/products')}
                  className="h-10 px-5 rounded-xl bg-slate-950 text-white font-bold text-[12px] shadow-lg shadow-slate-950/20 hover:bg-slate-900 transition-all flex items-center gap-2 active:scale-95 group"
               >
                  <Plus size={16} className="group-hover:rotate-90 transition-transform" />
                  New Initiative
               </button>
            </div>
         </div>

         {/* Metrics Grid */}
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               {systemAlerts.map((alert: any, i: number) => (
                  <div key={i} className={`p-5 rounded-2xl border-2 flex items-center justify-between transition-all hover:scale-[1.01] ${alert.type === 'danger' ? 'bg-rose-50/50 border-rose-100/50 text-rose-700' : 'bg-amber-50/50 border-amber-100/50 text-amber-700'
                     }`}>
                     <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-sm ${alert.type === 'danger' ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-600'
                           }`}>
                           {alert.type === 'danger' ? <Package size={22} /> : <Clock size={22} />}
                        </div>
                        <div>
                           <div className="text-[10px] font-black uppercase tracking-[0.15em] opacity-60 mb-0.5">{alert.label}</div>
                           <div className="text-lg font-black tracking-tight">{alert.value} Tasks Pending</div>
                        </div>
                     </div>
                     <button
                        onClick={() => router.push(alert.label.includes('Approvals') ? '/admin/products/approvals' : '/admin/products')}
                        className={`h-10 px-6 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all shadow-sm active:scale-95 ${alert.type === 'danger' ? 'bg-rose-600 text-white hover:bg-rose-700 shadow-rose-200' : 'bg-amber-600 text-white hover:bg-amber-700 shadow-amber-200'
                           }`}
                     >
                        Take Action
                     </button>
                  </div>
               ))}
            </div>
         )}


         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* Recent Orders */}
            <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200/60 p-8 shadow-sm">
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
               <div className="overflow-x-auto -mx-2">
                  <table className="w-full text-left border-separate border-spacing-y-2">
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

            <div className="space-y-8">
               {/* Catalog Highlights */}
               <div className="bg-slate-950 rounded-3xl p-8 shadow-2xl text-white relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl -mr-20 -mt-20 group-hover:bg-emerald-500/20 transition-all duration-700" />
                  <div className="relative z-10">
                     <h3 className="text-xl font-black mb-1 tracking-tight">Master Catalog</h3>
                     <p className="text-[11px] font-black text-emerald-400 uppercase tracking-[0.2em] mb-8">High Performance SKU List</p>

                     <div className="space-y-6">
                        {topProducts.length > 0 ? topProducts.map((product: any, i: number) => (
                           <div key={i} className="flex items-center gap-4 group/item cursor-pointer" onClick={() => router.push('/admin/products')}>
                              <div className="h-12 w-12 rounded-xl bg-white/5 border border-white/10 overflow-hidden shrink-0 transition-all group-hover/item:border-emerald-500/50 group-hover/item:scale-105 shadow-xl">
                                 <img src={product.image} className="h-full w-full object-cover" alt="" />
                              </div>
                              <div className="flex flex-col min-w-0">
                                 <span className="text-[13px] font-black tracking-tight truncate group-hover/item:text-emerald-400 transition-colors">{product.name}</span>
                                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">{product.sales} units dispatched</span>
                              </div>
                           </div>
                        )) : (
                           <div className="py-10 text-center text-white/10">
                              <Package size={32} className="mx-auto mb-2" />
                              <span className="text-[10px] font-black uppercase tracking-widest">Inventory Static</span>
                           </div>
                        )}
                     </div>

                     <button
                        onClick={() => router.push('/admin/products')}
                        className="w-full mt-10 h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[12px] uppercase tracking-widest rounded-xl shadow-lg shadow-emerald-900/40 transition-all flex items-center justify-center gap-3 active:scale-95"
                     >
                        <Package size={18} />
                        Optimize Stock
                     </button>
                  </div>
               </div>

            </div>

         </div>
      </div>
   );
}


