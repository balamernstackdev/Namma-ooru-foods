'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
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
   AlertCircle,
   Package,
   Sparkles,
   ChevronUp
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
         <label className="text-[11px] font-black text-[#6B7280] uppercase tracking-wider">
            {label}
         </label>
         {helpText && (
            <div className="group relative">
               <HelpCircle size={14} className="text-slate-355 cursor-help hover:text-[#0F7A4D] transition-all shadow-sm" />
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
      subcategoryId: '',
      image: '',
      tags: [] as string[],
      newTag: '',
      inventoryMode: 'SINGLE',
      weight: '',
      unit: 'g',
      stock: '0',
      sku: '',
      variants: [] as { id?: number; name: string; price: string; originalPrice: string; stock: string; sku: string; weight: string; unit: string; barcode: string }[],
      comboOffer: '',
      freeDelivery: '',
      productHighlights: [] as { title: string; description: string; sortOrder: number; isActive: boolean }[]
   });

   const [isHydrated, setIsHydrated] = useState(false);

   // Hydration
   const { data: product, error: productError } = useSWR(productId ? `${API_URL}/api/products/${productId}` : null, fetcher);
   const { data: categoriesRes } = useSWR(`${API_URL}/api/categories?all=true&limit=1000`, fetcher);
   const categories = categoriesRes?.categories || [];

   const { data: subcategoriesRes } = useSWR(
      formData.categoryId ? `${API_URL}/api/subcategories?categoryId=${formData.categoryId}&limit=100` : null,
      fetcher
   );
   const dbSubcategories = subcategoriesRes?.subcategories || [];

   const subcategories = useMemo(() => {
      if (!formData.categoryId) return [];
      if (dbSubcategories.length > 0) return dbSubcategories;
      return categories.filter((c: any) => c.parentId === Number(formData.categoryId));
   }, [dbSubcategories, categories, formData.categoryId]);

   useEffect(() => {
      if (product && !product.error && !isHydrated && categories.length > 0) {
         let uiCategoryId = product.categoryId?.toString() || '';
         let uiSubcategoryId = product.subcategoryId?.toString() || '';

         // Fallback for legacy products that stored subcategory directly in categoryId
         if (!uiSubcategoryId) {
            const catRecord = categories.find((c: any) => c.id === product.categoryId);
            if (catRecord && catRecord.parentId) {
               uiCategoryId = catRecord.parentId.toString();
               uiSubcategoryId = catRecord.id.toString();
            }
         }

         setFormData({
            name: product.name,
            description: product.description || '',
            price: product.price?.toString() || '',
            originalPrice: product.originalPrice?.toString() || '',
            categoryId: uiCategoryId,
            subcategoryId: uiSubcategoryId,
            image: product.image || '',
            tags: product.tags || [],
            newTag: '',
            inventoryMode: product.inventoryMode || 'SINGLE',
            weight: product.weight?.toString() || '',
            unit: product.unit || 'g',
            stock: product.stock?.toString() || '0',
            sku: product.sku || '',
            variants: product.variants?.map((v: any) => ({
               id: v.id,
               name: v.name,
               price: v.price?.toString() || '',
               originalPrice: v.originalPrice?.toString() || '',
               stock: v.stock?.toString() || '0',
               sku: v.sku || '',
               weight: v.weight?.toString() || '',
               unit: v.unit || 'g',
               barcode: v.barcode || ''
            })) || [],
            productHighlights: product.productHighlights ? product.productHighlights.map((h: any) => ({
               title: h.title,
               description: h.description,
               sortOrder: h.sortOrder,
               isActive: h.isActive
            })) : [],
            comboOffer: product.comboOffer || '',
            freeDelivery: product.freeDelivery || ''
         });
         setIsHydrated(true);
      }
   }, [product, categories, isHydrated]);

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
            categoryId: parseInt(formData.categoryId),
            subcategoryId: formData.subcategoryId ? parseInt(formData.subcategoryId) : null,
            price: formData.inventoryMode === 'SINGLE' && formData.price ? parseFloat(formData.price) : null,
            originalPrice: formData.inventoryMode === 'SINGLE' && formData.originalPrice ? parseFloat(formData.originalPrice) : null,
            brandId: user.brandId,
            comboOffer: formData.comboOffer,
            freeDelivery: formData.freeDelivery,
            inventoryMode: formData.inventoryMode,
            productHighlights: formData.productHighlights.map((h: any, idx: number) => ({
               title: h.title,
               description: h.description,
               sortOrder: h.sortOrder !== undefined ? h.sortOrder : idx,
               isActive: h.isActive !== undefined ? h.isActive : true
            })),
            weight: formData.inventoryMode === 'SINGLE' && formData.weight ? parseFloat(formData.weight) : null,
            unit: formData.inventoryMode === 'SINGLE' ? formData.unit : null,
            stock: formData.inventoryMode === 'SINGLE' && formData.stock ? parseInt(formData.stock) : 0,
            sku: formData.inventoryMode === 'SINGLE' ? formData.sku : null,
            variants: formData.inventoryMode === 'MULTIPLE' ? formData.variants.map(v => ({
               id: v.id,
               name: v.name,
               price: v.price ? parseFloat(v.price) : null,
               originalPrice: v.originalPrice ? parseFloat(v.originalPrice) : null,
               stock: parseInt(v.stock?.toString() || '0'),
               sku: v.sku,
               weight: v.weight ? parseFloat(v.weight) : null,
               unit: v.unit || null,
               barcode: v.barcode
            })) : []
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
      <div className="flex flex-col items-center justify-center py-40 px-6 bg-[#F8FAF7] min-h-screen">
         <div className="bg-white border border-[#E5E7EB] shadow-xl rounded-[20px] p-10 max-w-md w-full text-center flex flex-col items-center gap-6">
            <div className="h-16 w-16 rounded-2xl bg-red-50 flex items-center justify-center text-red-500">
               <AlertCircle size={32} className="animate-pulse" />
            </div>
            <div className="space-y-2">
               <p className="text-[10px] font-black uppercase tracking-widest text-[#6B7280]">Agrarian Node Sync Error</p>
               <h1 className="text-2xl font-black text-[#111827] tracking-tight">Calibration Failed</h1>
               <p className="text-sm font-medium text-[#6B7280] px-2 mt-2">
                  {errorMessage}
               </p>
            </div>
            <div className="w-full pt-4 border-t border-[#E5E7EB] flex gap-3">
               <button
                  type="button"
                  onClick={() => router.push('/vendor/products')}
                  className="flex-1 h-12 rounded-xl border border-[#E5E7EB] text-[#6B7280] text-xs font-bold hover:bg-slate-50 transition-all active:scale-95"
               >
                  Product List
               </button>
               <button
                  type="button"
                  onClick={() => window.location.reload()}
                  className="flex-1 h-12 rounded-xl bg-[#0F7A4D] hover:bg-[#0c623d] text-white text-xs font-black shadow-lg transition-all active:scale-95 uppercase tracking-wider"
               >
                  Retry Node
               </button>
            </div>
         </div>
      </div>
   );

   if (!product && !productError) return (
      <div className="flex flex-col items-center justify-center py-40 gap-6 bg-[#F8FAF7] min-h-screen">
         <RefreshCw size={48} className="text-[#0F7A4D] animate-spin" />
         <p className="text-[10px] font-black uppercase tracking-widest text-[#6B7280]">Hydrating Product Details...</p>
      </div>
   );

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
                        Product Overview
                     </h1>
                     <p className="text-[10px] font-bold text-[#6B7280] uppercase tracking-widest mt-0.5">Refining Inventory Integrity for Reseller #{user?.brandId}</p>
                  </div>
               </div>
               <div className="flex items-center gap-3">
                  <button onClick={() => router.back()} type="button" className="px-4 py-2 rounded-lg text-xs font-bold text-[#6B7280] hover:bg-slate-100 transition-all">Discard</button>
                  <button
                     form="product-form"
                     type="submit"
                     disabled={isLoading}
                     className="px-6 py-2.5 rounded-lg bg-[#0F7A4D] hover:bg-[#0c623d] text-white text-xs font-black flex items-center gap-2 shadow-sm disabled:opacity-50 transition-all active:scale-95 uppercase tracking-wider"
                  >
                     <Save size={14} />
                     {isLoading ? 'Calibrating...' : 'Save Changes'}
                  </button>
               </div>
            </div>
         </div>

         <form id="product-form" onSubmit={handleSubmit} className="w-full px-8 space-y-10">

            {/* 1. VISUAL ASSETS CARD */}
            <div className="bg-white rounded-[20px] border border-[#E5E7EB] shadow-[0_4px_12px_rgba(0,0,0,0.05)] overflow-hidden w-full">
               <SectionHeader title="Product Images" icon={ImageIcon} colorClass="text-[#0F7A4D]" />
               <div className="p-8 space-y-8">
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-4">
                     {formData.image && formData.image.trim() !== '' ? (
                        <div className="group relative aspect-square rounded-xl bg-[#F8FAF7] border border-[#E5E7EB] overflow-hidden hover:border-[#0F7A4D] transition-all shadow-sm">
                           <img src={formData.image} className="w-full h-full object-cover" alt="Primary visual" />
                           <button type="button" onClick={() => setFormData({ ...formData, image: '' })} className="absolute top-2 right-2 h-6 w-6 rounded-full bg-red-500 text-white flex items-center justify-center shadow-lg hover:scale-110"><X size={12} /></button>
                           <div className="absolute bottom-0 left-0 right-0 bg-[#0F7A4D] text-white text-[8px] font-black uppercase text-center py-1.5 tracking-widest">Primary Hero</div>
                        </div>
                     ) : (
                        <div
                           onClick={() => !isUploading && fileInputRef.current?.click()}
                           className={`aspect-square bg-[#F8FAF7] border-2 border-dashed border-[#E5E7EB] rounded-xl flex flex-col items-center justify-center gap-2 group cursor-pointer hover:border-[#0F7A4D] hover:bg-[#DCFCE7]/30 transition-all ${isUploading ? 'opacity-50 cursor-wait' : ''}`}
                        >
                           <input
                              type="file"
                              ref={fileInputRef}
                              className="hidden"
                              accept="image/*"
                              onChange={handleFileUpload}
                           />
                           {isUploading ? (
                              <Loader2 className="h-6 w-6 text-[#0F7A4D] animate-spin" />
                           ) : (
                              <>
                                 <div className="h-10 w-10 rounded-full bg-white shadow-sm flex items-center justify-center text-slate-355 group-hover:text-[#0F7A4D] transition-all">
                                    <Plus size={20} />
                                 </div>
                                 <span className="text-[9px] font-black uppercase tracking-widest text-[#6B7280] group-hover:text-[#0F7A4D] transition-all">Upload visual</span>
                              </>
                           )}
                        </div>
                     )}
                  </div>

                  <div className="pt-6 border-t border-[#E5E7EB]">
                     <InputWrapper label="Primary Image URL">
                        <input
                           type="text"
                           placeholder="Paste direct image link here..."
                           className="w-full h-14 px-6 rounded-xl border border-[#E5E7EB] bg-white focus:border-[#0F7A4D] focus:ring-4 focus:ring-[#0F7A4D]/5 outline-none font-bold text-[#111827] text-sm transition-all"
                           value={formData.image}
                           onChange={e => setFormData({ ...formData, image: e.target.value })}
                        />
                     </InputWrapper>
                  </div>
               </div>
            </div>

            {/* 2. Product Details CARD */}
            <div className="bg-white rounded-[20px] border border-[#E5E7EB] shadow-[0_4px_12px_rgba(0,0,0,0.05)] overflow-hidden w-full">
               <SectionHeader title="Product Details" icon={Tag} colorClass="text-[#0F7A4D]" />
               <div className="p-8 space-y-8">
                  <InputWrapper label="Product Name">
                     <input
                        required
                        type="text"
                        placeholder="e.g. Traditional Foxtail Millet"
                        className="w-full h-14 px-6 rounded-xl border border-[#E5E7EB] bg-white focus:border-[#0F7A4D] focus:ring-4 focus:ring-[#0F7A4D]/5 outline-none font-bold text-[#111827] text-sm transition-all"
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                     />
                  </InputWrapper>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     <InputWrapper label="Market Category">
                        <div className="relative">
                           <select
                              required
                              className="w-full h-14 px-6 rounded-xl border border-[#E5E7EB] bg-white focus:border-[#0F7A4D] outline-none font-bold text-sm appearance-none text-[#111827] focus:ring-4 focus:ring-[#0F7A4D]/5"
                              value={formData.categoryId}
                              onChange={e => setFormData({ ...formData, categoryId: e.target.value, subcategoryId: '' })}
                           >
                              <option value="">Select Category</option>
                              {categories.filter((c: any) => !c.parentId).map((cat: any) => (
                                 <option key={cat.id} value={cat.id}>{cat.name}</option>
                              ))}
                           </select>
                           <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                        </div>
                     </InputWrapper>

                     <InputWrapper label="Subcategory">
                        <div className="relative">
                           <select
                              className="w-full h-14 px-6 rounded-xl border border-[#E5E7EB] bg-white focus:border-[#0F7A4D] outline-none font-bold text-sm appearance-none text-[#111827] disabled:opacity-50 focus:ring-4 focus:ring-[#0F7A4D]/5"
                              value={formData.subcategoryId}
                              onChange={e => setFormData({ ...formData, subcategoryId: e.target.value })}
                              disabled={!formData.categoryId}
                           >
                              <option value="">Select Subcategory</option>
                              {subcategories.map((cat: any) => (
                                 <option key={cat.id} value={cat.id}>{cat.name}</option>
                              ))}
                           </select>
                           <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                        </div>
                     </InputWrapper>
                  </div>

                  {/* INVENTORY MODE SELECTOR */}
                  <div className="border-t border-[#E5E7EB] pt-6 mt-6">
                     <label className="text-[11px] font-black text-[#6B7280] uppercase tracking-wider mb-4 block">Variants </label>
                     <div className="flex gap-4">
                        <label className={`flex-1 flex items-center justify-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${formData.inventoryMode === 'SINGLE' ? 'border-[#0F7A4D] bg-[#DCFCE7]/30 text-[#0c623d]' : 'border-[#E5E7EB] bg-[#F8FAF7] text-[#6B7280] hover:bg-white'}`}>
                           <input type="radio" name="inventoryMode" className="hidden" checked={formData.inventoryMode === 'SINGLE'} onChange={() => setFormData({ ...formData, inventoryMode: 'SINGLE' })} />
                           <Package size={18} />
                           <span className="text-sm font-bold">Single Product (Base Inventory)</span>
                        </label>
                        <label className={`flex-1 flex items-center justify-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${formData.inventoryMode === 'MULTIPLE' ? 'border-[#0F7A4D] bg-[#DCFCE7]/30 text-[#0c623d]' : 'border-[#E5E7EB] bg-[#F8FAF7] text-[#6B7280] hover:bg-white'}`}>
                           <input type="radio" name="inventoryMode" className="hidden" checked={formData.inventoryMode === 'MULTIPLE'} onChange={() => setFormData({ ...formData, inventoryMode: 'MULTIPLE' })} />
                           <Layers size={18} />
                           <span className="text-sm font-bold">Multiple Variants (Variant Inventory)</span>
                        </label>
                     </div>
                  </div>

                  {formData.inventoryMode === 'SINGLE' && (
                     <>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
                           <InputWrapper label="Weight">
                              <input type="number" step="any" className="w-full h-14 px-6 rounded-xl border border-[#E5E7EB] bg-white focus:border-[#0F7A4D] focus:ring-4 focus:ring-[#0F7A4D]/5 outline-none font-bold text-sm" value={formData.weight} onChange={e => setFormData({ ...formData, weight: e.target.value })} />
                           </InputWrapper>
                           <InputWrapper label="Unit">
                              <select className="w-full h-14 px-6 rounded-xl border border-[#E5E7EB] bg-white focus:border-[#0F7A4D] outline-none font-bold text-sm" value={formData.unit} onChange={e => setFormData({ ...formData, unit: e.target.value })} >
                                 <option value="g">g (Grams)</option>
                                 <option value="kg">kg (Kilograms)</option>
                                 <option value="ml">ml (Milliliters)</option>
                                 <option value="l">l (Liters)</option>
                                 <option value="pcs">pcs (Pieces)</option>
                                 <option value="pack">pack (Pack)</option>
                              </select>
                           </InputWrapper>
                           <InputWrapper label="Base Stock">
                              <input type="number" className="w-full h-14 px-6 rounded-xl border border-[#E5E7EB] bg-white focus:border-[#0F7A4D] focus:ring-4 focus:ring-[#0F7A4D]/5 outline-none font-bold text-sm" value={formData.stock} onChange={e => setFormData({ ...formData, stock: e.target.value })} />
                           </InputWrapper>
                           <InputWrapper label="SKU">
                              <input type="text" className="w-full h-14 px-6 rounded-xl border border-[#E5E7EB] bg-white focus:border-[#0F7A4D] focus:ring-4 focus:ring-[#0F7A4D]/5 outline-none font-bold text-sm uppercase" value={formData.sku} onChange={e => setFormData({ ...formData, sku: e.target.value })} />
                           </InputWrapper>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                           <div className="flex gap-4">
                              <InputWrapper label="Selling Price (INR)">
                                 <input
                                    required={formData.inventoryMode === 'SINGLE'}
                                    type="number"
                                    placeholder="₹ Offer Price"
                                    className="w-full h-14 px-6 rounded-xl border border-[#E5E7EB] bg-white focus:border-[#0F7A4D] focus:ring-4 focus:ring-[#0F7A4D]/5 outline-none font-black text-[#0F7A4D] text-sm"
                                    value={formData.price}
                                    onChange={e => setFormData({ ...formData, price: e.target.value })}
                                 />
                              </InputWrapper>
                              <InputWrapper label="MRP">
                                 <input
                                    type="number"
                                    placeholder="₹ MRP"
                                    className="w-full h-14 px-6 rounded-xl border border-[#E5E7EB] bg-white focus:border-[#0F7A4D] focus:ring-4 focus:ring-[#0F7A4D]/5 outline-none font-black text-[#6B7280] text-sm"
                                    value={formData.originalPrice}
                                    onChange={e => setFormData({ ...formData, originalPrice: e.target.value })}
                                 />
                              </InputWrapper>
                           </div>
                        </div>
                     </>
                  )}

                  <InputWrapper label="Historical Narrative (Description)">
                     <textarea
                        required
                        rows={4}
                        placeholder="Describe the heritage, taste profile, and Product method..."
                        className="w-full px-6 py-4 rounded-xl border border-[#E5E7EB] bg-white focus:border-[#0F7A4D] focus:ring-4 focus:ring-[#0F7A4D]/5 outline-none font-bold text-[#6B7280] text-sm resize-none"
                        value={formData.description}
                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                     />
                  </InputWrapper>



                  <InputWrapper label="Attribution Tags">
                     <div className="space-y-4">
                        <div className="flex flex-wrap gap-2">
                           {formData.tags.map(tag => (
                              <span key={tag} className="px-3 py-1.5 rounded-lg bg-[#DCFCE7] text-[#15803D] text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                                 {tag}
                                 <button type="button" onClick={() => setFormData({ ...formData, tags: formData.tags.filter(t => t !== tag) })} className="hover:text-red-500 font-bold">×</button>
                              </span>
                           ))}
                        </div>
                        <div className="flex gap-2">
                           <input
                              placeholder="Add a search tag (e.g. Organic, Heritage)..."
                              className="flex-1 h-12 px-5 rounded-xl border border-[#E5E7EB] bg-white focus:border-[#0F7A4D] focus:ring-4 focus:ring-[#0F7A4D]/5 outline-none font-bold text-xs"
                              value={formData.newTag}
                              onChange={e => setFormData({ ...formData, newTag: e.target.value })}
                              onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                           />
                           <button
                              type="button"
                              onClick={handleAddTag}
                              className="h-12 w-12 rounded-xl bg-slate-105 hover:bg-slate-200 flex items-center justify-center transition-all font-black text-slate-800"
                           >
                              <Plus size={18} strokeWidth={3} />
                           </button>
                        </div>
                     </div>
                  </InputWrapper>
               </div>
            </div>

            {/* 3. VARIANT MANAGER */}
            {formData.inventoryMode === 'MULTIPLE' && (
               <div className="bg-white rounded-[20px] border border-[#E5E7EB] shadow-[0_4px_12px_rgba(0,0,0,0.05)] overflow-hidden w-full">
                  <div className="px-6 py-5 border-b border-[#E5E7EB] bg-[#F8FAF7] flex items-center justify-between">
                     <div className="flex items-center gap-3">
                        <Layers size={16} className="text-[#0F7A4D]" />
                        <h3 className="text-[10px] font-black text-[#111827] uppercase tracking-widest">Variant & Inventory Manager</h3>
                     </div>
                     <button type="button" onClick={() => setFormData({ ...formData, variants: [...formData.variants, { name: '', price: '', originalPrice: '', stock: '0', sku: '', weight: '', unit: 'g', barcode: '' }] })} className="px-3 py-1.5 rounded-lg bg-[#0F7A4D] text-white text-[10px] font-black uppercase tracking-widest hover:bg-[#0c623d] transition-all shadow-sm">+ Add Variant</button>
                  </div>
                  <div className="p-6 space-y-4">
                     {formData.variants.length === 0 ? (
                        <div className="text-center py-8 text-[#6B7280] text-sm font-medium border-2 border-dashed border-[#E5E7EB] rounded-xl bg-[#F8FAF7]/50">No variants added. The product will use the base price.</div>
                     ) : (
                        <div className="overflow-x-auto">
                           <table className="w-full text-left border-collapse min-w-[800px] min-w-[1200px] admin-data-table">
                              <thead>
                                 <tr className="border-b border-[#E5E7EB] text-[10px] font-black text-[#6B7280] uppercase tracking-widest">
                                    <th className="pb-3 font-black">Variant Name <span className="font-medium normal-case text-slate-400">(e.g. 500g)</span></th>
                                    <th className="pb-3 font-black">Selling Price</th>
                                    <th className="pb-3 font-black">MRP</th>
                                    <th className="pb-3 font-black">Weight / Unit</th>
                                    <th className="pb-3 font-black">Stock</th>
                                    <th className="pb-3 font-black">SKU <span className="font-medium normal-case text-slate-400">(Optional)</span></th>
                                    <th className="pb-3 font-black text-right">Actions</th>
                                 </tr>
                              </thead>
                              <tbody className="divide-y divide-[#E5E7EB]">
                                 {formData.variants.map((variant: any, idx: number) => (
                                    <tr key={idx} className="group">
                                       <td className="py-3 pr-2"><input type="text" className="w-full h-11 px-4 rounded-xl border border-[#E5E7EB] bg-white text-sm font-bold outline-none focus:border-[#0F7A4D] transition-colors focus:ring-4 focus:ring-[#0F7A4D]/5" placeholder="Variant name" value={variant.name} onChange={e => { const newV = [...formData.variants]; newV[idx].name = e.target.value; setFormData({ ...formData, variants: newV }); }} /></td>
                                       <td className="py-3 pr-2"><input type="number" className="w-full h-11 px-4 rounded-xl border border-[#E5E7EB] bg-white text-sm font-bold outline-none focus:border-[#0F7A4D] transition-colors text-[#0F7A4D] font-black focus:ring-4 focus:ring-[#0F7A4D]/5" placeholder="Price" value={variant.price} onChange={e => { const newV = [...formData.variants]; newV[idx].price = e.target.value; setFormData({ ...formData, variants: newV }); }} /></td>
                                       <td className="py-3 pr-2"><input type="number" className="w-full h-11 px-4 rounded-xl border border-[#E5E7EB] bg-white text-sm font-bold outline-none focus:border-[#0F7A4D] transition-colors text-[#6B7280] focus:ring-4 focus:ring-[#0F7A4D]/5" placeholder="MRP" value={variant.originalPrice} onChange={e => { const newV = [...formData.variants]; newV[idx].originalPrice = e.target.value; setFormData({ ...formData, variants: newV }); }} /></td>
                                       <td className="py-3 pr-2">
                                          <div className="flex gap-2">
                                             <input type="number" step="any" className="w-1/2 h-11 px-3 rounded-xl border border-[#E5E7EB] bg-white text-sm font-bold outline-none focus:border-[#0F7A4D] transition-colors" placeholder="Wt" value={variant.weight} onChange={e => { const newV = [...formData.variants]; newV[idx].weight = e.target.value; setFormData({ ...formData, variants: newV }); }} />
                                             <select className="w-1/2 h-11 px-2 rounded-xl border border-[#E5E7EB] bg-white text-sm font-bold outline-none focus:border-[#0F7A4D] transition-colors" value={variant.unit} onChange={e => { const newV = [...formData.variants]; newV[idx].unit = e.target.value; setFormData({ ...formData, variants: newV }); }}>
                                                <option value="g">g</option><option value="kg">kg</option><option value="ml">ml</option><option value="l">l</option><option value="pcs">pcs</option><option value="pack">pack</option>
                                             </select>
                                          </div>
                                       </td>
                                       <td className="py-3 pr-2"><input type="number" className="w-full h-11 px-4 rounded-xl border border-[#E5E7EB] bg-white text-sm font-bold outline-none focus:border-[#0F7A4D] transition-colors focus:ring-4 focus:ring-[#0F7A4D]/5" placeholder="Stock" value={variant.stock} onChange={e => { const newV = [...formData.variants]; newV[idx].stock = e.target.value; setFormData({ ...formData, variants: newV }); }} /></td>
                                       <td className="py-3 pr-2"><input type="text" className="w-full h-11 px-4 rounded-xl border border-[#E5E7EB] bg-white text-sm font-bold outline-none focus:border-[#0F7A4D] transition-colors uppercase focus:ring-4 focus:ring-[#0F7A4D]/5" placeholder="SKU" value={variant.sku} onChange={e => { const newV = [...formData.variants]; newV[idx].sku = e.target.value; setFormData({ ...formData, variants: newV }); }} /></td>
                                       <td className="py-3 text-right"><button type="button" onClick={() => { const newV = [...formData.variants]; newV.splice(idx, 1); setFormData({ ...formData, variants: newV }); }} className="h-11 w-11 inline-flex items-center justify-center rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all"><Trash2 size={16} /></button></td>
                                    </tr>
                                 ))}
                              </tbody>
                           </table>
                        </div>
                     )}
                  </div>
               </div>
            )}

            {/* 3.5. PRODUCT HIGHLIGHTS */}
            <div className="bg-white rounded-[20px] border border-[#E5E7EB] shadow-[0_4px_12px_rgba(0,0,0,0.05)] overflow-hidden w-full">
               <div className="px-6 py-5 border-b border-[#E5E7EB] bg-[#F8FAF7] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                     <Sparkles size={16} className="text-[#0F7A4D]" />
                     <div>
                        <h3 className="text-[10px] font-black text-[#111827] uppercase tracking-widest">Product Highlights</h3>
                        <p className="text-[9px] text-[#6B7280] font-semibold mt-0.5">Add key features shown as highlight cards on the product page</p>
                     </div>
                  </div>
                  <button
                     type="button"
                     onClick={() => setFormData(prev => ({
                        ...prev,
                        productHighlights: [
                           ...prev.productHighlights,
                           { title: '', description: '', sortOrder: prev.productHighlights.length, isActive: true }
                        ]
                     }))}
                     className="px-3 py-1.5 rounded-lg bg-[#0F7A4D] text-white text-[10px] font-black uppercase tracking-widest hover:bg-[#0c623d] transition-all shadow-sm"
                  >
                     + Add Highlight
                  </button>
               </div>
               <div className="p-6">
                  {formData.productHighlights.length === 0 ? (
                     <div className="text-center py-8 text-[#6B7280] text-sm font-medium border-2 border-dashed border-[#E5E7EB] rounded-xl bg-[#F8FAF7]/50">
                        <Sparkles size={24} className="mx-auto mb-2 text-[#D1D5DB]" />
                        No highlights added yet. Click "+ Add Highlight" to start.
                     </div>
                  ) : (
                     <div className="space-y-4">
                        {formData.productHighlights.map((h: any, idx: number) => (
                           <div key={idx} className="flex items-start gap-4 p-4 bg-[#F9FAFB] rounded-xl border border-[#E5E7EB] group">
                              <div className="flex flex-col items-center gap-1.5 pt-1 shrink-0">
                                 <button type="button" disabled={idx === 0} onClick={() => {
                                    const arr = [...formData.productHighlights];
                                    [arr[idx - 1], arr[idx]] = [arr[idx], arr[idx - 1]];
                                    setFormData(prev => ({ ...prev, productHighlights: arr.map((x, i) => ({ ...x, sortOrder: i })) }));
                                 }} className="h-6 w-6 rounded-lg bg-white border border-[#E5E7EB] flex items-center justify-center text-[#9CA3AF] hover:text-[#0F7A4D] disabled:opacity-30 transition-all">
                                    <ChevronUp size={12} />
                                 </button>
                                 <span className="text-[9px] font-black text-[#9CA3AF]">{idx + 1}</span>
                                 <button type="button" disabled={idx === formData.productHighlights.length - 1} onClick={() => {
                                    const arr = [...formData.productHighlights];
                                    [arr[idx + 1], arr[idx]] = [arr[idx], arr[idx + 1]];
                                    setFormData(prev => ({ ...prev, productHighlights: arr.map((x, i) => ({ ...x, sortOrder: i })) }));
                                 }} className="h-6 w-6 rounded-lg bg-white border border-[#E5E7EB] flex items-center justify-center text-[#9CA3AF] hover:text-[#0F7A4D] disabled:opacity-30 transition-all">
                                    <ChevronDown size={12} />
                                 </button>
                              </div>
                              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                                 <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-[#6B7280] uppercase tracking-wider">Title <span className="text-red-400">*</span></label>
                                    <input
                                       type="text"
                                       placeholder="e.g. 100% Organic"
                                       value={h.title}
                                       onChange={e => {
                                          const arr = [...formData.productHighlights];
                                          arr[idx] = { ...arr[idx], title: e.target.value };
                                          setFormData(prev => ({ ...prev, productHighlights: arr }));
                                       }}
                                       className="w-full h-12 px-4 rounded-xl border border-[#E5E7EB] focus:border-[#0F7A4D] outline-none font-bold text-sm transition-colors focus:ring-4 focus:ring-[#0F7A4D]/5"
                                    />
                                 </div>
                                 <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-[#6B7280] uppercase tracking-wider">Description <span className="text-red-400">*</span></label>
                                    <input
                                       type="text"
                                       placeholder="e.g. Zero chemicals and pesticides"
                                       value={h.description}
                                       onChange={e => {
                                          const arr = [...formData.productHighlights];
                                          arr[idx] = { ...arr[idx], description: e.target.value };
                                          setFormData(prev => ({ ...prev, productHighlights: arr }));
                                       }}
                                       className="w-full h-12 px-4 rounded-xl border border-[#E5E7EB] focus:border-[#0F7A4D] outline-none font-bold text-sm transition-colors focus:ring-4 focus:ring-[#0F7A4D]/5"
                                    />
                                 </div>
                              </div>
                              <div className="flex flex-col items-center gap-2 shrink-0">
                                 <button
                                    type="button"
                                    onClick={() => {
                                       const arr = formData.productHighlights.filter((_: any, i: number) => i !== idx);
                                       setFormData(prev => ({ ...prev, productHighlights: arr.map((x: any, i: number) => ({ ...x, sortOrder: i })) }));
                                    }}
                                    className="h-10 w-10 mt-5 inline-flex items-center justify-center rounded-xl text-[#9CA3AF] hover:text-red-500 hover:bg-red-50 transition-all border border-[#E5E7EB] hover:border-red-100 bg-white"
                                 >
                                    <Trash2 size={16} />
                                 </button>
                              </div>
                           </div>
                        ))}
                     </div>
                  )}
               </div>
            </div>
         </form>
      </div>
   );
}
