'use client';

import React from 'react';
import { MapPin, Package, CheckCircle2, Truck, Clock, RotateCcw, ChevronLeft } from 'lucide-react';
import Link from 'next/link';

const steps = [
  { label: 'Order Placed', desc: 'Your order has been confirmed', time: '12 Apr, 10:32 AM', done: true },
  { label: 'Payment Confirmed', desc: 'Payment processed successfully', time: '12 Apr, 10:33 AM', done: true },
  { label: 'Packed & Dispatched', desc: 'Packed at Madurai warehouse', time: '13 Apr, 8:15 AM', done: true },
  { label: 'In Transit', desc: 'En route to your city via Blue Dart', time: '14 Apr, 5:00 PM', done: true },
  { label: 'Out for Delivery', desc: 'Your delivery partner is on the way', time: 'Expected 16 Apr, 11:00 AM', done: false, active: true },
  { label: 'Delivered', desc: 'Package delivered to your doorstep', time: 'Expected 16 Apr', done: false },
];

const recentOrders = [
  { id: 'NOF-2024-001847', status: 'Out for Delivery', items: 3, date: '12 Apr 2024' },
  { id: 'NOF-2024-001632', status: 'Delivered', items: 2, date: '28 Mar 2024' },
  { id: 'NOF-2024-001589', status: 'In Transit', items: 1, date: '15 Mar 2024' },
];

export default function TrackingPage() {
  return (
    <div className="py-2 px-0 md:px-4">
      <div className="max-w-4xl">

        {/* Mobile Back Button */}
        <Link href="/account" className="md:hidden flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-emerald-600 mb-6 bg-emerald-50 w-fit px-4 py-2 rounded-full">
          <ChevronLeft className="h-4 w-4" /> Back to Account
        </Link>

        <h1 className="text-3xl font-black text-emerald-950 tracking-tighter mb-2">Track Your Order</h1>
        <p className="text-[12px] text-slate-400 font-medium mb-8">Real-time shipment updates for order <span className="font-black text-emerald-700">NOF-2024-001847</span></p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-emerald-950 rounded-[1.5rem] p-5 text-white">
            <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400 mb-1">Order ID</p>
            <p className="text-[15px] font-black">NOF-2024-001847</p>
          </div>
          <div className="bg-white rounded-[1.5rem] p-5 border border-slate-100 shadow-sm">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Tracking ID</p>
            <p className="text-[15px] font-black text-emerald-950">BD-38197264</p>
          </div>
          <div className="bg-amber-50 rounded-[1.5rem] p-5 border border-amber-100">
            <p className="text-[10px] font-black uppercase tracking-widest text-amber-600 mb-1">Expected Delivery</p>
            <p className="text-[15px] font-black text-emerald-950">16 Apr 2024</p>
          </div>
        </div>

        {/* Progress Tracker */}
        <div className="bg-white rounded-[1.5rem] p-6 border border-slate-100 shadow-sm mb-8">
          <h2 className="text-[13px] font-black uppercase tracking-widest text-emerald-950 border-l-2 border-amber-400 pl-3 mb-6">Shipment Progress</h2>
          <div className="relative">
            <div className="absolute left-5 top-5 bottom-5 w-0.5 bg-slate-100" />
            <div className="flex flex-col gap-6">
              {steps.map((step, i) => (
                <div key={i} className="flex items-start gap-5 relative">
                  <div className={`relative z-10 h-10 w-10 rounded-full flex items-center justify-center shrink-0 transition-all ${step.done ? 'bg-emerald-950' : step.active ? 'bg-amber-400 animate-pulse' : 'bg-slate-100'}`}>
                    {step.done ? (
                      <CheckCircle2 className="h-5 w-5 text-white" />
                    ) : step.active ? (
                      <Truck className="h-5 w-5 text-emerald-950" />
                    ) : (
                      <Clock className="h-4 w-4 text-slate-300" />
                    )}
                  </div>
                  <div className="pt-1.5 flex-1">
                    <div className="flex items-center justify-between">
                      <p className={`text-[13px] font-black ${step.done || step.active ? 'text-emerald-950' : 'text-slate-300'}`}>{step.label}</p>
                      <p className={`text-[10px] font-bold ${step.done ? 'text-slate-400' : step.active ? 'text-amber-600' : 'text-slate-300'}`}>{step.time}</p>
                    </div>
                    <p className={`text-[11px] font-medium mt-0.5 ${step.done || step.active ? 'text-slate-500' : 'text-slate-300'}`}>{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Delivery Address */}
        <div className="bg-white rounded-[1.5rem] p-6 border border-slate-100 shadow-sm mb-8">
          <h2 className="text-[13px] font-black uppercase tracking-widest text-emerald-950 border-l-2 border-amber-400 pl-3 mb-4">Delivering To</h2>
          <div className="flex items-start gap-4">
            <div className="h-10 w-10 rounded-2xl bg-rose-50 flex items-center justify-center shrink-0">
              <MapPin className="h-5 w-5 text-rose-500" />
            </div>
            <div>
              <p className="text-[14px] font-black text-emerald-950">John Doe</p>
              <p className="text-[13px] font-medium text-slate-500">9, First Floor, Opp. Jayam Hospital,<br/>Chokkikulam, Madurai, Tamil Nadu – 625002</p>
              <p className="text-[12px] font-bold text-emerald-700 mt-1">+91 98765 43210</p>
            </div>
          </div>
        </div>

        {/* Other Orders */}
        <div className="bg-white rounded-[1.5rem] p-6 border border-slate-100 shadow-sm">
          <h2 className="text-[13px] font-black uppercase tracking-widest text-emerald-950 border-l-2 border-amber-400 pl-3 mb-4">Track Another Order</h2>
          <div className="flex flex-col gap-3">
            {recentOrders.map(o => (
              <Link key={o.id} href={`/account/tracking?order=${o.id}`} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 hover:bg-emerald-50 transition-all group">
                <div>
                  <p className="text-[13px] font-black text-emerald-950">{o.id}</p>
                  <p className="text-[10px] font-medium text-slate-400">{o.items} items · {o.date}</p>
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-700">{o.status}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
