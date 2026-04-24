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
  RefreshCw
} from 'lucide-react';
import useSWR from 'swr';
import { useAuth } from '@/context/AuthContext';
import { API_URL } from '@/lib/api';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function AdminDashboard() {
  const { user } = useAuth();
  const { data, error } = useSWR(`${API_URL}/api/admin/analytics`, fetcher);

  const loading = !data && !error;

  if (loading) {
     return (
        <div className="flex flex-col items-center justify-center py-40 gap-6">
           <RefreshCw size={48} className="text-emerald-950 animate-spin" />
           <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Syncing Intelligence Network...</p>
        </div>
     );
  }

  const { stats, recentOrders, topProducts } = data || { stats: [], recentOrders: [], topProducts: [] };

  return (
    <div className="space-y-10">
      
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
           <span className="text-[10px] font-black uppercase tracking-[0.4em] text-amber-500">Overview</span>
           <h2 className="text-4xl font-black text-[#022c22] tracking-tighter">Command Center</h2>
           <p className="text-slate-400 font-medium">Live systemic intelligence for Namma Orru ecosystem.</p>
        </div>
        <button className="h-14 px-8 rounded-2xl bg-white border border-slate-200 text-[#022c22] text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-slate-50 transition-all shadow-sm">
           <Calendar size={18} />
           Real-time Stream
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {stats.map((stat: any, i: number) => (
          <div key={i} className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group flex flex-col justify-between min-h-[180px]">
            <div className="flex justify-between items-start">
              <div className="h-12 w-12 rounded-2xl bg-slate-50 flex items-center justify-center text-emerald-900 group-hover:bg-amber-400 group-hover:text-[#022c22] transition-all">
                {i === 0 || i === 3 ? <TrendingUp size={22} strokeWidth={2.5} /> : i === 1 ? <ShoppingBag size={22} strokeWidth={2.5} /> : <Users size={22} strokeWidth={2.5} />}
              </div>
              <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider ${stat.isUp ? 'text-emerald-600 bg-emerald-50' : 'text-red-600 bg-red-50'}`}>
                {stat.isUp ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                {stat.trend}
              </div>
            </div>
            <div className="space-y-1 mt-6">
              <span className="text-[11px] font-black uppercase tracking-widest text-slate-400">{stat.label}</span>
              <h3 className="text-2xl font-black text-[#022c22] tracking-tight">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Main Insights Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Recent Orders Table - Large */}
        <div className="lg:col-span-2 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col">
          <div className="p-8 border-b border-slate-50 flex items-center justify-between">
            <h3 className="text-lg font-black text-[#022c22] tracking-tighter">Recent Conversions</h3>
            <button className="text-[10px] font-black uppercase tracking-widest text-amber-600 hover:text-amber-700">View Master Ledger</button>
          </div>
          <div className="overflow-x-auto">
             <table className="w-full text-left border-collapse">
                <thead>
                   <tr className="bg-slate-50/50">
                      <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Identity</th>
                      <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Customer Node</th>
                      <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Logistics</th>
                      <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-right">Value</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                   {recentOrders.map((order: any, i: number) => (
                      <tr key={i} className="group hover:bg-slate-50 transition-all cursor-default">
                         <td className="px-8 py-6">
                            <span className="text-sm font-black text-[#022c22]">{order.id}</span>
                            <p className="text-[10px] text-slate-400 font-medium mt-1 uppercase tracking-widest">{order.date}</p>
                         </td>
                         <td className="px-8 py-6">
                            <span className="text-sm font-bold text-slate-600">{order.customer}</span>
                            <p className="text-[10px] text-slate-400 uppercase tracking-widest line-clamp-1 mt-1">{order.product}</p>
                         </td>
                         <td className="px-8 py-6">
                            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider
                               ${order.status === 'DELIVERED' ? 'bg-emerald-100 text-emerald-700' : 
                                 order.status === 'SHIPPED' ? 'bg-blue-100 text-blue-700' : 
                                 order.status === 'CANCELLED' ? 'bg-red-100 text-red-700' : 
                                 'bg-amber-100 text-amber-700'}
                            `}>
                               {order.status}
                            </span>
                         </td>
                         <td className="px-8 py-6 text-right">
                            <span className="text-[15px] font-black text-[#022c22] tracking-tighter">{order.amount}</span>
                         </td>
                      </tr>
                   ))}
                   {recentOrders.length === 0 && (
                      <tr>
                         <td colSpan={4} className="px-8 py-12 text-center">
                            <ShoppingBag className="mx-auto h-8 w-8 text-slate-300 mb-2" />
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No active conversions yet.</p>
                         </td>
                      </tr>
                   )}
                </tbody>
             </table>
          </div>
        </div>

        {/* Top Products - Small Column */}
        <div className="bg-[#022c22] rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden flex flex-col">
            <div className="absolute top-0 right-0 h-64 w-64 bg-emerald-800/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
            
            <div className="relative z-10 flex flex-col h-full">
              <h3 className="text-lg font-black tracking-tighter mb-8">Master Catalog</h3>
              <div className="space-y-8 flex-1">
                 {topProducts.map((product: any, i: number) => (
                    <div key={i} className="flex items-center gap-4 group cursor-pointer">
                       <div className="h-14 w-14 rounded-2xl bg-white/5 border border-white/10 overflow-hidden shrink-0 group-hover:scale-110 transition-all">
                          <img src={product.image} className="h-full w-full object-cover" alt="" />
                       </div>
                       <div className="flex flex-col gap-1">
                          <span className="text-[13px] font-black tracking-tight">{product.name}</span>
                          <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">{product.sales} sold this month</span>
                       </div>
                    </div>
                 ))}
                 {topProducts.length === 0 && (
                    <p className="text-[10px] font-black uppercase tracking-widest text-white/30 text-center py-20">No catalog data available.</p>
                 )}
              </div>

              <button className="mt-12 h-14 w-full rounded-2xl bg-amber-400 text-[#022c22] text-[11px] font-black uppercase tracking-widest shadow-xl shadow-amber-400/20 active:scale-95 transition-all">
                  Manage Intelligence
              </button>
            </div>
        </div>

      </div>

    </div>
  );
}
