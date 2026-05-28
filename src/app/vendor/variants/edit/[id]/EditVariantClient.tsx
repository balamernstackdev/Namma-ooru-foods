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
   Type,
   HelpCircle
} from 'lucide-react';
import { useToast } from '@/context/ToastContext';
import { API_URL } from '@/lib/api';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(res => res.json());

const InputWrapper = ({ label, children, helpText, maxWidth = "max-w-full" }: any) => (
   <div className={`space-y-2 flex-1 ${maxWidth}`}>
      <div className="flex items-center justify-between">
         <label className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            {label}
         </label>
         {helpText && (
            <div className="group relative">
               <HelpCircle size={14} className="text-slate-300 cursor-help hover:text-emerald-500 transition-all shadow-sm" />
               <div className="absolute bottom-full right-0 mb-2 w-48 p-2 bg-slate-800 text-white text-[10px] rounded shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                  {helpText}
               </div>
            </div>
         )}
      </div>
      <div className="relative">
         {children}
      </div>
   </div>
);

const SectionHeader = ({ title, icon: Icon, colorClass = "text-emerald-600" }: any) => (
   <div className="px-8 py-3.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center gap-3">
      <Icon size={16} className={colorClass} />
      <h2 className="text-[10px] font-black text-slate-900 dark:text-slate-200 uppercase tracking-[0.2em]">{title}</h2>
   </div>
);

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
            addToast('Scale Updationd', form.name);
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
         <RefreshCw size={48} className="text-emerald-950 animate-spin" />
         <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Hydrating Scale Metadata...</p>
      </div>
   );

   return (
      <div className="w-full pb-24 bg-[#f8fafc] dark:bg-slate-950 min-h-screen">
         {/* Sticky Header Navigation */}
         <div className="sticky top-0 z-40 bg-[#f8fafc]/80 dark:bg-slate-950/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 mb-8 py-6 px-8">
            <div className="w-full flex items-center justify-between">
               <div className="flex items-center gap-4">
                  <button
                     onClick={() => router.back()}
                     className="h-10 w-10 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-500 hover:bg-slate-50 hover:text-emerald-600 transition-all shadow-sm"
                  >
                     <ArrowLeft size={18} />
                  </button>
                  <div>
                     <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                        Variant Overview
                     </h1>
                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Refining Specification #{variantId} for Brand #{user?.brandId}</p>
                  </div>
               </div>
               <div className="flex items-center gap-3">
                  <button onClick={() => router.back()} className="px-4 py-2 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 transition-all">Discard</button>
                  <button
                     form="variant-form"
                     type="submit"
                     disabled={isLoading}
                     className="px-6 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black flex items-center gap-2 shadow-lg shadow-emerald-500/20 disabled:opacity-50 transition-all active:scale-95 uppercase tracking-wider"
                  >
                     <Save size={14} />
                     {isLoading ? 'Calibrating...' : 'Save Changes'}
                  </button>
               </div>
            </div>
         </div>

         <form id="variant-form" onSubmit={handleSubmit} className="w-full px-8 space-y-10">

            {/* 1. CORE MOLECULE CARD */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden w-full">
               <SectionHeader title="Specification Intelligence" icon={Layers} colorClass="text-emerald-600" />
               <div className="p-8 space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     <InputWrapper label="Active Scale Label">
                        <input
                           required
                           type="text"
                           placeholder="e.g. 500g Jar / 1kg Pouch"
                           className="w-full h-14 px-6 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:border-emerald-500 focus:ring-4 ring-emerald-500/5 outline-none font-bold text-slate-950 dark:text-white text-sm transition-all"
                           value={form.name}
                           onChange={e => setForm({ ...form, name: e.target.value })}
                        />
                     </InputWrapper>

                     <InputWrapper label="Market Price (Base)">
                        <input
                           required
                           type="number"
                           placeholder="₹ Base Price"
                           className="w-full h-14 px-6 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:border-emerald-500 outline-none font-black text-emerald-600 text-sm"
                           value={form.price}
                           onChange={e => setForm({ ...form, price: e.target.value })}
                        />
                     </InputWrapper>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     <InputWrapper label="Inventory Stock Level">
                        <input
                           required
                           type="number"
                           placeholder="Available SKU Count"
                           className="w-full h-14 px-6 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:border-emerald-500 outline-none font-bold text-sm text-slate-950 dark:text-white"
                           value={form.stock}
                           onChange={e => setForm({ ...form, stock: e.target.value })}
                        />
                     </InputWrapper>

                     <InputWrapper label="Inventory SKU ID">
                        <input
                           type="text"
                           placeholder="e.g. TM-SAUCE-500G"
                           className="w-full h-14 px-6 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:border-emerald-500 outline-none font-bold text-sm text-slate-950 dark:text-white"
                           value={form.sku}
                           onChange={e => setForm({ ...form, sku: e.target.value })}
                        />
                     </InputWrapper>
                  </div>

                  <div className="p-6 rounded-xl bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-800 flex items-center gap-6">
                     <Info className="text-emerald-600 shrink-0" size={20} />
                     <p className="text-[11px] font-bold text-emerald-900 dark:text-emerald-400 uppercase tracking-widest leading-relaxed">
                        Changing these parameters will update the price and availability across all products currently using this specification tier.
                     </p>
                  </div>
               </div>
            </div>
         </form>
      </div>
   );
}
