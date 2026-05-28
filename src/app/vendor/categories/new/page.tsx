'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
   ArrowLeft,
   Save,
   Plus,
   Folder,
   Image as ImageIcon,
   Info,
   Upload,
   Loader2,
   HelpCircle
} from 'lucide-react';
import { useToast } from '@/context/ToastContext';
import { API_URL } from '@/lib/api';

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

export default function CreateCategory() {
   const router = useRouter();
   const { user } = useAuth();
   const { addToast } = useToast();
   const [isLoading, setIsLoading] = useState(false);
   const [isUploading, setIsUploading] = useState(false);
   const fileInputRef = useRef<HTMLInputElement>(null);

   const [form, setForm] = useState({
      name: '',
      description: '',
      image: '',
      parentId: ''
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
         const payload = {
            ...form,
            brandId: user.brandId
         };

         const res = await fetch(`${API_URL}/api/categories`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
         });

         if (res.ok) {
            addToast('Cluster Defined Successfully', form.name);
            router.push('/vendor/categories');
         } else {
            const error = await res.json();
            addToast('Definition Error', error.error || 'Check all required fields');
         }
      } catch (err) {
         addToast('Critical Error', 'Synchronization with central node failed');
      } finally {
         setIsLoading(false);
      }
   };

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
                        Create Category
                     </h1>
                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Expanding Store Taxonomy for Brand #{user?.brandId}</p>
                  </div>
               </div>
               <div className="flex items-center gap-3">
                  <button onClick={() => router.back()} className="px-4 py-2 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 transition-all">Discard</button>
                  <button
                     form="category-form"
                     type="submit"
                     disabled={isLoading}
                     className="px-6 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black flex items-center gap-2 shadow-lg shadow-emerald-500/20 disabled:opacity-50 transition-all active:scale-95 uppercase tracking-wider"
                  >
                     <Save size={14} />
                     {isLoading ? 'Defining...' : 'Create Taxonomy'}
                  </button>
               </div>
            </div>
         </div>

         <form id="category-form" onSubmit={handleSubmit} className="w-full px-8 space-y-10">

            {/* 1. VISUAL ASSET CARD */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden w-full">
               <SectionHeader title="Visual Identity & Discovery" icon={ImageIcon} colorClass="text-emerald-600" />
               <div className="p-8 space-y-6">
                  <InputWrapper label="Visual Identity">
                     <div
                        onClick={() => !isUploading && fileInputRef.current?.click()}
                        className={`w-full aspect-video max-w-lg bg-slate-50 dark:bg-slate-800 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl flex flex-col items-center justify-center gap-4 group cursor-pointer hover:border-emerald-400 dark:hover:border-emerald-600 transition-all overflow-hidden relative ${isUploading ? 'opacity-50 cursor-wait' : ''}`}
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
                  </InputWrapper>
               </div>
            </div>

            {/* 2. CORE DNA CARD */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden w-full">
               <SectionHeader title="Category DNA" icon={Folder} colorClass="text-slate-900 dark:text-white" />
               <div className="p-8 space-y-8">
                  <InputWrapper label="Label">
                     <input
                        required
                        type="text"
                        placeholder="e.g. Organic Millet Flour"
                        className="w-full h-14 px-6 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:border-emerald-500 focus:ring-4 ring-emerald-500/5 outline-none font-bold text-slate-950 dark:text-white text-sm transition-all"
                        value={form.name}
                        onChange={e => setForm({ ...form, name: e.target.value })}
                     />
                  </InputWrapper>

                  <InputWrapper label="Description / Narrative">
                     <textarea
                        required
                        rows={4}
                        placeholder="Define the scope and purpose of this category..."
                        className="w-full px-6 py-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:border-emerald-500 outline-none font-bold text-slate-600 dark:text-slate-300 text-sm resize-none"
                        value={form.description}
                        onChange={e => setForm({ ...form, description: e.target.value })}
                     />
                  </InputWrapper>

                  <div className="p-6 rounded-xl bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-800 flex items-center gap-6">
                     <Info className="text-emerald-600 shrink-0" size={20} />
                     <p className="text-[11px] font-bold text-emerald-900 dark:text-emerald-400 uppercase tracking-widest leading-relaxed">
                        Taxonomy clusters help customers navigate your store efficiently. Ensure clear labels and concise descriptions for better market positioning.
                     </p>
                  </div>
               </div>
            </div>
         </form>
      </div>
   );
}
