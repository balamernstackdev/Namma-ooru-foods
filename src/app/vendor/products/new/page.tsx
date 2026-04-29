'use client';


import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
   ArrowLeft,
   Save,
   Plus,
   Trash2,
   Image as ImageIcon,
   Tag,
   Layers,
   Info,
   ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import useSWR from 'swr';
import { useToast } from '@/context/ToastContext';
import { API_URL } from '@/lib/api';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function CreateProduct() {
   const router = useRouter();
   const { user } = useAuth();
   const { addToast } = useToast();
   const [isLoading, setIsLoading] = useState(false);

   // Form State
   const [formData, setFormData] = useState({
      name: '',
      description: '',
      price: '',
      originalPrice: '',
      categoryId: '',
      image: '',
      tags: [] as string[],
      newTag: ''
   });

   const [variants, setVariants] = useState([{ name: 'Standard', price: '', originalPrice: '', stock: '50' }]);

   const { data: categories } = useSWR(`${API_URL}/api/categories`, fetcher);

   const handleAddVariant = () => setVariants([...variants, { name: '', price: '', originalPrice: '', stock: '' }]);
   const handleRemoveVariant = (index: number) => setVariants(variants.filter((_, i) => i !== index));

   const handleAddTag = () => {
      if (formData.newTag && !formData.tags.includes(formData.newTag)) {
         setFormData({ ...formData, tags: [...formData.tags, formData.newTag], newTag: '' });
      }
   };

   const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!user?.brandId) return;

      setIsLoading(true);
      try {
         const payload = {
            ...formData,
            price: parseFloat(formData.price),
            originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : null,
            brandId: user.brandId,
            variants: variants.map(v => ({
               ...v,
               price: v.price ? parseFloat(v.price) : null,
               originalPrice: v.originalPrice ? parseFloat(v.originalPrice) : null,
               stock: parseInt(v.stock?.toString() || '0')
            }))
         };

         const res = await fetch(`${API_URL}/api/products`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
         });

         if (res.ok) {
            addToast('Harvest Registered Successfully', formData.name);
            router.push('/vendor/products');
         } else {
            const error = await res.json();
            addToast('Fulfillment Error', error.error || 'Check all required fields');
         }
      } catch (err) {
         addToast('Critical Error', 'Connectivity to agrarian node lost');
      } finally {
         setIsLoading(false);
      }
   };

   return (
      <div className="max-w-5xl mx-auto pb-32">
         {/* Header Navigation */}
         <div className="flex items-center justify-between mb-16">
            <button
               onClick={() => router.back()}
               className="h-14 w-14 rounded-full bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-center justify-center text-emerald-950 dark:text-white hover:bg-slate-50 transition-all font-black"
            >
               <ArrowLeft size={20} strokeWidth={3} />
            </button>
            <div className="text-center">
               <h2 className="text-3xl font-black text-emerald-950 dark:text-white tracking-tighter uppercase">Register Harvest</h2>
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Namma Reseller Product Integrity Module</p>
            </div>
            <button
               form="product-form"
               disabled={isLoading}
               className="h-16 px-10 rounded-2xl bg-emerald-950 dark:bg-emerald-600 text-white text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-emerald-800 transition-all shadow-2xl shadow-emerald-900/40"
            >
               {isLoading ? 'Registering...' : <><Save size={20} className="text-amber-400" /> Commit to Store</>}
            </button>
         </div>

         <form id="product-form" onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-12">

            {/* LEFT: CORE INTELLIGENCE (2/3) */}
            <div className="lg:col-span-2 space-y-12">

               {/* Identity */}
               <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-10 md:p-14 border border-slate-100 dark:border-slate-800 space-y-10 shadow-sm">
                  <div className="flex items-center gap-4 text-emerald-950 dark:text-white">
                     <div className="h-12 w-12 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600">
                        <Tag size={24} />
                     </div>
                     <h3 className="text-xl font-black tracking-tight">Product Identity</h3>
                  </div>

                  <div className="grid grid-cols-1 gap-10">
                     <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Product Name</label>
                        <input
                           required
                           type="text"
                           placeholder="e.g. Traditional Foxtail Millet"
                           className="w-full h-16 px-8 rounded-2xl bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-amber-400 focus:bg-white dark:focus:bg-slate-950 outline-none transition-all font-bold text-emerald-950 dark:text-white"
                           value={formData.name}
                           onChange={e => setFormData({ ...formData, name: e.target.value })}
                        />
                     </div>

                     <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Historical Narrative (Description)</label>
                        <textarea
                           required
                           rows={6}
                           placeholder="Describe the heritage, taste profile, and harvest method..."
                           className="w-full p-8 rounded-[2rem] bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-amber-400 focus:bg-white dark:focus:bg-slate-950 outline-none transition-all font-bold text-emerald-950 dark:text-white leading-relaxed resize-none"
                           value={formData.description}
                           onChange={e => setFormData({ ...formData, description: e.target.value })}
                        />
                     </div>
                  </div>
               </div>

            </div>

            {/* RIGHT: ESTATE PARAMETERS (1/3) */}
            <div className="lg:col-span-1 space-y-12">

               {/* Media Hub */}
               <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-10 border border-slate-100 dark:border-slate-800 space-y-8 shadow-sm">
                  <div className="flex items-center gap-3 text-emerald-950 dark:text-white">
                     <ImageIcon size={20} className="text-purple-500" />
                     <h3 className="text-lg font-black tracking-tight">Media Hub</h3>
                  </div>

                  <div className="aspect-square rounded-[2rem] bg-slate-50 dark:bg-slate-800 flex flex-col items-center justify-center border-2 border-dashed border-slate-100 dark:border-slate-700 relative overflow-hidden group">
                     {formData.image ? (
                        <img src={formData.image} alt="Preview" className="h-full w-full object-cover" />
                     ) : (
                        <div className="text-center p-8">
                           <div className="h-16 w-16 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-center justify-center text-slate-300 mx-auto mb-4">
                              <Plus size={32} />
                           </div>
                           <p className="text-[10px] font-black uppercase tracking-widest text-slate-300">Awaiting Primary SKU Visual</p>
                        </div>
                     )}
                  </div>

                  <input
                     type="text"
                     placeholder="Primary Image URL"
                     className="w-full h-14 px-6 rounded-xl bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-amber-400 outline-none transition-all font-bold text-xs"
                     value={formData.image}
                     onChange={e => setFormData({ ...formData, image: e.target.value })}
                  />
               </div>

               {/* Estate Classification */}
               <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-10 border border-slate-100 dark:border-slate-800 space-y-8 shadow-sm text-emerald-950 dark:text-white">
                  <div className="flex items-center gap-3">
                     <Info size={20} className="text-amber-500" />
                     <h3 className="text-lg font-black tracking-tight">Category & Tags</h3>
                  </div>

                  <div className="space-y-6">
                     <div className="space-y-3">
                        <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Market Category</label>
                        <div className="relative">
                           <select
                              required
                              className="w-full h-14 px-6 pr-12 rounded-xl bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-amber-400 outline-none transition-all font-black text-[11px] uppercase tracking-widest appearance-none text-emerald-950 dark:text-white"
                              value={formData.categoryId}
                              onChange={e => setFormData({ ...formData, categoryId: e.target.value })}
                           >
                              <option value="">Select Cluster</option>
                              {categories?.map((cat: any) => (
                                 <option key={cat.id} value={cat.id}>{cat.name}</option>
                              ))}
                           </select>
                           <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" size={16} />
                        </div>
                     </div>

                     <div className="space-y-3">
                        <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Baseline Pricing</label>
                        <input
                           required
                           type="number"
                           placeholder="₹ Offer Price"
                           className="w-full h-14 px-6 rounded-xl bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-amber-400 outline-none transition-all font-black text-xs text-emerald-950 dark:text-white"
                           value={formData.price}
                           onChange={e => setFormData({ ...formData, price: e.target.value })}
                        />
                     </div>

                     <div className="space-y-3">
                        <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Baseline MRP</label>
                        <input
                           type="number"
                           placeholder="₹ MRP"
                           className="w-full h-14 px-6 rounded-xl bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-amber-400 outline-none transition-all font-black text-xs text-emerald-950 dark:text-white"
                           value={formData.originalPrice}
                           onChange={e => setFormData({ ...formData, originalPrice: e.target.value })}
                        />
                     </div>

                     <div className="space-y-4">
                        <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Attribution Tags</label>
                        <div className="flex flex-wrap gap-2 mb-4">
                           {formData.tags.map(tag => (
                              <span key={tag} className="px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                                 {tag}
                                 <button onClick={() => setFormData({ ...formData, tags: formData.tags.filter(t => t !== tag) })} className="hover:text-red-500">×</button>
                              </span>
                           ))}
                        </div>
                        <div className="flex gap-2">
                           <input
                              placeholder="Add Tag..."
                              className="flex-1 h-12 px-5 rounded-xl bg-slate-50 dark:bg-slate-800 outline-none font-bold text-xs"
                              value={formData.newTag}
                              onChange={e => setFormData({ ...formData, newTag: e.target.value })}
                              onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                           />
                           <button
                              type="button"
                              onClick={handleAddTag}
                              className="h-12 w-12 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center hover:bg-slate-100 transition-all font-black text-emerald-950 dark:text-white"
                           >
                              <Plus size={18} strokeWidth={3} />
                           </button>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         </form>
      </div>
   );
}
