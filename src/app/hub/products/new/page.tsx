'use client';

import React, { useState, useRef, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
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
   Package
} from 'lucide-react';
import useSWR from 'swr';
import RelatedProductsSelector from '@/components/admin/RelatedProductsSelector';
import ComboProductsSelector from '@/components/admin/ComboProductsSelector';
import { useToast } from '@/context/ToastContext';
import { API_URL } from '@/lib/api';

// Professional Rich Text Editor
const ReactQuill = dynamic(() => import('react-quill-new'), {
   ssr: false,
   loading: () => <div className="h-32 w-full bg-[#F8FAF7] animate-pulse rounded-lg border border-[#E5E7EB]" />
});
import 'react-quill-new/dist/quill.snow.css';

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

export default function CreateProduct() {
   const router = useRouter();
   const { user } = useAuth();
   const { addToast } = useToast();
   const [isLoading, setIsLoading] = useState(false);
   const [isUploading, setIsUploading] = useState(false);
   const [isVideoUploading, setIsVideoUploading] = useState(false);
   const [videoUploadProgress, setVideoUploadProgress] = useState(0);
   const [openFaqIdx, setOpenFaqIdx] = useState<number | null>(0);
   const fileInputRef = useRef<HTMLInputElement>(null);
   const videoInputRef = useRef<HTMLInputElement>(null);

   const [selectedBrandId, setSelectedBrandId] = useState<string>('');
   const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
   const [comboProducts, setComboProducts] = useState<any[]>([]);

   const isAdmin = user?.role?.toLowerCase() === 'admin';

   // Fetch all brands (subvendors) assigned to this Hub
   const { data: subVendorsRes } = useSWR(user ? `${API_URL}/api/vendor-hub/sub-vendors?limit=1000` : null, (url: string) => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('namma_orru_token') : null;
      return fetch(url, { headers: token ? { Authorization: `Bearer ${token}` } : {} }).then(r => r.json());
   });
   const subVendors = subVendorsRes?.subVendors || [];

   // Synchronize selected brand state with the user's active session brand
   React.useEffect(() => {
      if (user?.brandId) {
         setSelectedBrandId(user.brandId.toString());
      } else if (subVendors.length > 0 && !selectedBrandId) {
         setSelectedBrandId(subVendors[0].id.toString());
      }
   }, [user?.brandId, subVendors, selectedBrandId]);

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
      ingredientsInfo: '',
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
      inventoryMode: 'SINGLE',
      weight: '',
      unit: 'g',
      stock: '0',
      sku: '',
      variants: [] as { name: string; price: string; originalPrice: string; stock: string; sku: string; weight: string; unit: string; barcode: string }[],
      comboOffer: '',
      freeDelivery: '',
      isComboFallbackEnabled: true,
      productHighlights: [] as { title: string; description: string; sortOrder: number; isActive: boolean }[]
   });

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

      const activeBrandId = selectedBrandId || user?.brandId?.toString();
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
            comboOffer: formData.comboOffer,
            freeDelivery: formData.freeDelivery,
            ingredientsInfo: formData.ingredientsInfo,
            isComboFallbackEnabled: formData.isComboFallbackEnabled,
            relatedProducts: relatedProducts.map(rp => rp.relatedProductId || rp.id),
            productCombos: comboProducts,
            metaKeywords: formData.metaKeywords.join(', '),
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

         const res = await fetch(`${API_URL}/api/products`, {
            method: 'POST',
            headers,
            body: JSON.stringify(payload)
         });

         if (res.ok) {
            const data = await res.json();
            if (data && data.success) {
               addToast('Success', data.message || 'Product created successfully');
               router.push('/hub/products');
            } else {
               addToast('Error', data.message || 'Failed to create product');
            }
         } else {
            try {
               const error = await res.json();
               addToast('Fulfillment Error', error.message || error.error || 'Check all required fields');
            } catch (e) {
               addToast('Fulfillment Error', `Server returned error status ${res.status}`);
            }
         }
      } catch (err) {
         addToast('Critical Error', 'Connectivity to agrarian node lost');
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
                        Product
                     </h1>
                     <p className="text-[10px] font-bold text-[#6B7280] uppercase tracking-widest mt-0.5">Namma Reseller Product Registration</p>
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
                     {isLoading ? 'Creating...' : 'Create Product'}
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

                  <InputWrapper label="Associated Brand / Sub-Vendor" helpText="Specify the vendor brand that produces this item.">
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
                              <input
                                 type="text"
                                 className="w-full h-14 px-6 rounded-xl border border-[#E5E7EB] bg-white focus:border-[#0F7A4D] focus:ring-4 focus:ring-[#0F7A4D]/5 outline-none font-bold text-sm"
                                 placeholder="e.g. g, kg, ml, pcs"
                                 value={formData.unit}
                                 onChange={e => setFormData({ ...formData, unit: e.target.value })}
                              />
                           </InputWrapper>
                           <InputWrapper label="Base Stock">
                              <input type="number" className="w-full h-14 px-6 rounded-xl border border-[#E5E7EB] bg-white focus:border-[#0F7A4D] focus:ring-4 focus:ring-[#0F7A4D]/5 outline-none font-bold text-sm" value={formData.stock} onChange={e => setFormData({ ...formData, stock: e.target.value })} />
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
                                 <button type="button" onClick={() => setFormData({ ...formData, tags: formData.tags.filter(t => t !== tag) })} className="hover:text-red-550 font-bold">×</button>
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
                     <InputWrapper label="Ingredients">
                        <div className="rich-text-container">
                           <ReactQuill theme="snow" value={formData.ingredientsInfo} onChange={val => setFormData(prev => ({ ...prev, ingredientsInfo: val }))} modules={quillModules} formats={quillFormats} />
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

            {/* 5. RELATED & COMBO PRODUCTS */}
            <div className="bg-white rounded-[20px] border border-[#E5E7EB] shadow-[0_4px_12px_rgba(0,0,0,0.05)] overflow-hidden">
               <SectionHeader title="Cross-Sell & Upsell" icon={Package} colorClass="text-[#0F7A4D]" />
               <div className="p-8 space-y-6">
                  <div className="space-y-4">
                     <label className="text-[10px] font-black text-[#6B7280] uppercase tracking-widest">Related Products (Alternative Options)</label>
                     <RelatedProductsSelector
                        relatedProducts={relatedProducts}
                        onChange={setRelatedProducts}
                        isAdmin={false}
                     />
                  </div>
                  <div className="space-y-4 mt-8 border-t border-[#E5E7EB] pt-8">
                     <label className="text-[10px] font-black text-[#6B7280] uppercase tracking-widest">Combo Offer (Pairs Well With)</label>
                     <ComboProductsSelector
                        comboProducts={comboProducts}
                        onChange={setComboProducts}
                        isAdmin={false}
                        isFallbackEnabled={formData.isComboFallbackEnabled}
                        onFallbackToggle={(val: boolean) => setFormData(prev => ({ ...prev, isComboFallbackEnabled: val }))}
                     />
                  </div>
               </div>
            </div>

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
