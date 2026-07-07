'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
   ArrowLeft,
   ChevronDown,
   ChevronUp,
   Save,
   Plus,
   Trash2,
   Image as ImageIcon,
   Tag,
   Layers,
   HelpCircle,
   X,
   Loader2,
   Video,
   Sparkles,
   Globe,
   RefreshCw,
   AlertCircle
} from 'lucide-react';
import useSWR from 'swr';
import { useToast } from '@/context/ToastContext';
import { API_URL } from '@/lib/api';

// Professional Rich Text Editor
const ReactQuill = dynamic(() => import('react-quill-new'), {
   ssr: false,
   loading: () => <div className="h-32 w-full bg-[#F8FAF7] animate-pulse rounded-lg border border-[#E5E7EB]" />
});
import 'react-quill-new/dist/quill.snow.css';

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

export default function EditProductClient({ id }: { id?: string }) {
   const router = useRouter();
   const params = useParams();
   const { user } = useAuth();
   const { addToast } = useToast();
   const [isLoading, setIsLoading] = useState(false);
   const [isUploading, setIsUploading] = useState(false);
   const [isVideoUploading, setIsVideoUploading] = useState(false);
   const [videoUploadProgress, setVideoUploadProgress] = useState(0);
   const [openFaqIdx, setOpenFaqIdx] = useState<number | null>(0);
   const fileInputRef = useRef<HTMLInputElement>(null);
   const videoInputRef = useRef<HTMLInputElement>(null);
   const productId = id || (params.id as string);

   const [selectedBrandId, setSelectedBrandId] = useState<string>('');

   const isAdmin = user?.role?.toLowerCase() === 'admin';

   // Fetch all brands (subvendors), including those with 0 products
   const { data: subVendorsRes } = useSWR(`${API_URL}/api/sub-vendors?includeEmpty=true&limit=1000`, fetcher);
   const subVendors = subVendorsRes?.subVendors || [];

   const [isHydrated, setIsHydrated] = useState(false);

   // Form State
   const [formData, setFormData] = useState({
      name: '',
      categoryId: '',
      subcategoryId: '',
      description: '',
      image: '',
      images: [] as string[],
      videoUrl: '',
      price: '',
      originalPrice: '',
      whatIsProduct: '',
      healthBenefits: '',
      whyChoose: '',
      whoShouldEat: '',
      howToEat: '',
      faqs: [] as { q: string; a: string }[],
      metaTitle: '',
      metaDescription: '',
      metaKeywords: [] as string[],
      newKeyword: '',
      tags: [] as string[],
      newTag: '',
      variants: [] as { name: string; price: string; originalPrice: string; stock: string; sku: string }[]
   });

   // Hydration
   const { data: product, error: productError } = useSWR(productId ? `${API_URL}/api/products/${productId}` : null, fetcher);
   const { data: categoriesRes, error: categoriesError } = useSWR(`${API_URL}/api/categories?all=true&limit=1000`, fetcher);

   React.useEffect(() => {
      if (categoriesError) {
         console.error("Failed to load categories:", categoriesError);
      }
   }, [categoriesError]);

   const categories = categoriesRes?.categories || [];
   const isLoadingCategories = !categoriesRes && !categoriesError;

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

   // Synchronize selected brand state
   useEffect(() => {
      if (product && product.subVendorId) {
         setSelectedBrandId(product.subVendorId.toString());
      } else if (user?.brandId) {
         setSelectedBrandId(user.brandId.toString());
      }
   }, [product, user?.brandId]);

   useEffect(() => {
      if (product && !product.error && !isHydrated && categories.length > 0) {
         const extractedImages = product.images?.length > 0
            ? product.images.map((img: any) => img.url || img)
            : product.image ? [product.image] : [];

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
            name: product.name || '',
            categoryId: uiCategoryId,
            subcategoryId: uiSubcategoryId,
            description: product.description || '',
            image: product.image || '',
            images: extractedImages,
            videoUrl: product.videoUrl || '',
            price: product.price || '',
            originalPrice: product.originalPrice || '',
            whatIsProduct: product.whatIsProduct || '',
            healthBenefits: product.healthBenefits || '',
            whyChoose: product.whyChoose || '',
            whoShouldEat: product.whoShouldEat || '',
            howToEat: product.howToEat || '',
            faqs: product.faqs ? product.faqs.map((f: any) => ({ q: f.question || f.q || '', a: f.answer || f.a || '' })) : [],
            metaTitle: product.metaTitle || '',
            metaDescription: product.metaDescription || '',
            metaKeywords: product.metaKeywords ? product.metaKeywords.split(',').map((k: string) => k.trim()).filter(Boolean) : [],
            newKeyword: '',
            tags: product.tags || [],
            newTag: '',
            variants: product.variants ? product.variants.map((v: any) => ({
               name: v.name || '',
               price: v.price?.toString() || '',
               originalPrice: v.originalPrice?.toString() || '',
               stock: v.stock?.toString() || '0',
               sku: v.sku || ''
            })) : []
         });
         setIsHydrated(true);
      }
   }, [product, isHydrated, categories]);

   const handleAddTag = () => {
      if (formData.newTag && !formData.tags.includes(formData.newTag)) {
         setFormData({ ...formData, tags: [...formData.tags, formData.newTag], newTag: '' });
      }
   };

   const handleAddKeyword = () => {
      if (formData.newKeyword && !formData.metaKeywords.includes(formData.newKeyword)) {
         setFormData({ ...formData, metaKeywords: [...formData.metaKeywords, formData.newKeyword], newKeyword: '' });
      }
   };

   const handleKeywordKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' || e.key === ',') {
         e.preventDefault();
         handleAddKeyword();
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
            setFormData(prev => {
               const newImages = [...prev.images, data.url];
               return {
                  ...prev,
                  images: newImages,
                  image: prev.image && prev.image.trim() !== '' ? prev.image : data.url
               };
            });
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

   const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setIsVideoUploading(true);
      setVideoUploadProgress(0);
      const uploadData = new FormData();
      uploadData.append('video', file);

      const xhr = new XMLHttpRequest();
      xhr.open('POST', `${API_URL}/api/upload/video`);

      const token = typeof window !== 'undefined' ? localStorage.getItem('namma_orru_token') : null;
      if (token) {
         xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      }

      xhr.upload.onprogress = (event) => {
         if (event.lengthComputable) {
            const percentComplete = Math.round((event.loaded / event.total) * 100);
            setVideoUploadProgress(percentComplete);
         }
      };

      xhr.onload = () => {
         setIsVideoUploading(false);
         if (xhr.status >= 200 && xhr.status < 300) {
            try {
               const data = JSON.parse(xhr.responseText);
               setFormData(prev => ({ ...prev, videoUrl: data.url }));
               addToast('Success', 'Product video uploaded');
            } catch (err) {
               addToast('Error', 'Invalid response from server.');
            }
         } else {
            addToast('Error', 'Video upload failed.');
         }
      };

      xhr.onerror = () => {
         setIsVideoUploading(false);
         addToast('Error', 'Network error during upload.');
      };

      xhr.send(uploadData);
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

   const selectedParentHasChildren = formData.categoryId ? subcategories.length > 0 : false;

   const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();

      const activeBrandId = selectedBrandId || user?.brandId?.toString() || product?.subVendorId?.toString();
      if (!activeBrandId) {
         addToast('Association Error', 'Please select a Brand / Sub-Vendor to associate this product with.');
         return;
      }

      if (selectedParentHasChildren && !formData.subcategoryId) {
         addToast('Subcategory Required', 'Please select a subcategory for the chosen category.');
         return;
      }

      setIsLoading(true);
      try {
         const token = typeof window !== 'undefined' ? localStorage.getItem('namma_orru_token') : null;
         const headers: Record<string, string> = { 'Content-Type': 'application/json' };
         if (token) {
            headers['Authorization'] = `Bearer ${token}`;
         }

         const payload = {
            ...formData,
            categoryId: parseInt(formData.categoryId),
            subcategoryId: formData.subcategoryId ? parseInt(formData.subcategoryId) : null,
            price: parseFloat(formData.price),
            originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : null,
            brandId: parseInt(activeBrandId),
            metaKeywords: formData.metaKeywords.join(', '),
            variants: formData.variants.map(v => ({
               name: v.name,
               price: v.price ? parseFloat(v.price) : null,
               originalPrice: v.originalPrice ? parseFloat(v.originalPrice) : null,
               stock: parseInt(v.stock?.toString() || '0'),
               sku: v.sku
            }))
         };

         const res = await fetch(`${API_URL}/api/products/${productId}`, {
            method: 'PUT',
            headers,
            body: JSON.stringify(payload)
         });

         if (res.ok) {
            addToast('Product Updated Successfully', formData.name);
            router.push('/vendor/products');
         } else {
            const error = await res.json();
            addToast('Updation Error', error.error || 'Check all required fields');
         }
      } catch (err) {
         addToast('Critical Error', 'Agrarian database synchronization failed');
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

   const quillFormats = useMemo(() => [
      'header',
      'bold', 'italic', 'underline', 'strike',
      'list',
      'align',
      'link'
   ], []);

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
         <style jsx global>{`
            .rich-text-container .ql-toolbar {
               border-top-left-radius: 12px;
               border-top-right-radius: 12px;
               border: 1px solid #E5E7EB;
               background: #F8FAF7;
               padding: 12px;
            }
            .rich-text-container .ql-container {
               border-bottom-left-radius: 12px;
               border-bottom-right-radius: 12px;
               border: 1px solid #E5E7EB;
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

         {/* Sticky Header Navigation */}
         <div className="sticky top-0 z-40 bg-white/85 backdrop-blur-xl border-b border-[#E5E7EB] mb-8 py-6 px-8">
            <div className="w-full flex items-center justify-between">
               <div className="flex items-center gap-4">
                  <button
                     onClick={() => router.back()}
                     type="button"
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
                     {isLoading ? 'Updating...' : 'Save Changes'}
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
                     {formData.images.map((img: string, idx: number) => (
                        <div key={idx} className="group relative aspect-square rounded-xl bg-[#F8FAF7] border border-[#E5E7EB] overflow-hidden hover:border-[#0F7A4D] transition-all shadow-sm">
                           <img src={img} className="w-full h-full object-cover" alt={`Visual ${idx}`} />
                           <button type="button" onClick={() => removeImage(idx)} className="absolute top-2 right-2 h-6 w-6 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-lg hover:scale-110"><X size={12} /></button>
                           {formData.image === img && <div className="absolute bottom-0 left-0 right-0 bg-[#0F7A4D] text-white text-[8px] font-black uppercase text-center py-1.5 tracking-widest">Primary Hero</div>}
                           <div onClick={() => setFormData({ ...formData, image: img })} className={`absolute inset-0 cursor-pointer ${formData.image === img ? 'bg-transparent' : 'bg-black/0 hover:bg-black/20'} transition-all`} />
                        </div>
                     ))}
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
                  </div>

                  <div className="pt-8 border-t border-[#E5E7EB]">
                     <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                           <Video size={18} className="text-[#111827]" />
                           <h4 className="text-[11px] font-black text-[#111827] uppercase tracking-widest">Product Discovery Video</h4>
                        </div>
                     </div>
                     <div onClick={() => !isVideoUploading && !formData.videoUrl && videoInputRef.current?.click()} className={`h-auto min-h-[96px] rounded-xl border-2 border-dashed border-[#E5E7EB] bg-[#F8FAF7]/50 flex flex-col items-center justify-center transition-all relative ${!formData.videoUrl ? 'hover:border-[#0F7A4D] cursor-pointer' : ''}`}>
                        <input type="file" ref={videoInputRef} className="hidden" accept="video/*" onChange={handleVideoUpload} />
                        {isVideoUploading ? (
                           <div className="py-8 flex flex-col items-center justify-center w-full px-10">
                              <Loader2 className="h-6 w-6 text-[#0F7A4D] animate-spin mb-4" />
                              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                                 <div className="h-full bg-[#0F7A4D] transition-all duration-300" style={{ width: `${videoUploadProgress}%` }} />
                              </div>
                              <p className="text-[10px] font-black text-[#6B7280] uppercase tracking-widest mt-2">{videoUploadProgress}% Uploaded</p>
                           </div>
                        ) : formData.videoUrl ? (
                           <div className="w-full flex flex-col items-center">
                              <video src={formData.videoUrl} controls className="w-full max-h-[300px] rounded-t-lg bg-black object-contain" />
                              <div className="flex items-center justify-between w-full px-4 py-3 bg-white border-t border-[#E5E7EB] rounded-b-lg">
                                 <p className="text-[11px] font-black text-[#111827] uppercase truncate">Video Uploaded</p>
                                 <button type="button" onClick={() => videoInputRef.current?.click()} className="text-[10px] font-black text-[#0F7A4D] uppercase hover:text-[#0c623d]">Replace Video</button>
                              </div>
                           </div>
                        ) : (
                           <div className="py-8"><span className="text-[10px] font-black text-[#6B7280] uppercase tracking-widest">Upload story video</span></div>
                        )}
                     </div>
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

                  {(isAdmin || !user?.brandId) && (
                     <InputWrapper label="Associated Brand / Sub-Vendor" helpText="Specify the vendor brand that Products or produces this item.">
                        <div className="relative">
                           <select
                              required
                              className="w-full h-14 px-6 rounded-xl border border-[#E5E7EB] bg-white focus:border-[#0F7A4D] outline-none font-bold text-sm appearance-none text-[#111827] focus:ring-4 focus:ring-[#0F7A4D]/5"
                              value={selectedBrandId}
                              onChange={e => setSelectedBrandId(e.target.value)}
                           >
                              <option value="">Select Brand / Sub-Vendor</option>
                              {subVendors.map((vendor: any) => (
                                 <option key={vendor.id} value={vendor.id}>
                                    {vendor.name}
                                 </option>
                              ))}
                           </select>
                           <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                        </div>
                     </InputWrapper>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     <InputWrapper label="Primary Category">
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
                              {!isLoadingCategories && categories.filter((c: any) => !c.parentId).length === 0 && (
                                 <option disabled value="">No categories available. Contact administrator.</option>
                              )}
                           </select>
                           <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                        </div>
                        {!isLoadingCategories && categories.filter((c: any) => !c.parentId).length === 0 && (
                           <p className="text-[10px] font-bold text-red-500 mt-1">No categories available. Contact administrator.</p>
                        )}
                     </InputWrapper>

                     <InputWrapper label={selectedParentHasChildren ? 'Subcategory *' : 'Subcategory'}>
                        <div className="relative">
                           <select
                              className={`w-full h-14 px-6 rounded-xl border bg-white focus:border-[#0F7A4D] outline-none font-bold text-sm appearance-none text-[#111827] disabled:opacity-50 focus:ring-4 focus:ring-[#0F7A4D]/5 ${selectedParentHasChildren && !formData.subcategoryId ? 'border-red-400' : 'border-[#E5E7EB]'}`}
                              value={formData.subcategoryId}
                              onChange={e => setFormData({ ...formData, subcategoryId: e.target.value })}
                              disabled={!formData.categoryId}
                           >
                              <option value="">{selectedParentHasChildren ? 'Select Subcategory (Required)' : 'Select Subcategory'}</option>
                              {subcategories.map((cat: any) => (
                                 <option key={cat.id} value={cat.id}>{cat.name}</option>
                              ))}
                           </select>
                           <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                        </div>
                        {selectedParentHasChildren && !formData.subcategoryId && formData.categoryId && (
                           <p className="text-[10px] font-bold text-red-500 mt-1">This category requires a subcategory selection.</p>
                        )}
                     </InputWrapper>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     <div className="flex gap-4">
                        <InputWrapper label="Selling Price (INR)">
                           <input
                              required
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

                  <InputWrapper label="Product Short Summary">
                     <textarea
                        required
                        rows={2}
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
                                 <button type="button" onClick={() => setFormData({ ...formData, tags: formData.tags.filter(t => t !== tag) })} className="hover:text-red-555 font-bold">×</button>
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
                              className="h-12 w-12 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-all font-black text-slate-800"
                           >
                              <Plus size={18} strokeWidth={3} />
                           </button>
                        </div>
                     </div>
                  </InputWrapper>
               </div>
            </div>

            {/* 3. VARIANT MANAGER */}
            <div className="bg-white rounded-[20px] border border-[#E5E7EB] shadow-[0_4px_12px_rgba(0,0,0,0.05)] overflow-hidden w-full">
               <div className="px-6 py-5 border-b border-[#E5E7EB] bg-[#F8FAF7] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                     <Layers size={16} className="text-[#0F7A4D]" />
                     <h3 className="text-[10px] font-black text-[#111827] uppercase tracking-widest">Variant & Inventory Manager</h3>
                  </div>
                  <button type="button" onClick={() => setFormData({ ...formData, variants: [...formData.variants, { name: '', price: '', originalPrice: '', stock: '0', sku: '' }] })} className="px-3 py-1.5 rounded-lg bg-[#0F7A4D] text-white text-[10px] font-black uppercase tracking-widest hover:bg-[#0c623d] transition-all shadow-sm">+ Add Variant</button>
               </div>
               <div className="p-6 space-y-4">
                  {formData.variants.length === 0 ? (
                     <div className="text-center py-8 text-[#6B7280] text-sm font-medium border-2 border-dashed border-[#E5E7EB] rounded-xl bg-[#F8FAF7]/50">No variants added. The product will use the base price.</div>
                  ) : (
                     <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[1000px] admin-data-table">
                           <thead>
                              <tr className="border-b border-[#E5E7EB] text-[10px] font-black text-[#6B7280] uppercase tracking-widest">
                                 <th className="pb-3 font-black">Variant Name <span className="font-medium normal-case text-slate-450">(e.g. 500g)</span></th>
                                 <th className="pb-3 font-black">Selling Price</th>
                                 <th className="pb-3 font-black">MRP</th>
                                 <th className="pb-3 font-black">Stock</th>

                                 <th className="pb-3 font-black text-right">Actions</th>
                              </tr>
                           </thead>
                           <tbody className="divide-y divide-[#E5E7EB]">
                              {formData.variants.map((variant: any, idx: number) => (
                                 <tr key={idx} className="group">
                                    <td className="py-3 pr-2"><input type="text" className="w-full h-11 px-4 rounded-xl border border-[#E5E7EB] bg-white text-sm font-bold outline-none focus:border-[#0F7A4D] transition-colors focus:ring-4 focus:ring-[#0F7A4D]/5" placeholder="Variant name" value={variant.name} onChange={e => { const newV = [...formData.variants]; newV[idx].name = e.target.value; setFormData({ ...formData, variants: newV }); }} /></td>
                                    <td className="py-3 pr-2"><input type="number" className="w-full h-11 px-4 rounded-xl border border-[#E5E7EB] bg-white text-sm font-bold outline-none focus:border-[#0F7A4D] transition-colors text-[#0F7A4D] font-black focus:ring-4 focus:ring-[#0F7A4D]/5" placeholder="Price" value={variant.price} onChange={e => { const newV = [...formData.variants]; newV[idx].price = e.target.value; setFormData({ ...formData, variants: newV }); }} /></td>
                                    <td className="py-3 pr-2"><input type="number" className="w-full h-11 px-4 rounded-xl border border-[#E5E7EB] bg-white text-sm font-bold outline-none focus:border-[#0F7A4D] transition-colors text-[#6B7280] focus:ring-4 focus:ring-[#0F7A4D]/5" placeholder="MRP" value={variant.originalPrice} onChange={e => { const newV = [...formData.variants]; newV[idx].originalPrice = e.target.value; setFormData({ ...formData, variants: newV }); }} /></td>
                                    <td className="py-3 pr-2"><input type="number" className="w-full h-11 px-4 rounded-xl border border-[#E5E7EB] bg-white text-sm font-bold outline-none focus:border-[#0F7A4D] transition-colors focus:ring-4 focus:ring-[#0F7A4D]/5" placeholder="Stock" value={variant.stock} onChange={e => { const newV = [...formData.variants]; newV[idx].stock = e.target.value; setFormData({ ...formData, variants: newV }); }} /></td>
                                    <td className="py-3 text-right"><button type="button" onClick={() => { const newV = [...formData.variants]; newV.splice(idx, 1); setFormData({ ...formData, variants: newV }); }} className="h-11 w-11 inline-flex items-center justify-center rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all"><Trash2 size={16} /></button></td>
                                 </tr>
                              ))}
                           </tbody>
                        </table>
                     </div>
                  )}
               </div>
            </div>

            {/* 4. Product Specification (RICH TEXT) */}
            <div className="bg-white rounded-[20px] border border-[#E5E7EB] shadow-[0_4px_12px_rgba(0,0,0,0.05)] overflow-hidden w-full">
               <SectionHeader title="Product Specification" icon={Sparkles} colorClass="text-[#F59E0B]" />
               <div className="p-8 space-y-10">
                  <div className="grid grid-cols-1 gap-10">
                     <InputWrapper label="Product Description">
                        <div className="rich-text-container">
                           <ReactQuill theme="snow" value={formData.whatIsProduct} onChange={val => setFormData(prev => ({ ...prev, whatIsProduct: val }))} modules={quillModules} formats={quillFormats} />
                        </div>
                     </InputWrapper>
                     <InputWrapper label="Wellness & Health Benefits">
                        <div className="rich-text-container">
                           <ReactQuill theme="snow" value={formData.healthBenefits} onChange={val => setFormData(prev => ({ ...prev, healthBenefits: val }))} modules={quillModules} formats={quillFormats} />
                        </div>
                     </InputWrapper>
                     <InputWrapper label="Usage & Consumption Guide">
                        <div className="rich-text-container">
                           <ReactQuill theme="snow" value={formData.howToEat} onChange={val => setFormData(prev => ({ ...prev, howToEat: val }))} modules={quillModules} formats={quillFormats} />
                        </div>
                     </InputWrapper>
                     <InputWrapper label="Product specification">
                        <div className="rich-text-container">
                           <ReactQuill theme="snow" value={formData.whoShouldEat} onChange={val => setFormData(prev => ({ ...prev, whoShouldEat: val }))} modules={quillModules} formats={quillFormats} />
                        </div>
                     </InputWrapper>
                     <InputWrapper label="Quality Details">
                        <div className="rich-text-container">
                           <ReactQuill theme="snow" value={formData.whyChoose} onChange={val => setFormData(prev => ({ ...prev, whyChoose: val }))} modules={quillModules} formats={quillFormats} />
                        </div>
                     </InputWrapper>
                  </div>
               </div>
            </div>

            {/* 5. SEO CARD (Hidden for Vendors)
            <div className="bg-white rounded-[20px] border border-[#E5E7EB] shadow-[0_4px_12px_rgba(0,0,0,0.05)] overflow-hidden">
               <SectionHeader title="SEO Meta Details" icon={Globe} colorClass="text-[#0F7A4D]" />
               <div className="p-8 space-y-6">
                  <div className="space-y-2"><label className="text-[10px] font-black text-[#6B7280] uppercase tracking-widest">Meta Title</label><input type="text" className="w-full h-11 px-4 rounded-xl border border-[#E5E7EB] bg-white focus:border-[#0F7A4D] focus:ring-4 focus:ring-[#0F7A4D]/5 outline-none text-sm font-bold text-[#111827]" value={formData.metaTitle} onChange={e => setFormData({ ...formData, metaTitle: e.target.value })} /></div>
                  <div className="space-y-2"><label className="text-[10px] font-black text-[#6B7280] uppercase tracking-widest">Meta Description</label><textarea rows={3} className="w-full p-4 rounded-xl border border-[#E5E7EB] bg-white focus:border-[#0F7A4D] focus:ring-4 focus:ring-[#0F7A4D]/5 outline-none text-sm font-bold text-[#111827]" value={formData.metaDescription} onChange={e => setFormData({ ...formData, metaDescription: e.target.value })} /></div>
                  <div className="space-y-4">
                     <label className="text-[10px] font-black text-[#6B7280] uppercase tracking-widest">SEO Keywords</label>
                     <div className="flex flex-wrap gap-2">
                        {formData.metaKeywords.map(kw => (
                           <span key={kw} className="px-3 py-1.5 rounded-lg bg-[#DCFCE7] text-[#15803D] text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                              {kw}
                              <button type="button" onClick={() => setFormData({ ...formData, metaKeywords: formData.metaKeywords.filter(k => k !== kw) })} className="hover:text-red-555 font-bold">×</button>
                           </span>
                        ))}
                     </div>
                     <div className="flex gap-2">
                        <input
                           placeholder="Type a keyword and press Enter or Comma..."
                           className="flex-1 h-12 px-5 rounded-xl border border-[#E5E7EB] bg-white focus:border-[#0F7A4D] focus:ring-4 focus:ring-[#0F7A4D]/5 outline-none font-bold text-xs text-[#111827]"
                           value={formData.newKeyword}
                           onChange={e => setFormData({ ...formData, newKeyword: e.target.value })}
                           onKeyDown={handleKeywordKeyDown}
                        />
                        <button
                           type="button"
                           onClick={handleAddKeyword}
                           className="h-12 w-12 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-all font-black text-slate-800"
                        >
                           <Plus size={18} strokeWidth={3} />
                        </button>
                     </div>
                  </div>
               </div>
            </div>
            */}

            {/* 6. FAQ CARD */}
            <div className="bg-white rounded-[20px] border border-[#E5E7EB] shadow-[0_4px_12px_rgba(0,0,0,0.05)] overflow-hidden">
               <div className="px-6 py-5 border-b border-[#E5E7EB] bg-[#F8FAF7] flex items-center justify-between">
                  <h3 className="text-[10px] font-black text-[#111827] uppercase tracking-widest">FAQ</h3>
                  <button type="button" onClick={() => { const newFaqs = [...formData.faqs, { q: '', a: '' }]; setFormData({ ...formData, faqs: newFaqs }); setOpenFaqIdx(newFaqs.length - 1); }} className="px-3 py-1.5 rounded-lg bg-[#0F7A4D] text-white text-[10px] font-black uppercase tracking-widest hover:bg-[#0c623d] transition-all">+ Add FAQ</button>
               </div>
               <div className="p-4 space-y-2">
                  {formData.faqs.map((faq: any, idx: number) => (
                     <div key={idx} className={`rounded-xl border transition-all ${openFaqIdx === idx ? 'border-[#0F7A4D] bg-[#DCFCE7]/10' : 'border-[#E5E7EB]'}`}>
                        <div onClick={() => setOpenFaqIdx(openFaqIdx === idx ? null : idx)} className="px-5 py-4 flex items-center justify-between cursor-pointer">
                           <span className="text-[11px] font-black text-[#111827] uppercase truncate max-w-[280px]">{faq.q || `Question ${idx + 1}`}</span>
                           <div className="flex items-center gap-2">
                              <button type="button" onClick={(e) => { e.stopPropagation(); const newFaqs = [...formData.faqs]; newFaqs.splice(idx, 1); setFormData({ ...formData, faqs: newFaqs }); }} className="text-slate-400 hover:text-red-500"><Trash2 size={12} /></button>
                              {openFaqIdx === idx ? <ChevronUp size={14} className="text-[#0F7A4D]" /> : <ChevronDown size={14} className="text-slate-450" />}
                           </div>
                        </div>
                        {openFaqIdx === idx && (
                           <div className="px-5 pb-5 space-y-4">
                              <input className="w-full h-10 px-4 rounded-lg border border-[#E5E7EB] bg-white focus:border-[#0F7A4D] focus:ring-4 focus:ring-[#0F7A4D]/5 text-sm font-bold outline-none text-[#111827]" placeholder="Question" value={faq.q} onChange={e => { const newFaqs = [...formData.faqs]; newFaqs[idx].q = e.target.value; setFormData({ ...formData, faqs: newFaqs }); }} />
                              <textarea rows={2} className="w-full p-4 rounded-lg border border-[#E5E7EB] bg-white focus:border-[#0F7A4D] focus:ring-4 focus:ring-[#0F7A4D]/5 text-sm font-bold outline-none text-[#111827] resize-none" placeholder="Answer" value={faq.a} onChange={e => { const newFaqs = [...formData.faqs]; newFaqs[idx].a = e.target.value; setFormData({ ...formData, faqs: newFaqs }); }} />
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
