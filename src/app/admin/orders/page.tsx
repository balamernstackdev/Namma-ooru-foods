'use client';

import React from 'react';
import { Search, Truck, CheckCircle2, XCircle, Clock, ChevronDown, Package, Store, Trash2 } from 'lucide-react';
import useSWR from 'swr';
import { API_URL } from '@/lib/api';
import { useState } from 'react';
import AdminPagination from '@/components/admin/AdminPagination';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function AdminOrders() {
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState('');
  const { data, error, mutate } = useSWR(`${API_URL}/api/admin/orders?page=${currentPage}&limit=10&search=${search}`, fetcher);
  const [expandedOrder, setExpandedOrder] = useState<number | null>(null);

  const { orders = [], statusCounts = {}, totalPages = 1 } = data || {};

  const getStatusCount = (status: string) => {
    if (status === 'PENDING') {
      return (statusCounts['PENDING'] || 0) + (statusCounts['PROCESSING'] || 0);
    }
    return statusCounts[status] || 0;
  };

  const getOrderVendors = (order: any) => {
    const vendorMap = new Map();
    let hasOfficial = false;
    order.items?.forEach((item: any) => {
      const brand = item.product?.brand;
      if (brand && brand.userId) vendorMap.set(brand.id, brand);
      else hasOfficial = true;
    });
    return { resellers: Array.from(vendorMap.values()), hasOfficial };
  };

  if (!data && !error) {
     return (
        <div className="w-full h-[60vh] flex flex-col items-center justify-center bg-white gap-6">
           <div className="h-14 w-14 border-4 border-emerald-950 border-t-amber-400 rounded-full animate-spin" />
           <p className="text-[10px] font-black uppercase tracking-widest text-[#022c22]">Processing Global Orders...</p>
        </div>
     );
  }

  return (
    <div className="space-y-8">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
           <h2 className="text-4xl font-black text-[#022c22] tracking-tighter uppercase">ORDER MANAGEMENT</h2>
           <p className="text-slate-400 font-medium text-sm">Review and fulfill customer requests.</p>
        </div>
        <div className="flex items-center gap-3">
           <button className="h-14 px-8 rounded-2xl bg-white border border-slate-200 text-[#022c22] text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-slate-50 transition-all shadow-sm">
              Export CSV
           </button>
           <button className="h-14 px-8 rounded-2xl bg-[#022c22] text-white text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-emerald-900 transition-all shadow-xl shadow-emerald-900/10 active:scale-95">
              Bulk Actions
           </button>
        </div>
      </div>

      {/* Stats Summary - Mini */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
         <OrderStat icon={Clock} label="Pending" count={getStatusCount('PENDING').toString()} color="amber" />
         <OrderStat icon={Truck} label="In Transit" count={getStatusCount('SHIPPED').toString()} color="blue" />
         <OrderStat icon={CheckCircle2} label="Fulfilled" count={getStatusCount('DELIVERED').toString()} color="emerald" />
         <OrderStat icon={XCircle} label="Cancelled" count={getStatusCount('CANCELLED').toString()} color="red" />
      </div>

      {/* Orders List */}
      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-50">
           <div className="flex items-center gap-4 bg-slate-50 border border-slate-100 px-6 py-3 rounded-xl">
              <Search size={18} className="text-slate-300" />
              <input 
                type="text" 
                placeholder="Find orders by ID, user or email..." 
                className="bg-transparent border-none outline-none text-sm font-bold text-[#022c22] placeholder:text-slate-300 w-full"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
           </div>
        </div>

        <div className="overflow-x-auto">
           <table className="w-full text-left border-collapse">
              <thead>
                 <tr className="bg-slate-50/50">
                    <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Order & Date</th>
                    <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Customer</th>
                    <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Vendor(s)</th>
                    <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Items</th>
                    <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Status</th>
                    <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-right">Total</th>
                    <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-right">Actions</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                 {orders.map((order: any) => {
                   const { resellers, hasOfficial } = getOrderVendors(order);
                   return (
                     <React.Fragment key={order.id}> 
                      <tr 
                        className="group hover:bg-slate-50/50 transition-all cursor-pointer"
                        onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                      >
                        <td className="px-6 py-6">
                           <span className="text-sm font-black text-[#022c22] flex items-center gap-2">
                              #ORD-{order.id.toString().padStart(4, '0')}
                              <ChevronDown size={14} className={`text-slate-300 transition-transform ${expandedOrder === order.id ? 'rotate-180' : ''}`} />
                           </span>
                           <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1 block">
                             {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                           </span>
                        </td>
                        <td className="px-6 py-6">
                           <div className="flex flex-col">
                              <span className="text-sm font-bold text-slate-700">{order.user?.name}</span>
                              <span className="text-[10px] text-slate-400 font-medium lowercase">{order.user?.email}</span>
                           </div>
                        </td>
                        <td className="px-6 py-6">
                           <div className="flex flex-col gap-1.5">
                              {/* Official Brand if present */}
                              {hasOfficial && (
                                <div className="flex items-center gap-2">
                                  <div className="h-7 w-7 rounded-lg bg-emerald-950 flex items-center justify-center shadow-inner">
                                    <div className="h-4 w-4 bg-amber-400 rounded-sm" />
                                  </div>
                                  <span className="text-[11px] font-black text-emerald-950 uppercase tracking-tight">Originals</span>
                                </div>
                              )}
                              {/* Resellers */}
                              {resellers.map((vendor: any) => (
                                <div key={vendor.id} className="flex items-center gap-2">
                                  <div className="h-7 w-7 rounded-lg bg-white border border-slate-100 flex items-center justify-center shadow-sm">
                                    {vendor.logo ? (
                                      <img src={vendor.logo} alt={vendor.name} className="h-4 w-4 rounded object-cover" />
                                    ) : (
                                      <Store size={12} className="text-emerald-600" />
                                    )}
                                  </div>
                                  <span className="text-[11px] font-bold text-slate-600 truncate max-w-[120px]">{vendor.name}</span>
                                </div>
                              ))}
                              {resellers.length === 0 && !hasOfficial && (
                                <span className="text-[10px] text-slate-300 font-bold uppercase tracking-widest">No Vendor</span>
                              )}
                           </div>
                        </td>
                        <td className="px-6 py-6">
                           <div className="flex items-center gap-2">
                             <Package size={14} className="text-slate-300" />
                             <span className="text-[11px] font-black uppercase tracking-widest text-slate-400">{order.items?.length} Items</span>
                           </div>
                        </td>
                        <td className="px-6 py-6">
                           <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider
                              ${order.status === 'DELIVERED' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 
                                order.status === 'SHIPPED' ? 'bg-blue-100 text-blue-700 border border-blue-200' : 
                                order.status === 'CANCELLED' ? 'bg-red-100 text-red-700 border border-red-200' : 
                                'bg-amber-100 text-amber-700 border border-amber-200'}
                           `}>
                              {order.status}
                           </span>
                        </td>
                        <td className="px-6 py-6 text-right">
                           <span className="text-base font-black text-[#022c22] tracking-tighter">₹{Number(order.totalAmount).toLocaleString()}</span>
                        </td>
                        <td className="px-6 py-6 text-right" onClick={(e) => e.stopPropagation()}>
                           <button 
                             onClick={async () => {
                               if (confirm('Permanently purge this order from the historical database? This cannot be undone.')) {
                                 const res = await fetch(`${API_URL}/api/admin/orders/${order.id}`, { method: 'DELETE' });
                                 if (res.ok) mutate();
                               }
                             }}
                             className="h-10 w-10 rounded-xl bg-slate-50 text-red-300 hover:bg-red-500 hover:text-white transition-all shadow-sm flex items-center justify-center"
                           >
                              <Trash2 size={16} />
                           </button>
                        </td>
                      </tr>

                      {/* Expanded order items detail */}
                      {expandedOrder === order.id && (
                        <tr key={`${order.id}-detail`}>
                          <td colSpan={6} className="p-8 bg-slate-50/50">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                              {/* Group items by vendor */}
                              {(() => {
                                const groups: any = {};
                                order.items.forEach((item: any) => {
                                  const vName = item.product?.brand?.name || 'Namma Orru Originals';
                                  if (!groups[vName]) groups[vName] = [];
                                  groups[vName].push(item);
                                });
                                
                                return Object.keys(groups).map(vendorName => (
                                  <div key={vendorName} className="space-y-4">
                                    <div className="flex items-center gap-2 mb-4">
                                      <div className="h-5 w-1 bg-emerald-500 rounded-full" />
                                      <span className="text-[11px] font-black text-emerald-950 uppercase tracking-[0.2em]">{vendorName}</span>
                                      <span className="text-[9px] font-bold text-slate-400 bg-white px-2 py-0.5 rounded-full border border-slate-100">{groups[vendorName].length} items</span>
                                    </div>
                                    <div className="space-y-3">
                                      {groups[vendorName].map((item: any) => (
                                        <div key={item.id} className="flex items-center gap-4 bg-white rounded-2xl p-4 border border-slate-100 shadow-sm transition-all hover:shadow-md">
                                          <div className="h-14 w-14 rounded-xl overflow-hidden shrink-0 bg-slate-50 border border-slate-50">
                                            <img src={item.product?.image} className="h-full w-full object-cover" alt="" />
                                          </div>
                                          <div className="flex-1 min-w-0">
                                            <p className="text-[13px] font-black text-[#022c22] truncate">{item.product?.name}</p>
                                            <div className="flex items-center gap-4 mt-1">
                                              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Qty: {item.quantity}</span>
                                              <span className="text-[12px] font-black text-emerald-600 tracking-tighter">₹{Number(item.price * item.quantity).toLocaleString()}</span>
                                            </div>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                ));
                              })()}
                            </div>
                          </td>
                        </tr>
                      )}
                     </React.Fragment>
                   );
                 })}
                 {orders.length === 0 && (
                    <tr>
                       <td colSpan={6} className="px-8 py-20 text-center">
                          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-300">No transactions recorded yet.</p>
                       </td>
                    </tr>
                 )}
              </tbody>
           </table>
        </div>
        <AdminPagination 
           currentPage={currentPage}
           totalPages={totalPages}
           onPageChange={setCurrentPage}
        />
      </div>
    </div>
  );
}

function OrderStat({ icon: Icon, label, count, color }: any) {
  const colors: any = {
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    red: 'bg-red-50 text-red-600 border-red-100',
  };
  
  return (
    <div className={`p-6 rounded-2xl border flex items-center gap-5 bg-white shadow-sm`}>
       <div className={`h-14 w-14 rounded-2xl flex items-center justify-center ${colors[color]} border shadow-inner`}>
          <Icon size={24} strokeWidth={2.5} />
       </div>
       <div className="flex flex-col">
          <span className="text-[11px] font-black uppercase tracking-widest text-slate-400">{label}</span>
          <span className="text-2xl font-black text-[#022c22] tracking-tighter">{count}</span>
       </div>
    </div>
  );
}
