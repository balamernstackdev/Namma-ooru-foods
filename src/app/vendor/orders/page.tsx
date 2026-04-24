'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import useSWR from 'swr';
import { 
  ShoppingBag, 
  User, 
  Calendar, 
  ChevronRight, 
  Package, 
  Clock, 
  CheckCircle,
  MoreVertical,
  Search,
  Filter
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { TableRowSkeleton } from '@/components/ui/Skeletons';
import { API_URL } from '@/lib/api';

const fetcher = (url: string) => fetch(url).then(res => res.json());

interface VendorOrder {
  id: number;
  status: string;
  totalAmount: number;
  createdAt: string;
  user: { name: string, email: string };
  items: {
    id: number;
    productId: number;
    productName: string;
    quantity: number;
    price: number;
  }[];
}

export default function VendorOrders() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  
  const { data: orders, error, mutate } = useSWR<VendorOrder[]>(
    user?.brandId ? `${API_URL}/api/orders/vendor?brandId=${user.brandId}` : null,
    fetcher
  );

  const filteredOrders = orders?.filter(o => 
    o.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.items.some(i => i.productName.toLowerCase().includes(searchTerm.toLowerCase()))
  ) || [];

  const loading = user?.brandId ? (!orders && !error) : false;

  return (
    <div className="space-y-10">
       <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="space-y-1">
             <h2 className="text-4xl font-black text-emerald-950 dark:text-white tracking-tighter uppercase">Fulfillment Desk</h2>
             <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest leading-relaxed">
                Managing order resolution for <span className="text-emerald-900 dark:text-emerald-400">Namma Reseller Store</span>
             </p>
          </div>
          <div className="flex items-center gap-4">
             <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl px-6 py-4 flex items-center gap-4">
                <div className="h-10 w-10 rounded-xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center text-amber-600">
                   <ShoppingBag size={20} />
                </div>
                <div>
                   <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Pending Shipments</div>
                   <div className="text-lg font-black text-emerald-950 dark:text-white">{filteredOrders.filter(o => o.status === 'PENDING').length}</div>
                </div>
             </div>
          </div>
       </div>

       <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
             <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
             <input 
                type="text" 
                placeholder="Search by customer name or product title..."
                className="w-full h-16 pl-16 pr-6 rounded-[1.5rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 focus:border-emerald-100 transition-all outline-none font-bold text-emerald-950 dark:text-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
             />
          </div>
          <button className="h-16 px-8 rounded-[1.5rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-emerald-950 dark:text-white text-[11px] font-black uppercase tracking-widest flex items-center gap-3">
             <Filter size={18} />
             Filter Desk
          </button>
       </div>

       <div className="grid grid-cols-1 gap-6">
          {loading ? (
             [1, 2, 3].map(i => <div key={i} className="h-32 bg-white rounded-3xl animate-pulse" />)
          ) : filteredOrders.map((order) => (
             <motion.div 
               key={order.id}
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 p-8 shadow-sm hover:shadow-xl transition-all group overflow-hidden relative"
             >
                <div className="flex flex-col lg:flex-row items-center gap-10">
                   {/* Order Identity */}
                   <div className="flex items-center gap-6 lg:w-1/4">
                      <div className="h-20 w-20 rounded-2xl bg-slate-50 dark:bg-slate-800 flex flex-col items-center justify-center border border-slate-100 dark:border-slate-800">
                         <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Order</span>
                         <span className="text-xl font-black text-emerald-950 dark:text-white">#{order.id}</span>
                      </div>
                      <div className="flex flex-col">
                         <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Customer</span>
                         <h4 className="text-[15px] font-black text-emerald-950 dark:text-white">{order.user.name}</h4>
                         <p className="text-[10px] font-bold text-slate-400 truncate max-w-[150px]">{order.user.email}</p>
                      </div>
                   </div>

                   {/* Order Payload */}
                   <div className="flex-1 flex flex-col gap-4">
                      <div className="text-[9px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-[0.3em]">Payload Integration</div>
                      <div className="flex flex-wrap gap-3">
                         {order.items.map(item => (
                            <div key={item.id} className="flex items-center gap-3 bg-emerald-50 dark:bg-emerald-900/10 px-4 py-2 rounded-xl border border-emerald-100 dark:border-emerald-800">
                               <Package size={14} className="text-emerald-600" />
                               <span className="text-[11px] font-black text-emerald-950 dark:text-emerald-100">{item.productName} × {item.quantity}</span>
                            </div>
                         ))}
                      </div>
                   </div>

                   {/* Logistics Status */}
                   <div className="flex flex-col items-end gap-3 lg:w-1/5">
                      <div className="flex items-center gap-2">
                         <Clock size={12} className="text-amber-500" />
                         <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest">{order.status}</span>
                      </div>
                      <div className="text-xl font-black text-emerald-950 dark:text-white tracking-tighter">₹{order.totalAmount}</div>
                   </div>

                   {/* Interaction Suite */}
                   <div className="flex items-center gap-3 pl-8 border-l border-slate-50 dark:border-slate-800">
                      <button className="h-14 w-14 rounded-2xl bg-emerald-950 text-white flex items-center justify-center hover:bg-emerald-800 transition-all shadow-xl shadow-emerald-900/20">
                         <CheckCircle size={20} />
                      </button>
                      <button className="h-14 w-14 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-800 text-slate-400 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
                         <MoreVertical size={20} />
                      </button>
                   </div>
                </div>

                {/* Staggered Deco */}
                <div className="absolute top-0 right-0 w-32 h-full bg-slate-50/50 dark:bg-slate-800/10 -skew-x-12 translate-x-20 pointer-events-none" />
             </motion.div>
          ))}
          {!loading && filteredOrders.length === 0 && (
             <div className="py-20 flex flex-col items-center justify-center text-center space-y-4">
                <div className="h-20 w-20 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-300">
                   <ShoppingBag size={40} />
                </div>
                <h3 className="text-xl font-black text-emerald-950 dark:text-white uppercase tracking-tighter">No Active Fulfillment Required</h3>
                <p className="text-slate-400 max-w-xs text-sm font-medium">Your harvest is balanced. Check back soon for new customer integrations.</p>
             </div>
          )}
       </div>
    </div>
  );
}
