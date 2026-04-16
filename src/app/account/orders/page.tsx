'use client';

import React, { useState } from 'react';
import { Package, ChevronDown, ChevronUp, Star, RotateCcw, ChevronLeft } from 'lucide-react';
import Link from 'next/link';

const orders = [
  {
    id: 'NOF-2024-001847',
    date: '12 Apr 2024',
    status: 'Delivered',
    statusColor: 'bg-emerald-100 text-emerald-700',
    total: 1847,
    items: [
      { name: 'Organic Toor Dal', qty: 2, weight: '1 KG', price: 299, image: '/ai_images/indian_spices_1776231045209.png' },
      { name: 'Cold Pressed Sesame Oil', qty: 1, weight: '1 Litre', price: 599, image: '/ai_images/honey_gold_1776231080758.png' },
      { name: 'A2 Cow Ghee', qty: 1, weight: '500 ML', price: 650, image: '/ai_images/organic_grains_1776231059575.png' },
    ],
  },
  {
    id: 'NOF-2024-001632',
    date: '28 Mar 2024',
    status: 'Delivered',
    statusColor: 'bg-emerald-100 text-emerald-700',
    total: 748,
    items: [
      { name: 'Ragi Flour (Sprouted)', qty: 2, weight: '1 KG', price: 189, image: '/ai_images/organic_grains_1776231059575.png' },
      { name: 'Mango Forest Honey', qty: 1, weight: '500 G', price: 370, image: '/ai_images/honey_gold_1776231080758.png' },
    ],
  },
  {
    id: 'NOF-2024-001589',
    date: '15 Mar 2024',
    status: 'In Transit',
    statusColor: 'bg-blue-100 text-blue-700',
    total: 1199,
    items: [
      { name: 'Organic Basmati Rice', qty: 1, weight: '10 KG', price: 1199, image: '/ai_images/organic_grains_1776231059575.png' },
    ],
  },
  {
    id: 'NOF-2024-001401',
    date: '02 Mar 2024',
    status: 'Cancelled',
    statusColor: 'bg-red-100 text-red-600',
    total: 549,
    items: [
      { name: 'Kashmiri Red Chilli Powder', qty: 3, weight: '200 G', price: 149, image: '/ai_images/indian_spices_1776231045209.png' },
      { name: 'Turmeric Powder', qty: 1, weight: '200 G', price: 102, image: '/ai_images/indian_spices_1776231045209.png' },
    ],
  },
];

export default function OrdersPage() {
  const [expanded, setExpanded] = useState<string | null>(null);

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
                    <p className="text-[13px] font-black text-emerald-950">{order.id}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Date</p>
                    <p className="text-[13px] font-bold text-emerald-950">{order.date}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Total</p>
                    <p className="text-[13px] font-black text-emerald-950">₹{order.total}</p>
                  </div>
                  <div className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full ${order.statusColor}`}>
                    {order.status}
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
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-4">
                        <div className="h-14 w-14 rounded-xl overflow-hidden shrink-0 border border-slate-100">
                          <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] font-black text-emerald-950 truncate">{item.name}</p>
                          <p className="text-[10px] text-slate-400 font-medium">{item.weight} × {item.qty}</p>
                        </div>
                        <p className="text-[13px] font-black text-emerald-950 shrink-0">₹{item.price * item.qty}</p>
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
      </div>
    </div>
  );
}
