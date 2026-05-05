'use client'
import React, { useState, useRef, useMemo } from 'react';
import dynamic from 'next/dynamic';
import {
   ArrowLeft,
   ChevronRight,
   ChevronDown,
   ChevronUp,
   Save,
   Upload,
   Loader2,
   Trash2,
   Plus,
   Tag,
   AlignLeft,
   IndianRupee,
   Package,
   Layers,
   Heart,
   Utensils,
   BookOpen,
   Users,
   Search,
   MessageCircle,
   HelpCircle,
   Sparkles,
   Image as ImageIcon,
   Globe,
   X,
   Video,
   Play
} from 'lucide-react';
import { useRouter } from 'next/navigation';

import useSWR from 'swr';
import { useToast } from '@/context/ToastContext';
import { API_URL } from '@/lib/api';

// Professional Rich Text Editor
const ReactQuill = dynamic(() => import('react-quill-new'), {
   ssr: false,
   loading: () => <div className="h-32 w-full bg-slate-50 animate-pulse rounded-lg border border-slate-200" />
});
import 'react-quill-new/dist/quill.snow.css';

interface ProductFormProps {
   initialData?: any;
   mode: 'create' | 'edit';
}

const fetcher = (url: string) => fetch(url).then(res => res.json());

// Clean, icon-free wrapper for professional text inputs
const InputWrapper = ({ label, children, helpText, maxWidth = "max-w-full" }: any) => (
   <div className={`space-y-2 flex-1 ${maxWidth}`}>
      <div className="flex items-center justify-between">
         <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider">
            {label}
         </label>
         {helpText && (
            <div className="group relative">
               <HelpCircle size={14} className="text-slate-300 cursor-help hover:text-blue-500 transition-all shadow-sm" />
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
   <div className="px-8 py-3.5 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
      <Icon size={16} className={colorClass} />
      <h2 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em]">{title}</h2>
   </div>
);


export default function ProductForm({ initialData, mode }: ProductFormProps) {
   const router = useRouter();
   const { addToast } = useToast();
   const [isLoading, setIsLoading] = useState(false);
   const [isUploading, setIsUploading] = useState(false);
   const [isVideoUploading, setIsVideoUploading] = useState(false);
   const [openFaqIdx, setOpenFaqIdx] = useState<number | null>(0);
   const fileInputRef = useRef<HTMLInputElement>(null);
   const videoInputRef = useRef<HTMLInputElement>(null);

   const [formData, setFormData] = useState({
      name: initialData?.name || '',
      categoryId: initialData?.categoryId?.toString() || '',
      description: initialData?.description || '',
      image: initialData?.image || '',
      images: initialData?.images?.map((img: any) => img.url) || [],
      videoUrl: initialData?.videoUrl || '',
      price: initialData?.price || '',
      originalPrice: initialData?.originalPrice || '',
      whatIsProduct: initialData?.whatIsProduct || '',
      healthBenefits: initialData?.healthBenefits || '',
      whyChoose: initialData?.whyChoose || '',
      whoShouldEat: initialData?.whoShouldEat || '',
      howToEat: initialData?.howToEat || '',
      faqs: initialData?.faqs || [],
      metaTitle: initialData?.metaTitle || '',
      metaDescription: initialData?.metaDescription || '',
      metaKeywords: initialData?.metaKeywords || ''
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
            const newImages = [...formData.images, data.url];
            setFormData(prev => ({
               ...prev,
               images: newImages,
               image: prev.image ? prev.image : data.url
            }));
            addToast('Success', 'Gallery updated');
         }
      } finally {
         setIsUploading(false);
      }
   };

   const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setIsVideoUploading(true);
      const uploadData = new FormData();
      uploadData.append('video', file);

      try {
         const res = await fetch(`${API_URL}/api/upload/video`, {
            method: 'POST',
            body: uploadData,
         });

         if (res.ok) {
            const data = await res.json();
            setFormData(prev => ({ ...prev, videoUrl: data.url }));
            addToast('Success', 'Product video uploaded');
         }
      } finally {
         setIsVideoUploading(false);
      }
   };

   const removeImage = (index: number) => {
      const newImages = [...formData.images];
      const removedUrl = newImages[index];
      newImages.splice(index, 1);
      setFormData(prev => ({
         ...prev,
         images: newImages,
         image: prev.image === removedUrl ? (newImages[0] || '') : prev.image
      }));
   };

   const handleSave = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsLoading(true);
      try {
         const url = mode === 'edit' ? `${API_URL}/api/products/${initialData.id}` : `${API_URL}/api/products`;
         const res = await fetch(url, {
            method: mode === 'edit' ? 'PUT' : 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...formData, categoryId: parseInt(formData.categoryId), variants: [] })
         });

         if (res.ok) {
            addToast('Success', 'Product catalog updated');
            router.push('/admin/products');
         }
      } finally {
         setIsLoading(false);
      }
   };

   const quillModules = useMemo(() => ({
      toolbar: [
         [{ 'header': [1, 2, 3, false] }],
         ['bold', 'italic', 'underline', 'strike'],
         [{ 'list': 'ordered' }, { 'list': 'bullet' }],
         [{ 'align': [] }],
         ['link'],
         ['clean']
      ],
   }), []);

   const quillFormats = [
      'header',
      'bold', 'italic', 'underline', 'strike',
      'list',
      'align',
      'link'
   ];

   return (
      <div className="w-full pb-24 animate-in fade-in duration-1000 bg-[#f8fafc]">
         <style jsx global>{`
            .rich-text-container .ql-toolbar {
               border-top-left-radius: 12px;
               border-top-right-radius: 12px;
               border: 1px solid #e2e8f0;
               background: #f8fafc;
               padding: 12px;
            }
            .rich-text-container .ql-container {
               border-bottom-left-radius: 12px;
               border-bottom-right-radius: 12px;
               border: 1px solid #e2e8f0;
               border-top: none;
               min-height: 150px;
               font-family: inherit;
               font-size: 14px;
               background: white;
            }
            .rich-text-container .ql-editor {
               min-height: 150px;
               color: #475569;
               font-weight: 500;
            }
            .rich-text-container .ql-editor.ql-blank::before {
               color: #94a3b8;
               font-style: normal;
               font-weight: 500;
            }
         `}</style>

         <div className="sticky top-0 z-40 bg-[#f8fafc]/80 backdrop-blur-xl border-b border-slate-200 mb-8 py-6 px-4">
            <div className="flex items-center justify-between">
               <div className="flex items-center gap-4">
                  <button
                     onClick={() => router.push('/admin/products')}
                     className="h-10 w-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 hover:text-blue-600 transition-all shadow-sm"
                  >
                     <ArrowLeft size={18} />
                  </button>
                  <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                     {mode === 'edit' ? 'Edit Product' : 'Add New Product'}
                  </h1>
               </div>
               <div className="flex items-center gap-3">
                  <button onClick={() => router.push('/admin/products')} className="px-4 py-2 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-100 transition-all">Discard</button>
                  <button form="product-form" type="submit" disabled={isLoading} className="px-6 py-2 rounded-lg bg-[#2563eb] text-white text-xs font-black flex items-center gap-2 shadow-lg shadow-blue-500/20 hover:bg-[#1d4ed8] disabled:opacity-50 transition-all active:scale-95 uppercase tracking-wider" >
                     {isLoading ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                     {mode === 'edit' ? 'Update' : 'Publish'}
                  </button>
               </div>
            </div>
         </div>

         <form id="product-form" onSubmit={handleSave} className="px-2 space-y-10">

            {/* 1. MEDIA ASSETS */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden w-full">
               <SectionHeader title="Visual Assets & Discovery" icon={ImageIcon} colorClass="text-blue-600" />
               <div className="p-8 space-y-8">
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-4">
                     {formData.images.map((img: string, idx: number) => (
                        <div key={idx} className="group relative aspect-square rounded-xl bg-slate-50 border border-slate-200 overflow-hidden hover:border-blue-500 transition-all shadow-sm">
                           <img src={img} className="w-full h-full object-cover" alt={`Product ${idx}`} />
                           <button type="button" onClick={() => removeImage(idx)} className="absolute top-2 right-2 h-6 w-6 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-lg hover:scale-110"><X size={12} /></button>
                           {formData.image === img && <div className="absolute bottom-0 left-0 right-0 bg-blue-600 text-white text-[8px] font-black uppercase text-center py-1.5 tracking-widest">Primary Hero</div>}
                           <div onClick={() => setFormData({ ...formData, image: img })} className={`absolute inset-0 cursor-pointer ${formData.image === img ? 'bg-transparent' : 'bg-black/0 hover:bg-black/20'} transition-all`} />
                        </div>
                     ))}
                     <div onClick={() => !isUploading && fileInputRef.current?.click()} className={`aspect-square bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center gap-2 group cursor-pointer hover:border-blue-500 hover:bg-blue-50/30 transition-all ${isUploading ? 'opacity-50 cursor-wait' : ''}`}>
                        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />
                        {isUploading ? <Loader2 className="h-6 w-6 text-blue-600 animate-spin" /> : <><div className="h-10 w-10 rounded-full bg-white shadow-sm flex items-center justify-center text-slate-400 group-hover:text-blue-500 transition-all"><Plus size={20} /></div><span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Add Image</span></>}
                     </div>
                  </div>

                  <div className="pt-8 border-t border-slate-100">
                     <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                           <Video size={18} className="text-slate-900" />
                           <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-widest">Product Discovery Video</h4>
                        </div>
                     </div>
                     <div onClick={() => !isVideoUploading && !formData.videoUrl && videoInputRef.current?.click()} className={`h-24 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/30 flex items-center justify-center transition-all relative ${!formData.videoUrl ? 'hover:border-blue-500 cursor-pointer' : ''}`}>
                        <input type="file" ref={videoInputRef} className="hidden" accept="video/*" onChange={handleVideoUpload} />
                        {isVideoUploading ? <Loader2 className="h-6 w-6 text-blue-600 animate-spin" /> : formData.videoUrl ? (
                           <div className="flex items-center gap-4 px-6 w-full">
                              <div className="h-12 aspect-video bg-black rounded flex items-center justify-center text-white"><Play size={18} fill="currentColor" /></div>
                              <p className="flex-1 text-[11px] font-black text-slate-900 uppercase truncate">Video Harvest Linked</p>
                              <button type="button" onClick={() => videoInputRef.current?.click()} className="text-[10px] font-black text-blue-600 uppercase">Change</button>
                           </div>
                        ) : <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Upload story video</span>}
                     </div>
                  </div>
               </div>
            </div>

            {/* 2. IDENTITY & COMMERCE */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden w-full">
               <SectionHeader title="Core Specifications" icon={Tag} colorClass="text-slate-900" />
               <div className="p-8 space-y-8">
                  <InputWrapper label="Product Title">
                     <input type="text" required className="w-full h-14 px-6 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 ring-blue-500/5 outline-none font-bold text-slate-900 text-sm transition-all" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                  </InputWrapper>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     <InputWrapper label="Primary Category">
                        <select required className="w-full h-14 px-6 rounded-xl border border-slate-200 focus:border-blue-500 outline-none font-bold text-sm appearance-none bg-white" value={formData.categoryId} onChange={e => setFormData({ ...formData, categoryId: e.target.value })} >
                           <option value="">Select Category</option>
                           {categories?.map((cat: any) => (
                              <option key={cat.id} value={cat.id}>
                                 {cat.parent ? `${cat.parent.name} > ${cat.name}` : cat.name}
                              </option>
                           ))}
                        </select>
                     </InputWrapper>
                     <div className="flex gap-4">
                        <InputWrapper label="Selling Price (INR)"><input type="number" required className="w-full h-14 px-6 rounded-xl border border-slate-200 focus:border-blue-500 outline-none font-black text-blue-600 text-base" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} /></InputWrapper>
                        <InputWrapper label="MRP"><input type="number" className="w-full h-14 px-6 rounded-xl border border-slate-200 focus:border-blue-500 outline-none font-black text-slate-300 text-base" value={formData.originalPrice} onChange={e => setFormData({ ...formData, originalPrice: e.target.value })} /></InputWrapper>
                     </div>
                  </div>
                  <InputWrapper label="Marketplace Hook (Short Summary)">
                     <textarea rows={2} className="w-full px-6 py-4 rounded-xl border border-slate-200 focus:border-blue-500 outline-none font-bold text-slate-600 text-sm resize-none" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
                  </InputWrapper>
               </div>
            </div>

            {/* 3. THE ARTISANAL ENCYCLOPEDIA (RICH TEXT) */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden w-full">
               <SectionHeader title="The Artisanal Encyclopedia" icon={Sparkles} colorClass="text-amber-500" />
               <div className="p-8 space-y-10">
                  <div className="grid grid-cols-1 gap-10">
                     <InputWrapper label="The Product Story">
                        <div className="rich-text-container">
                           <ReactQuill theme="snow" value={formData.whatIsProduct} onChange={val => setFormData({ ...formData, whatIsProduct: val })} modules={quillModules} formats={quillFormats} />
                        </div>
                     </InputWrapper>
                     <InputWrapper label="Wellness & Health Benefits">
                        <div className="rich-text-container">
                           <ReactQuill theme="snow" value={formData.healthBenefits} onChange={val => setFormData({ ...formData, healthBenefits: val })} modules={quillModules} formats={quillFormats} />
                        </div>
                     </InputWrapper>
                     <InputWrapper label="Usage & Consumption Guide">
                        <div className="rich-text-container">
                           <ReactQuill theme="snow" value={formData.howToEat} onChange={val => setFormData({ ...formData, howToEat: val })} modules={quillModules} formats={quillFormats} />
                        </div>
                     </InputWrapper>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <InputWrapper label="Ideal Audience">
                           <textarea rows={3} className="w-full px-5 py-4 rounded-xl border border-slate-200 focus:border-blue-500 outline-none font-bold text-slate-600" value={formData.whoShouldEat} onChange={e => setFormData({ ...formData, whoShouldEat: e.target.value })} />
                        </InputWrapper>
                        <InputWrapper label="Quality & Heritage Promise">
                           <textarea rows={3} className="w-full px-5 py-4 rounded-xl border border-slate-200 focus:border-blue-500 outline-none font-bold text-slate-600" value={formData.whyChoose} onChange={e => setFormData({ ...formData, whyChoose: e.target.value })} />
                        </InputWrapper>
                     </div>
                  </div>
               </div>
            </div>

            {/* 4. SEO CARD */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
               <SectionHeader title="Search Optimization" icon={Globe} colorClass="text-blue-600" />
               <div className="p-8 space-y-6">
                  <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Meta Title</label><input type="text" className="w-full h-11 px-4 rounded-xl border border-slate-200 focus:border-blue-500 outline-none text-sm font-bold" value={formData.metaTitle} onChange={e => setFormData({ ...formData, metaTitle: e.target.value })} /></div>
                  <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Meta Description</label><textarea rows={3} className="w-full p-4 rounded-xl border border-slate-200 focus:border-blue-500 outline-none text-sm font-bold" value={formData.metaDescription} onChange={e => setFormData({ ...formData, metaDescription: e.target.value })} /></div>
                  <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">SEO Keywords</label><input type="text" className="w-full h-11 px-4 rounded-xl border border-slate-200 focus:border-blue-500 outline-none text-sm font-bold" value={formData.metaKeywords} onChange={e => setFormData({ ...formData, metaKeywords: e.target.value })} /></div>
               </div>
            </div>

            {/* 5. FAQ CARD */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
               <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                  <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-widest">FAQ Manager</h3>
                  <button type="button" onClick={() => { const newFaqs = [...formData.faqs, { q: '', a: '' }]; setFormData({ ...formData, faqs: newFaqs }); setOpenFaqIdx(newFaqs.length - 1); }} className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all">+ Add</button>
               </div>
               <div className="p-4 space-y-2">
                  {formData.faqs.map((faq: any, idx: number) => (
                     <div key={idx} className={`rounded-xl border transition-all ${openFaqIdx === idx ? 'border-blue-200 bg-blue-50/20' : 'border-slate-100'}`}>
                        <div onClick={() => setOpenFaqIdx(openFaqIdx === idx ? null : idx)} className="px-5 py-4 flex items-center justify-between cursor-pointer">
                           <span className="text-[11px] font-black text-slate-900 uppercase truncate max-w-[280px]">{faq.q || `Question ${idx + 1}`}</span>
                           <div className="flex items-center gap-2">
                              <button type="button" onClick={(e) => { e.stopPropagation(); const newFaqs = [...formData.faqs]; newFaqs.splice(idx, 1); setFormData({ ...formData, faqs: newFaqs }); }} className="text-slate-300 hover:text-red-500"><Trash2 size={12} /></button>
                              {openFaqIdx === idx ? <ChevronUp size={14} className="text-blue-500" /> : <ChevronDown size={14} className="text-slate-300" />}
                           </div>
                        </div>
                        {openFaqIdx === idx && (
                           <div className="px-5 pb-5 space-y-4">
                              <input className="w-full h-10 px-4 rounded-lg border border-slate-200 text-sm font-bold outline-none focus:border-blue-500" placeholder="Question" value={faq.q} onChange={e => { const newFaqs = [...formData.faqs]; newFaqs[idx].q = e.target.value; setFormData({ ...formData, faqs: newFaqs }); }} />
                              <textarea rows={2} className="w-full p-4 rounded-lg border border-slate-200 text-sm font-bold outline-none focus:border-blue-500" placeholder="Answer" value={faq.a} onChange={e => { const newFaqs = [...formData.faqs]; newFaqs[idx].a = e.target.value; setFormData({ ...formData, faqs: newFaqs }); }} />
                           </div>
                        )}
                     </div>
                  ))}
               </div>
            </div>
         </form>
      </div>
   );
}
