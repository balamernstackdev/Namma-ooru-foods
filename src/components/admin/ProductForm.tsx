'use client'
import React, { useState, useRef } from 'react';
import { ArrowLeft, ChevronRight, Save, Upload, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

import useSWR from 'swr';
import { useToast } from '@/context/ToastContext';
import { API_URL } from '@/lib/api';

interface ProductFormProps {
   initialData?: any;
   mode: 'create' | 'edit';
}

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function ProductForm({ initialData, mode }: ProductFormProps) {
   const router = useRouter();
   const { addToast } = useToast();
   const [isLoading, setIsLoading] = useState(false);
   const [isUploading, setIsUploading] = useState(false);
   const fileInputRef = useRef<HTMLInputElement>(null);

   const [formData, setFormData] = useState({
      name: initialData?.name || '',
      categoryId: initialData?.categoryId?.toString() || '',
      description: initialData?.description || '',
      image: initialData?.image || ''
   });

   const { data: categories } = useSWR(`${API_URL}/api/categories`, fetcher);

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
            addToast('Upload Success', 'Identity asset synchronized.');
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

   const handleSave = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsLoading(true);
      try {
         const url = mode === 'edit' 
            ? `${API_URL}/api/products/${initialData.id}`
            : `${API_URL}/api/products`;
         
         const res = await fetch(url, {
            method: mode === 'edit' ? 'PUT' : 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
               ...formData,
               categoryId: parseInt(formData.categoryId),
               variants: []
            })
         });

         if (res.ok) {
            addToast('Synchronized Successfully', formData.name);
            router.push('/admin/products');
         } else {
            addToast('Sync Error', 'Failed to update global registry');
         }
      } catch (err) {
         addToast('Critical Error', 'Connectivity to agrarian node lost');
      } finally {
         setIsLoading(false);
      }
   };

   return (
      <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
         {/* Navigation Header */}
         <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
               <button 
                 onClick={() => router.push('/admin/products')}
                 className="h-14 w-14 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-[var(--admin-sidebar)] hover:bg-slate-50 transition-all shadow-sm"
               >
                  <ArrowLeft size={24} />
               </button>
               <div className="flex flex-col">
                  <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 mb-1">
                     <span>Inventory</span>
                     <ChevronRight size={10} />
                     <span className="text-[var(--admin-accent)]">{mode === 'edit' ? 'Modification' : 'Creation'}</span>
                  </div>
                  <h2 className="text-4xl font-black text-[var(--admin-sidebar)] tracking-tighter">
                     {mode === 'edit' ? 'Refine Product' : 'Onboard New Product'}
                  </h2>
               </div>
            </div>
            <div className="flex gap-4">
               <button 
                 onClick={() => router.push('/admin/products')}
                 className="h-14 px-8 rounded-2xl border border-slate-200 text-slate-500 text-[11px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all"
               >
                  Discard
               </button>
               <button 
                 form="product-form"
                 type="submit"
                 className="h-14 px-10 rounded-2xl bg-[var(--admin-sidebar)] text-white text-[11px] font-black uppercase tracking-widest flex items-center gap-3 shadow-2xl shadow-slate-900/20 hover:bg-slate-900 transition-all active:scale-95"
               >
                  <Save size={18} className="text-[var(--admin-accent)]" />
                  {mode === 'edit' ? 'Update Global Registry' : 'Confirm & Publish Harvest'}
               </button>
            </div>
         </div>

         {/* Form UI */}
         <div className="grid grid-cols-12 gap-10">
            {/* Left Column */}
            <div className="col-span-12 lg:col-span-8 space-y-8">
               <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm space-y-10">
                  <div className="space-y-8">
                     <div className="flex flex-col gap-4">
                        <label className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400">Inventory Designation</label>
                        <input
                           type="text"
                           required
                           placeholder="e.g. Traditional Cold Pressed Sesame Oil"
                           className="h-20 px-8 rounded-3xl bg-slate-50/50 border border-slate-100 outline-none font-black text-2xl text-[var(--admin-sidebar)] focus:bg-white focus:border-[var(--admin-accent)]/30 focus:ring-8 ring-[var(--admin-accent)]/5 transition-all text-ellipsis"
                           value={formData.name}
                           onChange={e => setFormData({ ...formData, name: e.target.value })}
                        />
                     </div>
                     <div className="flex flex-col gap-4">
                        <label className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400">Artisanal Narrative</label>
                        <textarea
                           rows={8}
                           placeholder="Describe the organic heritage..."
                           className="p-8 rounded-[2.5rem] bg-slate-50/50 border border-slate-100 outline-none font-bold text-lg text-[var(--admin-sidebar)] focus:bg-white focus:border-[var(--admin-accent)]/30 transition-all resize-none leading-relaxed"
                           value={formData.description}
                           onChange={e => setFormData({ ...formData, description: e.target.value })}
                        />
                     </div>
                  </div>
               </div>

            </div>

            {/* Right Column */}
            <div className="col-span-12 lg:col-span-4 space-y-8">
                <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm space-y-8">
                  <label className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400">Visual Identity</label>
                  <div 
                     onClick={() => !isUploading && fileInputRef.current?.click()}
                     className={`aspect-square bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2.5rem] flex flex-col items-center justify-center gap-6 group cursor-pointer hover:border-[var(--admin-accent)]/50 transition-all overflow-hidden relative shadow-inner mb-6 ${isUploading ? 'opacity-50 cursor-wait' : ''}`}
                  >
                     <input 
                        type="file" 
                        ref={fileInputRef} 
                        className="hidden" 
                        accept="image/*"
                        onChange={handleFileUpload} 
                     />
                     {isUploading ? (
                        <div className="flex flex-col items-center gap-4">
                           <Loader2 className="h-10 w-10 text-[var(--admin-accent)] animate-spin" />
                           <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--admin-accent)]">Uploading...</span>
                        </div>
                     ) : (formData.image && formData.image.trim() !== '') ? (
                        <img src={formData.image || undefined} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" alt="Product" />
                     ) : (
                        <>
                           <div className="h-20 w-20 rounded-3xl bg-white flex items-center justify-center shadow-md text-slate-300 transition-all">
                              <Upload size={32} />
                           </div>
                           <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 text-center px-4">Awaiting Media Asset</span>
                        </>
                     )}
                  </div>
               </div>

               <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm space-y-8">
                  <div className="flex flex-col gap-6">
                     <div className="flex flex-col gap-4">
                        <label className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400">Taxonomy</label>
                        <select 
                           required
                           className="h-16 px-8 rounded-2xl bg-slate-50 border border-slate-100 outline-none font-bold text-lg text-[var(--admin-sidebar)] focus:bg-white transition-all appearance-none cursor-pointer"
                           value={formData.categoryId}
                           onChange={e => setFormData({ ...formData, categoryId: e.target.value })}
                        >
                           <option value="">Select Category</option>
                           {categories?.map((cat: any) => (
                              <option key={cat.id} value={cat.id}>{cat.name}</option>
                           ))}
                        </select>
                     </div>
                  </div>
               </div>
            </div>
         </div>
         <form id="product-form" onSubmit={handleSave} className="hidden" />
      </div>
   );
}
