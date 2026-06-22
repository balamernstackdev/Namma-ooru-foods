'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
   ArrowLeft,
   Save,
   Folder,
   Image as ImageIcon,
   Info,
   RefreshCw,
   Upload,
   Loader2,
   HelpCircle
} from 'lucide-react';
import { useToast } from '@/context/ToastContext';
import { API_URL } from '@/lib/api';
import useSWR from 'swr';

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

export default function EditCategoryClient({ id }: { id: string }) {
   const router = useRouter();
   const { user } = useAuth();
   const { addToast } = useToast();
   const [isLoading, setIsLoading] = useState(false);
   const [isUploading, setIsUploading] = useState(false);
   const fileInputRef = useRef<HTMLInputElement>(null);
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
            addToast('Taxonomy Updation', form.name);
            router.push('/vendor/categories');
         } else {
            const err = await res.json();
            addToast('Updation Error', err.error || 'Check all required fields');
         }
      } catch (err) {
         addToast('Critical Error', 'Central node synchronization failed');
      } finally {
         setIsLoading(false);
      }
   };

   if (!category && !error) return (
      <div className="flex flex-col items-center justify-center py-40 gap-6 bg-[#F8FAF7] min-h-screen">
         <RefreshCw size={48} className="text-[#0F7A4D] animate-spin" />
         <p className="text-[10px] font-black uppercase tracking-widest text-[#6B7280]">Hydrating Taxonomy Cluster...</p>
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
                        Product Category
                     </h1>
                     <p className="text-[10px] font-bold text-[#6B7280] uppercase tracking-widest mt-0.5">Refining Taxonomy segment #{categoryId} for Brand #{user?.brandId}</p>
                  </div>
               </div>
               <div className="flex items-center gap-3">
                  <button onClick={() => router.back()} type="button" className="px-4 py-2 rounded-lg text-xs font-bold text-[#6B7280] hover:bg-slate-100 transition-all">Discard</button>
                  <button
                     form="category-form"
                     type="submit"
                     disabled={isLoading}
                     className="px-6 py-2.5 rounded-lg bg-[#0F7A4D] hover:bg-[#0c623d] text-white text-xs font-black flex items-center gap-2 shadow-sm disabled:opacity-50 transition-all active:scale-95 uppercase tracking-wider"
                  >
                     <Save size={14} />
                     {isLoading ? 'Updating...' : 'Save Changes'}
                  </button>
               </div>
            </div>
         </div>

         <form id="category-form" onSubmit={handleSubmit} className="w-full px-8 space-y-10">

            {/* 1. VISUAL ASSET CARD */}
            <div className="bg-white rounded-[20px] border border-[#E5E7EB] shadow-[0_4px_12px_rgba(0,0,0,0.05)] overflow-hidden w-full">
               <SectionHeader title="Visual Identity & Discovery" icon={ImageIcon} colorClass="text-[#0F7A4D]" />
               <div className="p-8 space-y-6">
                  <InputWrapper label="Visual Identity">
                     <div
                        onClick={() => !isUploading && fileInputRef.current?.click()}
                        className={`w-full aspect-video max-w-lg bg-[#F8FAF7] border-2 border-dashed border-[#E5E7EB] rounded-2xl flex flex-col items-center justify-center gap-4 group cursor-pointer hover:border-[#0F7A4D] transition-all overflow-hidden relative ${isUploading ? 'opacity-50 cursor-wait' : ''}`}
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
                              <Loader2 className="h-8 w-8 text-[#0F7A4D] animate-spin" />
                              <span className="text-[9px] font-black uppercase tracking-widest text-[#0F7A4D]">Uploading...</span>
                           </div>
                        ) : (form.image && form.image.trim() !== '') ? (
                           <img src={form.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="Category" />
                        ) : (
                           <>
                              <div className="h-12 w-12 rounded-xl bg-white border border-[#E5E7EB] flex items-center justify-center shadow-sm text-slate-400">
                                 <Upload size={20} />
                              </div>
                              <span className="text-[9px] font-black uppercase tracking-widest text-[#6B7280]">Upload Asset</span>
                           </>
                        )}
                     </div>
                  </InputWrapper>
               </div>
            </div>

            {/* 2. CORE DNA CARD */}
            <div className="bg-white rounded-[20px] border border-[#E5E7EB] shadow-[0_4px_12px_rgba(0,0,0,0.05)] overflow-hidden w-full">
               <SectionHeader title="Category DNA" icon={Folder} colorClass="text-[#0F7A4D]" />
               <div className="p-8 space-y-8">
                  <InputWrapper label="Active Label">
                     <input
                        required
                        type="text"
                        placeholder="e.g. Organic Millet Flour"
                        className="w-full h-14 px-6 rounded-xl border border-[#E5E7EB] bg-white focus:border-[#0F7A4D] focus:ring-4 focus:ring-[#0F7A4D]/5 outline-none font-bold text-[#111827] text-sm transition-all"
                        value={form.name}
                        onChange={e => setForm({ ...form, name: e.target.value })}
                     />
                  </InputWrapper>

                  <InputWrapper label="Semantic Description">
                     <textarea
                        required
                        rows={4}
                        placeholder="Define the scope and purpose of this category..."
                        className="w-full px-6 py-4 rounded-xl border border-[#E5E7EB] bg-white focus:border-[#0F7A4D] focus:ring-4 focus:ring-[#0F7A4D]/5 outline-none font-bold text-[#6B7280] text-sm resize-none"
                        value={form.description}
                        onChange={e => setForm({ ...form, description: e.target.value })}
                     />
                  </InputWrapper>
               </div>
            </div>
         </form>
      </div>
   );
}
