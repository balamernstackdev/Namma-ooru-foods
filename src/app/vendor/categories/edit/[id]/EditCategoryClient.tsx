'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
   ArrowLeft,
   Save,
   Folder,
   Info,
   RefreshCw,
   Upload,
   Loader2
} from 'lucide-react';
import { useToast } from '@/context/ToastContext';
import { API_URL } from '@/lib/api';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function EditCategoryClient({ id }: { id: string }) {
   const router = useRouter();
   const { user } = useAuth();
   const { addToast } = useToast();
   const [isLoading, setIsLoading] = useState(false);
   const [isUploading, setIsUploading] = useState(false);
   const fileInputRef = React.useRef<HTMLInputElement>(null);
   const categoryId = id;

   const { data: category, error } = useSWR(categoryId ? `${API_URL}/api/categories/${categoryId}` : null, fetcher);

   const [form, setForm] = useState({
      name: '',
      description: '',
      image: '',
      parentId: ''
   });

   useEffect(() => {
      if (category) {
         setForm({
            name: category.name || '',
            description: category.description || '',
            image: category.image || '',
            parentId: category.parentId?.toString() || ''
         });
      }
   }, [category]);

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
            setForm(prev => ({ ...prev, image: data.url }));
            addToast('Upload Success', 'Taxonomy asset synchronized.');
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
         const res = await fetch(`${API_URL}/api/categories/${categoryId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...form, brandId: user.brandId })
         });

         if (res.ok) {
            addToast('Taxonomy Calibrated', form.name);
            router.push('/vendor/categories');
         } else {
            const err = await res.json();
            addToast('Calibration Error', err.error || 'Check all required fields');
         }
      } catch (err) {
         addToast('Critical Error', 'Central node synchronization failed');
      } finally {
         setIsLoading(false);
      }
   };

   if (!category && !error) return (
      <div className="flex flex-col items-center justify-center py-40 gap-6">
         <RefreshCw size={48} className="text-emerald-950 animate-spin" />
         <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Hydrating Taxonomy Cluster...</p>
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
               <h2 className="text-3xl font-black text-emerald-950 dark:text-white tracking-tighter uppercase">Calibrate Cluster</h2>
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Refining Taxonomy segment #{categoryId} for Brand #{user?.brandId}</p>
            </div>
            <button
               form="category-form"
               disabled={isLoading}
               className="h-16 px-10 rounded-2xl bg-emerald-950 dark:bg-emerald-600 text-white text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-emerald-800 transition-all shadow-2xl shadow-emerald-900/40"
            >
               {isLoading ? 'Calibrating...' : <><Save size={20} className="text-amber-400" /> Save Changes</>}
            </button>
         </div>

         <form id="category-form" onSubmit={handleSubmit} className="grid grid-cols-1 gap-12">
            <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-10 md:p-14 border border-slate-100 dark:border-slate-800 space-y-12 shadow-sm">
               <div className="space-y-10">
                  <div className="flex items-center gap-4 text-emerald-950 dark:text-white">
                     <div className="h-12 w-12 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600">
                        <Folder size={24} />
                     </div>
                     <h3 className="text-xl font-black tracking-tight">Category Intelligence</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                     <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Active Label</label>
                        <input
                           required
                           type="text"
                           className="w-full h-16 px-8 rounded-2xl bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-emerald-400 outline-none transition-all font-bold text-emerald-950 dark:text-white"
                           value={form.name}
                           onChange={e => setForm({ ...form, name: e.target.value })}
                        />
                     </div>

                     <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Visual Identity</label>
                        <div
                           onClick={() => !isUploading && fileInputRef.current?.click()}
                           className={`w-full aspect-video bg-slate-50 dark:bg-slate-800 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl flex flex-col items-center justify-center gap-4 group cursor-pointer hover:border-emerald-400 transition-all overflow-hidden relative ${isUploading ? 'opacity-50 cursor-wait' : ''}`}
                        >
                           <input
                              type="file"
                              ref={fileInputRef}
                              className="hidden"
                              accept="image/*"
                              onChange={handleFileUpload}
                           />
                           {isUploading ? (
                              <div className="flex flex-col items-center gap-2">
                                 <Loader2 className="h-8 w-8 text-emerald-500 animate-spin" />
                                 <span className="text-[9px] font-black uppercase tracking-widest text-emerald-500">Uploading...</span>
                              </div>
                           ) : (form.image && form.image.trim() !== '') ? (
                              <img src={form.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" alt="Category" />
                           ) : (
                              <>
                                 <div className="h-12 w-12 rounded-xl bg-white dark:bg-slate-700 flex items-center justify-center shadow-md text-slate-300">
                                    <Upload size={20} />
                                 </div>
                                 <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Upload Asset</span>
                              </>
                           )}
                        </div>
                     </div>

                     <div className="md:col-span-2 space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Semantic Description</label>
                        <textarea
                           required
                           rows={5}
                           className="w-full p-8 rounded-[2rem] bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-emerald-400 outline-none transition-all font-bold text-emerald-950 dark:text-white leading-relaxed resize-none"
                           value={form.description}
                           onChange={e => setForm({ ...form, description: e.target.value })}
                        />
                     </div>
                  </div>
               </div>
            </div>
         </form>
      </div>
   );
}
