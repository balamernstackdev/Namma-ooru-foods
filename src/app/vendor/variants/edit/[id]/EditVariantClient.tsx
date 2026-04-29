'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
   ArrowLeft,
   Save,
   Layers,
   Info,
   RefreshCw,
   Hash,
   Type
} from 'lucide-react';
import { useToast } from '@/context/ToastContext';
import { API_URL } from '@/lib/api';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function EditVariantClient({ id }: { id: string }) {
   const router = useRouter();
   const { user } = useAuth();
   const { addToast } = useToast();
   const [isLoading, setIsLoading] = useState(false);
   const variantId = id;

   const { data: variant, error } = useSWR(variantId ? `${API_URL}/api/variants/${variantId}` : null, fetcher);

   const [form, setForm] = useState({
      name: '',
      price: '',
      stock: '',
      sku: ''
   });

   useEffect(() => {
      if (variant) {
         setForm({
            name: variant.name || '',
            price: variant.price?.toString() || '',
            stock: variant.stock?.toString() || '',
            sku: variant.sku || ''
         });
      }
   }, [variant]);

   const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!user?.brandId) return;

      setIsLoading(true);
      try {
         const res = await fetch(`${API_URL}/api/variants/${variantId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
               ...form,
               price: parseFloat(form.price),
               stock: parseInt(form.stock),
               brandId: user.brandId
            })
         });

         if (res.ok) {
            addToast('Scale Calibrated', form.name);
            router.push('/vendor/variants');
         } else {
            const err = await res.json();
            addToast('Calibration Error', err.error || 'Check all required fields');
         }
      } catch (err) {
         addToast('Critical Error', 'Inventory node synchronization failed');
      } finally {
         setIsLoading(false);
      }
   };

   if (!variant && !error) return (
      <div className="flex flex-col items-center justify-center py-40 gap-6">
         <RefreshCw size={48} className="text-amber-500 animate-spin" />
         <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Hydrating Scale Metadata...</p>
      </div>
   );

   return (
      <div className="max-w-4xl mx-auto pb-32">
         {/* Header Navigation */}
         <div className="flex items-center justify-between mb-16">
            <button
               onClick={() => router.back()}
               className="h-14 w-14 rounded-full bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-center justify-center text-emerald-950 dark:text-white hover:bg-slate-50 transition-all shadow-sm"
            >
               <ArrowLeft size={20} />
            </button>
            <div className="text-center">
               <h2 className="text-3xl font-black text-emerald-950 dark:text-white tracking-tighter uppercase">Variant Overview</h2>
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Refining Specification #{variantId} for Brand #{user?.brandId}</p>
            </div>
            <button
               form="variant-form"
               disabled={isLoading}
               className="h-16 px-10 rounded-2xl bg-amber-500 text-emerald-950 text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-amber-400 transition-all shadow-2xl shadow-amber-900/40"
            >
               {isLoading ? 'Calibrating...' : <><Save size={20} /> Save Changes</>}
            </button>
         </div>

         <form id="variant-form" onSubmit={handleSubmit} className="grid grid-cols-1 gap-12">
            <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-10 md:p-14 border border-slate-100 dark:border-slate-800 space-y-12 shadow-sm">
               <div className="space-y-10">
                  <div className="flex items-center gap-4 text-emerald-950 dark:text-white">
                     <div className="h-12 w-12 rounded-2xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center text-amber-600">
                        <Layers size={24} />
                     </div>
                     <h3 className="text-xl font-black tracking-tight">Specification Intelligence</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                     <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Active Scale Label</label>
                        <div className="relative">
                           <Type className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                           <input
                              required
                              type="text"
                              className="w-full h-16 pl-16 pr-8 rounded-2xl bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-amber-400 outline-none transition-all font-bold text-emerald-950 dark:text-white"
                              value={form.name}
                              onChange={e => setForm({ ...form, name: e.target.value })}
                           />
                        </div>
                     </div>

                     <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Market Price (Base)</label>
                        <div className="relative">
                           <span className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 font-bold text-lg">₹</span>
                           <input
                              required
                              type="number"
                              className="w-full h-16 pl-16 pr-8 rounded-2xl bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-amber-400 outline-none transition-all font-bold text-emerald-950 dark:text-white"
                              value={form.price}
                              onChange={e => setForm({ ...form, price: e.target.value })}
                           />
                        </div>
                     </div>

                     <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Inventory Stock Level</label>
                        <div className="relative">
                           <Hash className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                           <input
                              required
                              type="number"
                              className="w-full h-16 pl-16 pr-8 rounded-2xl bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-amber-400 outline-none transition-all font-bold text-emerald-950 dark:text-white"
                              value={form.stock}
                              onChange={e => setForm({ ...form, stock: e.target.value })}
                           />
                        </div>
                     </div>

                     <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Inventory SKU ID</label>
                        <div className="relative">
                           <Hash className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                           <input
                              type="text"
                              placeholder="e.g. TM-SAUCE-500G"
                              className="w-full h-16 pl-16 pr-8 rounded-2xl bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-amber-400 outline-none transition-all font-bold text-emerald-950 dark:text-white"
                              value={form.sku}
                              onChange={e => setForm({ ...form, sku: e.target.value })}
                           />
                        </div>
                     </div>

                     <div className="p-8 rounded-[2rem] bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-800 flex items-center gap-6">
                        <Info className="text-amber-600 shrink-0" size={24} />
                        <p className="text-[11px] font-bold text-amber-900 dark:text-amber-400 uppercase tracking-widest leading-relaxed">
                           Changing these parameters will update the price and availability across all products currently using this specification tier.
                        </p>
                     </div>
                  </div>
               </div>
            </div>
         </form>
      </div>
   );
}
