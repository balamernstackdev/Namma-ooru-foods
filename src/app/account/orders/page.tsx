'use client';

import React, { useState, useEffect } from 'react';
import { Package, ChevronDown, ChevronUp, Star, RotateCcw, ChevronLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { API_URL } from '@/lib/api';

export default function OrdersPage() {
  const [expanded, setExpanded] = useState<string | null>(null);
  const { user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user?.id) return;
      try {
        const res = await fetch(`${API_URL}/api/orders/user/${user.id}`);
        const data = await res.json();
        setOrders(data);
      } catch (err) {
        console.error('Error fetching orders:', err);
      } finally {
        setLoading(false);
      }
    };
    
    if (user) {
      fetchOrders();
    } else {
      setLoading(false);
    }
  }, [user]);

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'delivered': return 'bg-emerald-100 text-emerald-700';
      case 'cancelled': return 'bg-red-100 text-red-600';
      case 'in transit': return 'bg-blue-100 text-blue-700';
      case 'pending': return 'bg-amber-100 text-amber-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  if (loading) {
     return (
        <div className="flex justify-center items-center h-64">
           <Loader2 className="animate-spin text-emerald-600 h-8 w-8" />
        </div>
     );
  }

  return (
    <div className="py-2 px-0 md:px-4">
      <div className="max-w-4xl">

        {/* Mobile Back Button */}
        <Link href="/account" className="md:hidden flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-emerald-600 mb-6 bg-emerald-50 w-fit px-4 py-2 rounded-full">
          <ChevronLeft className="h-4 w-4" /> Back to Account
        </Link>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black text-emerald-950 tracking-tighter">My Orders</h1>
            <p className="text-[12px] text-slate-400 font-medium mt-1">{orders.length} orders placed</p>
          </div>
          <div className="h-14 w-14 rounded-2xl bg-emerald-50 flex items-center justify-center">
            <Package className="h-6 w-6 text-emerald-700" />
          </div>
        </div>

        {orders.length === 0 ? (
           <div className="bg-white rounded-[1.5rem] border border-slate-100 p-10 text-center shadow-sm">
              <Package className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-black text-emerald-950 mb-2">No Orders Yet</h3>
              <p className="text-slate-500 text-sm mb-6">Looks like you haven't placed an order yet.</p>
              <Link href="/" className="px-6 py-3 bg-emerald-600 text-white font-bold rounded-xl text-sm inline-block hover:bg-emerald-700 transition-colors">Start Shopping</Link>
           </div>
        ) : (
           <div className="flex flex-col gap-4">
             {orders.map(order => (
               <div key={order.id} className="bg-white rounded-[1.5rem] border border-slate-100 shadow-sm overflow-hidden">
                 {/* Order Header */}
                 <button
                   className="w-full flex items-center justify-between p-5 hover:bg-slate-50 transition-colors"
                   onClick={() => setExpanded(expanded === order.id ? null : order.id)}
                 >
                   <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 text-left">
                     <div>
                       <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Order ID</p>
                       <p className="text-[13px] font-black text-emerald-950">#{order.id}</p>
                     </div>
                     <div>
                       <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Date</p>
                       <p className="text-[13px] font-bold text-emerald-950">{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                     </div>
                     <div>
                       <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Total</p>
                       <p className="text-[13px] font-black text-emerald-950">₹{order.totalAmount}</p>
                     </div>
                     <div className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full ${getStatusColor(order.status)}`}>
                       {order.status || 'Pending'}
                     </div>
                   </div>
                   <div className="shrink-0 ml-4">
                     {expanded === order.id ? <ChevronUp className="h-5 w-5 text-slate-400" /> : <ChevronDown className="h-5 w-5 text-slate-400" />}
                   </div>
                 </button>
   
                 {/* Order Items */}
                 {expanded === order.id && (
                   <div className="border-t border-slate-100 px-5 py-4">
                     <div className="flex flex-col gap-3 mb-4">
                       {(order.orderItems || []).map((item: any, idx: number) => (
                         <div key={idx} className="flex items-center gap-4">
                           <div className="h-14 w-14 rounded-xl overflow-hidden shrink-0 border border-slate-100 bg-slate-50 flex items-center justify-center">
                             {item.product?.images?.[0] ? (
                                <img src={item.product.images[0]} alt={item.product?.name || item.name} className="h-full w-full object-cover" />
                             ) : (
                                <Package className="h-6 w-6 text-slate-300" />
                             )}
                           </div>
                           <div className="flex-1 min-w-0">
                             <p className="text-[13px] font-black text-emerald-950 truncate">{item.product?.name || item.name}</p>
                             <p className="text-[10px] text-slate-400 font-medium">{item.variant || 'Standard'} × {item.quantity}</p>
                           </div>
                           <p className="text-[13px] font-black text-emerald-950 shrink-0">₹{item.price * item.quantity}</p>
                         </div>
                       ))}
                     </div>
                     <div className="flex flex-wrap gap-3 pt-4 border-t border-slate-100">
                       <Link
                         href={`/account/tracking?order=${order.id}`}
                         className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-950 text-white text-[11px] font-black uppercase tracking-widest hover:bg-emerald-800 transition-all"
                       >
                         Track Order
                       </Link>
                       <button className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-[11px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all">
                         <RotateCcw className="h-3.5 w-3.5" /> Reorder
                       </button>
                       <button className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-[11px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all">
                         <Star className="h-3.5 w-3.5" /> Rate Items
                       </button>
                     </div>
                   </div>
                 )}
               </div>
             ))}
           </div>
        )}
      </div>
    </div>
  );
}
