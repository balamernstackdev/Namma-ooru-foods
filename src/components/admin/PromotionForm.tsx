'use client'
import React, { useState, useRef } from 'react';
import { ArrowLeft, ChevronRight, Save, Upload, Megaphone, Calendar, Tag, Info, Palette, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/context/ToastContext';
import useSWR from 'swr';
import { API_URL } from '@/lib/api';

const fetcher = (url: string) => fetch(url).then(res => res.json());

interface PromotionFormProps {
   initialData?: any;
   mode: 'create' | 'edit';
}

export default function PromotionForm({ initialData, mode }: PromotionFormProps) {
   const router = useRouter();
   const { addToast } = useToast();
   const { data: categories } = useSWR(`${API_URL}/api/categories`, fetcher);
   const [isLoading, setIsLoading] = useState(false);
   const [isUploading, setIsUploading] = useState(false);
   const fileInputRef = useRef<HTMLInputElement>(null);

   const [formData, setFormData] = useState({
      title: initialData?.title || '',
      discount: initialData?.discount || '',
      category: initialData?.category || '',
      code: initialData?.code || '',
      description: initialData?.description || '',
      image: initialData?.image || '',
      color: initialData?.color || '#FF5733',
      active: initialData?.isActive ?? initialData?.active ?? true,
      end: initialData?.endDate || initialData?.end || '',
   });

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
            addToast('Upload Success', 'Campus hero image updated.');
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
         const method = mode === 'edit' ? 'PUT' : 'POST';
         const url = mode === 'edit' ? `${API_URL}/api/promotions/${initialData.id}` : `${API_URL}/api/promotions`;

         const res = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
               ...formData,
               // Convert specific strings to what backend expects if necessary
            })
         });

         if (res.ok) {
            addToast('Promotion Saved', `${formData.title} has been ${mode === 'edit' ? 'updated' : 'created'} successfully.`);
            router.push('/admin/promotions');
            router.refresh();
         } else {
            const err = await res.json();
            addToast('Error', err.error || 'Failed to save promotion');
         }
      } catch (error) {
         addToast('Critical Error', 'Network or server failure');
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
                  onClick={() => router.push('/admin/promotions')}
                  className="h-14 w-14 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-[var(--primary)] hover:bg-slate-50 transition-all shadow-sm"
               >
                  <ArrowLeft size={24} />
               </button>
               <div className="flex flex-col">
                  <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 mb-1">
                     <span>Marketing</span>
                     <ChevronRight size={10} />
                     <span className="text-[var(--primary)]">{mode === 'edit' ? 'Modification' : 'Creation'}</span>
                  </div>
                  <h2 className="text-4xl font-black text-slate-800 tracking-tighter">
                     {mode === 'edit' ? 'Refine Promotion' : 'New Marketing Offer'}
                  </h2>
               </div>
            </div>
            <div className="flex gap-4">
               <button
                  onClick={() => router.push('/admin/promotions')}
                  className="h-14 px-8 rounded-2xl border border-slate-200 text-slate-500 text-[11px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all"
               >
                  Discard
               </button>
               <button
                  form="promotion-form"
                  type="submit"
                  disabled={isLoading}
                  className="h-14 px-10 rounded-2xl bg-[var(--primary)] text-white text-[11px] font-black uppercase tracking-widest flex items-center gap-3 shadow-2xl shadow-[var(--primary)]/20 hover:opacity-90 transition-all active:scale-95 disabled:opacity-50"
               >
                  <Save size={18} />
                  {mode === 'edit' ? 'Update Promotion' : 'Activate Offer'}
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
                        <label className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400">Promotion Title</label>
                        <div className="relative">
                           <Megaphone className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={24} />
                           <input
                              type="text"
                              required
                              placeholder="e.g. Summer Harvest Bonanza"
                              className="h-20 pl-16 pr-8 w-full rounded-3xl bg-slate-50/50 border border-slate-100 outline-none font-black text-2xl text-slate-800 focus:bg-white focus:border-[var(--primary)]/30 focus:ring-8 ring-[var(--primary)]/5 transition-all"
                              value={formData.title}
                              onChange={e => setFormData({ ...formData, title: e.target.value })}
                           />
                        </div>
                     </div>

                     <div className="grid grid-cols-2 gap-8">
                        <div className="flex flex-col gap-4">
                           <label className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400">Discount Label</label>
                           <input
                              type="text"
                              placeholder="e.g. 20% OFF or Flat ₹100"
                              className="h-16 px-8 rounded-2xl bg-slate-50/50 border border-slate-100 outline-none font-bold text-lg text-slate-800 focus:bg-white transition-all"
                              value={formData.discount}
                              onChange={e => setFormData({ ...formData, discount: e.target.value })}
                           />
                        </div>
                        <div className="flex flex-col gap-4">
                           <label className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400">Promo Code</label>
                           <div className="relative">
                              <Tag className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                              <input
                                 type="text"
                                 placeholder="e.g. SUMMER24"
                                 className="h-16 pl-14 pr-8 w-full rounded-2xl bg-slate-50/50 border border-slate-100 outline-none font-mono font-bold text-lg text-[var(--primary)] focus:bg-white transition-all uppercase"
                                 value={formData.code}
                                 onChange={e => setFormData({ ...formData, code: e.target.value })}
                              />
                           </div>
                        </div>
                     </div>

                     <div className="flex flex-col gap-4">
                        <label className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400">Marketing Narrative</label>
                        <textarea
                           rows={4}
                           placeholder="Describe the campaign objectives..."
                           className="p-8 rounded-[2rem] bg-slate-50/50 border border-slate-100 outline-none font-bold text-lg text-slate-700 focus:bg-white focus:border-[var(--primary)]/30 transition-all resize-none leading-relaxed"
                           value={formData.description}
                           onChange={e => setFormData({ ...formData, description: e.target.value })}
                        />
                     </div>
                  </div>
               </div>

               <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm space-y-10">
                  <h4 className="text-xl font-black text-slate-800 tracking-tighter flex items-center gap-3">
                     <span className="h-8 w-1.5 bg-[var(--primary)] rounded-full"></span>
                     Targeting & Schedule
                  </h4>
                  <div className="grid grid-cols-2 gap-10">
                     <div className="flex flex-col gap-4">
                        <label className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400">Target Category</label>
                        <select
                           className="h-16 px-8 rounded-2xl bg-slate-50/50 border border-slate-100 outline-none font-bold text-lg text-slate-800 focus:bg-white transition-all appearance-none"
                           value={formData.category}
                           onChange={e => setFormData({ ...formData, category: e.target.value })}
                        >
                           <option value="">Specific Category (None)</option>
                           <option value="All Products">All Products</option>
                           {categories?.map((cat: any) => (
                              <option key={cat.id} value={cat.name}>{cat.name}</option>
                           ))}
                        </select>
                     </div>
                     <div className="flex flex-col gap-4">
                        <label className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400">Validity / Deadline</label>
                        <div className="relative">
                           <Calendar className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                           <input
                              type="date"
                              className="h-16 pl-14 pr-8 w-full rounded-2xl bg-slate-50/50 border border-slate-100 outline-none font-bold text-lg text-slate-800 focus:bg-white transition-all"
                              value={formData.end}
                              onChange={e => setFormData({ ...formData, end: e.target.value })}
                           />
                        </div>
                     </div>
                  </div>
               </div>
            </div>

            {/* Right Column */}
            <div className="col-span-12 lg:col-span-4 space-y-8">
               <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm space-y-8">
                  <label className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400">Campaign Hero Image</label>
                  <div
                     onClick={() => !isUploading && fileInputRef.current?.click()}
                     className={`aspect-video bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2rem] flex flex-col items-center justify-center gap-6 group cursor-pointer hover:border-[var(--primary)]/50 transition-all overflow-hidden relative shadow-inner mb-6 ${isUploading ? 'opacity-50 cursor-wait' : ''}`}
                     style={{ backgroundColor: formData.image ? 'transparent' : `${formData.color}10` }}
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
                           <Loader2 className="h-10 w-10 text-[var(--primary)] animate-spin" />
                           <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--primary)]">Uploading...</span>
                        </div>
                     ) : (formData.image && formData.image.trim() !== '') ? (
                        <img src={formData.image || undefined} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" alt="Promotion" />
                     ) : (
                        <>
                           <div className="h-16 w-16 rounded-2xl bg-white flex items-center justify-center shadow-md text-slate-300 transition-all">
                              <Upload size={28} />
                           </div>
                           <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 text-center px-4">Upload Asset</span>
                        </>
                     )}
                  </div>
               </div>

               <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm space-y-8">
                  <div className="flex flex-col gap-6">
                     <div className="flex flex-col gap-4">
                        <label className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400">Theme Identity</label>
                        <div className="flex items-center gap-4">
                           <div
                              className="h-14 w-14 rounded-2xl shadow-inner border border-white"
                              style={{ backgroundColor: formData.color }}
                           ></div>
                           <input
                              type="text"
                              placeholder="#Hex Code"
                              className="flex-1 h-14 px-6 rounded-2xl bg-slate-50 border border-slate-100 outline-none font-mono font-bold text-slate-800"
                              value={formData.color}
                              onChange={e => setFormData({ ...formData, color: e.target.value })}
                           />
                           <input
                              type="color"
                              className="h-10 w-10 cursor-pointer opacity-0 absolute w-0 h-0"
                              id="color-picker"
                              value={formData.color}
                              onChange={e => setFormData({ ...formData, color: e.target.value })}
                           />
                           <label htmlFor="color-picker" className="p-3 bg-slate-100 rounded-xl cursor-pointer hover:bg-slate-200 transition-colors">
                              <Palette size={20} className="text-slate-500" />
                           </label>
                        </div>
                     </div>

                     <div className="flex items-center justify-between p-6 bg-slate-50 rounded-2xl border border-slate-100">
                        <div className="flex flex-col">
                           <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">Campaign Status</span>
                           <span className={`text-sm font-bold ${formData.active ? 'text-green-600' : 'text-slate-400'}`}>
                              {formData.active ? 'Active & Visible' : 'Draft / Scheduled'}
                           </span>
                        </div>
                        <button
                           type="button"
                           onClick={() => setFormData({ ...formData, active: !formData.active })}
                           className={`w-14 h-8 rounded-full transition-all relative ${formData.active ? 'bg-green-500 shadow-lg shadow-green-500/30' : 'bg-slate-200'}`}
                        >
                           <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${formData.active ? 'left-7' : 'left-1'}`}></div>
                        </button>
                     </div>
                  </div>
               </div>
            </div>
         </div>
         <form id="promotion-form" onSubmit={handleSave} className="hidden" />
      </div>
   );
}
