'use client';

import { Search, Filter, ShoppingBag, Truck, CheckCircle2, XCircle, Clock, ChevronDown } from 'lucide-react';
import useSWR from 'swr';
import { API_URL } from '@/lib/api';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function AdminOrders() {
  const { data, error } = useSWR(`${API_URL}/api/admin/orders`, fetcher);

  const { orders = [], statusCounts = [] } = data || {};

  const getStatusCount = (status: string) => {
    return statusCounts.find((s: any) => s.status === status)?._count || 0;
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
           <h2 className="text-3xl font-black text-[#022c22] tracking-tighter">Order Management</h2>
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
              />
           </div>
        </div>

        <div className="overflow-x-auto">
           <table className="w-full text-left border-collapse">
              <thead>
                 <tr className="bg-slate-50/50">
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Order & Date</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Customer</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Payment</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Status</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-right">Total</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                 {orders.map((order: any) => (
                    <tr key={order.id} className="group hover:bg-slate-50/50 transition-all cursor-pointer">
                       <td className="px-8 py-6">
                          <span className="text-sm font-black text-[#022c22] flex items-center gap-2">
                             #ORD-{order.id.toString().padStart(4, '0')}
                             <ChevronDown size={14} className="text-slate-300 transition-opacity" />
                          </span>
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1 block">
                            {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                          </span>
                       </td>
                       <td className="px-8 py-6">
                          <div className="flex flex-col">
                             <span className="text-sm font-bold text-slate-700">{order.user?.name}</span>
                             <span className="text-[10px] text-slate-400 font-medium lowercase">{order.user?.email}</span>
                          </div>
                       </td>
                       <td className="px-8 py-6">
                          <div className="flex flex-col">
                             <span className="text-[11px] font-black uppercase tracking-widest text-slate-400">PREPAID</span>
                             <span className="text-[10px] text-slate-400 font-medium">{order.items?.length} Items</span>
                          </div>
                       </td>
                       <td className="px-8 py-6">
                          <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider
                             ${order.status === 'DELIVERED' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 
                               order.status === 'SHIPPED' ? 'bg-blue-100 text-blue-700 border border-blue-200' : 
                               order.status === 'CANCELLED' ? 'bg-red-100 text-red-700 border border-red-200' : 
                               'bg-amber-100 text-amber-700 border border-amber-200'}
                          `}>
                             {order.status}
                          </span>
                       </td>
                       <td className="px-8 py-6 text-right">
                          <span className="text-base font-black text-[#022c22] tracking-tighter">₹{Number(order.totalAmount).toLocaleString()}</span>
                       </td>
                    </tr>
                 ))}
                 {orders.length === 0 && (
                    <tr>
                       <td colSpan={5} className="px-8 py-20 text-center">
                          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-300">No transactions recorded yet.</p>
                       </td>
                    </tr>
                 )}
              </tbody>
           </table>
        </div>
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
