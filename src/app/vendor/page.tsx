'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { 
  ShoppingBag, 
  Package, 
  TrendingUp, 
  Clock, 
  ChevronRight,
  Plus,
  ArrowUpRight
} from 'lucide-react';
import { motion, Variants } from 'framer-motion';
import { DashboardStatsSkeleton } from '@/components/ui/Skeletons';
import { SalesPerformanceChart, CategoryPieChart } from '@/components/vendor/AnalyticsCharts';
import useSWR from 'swr';
import Link from 'next/link';
import { API_URL } from '@/lib/api';

const fetcher = (url: string) => fetch(url).then(res => res.json());

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 100
    }
  }
};

export default function VendorDashboard() {
  const { user } = useAuth();
  
  // Real Data Integration via SWR
  const { data: products, isLoading: isLoadingProducts } = useSWR(user?.brandId ? `${API_URL}/api/products?brandId=${user.brandId}` : null, fetcher);
  const { data: orders, isLoading: isLoadingOrders } = useSWR<any[]>(user?.brandId ? `${API_URL}/api/orders/vendor?brandId=${user.brandId}` : null, fetcher);

  const stats = {
    products: products?.length || 0,
    orders: orders?.length || 0,
    revenue: orders?.reduce((acc: any, curr: any) => acc + Number(curr.totalAmount || 0), 0) || 0,
    pending: orders?.filter((o: any) => o.status === 'PENDING').length || 0
  };

  const loading = user?.brandId ? (isLoadingProducts || isLoadingOrders) : false;

  if (loading) return (
     <div className="space-y-10">
        <div className="h-10 w-64 bg-slate-100 rounded-lg animate-pulse" />
        <DashboardStatsSkeleton />
        <div className="h-96 bg-white rounded-[3rem] border border-slate-100 animate-pulse" />
     </div>
  );

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-10"
    >
       {/* Welcome Banner */}
       <motion.div variants={itemVariants} className="flex flex-col gap-1">
          <h1 className="text-4xl font-black text-emerald-950 tracking-tighter uppercase">Market Overview</h1>
          <p className="text-slate-400 font-bold text-[11px] uppercase tracking-widest leading-relaxed">
             Hello, <span className="text-emerald-900 font-black">{user?.name}</span>. Your store activity is looking healthy today.
          </p>
       </motion.div>

       {/* Stats Grid */}
       <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
             { label: 'Active Inventory', value: stats.products, icon: Package, color: 'emerald' as const, trend: 'Updated Live' },
             { label: 'Platform Revenue', value: `₹${stats.revenue.toLocaleString()}`, icon: TrendingUp, color: 'amber' as const, trend: 'Gross Earnings' },
             { label: 'Total Orders', value: stats.orders, icon: ShoppingBag, color: 'blue' as const, trend: `${stats.pending} pending action` }
          ].map((stat, idx) => (
             <motion.div 
                key={idx}
                variants={itemVariants}
                whileHover={{ y: -5, scale: 1.02 }}
                className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm hover:shadow-xl hover:shadow-emerald-900/5 transition-all group overflow-hidden relative"
             >
                <div className={`absolute top-0 right-0 w-32 h-32 bg-${stat.color}-50 rounded-full translate-x-16 -translate-y-16 group-hover:scale-150 transition-transform duration-700`} />
                
                <div className="relative z-10 space-y-4">
                   <div className={`h-12 w-12 rounded-2xl bg-${stat.color}-100 flex items-center justify-center text-${stat.color}-600`}>
                      <stat.icon size={24} />
                   </div>
                   <div>
                      <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{stat.label}</div>
                      <div className="text-3xl font-black text-emerald-950">{stat.value}</div>
                      <div className={`text-[9px] font-black uppercase tracking-widest text-${stat.color}-600 mt-2`}>{stat.trend}</div>
                   </div>
                </div>
             </motion.div>
          ))}
       </div>

       {/* Analytics Hub */}
       <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <motion.div variants={itemVariants} className="lg:col-span-2 bg-white rounded-[3rem] border border-slate-100 p-10 space-y-8 relative overflow-hidden shadow-sm">
             <div className="flex items-center justify-between">
                <div>
                   <h3 className="text-xl font-black text-emerald-950 tracking-tight">Sales Trajectory</h3>
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Weekly performance trend</p>
                </div>
                <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-xl font-black text-[10px]">
                   <TrendingUp size={14} /> +18.4%
                </div>
             </div>
             <SalesPerformanceChart />
          </motion.div>

          <motion.div variants={itemVariants} className="bg-white rounded-[3rem] border border-slate-100 p-10 space-y-8 relative overflow-hidden shadow-sm flex flex-col items-center">
             <h3 className="text-xl font-black text-emerald-950 tracking-tight">Harvest Split</h3>
             <CategoryPieChart />
          </motion.div>
       </div>

       {/* Fulfillment & Growth */}
       <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <motion.div variants={itemVariants} className="lg:col-span-3 bg-white rounded-[3rem] border border-slate-100 p-10 space-y-8 relative overflow-hidden shadow-sm">
             <div className="flex items-center justify-between relative z-10">
                <h3 className="text-xl font-black text-emerald-950 tracking-tight">Rapid Fulfillment Queue</h3>
                <Link href="/vendor/orders" className="text-[10px] font-black uppercase tracking-widest text-emerald-600 hover:text-emerald-800 flex items-center gap-2">
                   Open Desk <ArrowUpRight size={14} />
                </Link>
             </div>
             
             <div className="space-y-6 relative z-10">
                {orders && orders.length > 0 ? orders.slice(0, 5).map((order, i) => (
                   <div key={order.id} className="flex items-center gap-6 p-4 rounded-2xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                      <div className="h-14 w-14 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 font-bold text-lg">#{order.id}</div>
                      <div className="flex-1">
                         <div className="text-[13px] font-black text-emerald-950 line-clamp-1">
                            {order.items.map((item: any) => item.productName).join(', ')}
                         </div>
                         <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Order for {order.user.name}</div>
                      </div>
                      <div className="text-right">
                         <div className="text-sm font-black text-emerald-950">₹{Number(order.totalAmount).toLocaleString()}</div>
                         <div className="flex items-center justify-end gap-1.5 mt-1">
                            <Clock size={10} className="text-amber-500" />
                            <span className="text-[9px] font-black text-amber-500 uppercase tracking-widest">{order.status}</span>
                         </div>
                      </div>
                   </div>
                )) : (
                   <div className="py-20 flex flex-col items-center justify-center text-center opacity-40">
                      <ShoppingBag size={48} className="text-slate-200 mb-4" />
                      <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">No orders in queue</p>
                   </div>
                )}
             </div>
          </motion.div>

          <motion.div variants={itemVariants} className="lg:col-span-2 bg-emerald-950 rounded-[3rem] p-10 text-white relative overflow-hidden group shadow-2xl">
             <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-900 rounded-full translate-x-20 -translate-y-20 blur-3xl opacity-50 group-hover:scale-110 transition-transform duration-1000" />
             
             <div className="relative z-10 space-y-8 h-full flex flex-col justify-between">
                <div className="space-y-2">
                   <div className="h-10 w-10 rounded-xl bg-amber-400 flex items-center justify-center text-emerald-950">
                      <TrendingUp size={20} />
                   </div>
                   <h3 className="text-2xl font-black tracking-tight mt-6 leading-tight">Partner Growth Program</h3>
                   <p className="text-[11px] font-bold text-emerald-200 uppercase tracking-widest leading-relaxed mt-4">
                      Add 5 more niche harvests to unlock "Featured Store" status on our homepage.
                   </p>
                </div>
                <button className="w-full h-14 rounded-2xl bg-amber-400 text-emerald-950 font-black text-[11px] uppercase tracking-[0.2em] hover:bg-white transition-all active:scale-95 shadow-lg shadow-amber-400/20">
                   Analyze Metrics
                </button>
             </div>
          </motion.div>
       </div>
    </motion.div>
  );
}
