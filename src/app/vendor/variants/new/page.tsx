'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
   ArrowLeft,
   Save,
   Layers,
   Info,
   Type,
   Hash
} from 'lucide-react';
import { motion } from 'framer-motion';
import useSWR from 'swr';
import { useToast } from '@/context/ToastContext';
import { API_URL } from '@/lib/api';
const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function CreateVariant() {
   const router = useRouter();
   const { user } = useAuth();
   const { addToast } = useToast();
   const [isLoading, setIsLoading] = useState(false);

   const [form, setForm] = useState({
      name: '',
      productId: '',
      price: '',
      originalPrice: '',
      stock: '',
      sku: ''
   });

   const { data: products } = useSWR(user?.brandId ? `${API_URL}/api/products?brandId=${user.brandId}` : null, fetcher);

   const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!user?.brandId) return;

      setIsLoading(true);
      try {
         const payload = {
            ...form,
            productId: parseInt(form.productId),
            price: parseFloat(form.price),
            originalPrice: form.originalPrice ? parseFloat(form.originalPrice) : null,
            stock: parseInt(form.stock),
            brandId: user.brandId
         };

         const res = await fetch(`${API_URL}/api/variants`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
         });

         if (res.ok) {
            addToast('Specification Defined', form.name);
            router.push('/vendor/variants');
         } else {
            const error = await res.json();
            addToast('Definition Error', error.error || 'Check all required fields');
         }
      } catch (err) {
         addToast('Critical Error', 'Synchronization with inventory node failed');
      } finally {
         setIsLoading(false);
      }
   };

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
               <h2 className="text-3xl font-black text-emerald-950 dark:text-white tracking-tighter uppercase">Variant</h2>
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Refining Product Specifications for Store #{user?.brandId}</p>
            </div>
            <button
               form="variant-form"
               disabled={isLoading}
               className="h-16 px-10 rounded-2xl bg-amber-500 text-emerald-950 text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-amber-400 transition-all shadow-2xl shadow-amber-900/40"
            >
               {isLoading ? 'Saving...' : <><Save size={20} /> Save</>}
            </button>
         </div>

         <form id="variant-form" onSubmit={handleSubmit} className="grid grid-cols-1 gap-12">

            <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-10 md:p-14 border border-slate-100 dark:border-slate-800 space-y-12 shadow-sm">

               {/* Section: Specification */}
               <div className="space-y-10">
                  <div className="flex items-center gap-4 text-emerald-950 dark:text-white">
                     <div className="h-12 w-12 rounded-2xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center text-amber-600">
                        <Layers size={24} />
                     </div>
                     <h3 className="text-xl font-black tracking-tight">Weight & Inventory DNA</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                     <div className="space-y-4 md:col-span-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Parent Root Product</label>
                        <div className="relative">
                           <select
                              required
                              className="w-full h-16 px-8 rounded-2xl bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-amber-400 outline-none transition-all font-bold text-emerald-950 dark:text-white appearance-none"
                              value={form.productId}
                              onChange={e => setForm({ ...form, productId: e.target.value })}
                           >
                              <option value="">Select Root Product to Associate</option>
                              {Array.isArray(products) && products.map((p: any) => (
                                 <option key={p.id} value={p.id}>{p.name}</option>
                              ))}
                           </select>
                        </div>
                     </div>

                     <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Scale Label</label>
                        <div className="relative">
                           <Type className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                           <input
                              required
                              type="text"
                              placeholder="e.g. 500g Jar / 1kg Pouch"
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
                              placeholder="0.00"
                              className="w-full h-16 pl-16 pr-8 rounded-2xl bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-amber-400 outline-none transition-all font-bold text-emerald-950 dark:text-white"
                              value={form.price}
                              onChange={e => setForm({ ...form, price: e.target.value })}
                           />
                        </div>
                     </div>
                     <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Market MRP (Original)</label>
                        <div className="relative">
                           <span className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 font-bold text-lg">₹</span>
                           <input
                              type="number"
                              placeholder="MRP"
                              className="w-full h-16 pl-16 pr-8 rounded-2xl bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-amber-400 outline-none transition-all font-bold text-emerald-950 dark:text-white"
                              value={form.originalPrice}
                              onChange={e => setForm({ ...form, originalPrice: e.target.value })}
                           />
                        </div>
                     </div>

                     <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Stock Availability</label>
                        <div className="relative">
                           <Hash className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                           <input
                              required
                              type="number"
                              placeholder="Available SKU Count"
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

                     <div className="p-8 rounded-[2rem] bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 flex items-center gap-6">
                        <Info className="text-slate-400 shrink-0" size={24} />
                        <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest leading-relaxed">
                           Variants allow you to offer the same product in multiple sizes or configurations. Every variant maintains its own pricing and stock integrity.
                        </p>
                     </div>
                  </div>
               </div>
            </div>
         </form>
      </div>
   );
}
