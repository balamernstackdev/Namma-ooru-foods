'use client';

import React from 'react';
import { 
  Settings, 
  MapPin, 
  CreditCard, 
  Bell, 
  ShieldCheck, 
  Clock, 
  Store,
  ChevronRight,
  Save
} from 'lucide-react';

export default function AdminSettings() {
  const sections = [
    { 
      title: 'Store Profile', 
      desc: 'Local harvest brand and contact details.',
      icon: Store,
      fields: ['Legal Name', 'Business Category', 'Support Email', 'Support WhatsApp']
    },
    { 
      title: 'Logistics & Shipping', 
      desc: 'Coverage area and delivery fee structure.',
      icon: MapPin,
      fields: ['Delivery Radius', 'Flat Rate Fee', 'Free Shipping Threshold']
    },
    { 
      title: 'Payment Gateway', 
      desc: 'Configure COD and third-party processors.',
      icon: CreditCard,
      fields: ['Enable COD', 'Razorpay Integration', 'Tax (GST) Settings']
    },
    { 
      title: 'Notifications', 
      desc: 'Transactional alerts and marketing triggers.',
      icon: Bell,
      fields: ['Order Placing Email', 'WhatsApp fulfillment alerts']
    }
  ];

  return (
    <div className="max-w-5xl space-y-10">
      
      {/* Header */}
      <div className="space-y-1">
         <h2 className="text-3xl font-black text-[#022c22] tracking-tighter">Executive Settings</h2>
         <p className="text-slate-400 font-medium text-sm">Fine-tune Namma Orru's operational parameters.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
         
         {/* Navigation Sidebar-like Tabs */}
         <div className="lg:col-span-1 space-y-2">
            {sections.map((s, i) => (
               <button key={i} className={`w-full flex items-center gap-4 p-5 rounded-2xl transition-all group ${i === 0 ? 'bg-[#022c22] text-white shadow-xl' : 'bg-white border border-slate-100 text-slate-400 hover:bg-slate-50'}`}>
                  <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${i === 0 ? 'bg-amber-400 text-[#022c22]' : 'bg-slate-50 text-slate-400 group-hover:text-amber-500 transition-all'}`}>
                     <s.icon size={20} />
                  </div>
                  <div className="flex flex-col text-left">
                     <span className="text-[12px] font-black uppercase tracking-widest">{s.title}</span>
                     <span className={`text-[10px] font-medium leading-none mt-1 ${i === 0 ? 'text-emerald-400' : 'text-slate-300'}`}>Edit Configuration</span>
                  </div>
                  <ChevronRight size={16} className="ml-auto opacity-20" />
               </button>
            ))}
         </div>

         {/* Form Content Area */}
         <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-10 overflow-hidden relative">
               <div className="absolute top-0 right-0 h-40 w-40 bg-slate-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
               
               <div className="relative z-10 space-y-10">
                  <div className="pb-8 border-b border-slate-50">
                     <h3 className="text-xl font-black text-[#022c22] tracking-tighter">Store Profile Configuration</h3>
                     <p className="text-xs text-slate-400 font-medium mt-1">These details appear on customer invoices and receipts.</p>
                  </div>

                  <div className="space-y-8">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="flex flex-col gap-3">
                           <label className="text-[10px] font-black uppercase tracking-[.3em] text-slate-400">Legal Brand Name</label>
                           <input type="text" defaultValue="Namma Orru Foods Ltd" className="h-14 px-6 rounded-2xl bg-slate-50 border-none outline-none font-bold text-[#022c22] focus:ring-2 ring-amber-400/20" />
                        </div>
                        <div className="flex flex-col gap-3">
                           <label className="text-[10px] font-black uppercase tracking-[.3em] text-slate-400">Store Category</label>
                           <input type="text" defaultValue="Organic Essentials" className="h-14 px-6 rounded-2xl bg-slate-50 border-none outline-none font-bold text-[#022c22] focus:ring-2 ring-amber-400/20" />
                        </div>
                     </div>

                     <div className="flex flex-col gap-3">
                        <label className="text-[10px] font-black uppercase tracking-[.3em] text-slate-400">Official Support Email</label>
                        <input type="email" defaultValue="care@nammaorru.com" className="h-14 px-6 rounded-2xl bg-slate-50 border-none outline-none font-bold text-[#022c22] focus:ring-2 ring-amber-400/20" />
                     </div>

                     <div className="flex flex-col gap-3">
                        <label className="text-[10px] font-black uppercase tracking-[.3em] text-slate-400">WhatsApp Hotline Number</label>
                        <input type="text" defaultValue="+91 98765 43210" className="h-14 px-6 rounded-2xl bg-slate-50 border-none outline-none font-bold text-[#022c22] focus:ring-2 ring-amber-400/20" />
                     </div>
                  </div>

                  <div className="pt-8 flex justify-end gap-4">
                     <button className="h-14 px-10 rounded-2xl bg-[#022c22] text-white text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl shadow-emerald-900/10 active:scale-95 transition-all">
                        <Save size={18} />
                        Save Changes
                     </button>
                  </div>
               </div>
            </div>

            {/* Danger Zone */}
            <div className="bg-red-50/50 rounded-3xl border border-red-100 p-8 flex items-center justify-between">
               <div className="flex items-center gap-5">
                  <div className="h-12 w-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center">
                     <ShieldCheck size={24} />
                  </div>
                  <div>
                     <h4 className="text-sm font-black text-red-900 tracking-tight">Security & Governance</h4>
                     <p className="text-[10px] text-red-700/60 font-medium font-bold uppercase tracking-widest mt-0.5">Manage master access tokens</p>
                  </div>
               </div>
               <button className="h-12 px-6 rounded-xl bg-white border border-red-200 text-red-600 text-[10px] font-black uppercase tracking-widest hover:bg-red-50 transition-all">
                  Update Keys
               </button>
            </div>
         </div>

      </div>

    </div>
  );
}
