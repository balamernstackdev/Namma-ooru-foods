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
   Play,
   ShoppingBag
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import RelatedProductsSelector from './RelatedProductsSelector';
import ComboProductsSelector from './ComboProductsSelector';

import useSWR, { mutate } from 'swr';
import { useToast } from '@/context/ToastContext';
import { useAuth } from '@/context/AuthContext';
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
   const { user } = useAuth();
   const isAdmin = user?.role?.toLowerCase() === 'admin';
   const [isLoading, setIsLoading] = useState(false);
   const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
   const [comboProducts, setComboProducts] = useState<any[]>([]);
   const [isUploading, setIsUploading] = useState(false);
   const [isVideoUploading, setIsVideoUploading] = useState(false);
   const [videoUploadProgress, setVideoUploadProgress] = useState(0);
   const [openFaqIdx, setOpenFaqIdx] = useState<number | null>(0);
   const fileInputRef = useRef<HTMLInputElement>(null);
   const videoInputRef = useRef<HTMLInputElement>(null);
   const [imageMetadata, setImageMetadata] = useState<Record<string, { resolution: string; size: string; qualityStatus: string; }>>({});

   const [formData, setFormData] = useState({
      name: initialData?.name || '',
      categoryId: initialData?.categoryId?.toString() || '',
      subcategoryId: initialData?.subcategoryId?.toString() || '',
      description: initialData?.description || '',
      image: initialData?.image || '',
      images: (initialData?.images?.length > 0)
         ? initialData.images.map((img: any) => img.url || img)
         : (initialData?.image ? [initialData.image] : []),
      videoUrl: initialData?.videoUrl || '',
      price: initialData?.price || '',
      originalPrice: initialData?.originalPrice || '',
      whatIsProduct: initialData?.whatIsProduct || '',
      ingredientsInfo: initialData?.ingredientsInfo || '',
      healthBenefits: initialData?.healthBenefits || '',
      whyChoose: initialData?.whyChoose || '',
      whoShouldEat: initialData?.whoShouldEat || '',
      howToEat: initialData?.howToEat || '',
      storageInstructions: initialData?.storageInstructions || '',
      faqs: initialData?.faqs ? initialData.faqs.map((f: any) => ({ q: f.question || f.q || '', a: f.answer || f.a || '' })) : [],
      metaTitle: initialData?.metaTitle || '',
      metaDescription: initialData?.metaDescription || '',
      metaKeywords: initialData?.metaKeywords ? initialData.metaKeywords.split(',').map((k: string) => k.trim()).filter(Boolean) : [] as string[],
      newKeyword: '',
      variants: initialData?.variants || [],
      comboOffer: initialData?.comboOffer || '',
      freeDelivery: initialData?.freeDelivery || '',
      subVendorId: initialData?.subVendorId?.toString() || '',
      headVendorId: initialData?.subVendor?.headVendorId?.toString() || '',
      isBestSeller: initialData?.isBestSeller || false,
      isOrganic: initialData?.isOrganic || false,
      isFarmerCollection: initialData?.isFarmerCollection || false,
      isFeatured: initialData?.isFeatured || false,
      isNewArrival: initialData?.isNewArrival || false,
      isFastDelivery: initialData?.isFastDelivery || false,
      deliveryTime: initialData?.deliveryTime || '',
      inventoryMode: initialData?.inventoryMode || 'SINGLE',
      weight: initialData?.weight?.toString() || '',
      unit: initialData?.unit || 'g',
      sku: initialData?.sku || '',
      stock: initialData?.stock?.toString() || '0',
      isComboFallbackEnabled: initialData?.isComboFallbackEnabled ?? true,
      gstRate: initialData?.gstRate !== undefined && initialData?.gstRate !== null ? initialData.gstRate.toString() : '',
      productHighlights: initialData?.productHighlights ? initialData.productHighlights.map((h: any) => ({
         title: h.title,
         description: h.description,
         sortOrder: h.sortOrder,
         isActive: h.isActive
      })) : []
   });

   const { data: categoriesRes } = useSWR(`${API_URL}/api/categories?all=true&limit=1000`, fetcher);
   const allCategoryList: any[] = Array.isArray(categoriesRes)
      ? categoriesRes
      : (categoriesRes?.categories || []);
   const categories = allCategoryList;

   const [isInitialized, setIsInitialized] = useState(false);

   const { data: subcategoriesRes } = useSWR(
      formData.categoryId ? `${API_URL}/api/subcategories?categoryId=${formData.categoryId}&limit=100` : null,
      fetcher
   );
   const dbSubcategories = subcategoriesRes?.subcategories || [];

   const subcategories = useMemo(() => {
      if (!formData.categoryId) return [];
      if (dbSubcategories.length > 0) return dbSubcategories;
      return allCategoryList.filter((c: any) => c.parentId === Number(formData.categoryId));
   }, [dbSubcategories, allCategoryList, formData.categoryId]);

   const selectedParentHasChildren = formData.categoryId ? subcategories.length > 0 : false;

   const { data: headVendorsRes } = useSWR(`${API_URL}/api/head-vendors?limit=100`, fetcher);
   const { data: subVendorsRes } = useSWR(`${API_URL}/api/sub-vendors?limit=100&includeEmpty=true`, fetcher);

   const headVendors = headVendorsRes?.headVendors || [];
   const allSubVendors = subVendorsRes?.subVendors || [];

   const filteredSubVendors = formData.headVendorId
      ? allSubVendors.filter((sv: any) => sv.headVendorId === parseInt(formData.headVendorId))
      : allSubVendors;

   React.useEffect(() => {
      if (initialData && allCategoryList.length > 0 && !isInitialized) {
         const extractedImages = initialData.images?.length > 0
            ? initialData.images.map((img: any) => img.url || img)
            : initialData.image ? [initialData.image] : [];

         // Resolve parent/child: if saved category has a parentId, split into parent+child
         let uiCategoryId = initialData.categoryId?.toString() || '';
         let uiSubcategoryId = initialData.subcategoryId?.toString() || '';

         // Fallback for legacy products that stored subcategory directly in categoryId
         if (!uiSubcategoryId) {
            const catRecord = allCategoryList.find((c: any) => Number(c.id) === Number(initialData.categoryId));
            if (catRecord && catRecord.parentId) {
               uiCategoryId = catRecord.parentId.toString();
               uiSubcategoryId = catRecord.id.toString();
            }
         }

         setFormData(prev => ({
            ...prev,
            name: initialData.name || '',
            categoryId: uiCategoryId,
            subcategoryId: uiSubcategoryId,
            description: initialData.description || '',
            image: initialData.image || '',
            images: extractedImages,
            videoUrl: initialData.videoUrl || '',
            price: initialData.price || '',
            originalPrice: initialData.originalPrice || '',
            whatIsProduct: initialData.whatIsProduct || '',
            ingredientsInfo: initialData.ingredientsInfo || '',
            healthBenefits: initialData.healthBenefits || '',
            whyChoose: initialData.whyChoose || '',
            whoShouldEat: initialData.whoShouldEat || '',
            howToEat: initialData.howToEat || '',
            storageInstructions: initialData.storageInstructions || '',
            faqs: initialData.faqs ? initialData.faqs.map((f: any) => ({ q: f.question || f.q || '', a: f.answer || f.a || '' })) : [],
            metaTitle: initialData.metaTitle || '',
            metaDescription: initialData.metaDescription || '',
            metaKeywords: initialData.metaKeywords ? initialData.metaKeywords.split(',').map((k: string) => k.trim()).filter(Boolean) : [],
            newKeyword: '',
            variants: initialData.variants || [],
            comboOffer: initialData.comboOffer || '',
            freeDelivery: initialData.freeDelivery || '',
            subVendorId: initialData.subVendorId?.toString() || '',
            headVendorId: initialData.subVendor?.headVendorId?.toString() || '',
            isBestSeller: initialData.isBestSeller || false,
            isOrganic: initialData.isOrganic || false,
            isFarmerCollection: initialData.isFarmerCollection || false,
            isFeatured: initialData.isFeatured || false,
            isNewArrival: initialData.isNewArrival || false,
            isFastDelivery: initialData.isFastDelivery || false,
            deliveryTime: initialData.deliveryTime || '',
            isComboFallbackEnabled: initialData.isComboFallbackEnabled ?? true,
            inventoryMode: initialData.inventoryMode || 'SINGLE',
            weight: initialData.weight?.toString() || '',
            unit: initialData.unit || 'g',
            sku: initialData.sku || '',
            stock: initialData.stock?.toString() || '0',
            gstRate: initialData.gstRate !== undefined && initialData.gstRate !== null ? initialData.gstRate.toString() : '',
            productHighlights: initialData.productHighlights ? initialData.productHighlights.map((h: any) => ({
               title: h.title,
               description: h.description,
               sortOrder: h.sortOrder,
               isActive: h.isActive
            })) : []
         }));
         if (initialData.relatedProductsSource) {
            const allRPs = initialData.relatedProductsSource.map((rp: any) => ({
               relatedProductId: rp.relatedProductId,
               priority: rp.priority,
               type: rp.type
            }));
            setRelatedProducts(allRPs);
         }
         const combosToLoad = initialData.comboProducts || initialData.parentCombos;
         if (combosToLoad) {
            const allCombos = combosToLoad.map((c: any) => ({
               comboProductId: c.comboProductId,
               sortOrder: c.sortOrder,
               discountType: c.discountType,
               discountValue: c.discountValue,
               finalPrice: c.finalPrice
            }));
            setComboProducts(allCombos);
         }
         setIsInitialized(true);
      }
   }, [initialData, allCategoryList, isInitialized]);

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

      // ── Format Validation ──────────────────────────────────────────────────
      const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedImageTypes.includes(file.type)) {
         addToast('Error', 'Unsupported image format. Please upload JPG, PNG, or WEBP.');
         e.target.value = '';
         return;
      }

      // ── Size Validation (5 MB max) ─────────────────────────────────────────
      const MAX_IMAGE_MB = 5;
      if (file.size > MAX_IMAGE_MB * 1024 * 1024) {
         addToast('Error', `File exceeds maximum size limit of ${MAX_IMAGE_MB} MB.`);
         e.target.value = '';
         return;
      }

      // ── Dimension Tracking & Warnings ──────────────────────────────
      let imgWidth = 0;
      let imgHeight = 0;
      let isSubOptimal = false;
      await new Promise<void>((resolve) => {
         const img = new window.Image();
         img.onload = () => {
            URL.revokeObjectURL(img.src);
            imgWidth = img.width;
            imgHeight = img.height;
            if (img.width < 800 || img.height < 800) {
               isSubOptimal = true;
               addToast('Info', `Image is ${img.width} × ${img.height} px. A minimum of 800 × 800 px is recommended for best quality.`);
            }
            resolve();
         };
         img.onerror = () => { URL.revokeObjectURL(img.src); resolve(); };
         img.src = URL.createObjectURL(file);
      });

      if (!e.target.files?.[0]) return; // dimension check failed and cleared input

      // Calculate file size
      const sizeMB = (file.size / (1024 * 1024)).toFixed(2) + ' MB';
      const resolution = `${imgWidth} × ${imgHeight} px`;
      const qualityStatus = isSubOptimal ? 'Warning: Low Resolution' : 'High Quality';

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
            setImageMetadata(prev => ({
               ...prev,
               [data.url]: { resolution, size: sizeMB, qualityStatus }
            }));
            addToast('Success', 'Product image uploaded successfully.');
         } else {
            addToast('Error', 'Image upload failed. Please try again.');
         }
      } finally {
         setIsUploading(false);
         e.target.value = '';
      }
   };

   const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      // ── Format Validation ──────────────────────────────────────────────────
      const allowedVideoTypes = ['video/mp4', 'video/quicktime', 'video/webm', 'video/mov'];
      const ext = file.name.split('.').pop()?.toLowerCase();
      const validExts = ['mp4', 'mov', 'webm'];
      if (!allowedVideoTypes.includes(file.type) && !validExts.includes(ext || '')) {
         addToast('Error', 'Unsupported video format. Please upload MP4, MOV, or WEBM.');
         e.target.value = '';
         return;
      }

      // ── Size Validation (100 MB max) ───────────────────────────────────────
      const MAX_VIDEO_MB = 100;
      if (file.size > MAX_VIDEO_MB * 1024 * 1024) {
         addToast('Error', `Video exceeds maximum size limit of ${MAX_VIDEO_MB} MB.`);
         e.target.value = '';
         return;
      }

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
               addToast('Success', 'Product video uploaded successfully.');
            } catch (err) {
               addToast('Error', 'Invalid response from server.');
            }
         } else {
            console.error('Upload error:', xhr.responseText);
            addToast('Error', 'Video upload failed. Please try again.');
         }
         e.target.value = '';
      };

      xhr.onerror = () => {
         setIsVideoUploading(false);
         console.error('Network error during upload');
         addToast('Error', 'Network error during upload.');
         e.target.value = '';
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

   const handleSave = async (e: React.FormEvent) => {
      e.preventDefault();

      if (selectedParentHasChildren && !formData.subcategoryId) {
         addToast('Subcategory Required', 'Please select a subcategory for the chosen category.');
         return;
      }

      setIsLoading(true);
      try {
         const url = mode === 'edit' ? `${API_URL}/api/products/${initialData.id}` : `${API_URL}/api/products`;
         const token = typeof window !== 'undefined' ? localStorage.getItem('namma_orru_token') : null;
         const headers: Record<string, string> = { 'Content-Type': 'application/json' };
         if (token) {
            headers['Authorization'] = `Bearer ${token}`;
         }
         const res = await fetch(url, {
            method: mode === 'edit' ? 'PUT' : 'POST',
            headers,
            body: JSON.stringify({
               ...formData,
               relatedProducts: [...relatedProducts],
               productCombos: comboProducts.map((cp: any, idx: number) => ({
                  comboProductId: cp.comboProductId,
                  discountType: cp.discountType,
                  discountValue: cp.discountValue,
                  finalPrice: cp.finalPrice,
                  sortOrder: idx
               })),
               productHighlights: formData.productHighlights.map((h: any, idx: number) => ({
                  title: h.title,
                  description: h.description,
                  sortOrder: h.sortOrder !== undefined ? h.sortOrder : idx,
                  isActive: h.isActive !== undefined ? h.isActive : true
               })),
               categoryId: parseInt(formData.categoryId),
               subcategoryId: formData.subcategoryId ? parseInt(formData.subcategoryId) : null,
               subVendorId: formData.subVendorId ? parseInt(formData.subVendorId) : null,
               isBestSeller: formData.isBestSeller,
               isOrganic: formData.isOrganic,
               isFarmerCollection: formData.isFarmerCollection,
               isFeatured: formData.isFeatured,
               isNewArrival: formData.isNewArrival,
               isFastDelivery: formData.isFastDelivery,
               deliveryTime: formData.deliveryTime,
               weight: formData.weight ? parseFloat(formData.weight) : null,
               unit: formData.unit || null,
               sku: formData.sku || null,
               stock: formData.stock ? parseInt(formData.stock) : 0,
               metaKeywords: formData.metaKeywords.join(', '),
               variants: formData.variants.map((v: any) => ({
                  name: v.name,
                  price: v.price ? parseFloat(v.price) : null,
                  originalPrice: v.originalPrice ? parseFloat(v.originalPrice) : null,
                  stock: parseInt(v.stock?.toString() || '0'),
                  sku: v.sku && typeof v.sku === 'string' ? v.sku.trim() || null : null,
                  barcode: v.barcode && typeof v.barcode === 'string' ? v.barcode.trim() || null : null,
                  weight: v.weight ? parseFloat(v.weight) : null,
                  unit: null
               }))
            })
         });

         if (res.ok) {
            const data = await res.json();
            if (mode === 'edit') {
               addToast('Success', 'Product updated successfully');
               mutate(() => true);
               router.refresh();
               router.push('/admin/products');
            } else {
               if (data && data.success) {
                  addToast('Success', data.message || 'Product created successfully');
                  mutate(() => true);
                  router.refresh();
                  router.push('/admin/products');
               } else {
                  addToast('Error', data.message || 'Failed to create product');
               }
            }
         } else {
            try {
               const errorData = await res.json();
               addToast('Error', errorData.message || errorData.error || 'Server error occurred');
            } catch (e) {
               addToast('Error', `Server returned error status ${res.status}`);
            }
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
               <SectionHeader title="Product Images" icon={ImageIcon} colorClass="text-blue-600" />
               <div className="p-8 space-y-6">

                  {/* ── IMAGE UPLOAD GUIDELINES ─────────────────────────── */}
                  <div className="rounded-xl border border-blue-100 bg-gradient-to-br from-blue-50/80 to-sky-50/60 p-4 flex gap-3">
                     <div className="shrink-0 mt-0.5">
                        <div className="h-7 w-7 rounded-lg bg-blue-100 flex items-center justify-center">
                           <ImageIcon size={14} className="text-blue-600" />
                        </div>
                     </div>
                     <div className="space-y-2.5 flex-1 min-w-0">
                        <p className="text-[11px] font-black text-blue-800 uppercase tracking-wider">Image Upload Guidelines</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5">
                           {[
                              ['Recommended Size', '1200 × 1200 px'],
                              ['Minimum Size', 'None (Auto-Optimized)'],
                              ['Aspect Ratio', '1:1 (Square)'],
                              ['Supported Formats', 'JPG, JPEG, PNG, WEBP'],
                              ['Maximum File Size', '5 MB per image'],
                           ].map(([label, val]) => (
                              <div key={label} className="flex items-center gap-2">
                                 <span className="h-1.5 w-1.5 rounded-full bg-blue-400 shrink-0" />
                                 <span className="text-[11px] text-slate-500 font-semibold">{label}:</span>
                                 <span className="text-[11px] font-black text-slate-700 truncate">{val}</span>
                              </div>
                           ))}
                        </div>
                        <p className="text-[11px] text-slate-500 font-medium italic border-t border-blue-100 pt-2">
                           Upload high-quality product images with a clean background for the best storefront experience.
                        </p>
                     </div>
                  </div>

                  {/* ── IMAGE GRID ──────────────────────────────────────── */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-4">
                     {formData.images.map((img: string, idx: number) => (
                        <div key={idx} className="group relative aspect-square rounded-xl bg-slate-50 border border-slate-200 overflow-hidden hover:border-blue-500 transition-all shadow-sm flex flex-col">
                           <img src={img} className="w-full h-full object-contain bg-white" alt={`Product ${idx}`} />
                           <button type="button" onClick={(e) => { e.stopPropagation(); removeImage(idx); }} className="absolute top-2 right-2 h-6 w-6 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-lg hover:scale-110 z-20"><X size={12} /></button>

                           {imageMetadata[img] && (
                              <div className="absolute inset-x-0 bottom-0 bg-black/60 text-white p-2 text-[8px] flex flex-col gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                 <span className="font-bold">{imageMetadata[img].resolution}</span>
                                 <span>{imageMetadata[img].size}</span>
                                 <span className={imageMetadata[img].qualityStatus.includes('Warning') ? 'text-amber-400' : 'text-emerald-400'}>{imageMetadata[img].qualityStatus}</span>
                              </div>
                           )}

                           {formData.image === img && <div className="absolute top-2 left-2 bg-blue-600 text-white text-[8px] font-black uppercase px-2 py-1 rounded shadow-sm tracking-widest z-10">Hero</div>}
                           <div onClick={() => setFormData({ ...formData, image: img })} className={`absolute inset-0 cursor-pointer ${formData.image === img ? 'bg-transparent' : 'bg-black/0 hover:bg-black/10'} transition-all`} />
                        </div>
                     ))}
                     <div onClick={() => !isUploading && fileInputRef.current?.click()} className={`aspect-square bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center gap-2 group cursor-pointer hover:border-blue-500 hover:bg-blue-50/30 transition-all ${isUploading ? 'opacity-50 cursor-wait' : ''}`}>
                        <input type="file" ref={fileInputRef} className="hidden" accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp" onChange={handleFileUpload} />
                        {isUploading ? <Loader2 className="h-6 w-6 text-blue-600 animate-spin" /> : <><div className="h-10 w-10 rounded-full bg-white shadow-sm flex items-center justify-center text-slate-400 group-hover:text-blue-500 transition-all"><Plus size={20} /></div><span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Add Image</span></>}
                     </div>
                  </div>

                  {/* ── VIDEO SECTION ───────────────────────────────────── */}
                  <div className="pt-6 border-t border-slate-100 space-y-4">
                     <div className="flex items-center gap-2">
                        <Video size={18} className="text-slate-900" />
                        <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-widest">Product Discovery Video</h4>
                     </div>

                     {/* ── VIDEO UPLOAD GUIDELINES ─────────────────────── */}
                     <div className="rounded-xl border border-violet-100 bg-gradient-to-br from-violet-50/80 to-purple-50/60 p-4 flex gap-3">
                        <div className="shrink-0 mt-0.5">
                           <div className="h-7 w-7 rounded-lg bg-violet-100 flex items-center justify-center">
                              <Video size={14} className="text-violet-600" />
                           </div>
                        </div>
                        <div className="space-y-2.5 flex-1 min-w-0">
                           <p className="text-[11px] font-black text-violet-800 uppercase tracking-wider">Video Upload Guidelines</p>
                           <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5">
                              {[
                                 ['Recommended Resolution', '1080 × 1920 px'],
                                 ['Aspect Ratio', '9:16 (Vertical Reel Format)'],
                                 ['Supported Formats', 'MP4, MOV, WEBM'],
                                 ['Maximum File Size', '100 MB'],
                                 ['Recommended Duration', '15 – 60 Seconds'],
                              ].map(([label, val]) => (
                                 <div key={label} className="flex items-center gap-2">
                                    <span className="h-1.5 w-1.5 rounded-full bg-violet-400 shrink-0" />
                                    <span className="text-[11px] text-slate-500 font-semibold">{label}:</span>
                                    <span className="text-[11px] font-black text-slate-700 truncate">{val}</span>
                                 </div>
                              ))}
                           </div>
                           <p className="text-[11px] text-slate-500 font-medium italic border-t border-violet-100 pt-2">
                              Use vertical product videos optimized for mobile viewing and social commerce experiences.
                           </p>
                        </div>
                     </div>

                     <div onClick={() => !isVideoUploading && !formData.videoUrl && videoInputRef.current?.click()} className={`h-auto min-h-[96px] rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/30 flex flex-col items-center justify-center transition-all relative ${!formData.videoUrl ? 'hover:border-violet-400 cursor-pointer' : ''}`}>
                        <input type="file" ref={videoInputRef} className="hidden" accept=".mp4,.mov,.webm,video/mp4,video/quicktime,video/webm" onChange={handleVideoUpload} />
                        {isVideoUploading ? (
                           <div className="py-8 flex flex-col items-center justify-center w-full px-10">
                              <Loader2 className="h-6 w-6 text-violet-600 animate-spin mb-4" />
                              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                                 <div className="h-full bg-violet-600 transition-all duration-300" style={{ width: `${videoUploadProgress}%` }} />
                              </div>
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">{videoUploadProgress}% Uploaded</p>
                           </div>
                        ) : formData.videoUrl ? (
                           <div className="w-full flex flex-col items-center">
                              <video src={formData.videoUrl} controls className="w-full max-h-[300px] rounded-t-lg bg-black object-contain" />
                              <div className="flex items-center justify-between w-full px-4 py-3 bg-white border-t border-slate-100 rounded-b-lg">
                                 <p className="text-[11px] font-black text-slate-900 uppercase truncate">Video Uploaded Successfully</p>
                                 <button type="button" onClick={() => videoInputRef.current?.click()} className="text-[10px] font-black text-violet-600 uppercase hover:text-violet-700">Replace Video</button>
                              </div>
                           </div>
                        ) : (
                           <div className="py-8 flex flex-col items-center gap-2">
                              <Play size={20} className="text-slate-300" />
                              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Upload Story Video</span>
                           </div>
                        )}
                     </div>
                  </div>

               </div>
            </div>

            {/* 2. IDENTITY & COMMERCE */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden w-full">
               <SectionHeader title="Product Details" icon={Tag} colorClass="text-slate-900" />
               <div className="p-8 space-y-8">
                  <InputWrapper label="Product Name">
                     <input type="text" required className="w-full h-14 px-6 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 ring-blue-500/5 outline-none font-bold text-slate-900 text-sm transition-all" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                  </InputWrapper>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     <InputWrapper label="Primary Category">
                        <select required className="w-full h-14 px-6 rounded-xl border border-slate-200 focus:border-blue-500 outline-none font-bold text-sm appearance-none bg-white" value={formData.categoryId} onChange={e => setFormData({ ...formData, categoryId: e.target.value, subcategoryId: '' })} >
                           <option value="">Select Category</option>
                           {categories.filter((c: any) => !c.parentId).map((cat: any) => (
                              <option key={cat.id} value={cat.id}>{cat.name}</option>
                           ))}
                        </select>
                     </InputWrapper>
                     <InputWrapper label={selectedParentHasChildren ? 'Subcategory *' : 'Subcategory'}>
                        <select
                           className={`w-full h-14 px-6 rounded-xl border focus:border-blue-500 outline-none font-bold text-sm appearance-none bg-white disabled:opacity-50 ${selectedParentHasChildren && !formData.subcategoryId ? 'border-red-400' : 'border-slate-200'}`}
                           value={formData.subcategoryId}
                           onChange={e => setFormData({ ...formData, subcategoryId: e.target.value })}
                           disabled={!formData.categoryId}
                        >
                           <option value="">{selectedParentHasChildren ? 'Select Subcategory (Required)' : 'Select Subcategory'}</option>
                           {subcategories.map((cat: any) => (
                              <option key={cat.id} value={cat.id}>{cat.name}</option>
                           ))}
                        </select>
                        {selectedParentHasChildren && !formData.subcategoryId && formData.categoryId && (
                           <p className="text-[10px] font-bold text-red-500 mt-1">This category requires a subcategory selection.</p>
                        )}
                     </InputWrapper>
                  </div>


                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     <InputWrapper label="Regional Hub (Vendor)">
                        <select className="w-full h-14 px-6 rounded-xl border border-slate-200 focus:border-blue-500 outline-none font-bold text-sm appearance-none bg-white" value={formData.headVendorId} onChange={e => setFormData({ ...formData, headVendorId: e.target.value, subVendorId: '' })} >
                           <option value="">Select Vendor</option>
                           {headVendors.map((hv: any) => (
                              <option key={hv.id} value={hv.id}>
                                 {hv.name}
                              </option>
                           ))}
                        </select>
                     </InputWrapper>
                     <InputWrapper label="Brand (Sub Vendor)">
                        <select className="w-full h-14 px-6 rounded-xl border border-slate-200 focus:border-blue-500 outline-none font-bold text-sm appearance-none bg-white disabled:opacity-50" value={formData.subVendorId} onChange={e => setFormData({ ...formData, subVendorId: e.target.value })} disabled={!formData.headVendorId}>
                           <option value="">Select Brand</option>
                           {filteredSubVendors.map((sv: any) => (
                              <option key={sv.id} value={sv.id}>
                                 {sv.name}
                              </option>
                           ))}
                        </select>
                     </InputWrapper>
                  </div>

                  {/* INVENTORY MODE SELECTOR */}
                  <div className="border-t border-slate-100 pt-6">
                     <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider mb-4 block">Variants </label>
                     <div className="flex gap-4">
                        <label className={`flex-1 flex items-center justify-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${formData.inventoryMode === 'SINGLE' ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-200 bg-slate-50 text-slate-500 hover:bg-white'}`}>
                           <input type="radio" name="inventoryMode" className="hidden" checked={formData.inventoryMode === 'SINGLE'} onChange={() => setFormData({ ...formData, inventoryMode: 'SINGLE' })} />
                           <Package size={18} />
                           <span className="text-sm font-bold">Single Product (Base Inventory)</span>
                        </label>
                        <label className={`flex-1 flex items-center justify-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${formData.inventoryMode === 'MULTIPLE' ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-200 bg-slate-50 text-slate-500 hover:bg-white'}`}>
                           <input type="radio" name="inventoryMode" className="hidden" checked={formData.inventoryMode === 'MULTIPLE'} onChange={() => setFormData({ ...formData, inventoryMode: 'MULTIPLE' })} />
                           <Layers size={18} />
                           <span className="text-sm font-bold">Multiple Variants (Variant Inventory)</span>
                        </label>
                     </div>
                  </div>

                  {isAdmin && formData.inventoryMode === 'SINGLE' && (
                     <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
                        <InputWrapper label="Weight">
                           <input type="number" step="any" className="w-full h-14 px-6 rounded-xl border border-slate-200 focus:border-blue-500 outline-none font-bold text-sm" value={formData.weight} onChange={e => setFormData({ ...formData, weight: e.target.value })} />
                        </InputWrapper>
                        <InputWrapper label="Unit">
                           <input
                              type="text"
                              className="w-full h-14 px-6 rounded-xl border border-slate-200 focus:border-blue-500 outline-none font-bold text-sm"
                              placeholder="e.g. g, kg, ml, pcs"
                              value={formData.unit}
                              onChange={e => setFormData({ ...formData, unit: e.target.value })}
                           />
                        </InputWrapper>
                        <InputWrapper label="Base Stock">
                           <input type="number" className="w-full h-14 px-6 rounded-xl border border-slate-200 focus:border-blue-500 outline-none font-bold text-sm" value={formData.stock} onChange={e => setFormData({ ...formData, stock: e.target.value })} />
                        </InputWrapper>
                     </div>
                  )}

                  {isAdmin && (
                     <div className="border-t border-slate-100 pt-6">
                        <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider mb-4 block">Product Classification / Badges</label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                           {[
                              { name: 'isBestSeller', label: 'Best Seller' },
                              { name: 'isOrganic', label: 'Organic Product' },
                              { name: 'isFarmerCollection', label: 'Farmer Collection' },
                              { name: 'isFeatured', label: 'Featured Product' },
                              { name: 'isNewArrival', label: 'New Arrival' },
                              { name: 'isFastDelivery', label: 'Fast Delivery' }
                           ].map(flag => (
                              <label key={flag.name} className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 cursor-pointer bg-slate-50 hover:bg-white select-none transition-colors">
                                 <input
                                    type="checkbox"
                                    checked={(formData as any)[flag.name]}
                                    onChange={e => setFormData({ ...formData, [flag.name]: e.target.checked })}
                                    className="h-4 w-4 accent-blue-600 rounded"
                                 />
                                 <span className="text-xs font-bold text-slate-700">{flag.label}</span>
                              </label>
                           ))}
                        </div>

                        {formData.isFastDelivery && (
                           <div className="mt-4 max-w-xs">
                              <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider mb-2 block">Delivery Time</label>
                              <select 
                                 value={formData.deliveryTime || ''}
                                 onChange={e => setFormData({ ...formData, deliveryTime: e.target.value })}
                                 className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-bold text-slate-700 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                              >
                                 <option value="">Select Delivery Time</option>
                                 <option value="15 Minutes">15 Minutes</option>
                                 <option value="30 Minutes">30 Minutes</option>
                                 <option value="45 Minutes">45 Minutes</option>
                                 <option value="1 Hour">1 Hour</option>
                                 <option value="2 Hours">2 Hours</option>
                                 <option value="Same Day">Same Day</option>
                              </select>
                           </div>
                        )}
                     </div>
                  )}

                  {formData.inventoryMode === 'SINGLE' && (
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="flex gap-4">
                           <InputWrapper label="Selling Price (INR)"><input type="number" required className="w-full h-14 px-6 rounded-xl border border-slate-200 focus:border-blue-500 outline-none font-black text-blue-600 text-base" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} /></InputWrapper>
                           <InputWrapper label="MRP"><input type="number" className="w-full h-14 px-6 rounded-xl border border-slate-200 focus:border-blue-500 outline-none font-black text-slate-300 text-base" value={formData.originalPrice} onChange={e => setFormData({ ...formData, originalPrice: e.target.value })} /></InputWrapper>
                        </div>
                     </div>
                  )}
                  <InputWrapper label="Product Short Summary">
                     <textarea rows={2} className="w-full px-6 py-4 rounded-xl border border-slate-200 focus:border-blue-500 outline-none font-bold text-slate-600 text-sm resize-none" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
                  </InputWrapper>


               </div>
            </div>

            {/* VARIANT MANAGER */}
            {formData.inventoryMode === 'MULTIPLE' && (
               <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden w-full">
                  <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                     <div className="flex items-center gap-3">
                        <Layers size={16} className="text-emerald-600" />
                        <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Variant & Inventory Manager</h3>
                     </div>
                     <button type="button" onClick={() => setFormData({ ...formData, variants: [...formData.variants, { name: '', price: '', originalPrice: '', stock: '0', sku: '', weight: '', unit: '' }] })} className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-sm">+ Add Variant</button>
                  </div>
                  <div className="p-6 space-y-4">
                     {formData.variants.length === 0 ? (
                        <div className="text-center py-8 text-slate-400 text-sm font-medium border-2 border-dashed border-slate-100 rounded-xl bg-slate-50/50">No variants added.</div>
                     ) : (
                        <div className="overflow-x-auto">
                           <table className="w-full text-left border-collapse">
                              <thead>
                                 <tr className="border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                    <th className="pb-3 font-black">Variant Name</th>
                                    <th className="pb-3 font-black">Selling Price</th>
                                    <th className="pb-3 font-black">MRP</th>
                                    <th className="pb-3 font-black">Stock</th>
                                    <th className="pb-3 font-black text-right">Actions</th>
                                 </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-50">
                                 {formData.variants.map((variant: any, idx: number) => (
                                    <tr key={idx} className="group">
                                       <td className="py-3 pr-2"><input type="text" className="w-[120px] h-11 px-3 rounded-xl border border-slate-200 text-sm font-bold outline-none focus:border-emerald-500 transition-colors" placeholder="e.g. 500g" value={variant.name} onChange={e => { const newV = [...formData.variants]; newV[idx].name = e.target.value; setFormData({ ...formData, variants: newV }); }} /></td>
                                       <td className="py-3 pr-2"><input type="number" className="w-[100px] h-11 px-3 rounded-xl border border-slate-200 text-sm font-bold outline-none focus:border-emerald-500 transition-colors text-blue-600" placeholder="Price" value={variant.price} onChange={e => { const newV = [...formData.variants]; newV[idx].price = e.target.value; setFormData({ ...formData, variants: newV }); }} /></td>
                                       <td className="py-3 pr-2"><input type="number" className="w-[100px] h-11 px-3 rounded-xl border border-slate-200 text-sm font-bold outline-none focus:border-emerald-500 transition-colors text-blue-600" placeholder="MRP" value={variant.originalPrice} onChange={e => { const newV = [...formData.variants]; newV[idx].originalPrice = e.target.value; setFormData({ ...formData, variants: newV }); }} /></td>
                                       <td className="py-3 pr-2"><input type="number" className="w-[80px] h-11 px-3 rounded-xl border border-slate-200 text-sm font-bold outline-none focus:border-emerald-500 transition-colors" placeholder="Stock" value={variant.stock} onChange={e => { const newV = [...formData.variants]; newV[idx].stock = e.target.value; setFormData({ ...formData, variants: newV }); }} /></td>
                                       <td className="py-3 text-right"><button type="button" onClick={() => { const newV = [...formData.variants]; newV.splice(idx, 1); setFormData({ ...formData, variants: newV }); }} className="h-11 w-11 inline-flex items-center justify-center rounded-xl text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all"><Trash2 size={16} /></button></td>
                                    </tr>
                                 ))}
                              </tbody>
                           </table>
                        </div>
                     )}
                  </div>
               </div>
            )}

            {/* 3. Product Specification (RICH TEXT) */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden w-full">
               <SectionHeader title="Product Specification" icon={Sparkles} colorClass="text-amber-500" />
               <div className="p-8 space-y-10">
                  <div className="grid grid-cols-1 gap-10">
                     <InputWrapper label="Product Description">
                        <div className="rich-text-container">
                           <ReactQuill theme="snow" value={formData.whatIsProduct} onChange={val => setFormData({ ...formData, whatIsProduct: val })} modules={quillModules} formats={quillFormats} />
                        </div>
                     </InputWrapper>
                     <InputWrapper label="Ingredients">
                        <div className="rich-text-container">
                           <ReactQuill theme="snow" value={formData.ingredientsInfo} onChange={val => setFormData({ ...formData, ingredientsInfo: val })} modules={quillModules} formats={quillFormats} />
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
                     <InputWrapper label="Storage Instructions">
                        <div className="rich-text-container">
                           <ReactQuill theme="snow" value={formData.storageInstructions} onChange={val => setFormData({ ...formData, storageInstructions: val })} modules={quillModules} formats={quillFormats} />
                        </div>
                     </InputWrapper>
                     <InputWrapper label="Product specification">
                        <div className="rich-text-container">
                           <ReactQuill theme="snow" value={formData.whoShouldEat} onChange={val => setFormData({ ...formData, whoShouldEat: val })} modules={quillModules} formats={quillFormats} />
                        </div>
                     </InputWrapper>
                     <InputWrapper label="Quality Details">
                        <div className="rich-text-container">
                           <ReactQuill theme="snow" value={formData.whyChoose} onChange={val => setFormData({ ...formData, whyChoose: val })} modules={quillModules} formats={quillFormats} />
                        </div>
                     </InputWrapper>
                  </div>
               </div>
            </div>

            {/* 4. SEO CARD */}
            {isAdmin && (
               <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  <SectionHeader title="SEO Meta Details" icon={Globe} colorClass="text-blue-600" />
                  <div className="p-8 space-y-6">
                     <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Meta Title</label><input type="text" className="w-full h-11 px-4 rounded-xl border border-slate-200 focus:border-blue-500 outline-none text-sm font-bold" value={formData.metaTitle} onChange={e => setFormData({ ...formData, metaTitle: e.target.value })} /></div>
                     <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Meta Description</label><textarea rows={3} className="w-full p-4 rounded-xl border border-slate-200 focus:border-blue-500 outline-none text-sm font-bold" value={formData.metaDescription} onChange={e => setFormData({ ...formData, metaDescription: e.target.value })} /></div>
                     <div className="space-y-4">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">SEO Keywords</label>
                        <div className="flex flex-wrap gap-2">
                           {formData.metaKeywords.map((kw: string) => (
                              <span key={kw} className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                                 {kw}
                                 <button type="button" onClick={() => setFormData({ ...formData, metaKeywords: formData.metaKeywords.filter((k: string) => k !== kw) })} className="hover:text-red-500 font-bold">×</button>
                              </span>
                           ))}
                        </div>
                        <div className="flex gap-2">
                           <input
                              placeholder="Type a keyword and press Enter or Comma..."
                              className="flex-1 h-12 px-5 rounded-xl border border-slate-200 outline-none font-bold text-xs"
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
            )}

            {/* PRODUCT HIGHLIGHTS */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden w-full">
               <div className="px-8 py-4 border-b border-slate-100 bg-gradient-to-r from-emerald-50 to-white flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                     <Sparkles size={15} className="text-emerald-600" />
                  </div>
                  <div>
                     <h2 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em]">Product Highlights</h2>
                     <p className="text-[9px] text-slate-400 font-semibold mt-0.5">Add key features shown as highlight cards on the product page</p>
                  </div>
                  <div className="ml-auto">
                     <button
                        type="button"
                        onClick={() => setFormData(prev => ({
                           ...prev,
                           productHighlights: [
                              ...prev.productHighlights,
                              { title: '', description: '', sortOrder: prev.productHighlights.length, isActive: true }
                           ]
                        }))}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-sm"
                     >
                        <Plus size={12} strokeWidth={3} /> Add Highlight
                     </button>
                  </div>
               </div>
               <div className="p-8">
                  {formData.productHighlights.length === 0 ? (
                     <div className="text-center py-10 text-slate-400 text-sm font-medium border-2 border-dashed border-slate-100 rounded-xl bg-slate-50/50">
                        <Sparkles size={24} className="mx-auto mb-2 text-slate-300" />
                        No highlights added yet. Click "+ Add Highlight" to start.
                     </div>
                  ) : (
                     <div className="space-y-4">
                        {formData.productHighlights.map((h: any, idx: number) => (
                           <div key={idx} className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100 group">
                              <div className="flex flex-col items-center gap-1.5 pt-1 shrink-0">
                                 <button type="button" disabled={idx === 0} onClick={() => {
                                    const arr = [...formData.productHighlights];
                                    [arr[idx - 1], arr[idx]] = [arr[idx], arr[idx - 1]];
                                    setFormData(prev => ({ ...prev, productHighlights: arr.map((x, i) => ({ ...x, sortOrder: i })) }));
                                 }} className="h-6 w-6 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-emerald-600 disabled:opacity-30 transition-all">
                                    <ChevronUp size={12} />
                                 </button>
                                 <span className="text-[9px] font-black text-slate-400">{idx + 1}</span>
                                 <button type="button" disabled={idx === formData.productHighlights.length - 1} onClick={() => {
                                    const arr = [...formData.productHighlights];
                                    [arr[idx + 1], arr[idx]] = [arr[idx], arr[idx + 1]];
                                    setFormData(prev => ({ ...prev, productHighlights: arr.map((x, i) => ({ ...x, sortOrder: i })) }));
                                 }} className="h-6 w-6 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-emerald-600 disabled:opacity-30 transition-all">
                                    <ChevronDown size={12} />
                                 </button>
                              </div>
                              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                                 <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Title <span className="text-red-400">*</span></label>
                                    <input
                                       type="text"
                                       placeholder="e.g. 100% Organic"
                                       value={h.title}
                                       onChange={e => {
                                          const arr = [...formData.productHighlights];
                                          arr[idx] = { ...arr[idx], title: e.target.value };
                                          setFormData(prev => ({ ...prev, productHighlights: arr }));
                                       }}
                                       className="w-full h-12 px-4 rounded-xl border border-slate-200 focus:border-emerald-500 outline-none font-bold text-sm transition-colors"
                                    />
                                 </div>
                                 <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Description <span className="text-red-400">*</span></label>
                                    <input
                                       type="text"
                                       placeholder="e.g. Zero chemicals and pesticides"
                                       value={h.description}
                                       onChange={e => {
                                          const arr = [...formData.productHighlights];
                                          arr[idx] = { ...arr[idx], description: e.target.value };
                                          setFormData(prev => ({ ...prev, productHighlights: arr }));
                                       }}
                                       className="w-full h-12 px-4 rounded-xl border border-slate-200 focus:border-emerald-500 outline-none font-bold text-sm transition-colors"
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
                                    className="h-10 w-10 rounded-xl text-slate-300 hover:text-red-500 hover:bg-red-50 flex items-center justify-center transition-all border border-transparent hover:border-red-100"
                                 >
                                    <Trash2 size={15} />
                                 </button>
                                 <button
                                    type="button"
                                    onClick={() => {
                                       const arr = [...formData.productHighlights];
                                       arr[idx] = { ...arr[idx], isActive: !arr[idx].isActive };
                                       setFormData(prev => ({ ...prev, productHighlights: arr }));
                                    }}
                                    className={`h-6 w-12 rounded-full transition-all border ${h.isActive ? 'bg-emerald-500 border-emerald-500' : 'bg-slate-200 border-slate-200'}`}
                                    title={h.isActive ? 'Active (click to hide)' : 'Inactive (click to show)'}
                                 >
                                    <span className={`block h-4 w-4 rounded-full bg-white shadow transition-transform ${h.isActive ? 'translate-x-6' : 'translate-x-1'} mt-0.5`} />
                                 </button>
                              </div>
                           </div>
                        ))}
                     </div>
                  )}
               </div>
            </div>

            {/* 5. RELATED PRODUCTS / RECOMMENDED ESSENTIALS */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
               <div className="px-8 py-4 border-b border-slate-100 bg-gradient-to-r from-purple-50 to-white flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-purple-100 flex items-center justify-center">
                     <Sparkles size={15} className="text-purple-600" />
                  </div>
                  <div>
                     <h2 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em]">Related Products / Recommended Essentials</h2>
                     <p className="text-[9px] text-slate-400 font-semibold mt-0.5">Manually curate what customers see after viewing this product</p>
                  </div>
                  <div className="ml-auto">
                     <span className={`text-[8px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border ${relatedProducts.length > 0 ? 'bg-purple-50 text-purple-600 border-purple-200' : 'bg-slate-50 text-slate-400 border-slate-200'}`}>
                        {relatedProducts.length > 0 ? `${relatedProducts.length} Manual Picks` : 'Auto Fallback Active'}
                     </span>
                  </div>
               </div>


               <div className="p-8">
                  <RelatedProductsSelector
                     relatedProducts={relatedProducts}
                     onChange={setRelatedProducts}
                     isAdmin={true}
                     currentProductId={initialData?.id}
                  />
               </div>
            </div>

            {/* 6. COMBO & BUNDLE MANAGEMENT */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
               <div className="px-8 py-4 border-b border-slate-100 bg-gradient-to-r from-amber-50 to-white flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-amber-100 flex items-center justify-center">
                     <ShoppingBag size={15} className="text-amber-600" />
                  </div>
                  <div>
                     <h2 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em]">Combo & Bundle Management</h2>
                     <p className="text-[9px] text-slate-400 font-semibold mt-0.5">Configure "Frequently Bought Together" products for this specific product</p>
                  </div>
                  <div className="ml-auto">
                     <span className={`text-[8px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border ${comboProducts.length > 0 ? 'bg-amber-50 text-amber-600 border-amber-200' : (formData.isComboFallbackEnabled ? 'bg-slate-50 text-slate-400 border-slate-200' : 'bg-rose-50 text-rose-500 border-rose-200')}`}>
                        {comboProducts.length > 0 ? `${comboProducts.length} Combo Items` : (formData.isComboFallbackEnabled ? 'Smart Fallback Active' : 'Fallback Disabled')}
                     </span>
                  </div>
               </div>
               <div className="p-8">
                  <ComboProductsSelector
                     comboProducts={comboProducts}
                     onChange={setComboProducts}
                     isAdmin={true}
                     currentProductId={initialData?.id}
                     isFallbackEnabled={formData.isComboFallbackEnabled}
                     onFallbackToggle={(val: boolean) => setFormData(prev => ({ ...prev, isComboFallbackEnabled: val }))}
                  />
               </div>
            </div>

            {/* 7. FAQ CARD */}

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
               <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                  <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-widest">FAQ</h3>
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
