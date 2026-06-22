'use client';

import { useState, useEffect } from 'react';
import {
  BarChart3, TrendingUp, ShoppingBag, Users,
  ArrowUpRight, ArrowDownRight, Calendar, Filter,
  Loader2, RefreshCcw
} from 'lucide-react';
import { API_URL } from '@/lib/api';

interface Stats {
  revenue: number;
  orders: number;
  customers: number;
  avgOrderValue: number;
  recentOrders: any[];
}

export default function AdminAnalyticsPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/api/admin/analytics`)
      .then(r => r.json())
      .then(data => {
        // Adapt response to interface if needed
        if (data.stats) {
          const rev = parseInt(data.stats[0]?.value.replace(/[^0-9]/g, '')) || 0;
          const ord = parseInt(data.stats[1]?.value) || 0;
          const cust = parseInt(data.stats[2]?.value) || 0;
          const avg = parseInt(data.stats[3]?.value.replace(/[^0-9]/g, '')) || 0;
          setStats({
            revenue: rev,
            orders: ord,
            customers: cust,
            avgOrderValue: avg,
            recentOrders: data.recentOrders || []
          });
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="min-h-[50vh] flex items-center justify-center"><Loader2 className="h-12 w-12 animate-spin text-slate-200" /></div>;
  }

  const statCards = [
    { label: 'Total Revenue', value: `₹${stats?.revenue.toLocaleString()}`, change: '+12.5%', isUp: true, icon: TrendingUp, color: 'text-emerald-500', bg: 'bg-emerald-50' },
    { label: 'Total Orders', value: stats?.orders, change: '+5.4%', isUp: true, icon: ShoppingBag, color: 'text-blue-500', bg: 'bg-blue-50' },
    { label: 'Total Customers', value: stats?.customers, change: '+2.1%', isUp: true, icon: Users, color: 'text-amber-500', bg: 'bg-amber-50' },
    { label: 'Avg Order Value', value: `₹${Math.round(stats?.avgOrderValue || 0).toLocaleString()}`, change: '-0.4%', isUp: false, icon: BarChart3, color: 'text-purple-500', bg: 'bg-purple-50' },
  ];

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-5 duration-1000">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tighter italic">Business <span className="text-emerald-600">Analytics</span></h1>
          <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px] mt-2">Real-time performance metrics for namma ooru ecosystem.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="h-14 px-6 rounded-2xl border-2 border-slate-100 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:bg-slate-50 transition-all">
            <Calendar size={16} /> Last 30 Days
          </button>
          <button onClick={() => window.location.reload()} className="h-14 w-14 rounded-2xl bg-[var(--admin-sidebar)] text-white flex items-center justify-center hover:bg-slate-900 transition-all shadow-xl">
            <RefreshCcw size={20} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map(card => (
          <div key={card.label} className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm hover:shadow-xl hover:shadow-slate-200/40 transition-all">
            <div className="flex items-start justify-between mb-8">
              <div className={`h-14 w-14 rounded-2xl ${card.bg} ${card.color} flex items-center justify-center shadow-inner`}>
                <card.icon size={24} />
              </div>
              <div className={`flex items-center gap-1 font-black text-[10px] px-2 py-1 rounded-lg ${card.isUp ? 'text-emerald-600 bg-emerald-50' : 'text-red-500 bg-red-50'}`}>
                {card.isUp ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                {card.change}
              </div>
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{card.label}</p>
            <h3 className="text-2xl font-black text-[var(--admin-sidebar)] tracking-tight">{card.value}</h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-[3.5rem] border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-slate-50 flex items-center justify-between">
            <h3 className="text-sm font-black text-[var(--admin-sidebar)] uppercase tracking-widest">Revenue Growth</h3>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-blue-500" />
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Current</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-slate-200" />
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Previous</span>
              </div>
            </div>
          </div>
          <div className="h-[350px] w-full flex items-center justify-center p-10">
            <div className="flex items-end justify-between w-full h-full gap-4">
              {[40, 60, 45, 90, 65, 80, 50, 70, 85, 40].map((h, i) => (
                <div key={i} className="flex-1 space-y-2">
                  <div className="bg-slate-50 rounded-lg w-full h-full relative overflow-hidden group">
                    <div
                      className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-blue-600 to-blue-400 rounded-lg transition-all duration-1000 group-hover:from-amber-500 group-hover:to-amber-400"
                      style={{ height: `${h}%` }}
                    />
                  </div>
                  <div className="text-[8px] font-black text-center text-slate-300 uppercase tracking-tighter">Day {i + 1}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-[var(--admin-sidebar)] rounded-[3.5rem] p-8 text-white relative overflow-hidden shadow-2xl">
          <div className="relative z-10">
            <h3 className="text-sm font-black uppercase tracking-widest mb-8 text-white/40">Performance Snapshot</h3>
            <div className="space-y-8">
              {[
                { label: 'Order Completion', value: 94 },
                { label: 'Customer Retention', value: 78 },
                { label: 'Coupon Utilization', value: 42 }
              ].map(item => (
                <div key={item.label} className="space-y-4">
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                    <span>{item.label}</span>
                    <span className="text-[var(--admin-accent)]">{item.value}%</span>
                  </div>
                  <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-[var(--admin-accent)] rounded-full transition-all duration-1000" style={{ width: `${item.value}%` }} />
                  </div>
                </div>
              ))}
            </div>
            <button className="mt-12 w-full h-16 rounded-2xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all">
              Generate Reports
            </button>
          </div>
          <div className="absolute -bottom-20 -right-20 h-64 w-64 bg-[var(--admin-accent)] blur-[120px] opacity-20" />
        </div>
      </div>
    </div>
  );
}
