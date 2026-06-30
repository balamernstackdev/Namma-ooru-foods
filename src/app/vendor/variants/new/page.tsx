'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
   ArrowLeft,
   Save,
   Layers,
   Info,
   ChevronDown,
   HelpCircle
} from 'lucide-react';
import useSWR from 'swr';
import { useToast } from '@/context/ToastContext';
import { API_URL } from '@/lib/api';

const fetcher = (url: string) => fetch(url).then(res => res.json());

const InputWrapper = ({ label, children, helpText, maxWidth = "max-w-full" }: any) => (
   <div className={`space-y-2 flex-1 ${maxWidth}`}>
      <div className="flex items-center justify-between">
         <label className="text-[11px] font-black text-[#6B7280] uppercase tracking-wider">
            {label}
         </label>
         {helpText && (
            <div className="group relative">
               <HelpCircle size={14} className="text-slate-300 cursor-help hover:text-[#0F7A4D] transition-all shadow-sm" />
               <div className="absolute bottom-full right-0 mb-2 w-48 p-2 bg-[#111827] text-white text-[10px] rounded shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
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

const SectionHeader = ({ title, icon: Icon, colorClass = "text-[#0F7A4D]" }: any) => (
   <div className="px-8 py-3.5 border-b border-[#E5E7EB] bg-[#F8FAF7] flex items-center gap-3">
      <Icon size={16} className={colorClass} />
      <h2 className="text-[10px] font-black text-[#111827] uppercase tracking-[0.2em]">{title}</h2>
   </div>
);

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

   const { data: productsData } = useSWR(user?.brandId ? `${API_URL}/api/products?subVendorId=${user.brandId}&limit=1000` : null, fetcher);
   const products = productsData?.products || [];

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
      <div className="w-full pb-24 bg-[#F8FAF7] min-h-screen">
         {/* Sticky Header Navigation */}
         <div className="sticky top-0 z-40 bg-white/85 backdrop-blur-xl border-b border-[#E5E7EB] mb-8 py-6 px-8">
            <div className="w-full flex items-center justify-between">
               <div className="flex items-center gap-4">
                  <button
                     onClick={() => router.back()}
                     className="h-10 w-10 rounded-lg bg-white border border-[#E5E7EB] flex items-center justify-center text-slate-500 hover:bg-slate-50 hover:text-[#0F7A4D] transition-all shadow-sm"
                  >
                     <ArrowLeft size={18} />
                  </button>
                  <div>
                     <h1 className="text-3xl font-black text-[#111827] tracking-tight">
                        Create Variant
                     </h1>
                     <p className="text-[10px] font-bold text-[#6B7280] uppercase tracking-widest mt-0.5">Refining Product Specifications for Store #{user?.brandId}</p>
                  </div>
               </div>
               <div className="flex items-center gap-3">
                  <button onClick={() => router.back()} type="button" className="px-4 py-2 rounded-lg text-xs font-bold text-[#6B7280] hover:bg-slate-100 transition-all">Discard</button>
                  <button
                     form="variant-form"
                     type="submit"
                     disabled={isLoading}
                     className="px-6 py-2.5 rounded-lg bg-[#0F7A4D] hover:bg-[#0c623d] text-white text-xs font-black flex items-center gap-2 shadow-sm disabled:opacity-50 transition-all active:scale-95 uppercase tracking-wider"
                  >
                     <Save size={14} />
                     {isLoading ? 'Defining...' : 'Create Variant'}
                  </button>
               </div>
            </div>
         </div>

         <form id="variant-form" onSubmit={handleSubmit} className="w-full px-8 space-y-10">

            {/* 1. CORE MOLECULE CARD */}
            <div className="bg-white rounded-[20px] border border-[#E5E7EB] shadow-[0_4px_12px_rgba(0,0,0,0.05)] overflow-hidden w-full">
               <SectionHeader title="Weight & Inventory DNA" icon={Layers} colorClass="text-[#0F7A4D]" />
               <div className="p-8 space-y-8">

                  <InputWrapper label="Parent Root Product">
                     <div className="relative">
                        <select
                           required
                           className="w-full h-14 px-6 rounded-xl border border-[#E5E7EB] bg-white focus:border-[#0F7A4D] outline-none font-bold text-sm appearance-none text-[#111827] focus:ring-4 focus:ring-[#0F7A4D]/5"
                           value={form.productId}
                           onChange={e => setForm({ ...form, productId: e.target.value })}
                        >
                           <option value="">Select Root Product to Associate</option>
                           {Array.isArray(products) && products.map((p: any) => (
                              <option key={p.id} value={p.id}>{p.name}</option>
                           ))}
                        </select>
                        <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                     </div>
                  </InputWrapper>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     <InputWrapper label="Scale Label">
                        <input
                           required
                           type="text"
                           placeholder="e.g. 500g Jar / 1kg Pouch"
                           className="w-full h-14 px-6 rounded-xl border border-[#E5E7EB] bg-white focus:border-[#0F7A4D] focus:ring-4 focus:ring-[#0F7A4D]/5 outline-none font-bold text-[#111827] text-sm transition-all"
                           value={form.name}
                           onChange={e => setForm({ ...form, name: e.target.value })}
                        />
                     </InputWrapper>

                     <div className="grid grid-cols-2 gap-4">
                        <InputWrapper label="Market Price (Base)">
                           <input
                              required
                              type="number"
                              placeholder="₹ Base Price"
                              className="w-full h-14 px-6 rounded-xl border border-[#E5E7EB] bg-white focus:border-[#0F7A4D] focus:ring-4 focus:ring-[#0F7A4D]/5 outline-none font-black text-[#0F7A4D] text-sm"
                              value={form.price}
                              onChange={e => setForm({ ...form, price: e.target.value })}
                           />
                        </InputWrapper>
                        <InputWrapper label="MRP">
                           <input
                              type="number"
                              placeholder="₹ MRP"
                              className="w-full h-14 px-6 rounded-xl border border-[#E5E7EB] bg-white focus:border-[#0F7A4D] focus:ring-4 focus:ring-[#0F7A4D]/5 outline-none font-black text-[#6B7280] text-sm"
                              value={form.originalPrice}
                              onChange={e => setForm({ ...form, originalPrice: e.target.value })}
                           />
                        </InputWrapper>
                     </div>
                  </div>

                  <div className="grid grid-cols-1 gap-8">
                     <InputWrapper label="Stock Availability">
                        <input
                           required
                           type="number"
                           placeholder="Available Stock Count"
                           className="w-full h-14 px-6 rounded-xl border border-[#E5E7EB] bg-white focus:border-[#0F7A4D] focus:ring-4 focus:ring-[#0F7A4D]/5 outline-none font-bold text-sm text-[#111827]"
                           value={form.stock}
                           onChange={e => setForm({ ...form, stock: e.target.value })}
                        />
                     </InputWrapper>
                  </div>

                  <div className="p-6 rounded-xl bg-[#DCFCE7] border border-[#DCFCE7] flex items-center gap-6">
                     <Info className="text-[#15803D] shrink-0" size={20} />
                     <p className="text-[11px] font-bold text-[#15803D] uppercase tracking-widest leading-relaxed">
                        Variants allow you to offer the same product in multiple sizes or configurations. Every variant maintains its own pricing and stock integrity.
                     </p>
                  </div>
               </div>
            </div>
         </form>
      </div>
   );
}
