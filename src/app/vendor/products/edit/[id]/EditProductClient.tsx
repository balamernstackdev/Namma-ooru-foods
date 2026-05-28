'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
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
   ChevronDown,
   RefreshCw,
   HelpCircle,
   X,
   Upload,
   Loader2,
   AlertCircle
} from 'lucide-react';
import useSWR from 'swr';
import { useToast } from '@/context/ToastContext';
import { API_URL } from '@/lib/api';

const fetcher = async (url: string) => {
   const res = await fetch(url);
   if (!res.ok) {
      const error = new Error('Failed to fetch data');
      (error as any).status = res.status;
      try {
         (error as any).info = await res.json();
      } catch (e) {
         // ignore
      }
      throw error;
   }
   return res.json();
};

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

export default function EditProductClient({ id }: { id?: string }) {
   const router = useRouter();
   const params = useParams();
   const { user } = useAuth();
   const { addToast } = useToast();
   const [isLoading, setIsLoading] = useState(false);
   const [isUploading, setIsUploading] = useState(false);
   const fileInputRef = useRef<HTMLInputElement>(null);
   const productId = id || (params.id as string);

   // Form State
   const [formData, setFormData] = useState({
      name: '',
      description: '',
      price: '',
      originalPrice: '',
      categoryId: '',
      image: '',
      tags: [] as string[],
      newTag: '',
      comboOffer: '',
      freeDelivery: ''
   });

   const [variants, setVariants] = useState<any[]>([]);

   // Hydration
   const { data: product, error: productError } = useSWR(productId ? `${API_URL}/api/products/${productId}` : null, fetcher);
   const { data: categories } = useSWR(`${API_URL}/api/categories`, fetcher);

   useEffect(() => {
      if (product && !product.error) {
         setFormData({
            name: product.name,
            description: product.description || '',
            price: product.price?.toString() || '',
            originalPrice: product.originalPrice?.toString() || '',
            categoryId: product.categoryId?.toString() || '',
            image: product.image || '',
            tags: product.tags || [],
            newTag: '',
            comboOffer: product.comboOffer || '',
            freeDelivery: product.freeDelivery || ''
         });
         setVariants(product.variants || []);
      }
   }, [product]);

   const handleAddTag = () => {
      if (formData.newTag && !formData.tags.includes(formData.newTag)) {
         setFormData({ ...formData, tags: [...formData.tags, formData.newTag], newTag: '' });
      }
   };

   const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setIsUploading(true);
      const uploadData = new FormData();
      uploadData.append('image', file);

      try {
         const res = await fetch(`${API_URL}/api/upload/image`, {
            method: 'POST',
            body: uploadData,
         });

         if (res.ok) {
            const data = await res.json();
            setFormData(prev => ({ ...prev, image: data.url }));
            addToast('Upload Success', 'SKU visual synchronized successfully.');
         } else {
            const err = await res.json();
            addToast('Upload Failed', err.error || 'Check server configuration');
         }
      } catch (error) {
         addToast('Upload Error', 'Connection to upload service failed');
      } finally {
         setIsUploading(false);
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
            comboOffer: formData.comboOffer,
            freeDelivery: formData.freeDelivery,
            variants: variants.map(v => ({
               name: v.name,
               price: v.price ? parseFloat(v.price) : null,
               originalPrice: v.originalPrice ? parseFloat(v.originalPrice) : null,
               stock: parseInt(v.stock?.toString() || '0')
            }))
         };

         const res = await fetch(`${API_URL}/api/products/${productId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
         });

         if (res.ok) {
            addToast('Product Calibration Updated', formData.name);
            router.push('/vendor/products');
         } else {
            const error = await res.json();
            addToast('Calibration Error', error.error || 'Check all required fields');
         }
      } catch (err) {
         addToast('Critical Error', 'Agrarian database synchronization failed');
      } finally {
         setIsLoading(false);
      }
   };

   const hasError = productError || (product && (product as any).error);
   const errorMessage = productError
      ? (productError.info?.error || productError.message || 'Failed to sync with API node')
      : (product && (product as any).error);

   if (hasError) return (
      <div className="flex flex-col items-center justify-center py-40 px-6 bg-[#f8fafc] dark:bg-slate-950 min-h-screen">
         <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl rounded-3xl p-10 max-w-md w-full text-center flex flex-col items-center gap-6">
            <div className="h-16 w-16 rounded-2xl bg-red-50 dark:bg-red-950/20 flex items-center justify-center text-red-500">
               <AlertCircle size={32} className="animate-pulse" />
            </div>
            <div className="space-y-2">
               <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Agrarian Node Sync Error</p>
               <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Calibration Failed</h1>
               <p className="text-sm font-medium text-slate-500 dark:text-slate-400 px-2 mt-2">
                  {errorMessage}
               </p>
            </div>
            <div className="w-full pt-4 border-t border-slate-100 dark:border-slate-800 flex gap-3">
               <button
                  type="button"
                  onClick={() => router.push('/vendor/products')}
                  className="flex-1 h-12 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all active:scale-95"
               >
                  Product List
               </button>
               <button
                  type="button"
                  onClick={() => window.location.reload()}
                  className="flex-1 h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-lg shadow-emerald-500/20 transition-all active:scale-95 uppercase tracking-wider"
               >
                  Retry Node
               </button>
            </div>
         </div>
      </div>
   );

   if (!product && !productError) return (
      <div className="flex flex-col items-center justify-center py-40 gap-6 bg-[#f8fafc] dark:bg-slate-950 min-h-screen">
         <RefreshCw size={48} className="text-emerald-950 dark:text-emerald-500 animate-spin" />
         <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Hydrating Product Details...</p>
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
                        Product Overview
                     </h1>
                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Refining Inventory Integrity for Reseller #{user?.brandId}</p>
                  </div>
               </div>
               <div className="flex items-center gap-3">
                  <button onClick={() => router.back()} className="px-4 py-2 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 transition-all">Discard</button>
                  <button
                     form="product-form"
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

         <form id="product-form" onSubmit={handleSubmit} className="w-full px-8 space-y-10">

            {/* 1. VISUAL ASSETS CARD */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden w-full">
               <SectionHeader title="Product Images" icon={ImageIcon} colorClass="text-emerald-600" />
               <div className="p-8 space-y-8">
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-4">
                     {formData.image && formData.image.trim() !== '' ? (
                        <div className="group relative aspect-square rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-hidden hover:border-emerald-500 transition-all shadow-sm">
                           <img src={formData.image} className="w-full h-full object-cover" alt="Primary visual" />
                           <button type="button" onClick={() => setFormData({ ...formData, image: '' })} className="absolute top-2 right-2 h-6 w-6 rounded-full bg-red-500 text-white flex items-center justify-center shadow-lg hover:scale-110"><X size={12} /></button>
                           <div className="absolute bottom-0 left-0 right-0 bg-emerald-600 text-white text-[8px] font-black uppercase text-center py-1.5 tracking-widest">Primary Hero</div>
                        </div>
                     ) : (
                        <div
                           onClick={() => !isUploading && fileInputRef.current?.click()}
                           className={`aspect-square bg-slate-50 dark:bg-slate-800 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl flex flex-col items-center justify-center gap-2 group cursor-pointer hover:border-emerald-500 hover:bg-emerald-50/30 transition-all ${isUploading ? 'opacity-50 cursor-wait' : ''}`}
                        >
                           <input
                              type="file"
                              ref={fileInputRef}
                              className="hidden"
                              accept="image/*"
                              onChange={handleFileUpload}
                           />
                           {isUploading ? (
                              <Loader2 className="h-6 w-6 text-emerald-600 animate-spin" />
                           ) : (
                              <>
                                 <div className="h-10 w-10 rounded-full bg-white dark:bg-slate-900 shadow-sm flex items-center justify-center text-slate-300 group-hover:text-emerald-500 transition-all">
                                    <Plus size={20} />
                                 </div>
                                 <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 group-hover:text-emerald-600 transition-all">Upload visual</span>
                              </>
                           )}
                        </div>
                     )}
                  </div>

                  <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
                     <InputWrapper label="Primary Image URL">
                        <input
                           type="text"
                           placeholder="Paste direct image link here..."
                           className="w-full h-14 px-6 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:border-emerald-500 focus:ring-4 ring-emerald-500/5 outline-none font-bold text-slate-950 dark:text-white text-sm transition-all"
                           value={formData.image}
                           onChange={e => setFormData({ ...formData, image: e.target.value })}
                        />
                     </InputWrapper>
                  </div>
               </div>
            </div>

            {/* 2. Product Details CARD */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden w-full">
               <SectionHeader title="Product Details" icon={Tag} colorClass="text-slate-900 dark:text-white" />
               <div className="p-8 space-y-8">
                  <InputWrapper label="Product Name">
                     <input
                        required
                        type="text"
                        placeholder="e.g. Traditional Foxtail Millet"
                        className="w-full h-14 px-6 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:border-emerald-500 focus:ring-4 ring-emerald-500/5 outline-none font-bold text-slate-950 dark:text-white text-sm transition-all"
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                     />
                  </InputWrapper>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     <InputWrapper label="Market Category">
                        <div className="relative">
                           <select
                              required
                              className="w-full h-14 px-6 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:border-emerald-500 outline-none font-bold text-sm appearance-none text-slate-950 dark:text-white"
                              value={formData.categoryId}
                              onChange={e => setFormData({ ...formData, categoryId: e.target.value })}
                           >
                              <option value="">Select Category</option>
                              {((Array.isArray(categories) ? categories : (categories as any)?.categories) || [])?.map((cat: any) => (
                                 <option key={cat.id} value={cat.id}>{cat.name}</option>
                              ))}
                           </select>
                           <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" size={16} />
                        </div>
                     </InputWrapper>

                     <div className="grid grid-cols-2 gap-4">
                        <InputWrapper label="Selling Price (INR)">
                           <input
                              required
                              type="number"
                              placeholder="₹ Offer Price"
                              className="w-full h-14 px-6 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:border-emerald-500 outline-none font-black text-emerald-600 text-sm"
                              value={formData.price}
                              onChange={e => setFormData({ ...formData, price: e.target.value })}
                           />
                        </InputWrapper>
                        <InputWrapper label="MRP">
                           <input
                              type="number"
                              placeholder="₹ MRP"
                              className="w-full h-14 px-6 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:border-emerald-500 outline-none font-black text-slate-300 text-sm"
                              value={formData.originalPrice}
                              onChange={e => setFormData({ ...formData, originalPrice: e.target.value })}
                           />
                        </InputWrapper>
                     </div>
                  </div>

                  <InputWrapper label="Historical Narrative (Description)">
                     <textarea
                        required
                        rows={4}
                        placeholder="Describe the heritage, taste profile, and Product method..."
                        className="w-full px-6 py-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:border-emerald-500 outline-none font-bold text-slate-600 dark:text-slate-300 text-sm resize-none"
                        value={formData.description}
                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                     />
                  </InputWrapper>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     <InputWrapper label="Combo Offer text (e.g. Buy 2 get 10% OFF)">
                        <input
                           type="text"
                           placeholder="Leave empty for default"
                           className="w-full h-14 px-6 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:border-emerald-500 outline-none font-bold text-slate-600 dark:text-slate-300 text-sm"
                           value={formData.comboOffer}
                           onChange={e => setFormData({ ...formData, comboOffer: e.target.value })}
                        />
                     </InputWrapper>
                     <InputWrapper label="Free Delivery text (e.g. Orders above ₹499)">
                        <input
                           type="text"
                           placeholder="Leave empty for default"
                           className="w-full h-14 px-6 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:border-emerald-500 outline-none font-bold text-slate-600 dark:text-slate-300 text-sm"
                           value={formData.freeDelivery}
                           onChange={e => setFormData({ ...formData, freeDelivery: e.target.value })}
                        />
                     </InputWrapper>
                  </div>

                  <InputWrapper label="Attribution Tags">
                     <div className="space-y-4">
                        <div className="flex flex-wrap gap-2">
                           {formData.tags.map(tag => (
                              <span key={tag} className="px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                                 {tag}
                                 <button type="button" onClick={() => setFormData({ ...formData, tags: formData.tags.filter(t => t !== tag) })} className="hover:text-red-500 font-bold">×</button>
                              </span>
                           ))}
                        </div>
                        <div className="flex gap-2">
                           <input
                              placeholder="Add a search tag (e.g. Organic, Heritage)..."
                              className="flex-1 h-12 px-5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 outline-none font-bold text-xs"
                              value={formData.newTag}
                              onChange={e => setFormData({ ...formData, newTag: e.target.value })}
                              onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                           />
                           <button
                              type="button"
                              onClick={handleAddTag}
                              className="h-12 w-12 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 flex items-center justify-center transition-all font-black text-slate-800 dark:text-white"
                           >
                              <Plus size={18} strokeWidth={3} />
                           </button>
                        </div>
                     </div>
                  </InputWrapper>
               </div>
            </div>
         </form>
      </div>
   );
}
