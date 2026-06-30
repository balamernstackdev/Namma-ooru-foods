'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Loader2, Upload, Hash, Zap, ListOrdered, Info, CheckCircle2, AlertCircle } from 'lucide-react';
import { API_URL } from '@/lib/api';
import { useRouter } from 'next/navigation';
import SearchableSelect from '@/components/admin/SearchableSelect';

export interface Banner {
   id: number;
   title: string;
   subtitle?: string;
   tagline?: string;
   banner_image: string;
   buttonText?: string;
   link?: string;
   linkData?: any;
   isActive: boolean;
   startDate?: string;
   endDate?: string;
   display_order: number;
   sortOrder?: number;
   type?: string;
   createdAt?: string;
}

interface BannerFormProps {
   initialData?: Partial<Banner>;
   isEditing?: boolean;
}

// ── Banner Type Configuration ────────────────────────────────────────────────
const BANNER_TYPE_CONFIG: Record<string, {
   label: string;
   section: string;
   width: number;
   height: number;
   autoSlide: boolean | 'optional';
   description: string;
}> = {
   hero: {
      label: 'Hero Banner',
      section: 'Homepage Hero Slider',
      width: 1920, height: 600,
      autoSlide: true,
      description: 'Full-width hero slider shown at the top of the homepage'
   },
   best_sellers: {
      label: 'Best Sellers Banner',
      section: 'Best Sellers Section',
      width: 1920, height: 450,
      autoSlide: true,
      description: 'Displayed alongside the Best Sellers product carousel'
   },
   organic_collection: {
      label: 'Organic Collection Banner',
      section: 'Organic Collection',
      width: 1920, height: 450,
      autoSlide: true,
      description: 'Displayed alongside the Organic Collection product carousel'
   },
   farmer_collection: {
      label: 'Farmer Collection Banner',
      section: 'Farmers Collection',
      width: 1920, height: 450,
      autoSlide: true,
      description: 'Displayed in the Farmers Collection section'
   },
   category: {
      label: 'Category Banner',
      section: 'Category Detail Page',
      width: 1400, height: 320,
      autoSlide: false,
      description: 'Banner displayed at the top of category detail pages'
   },
};

const getConfig = (type: string) => BANNER_TYPE_CONFIG[type] ?? BANNER_TYPE_CONFIG['hero'];

export default function BannerForm({ initialData, isEditing }: BannerFormProps) {
   const router = useRouter();

   const parseLinkData = (raw: any) => {
      if (!raw) return null;
      if (typeof raw === 'string') {
         try { return JSON.parse(raw); } catch { return null; }
      }
      return raw;
   };

   const normalizeType = (val?: string): string => {
      if (!val) return 'hero';
      const map: Record<string, string> = {
         'Hero': 'hero', 'Hero Banner': 'hero',
         'Best Sellers': 'best_sellers', 'Best Sellers Banner': 'best_sellers',
         'Organic Collection': 'organic_collection', 'Organic Collection Banner': 'organic_collection',
         'Farmer Collection': 'farmer_collection', 'Farmer Collection Banner': 'farmer_collection',
         'Category': 'category', 'Category Banner': 'category',
         'hero': 'hero', 'best_sellers': 'best_sellers',
         'organic_collection': 'organic_collection', 'farmer_collection': 'farmer_collection',
         'category': 'category'
      };
      return map[val] ?? val.toLowerCase();
   };

   const buildInitialState = (data?: Partial<Banner>) => {
      const ld = parseLinkData(data?.linkData);
      return {
         title: data?.title || '',
         subtitle: data?.subtitle || '',
         tagline: data?.tagline || '',
         banner_image: data?.banner_image || '',
         buttonText: data?.buttonText || 'Shop Now',
         link: data?.link || '',
         isActive: data?.isActive ?? true,
         display_order: data?.display_order ?? data?.sortOrder ?? 0,
         startDate: data?.startDate?.split('T')[0] || '',
         endDate: data?.endDate?.split('T')[0] || '',
         type: normalizeType(data?.type),
         linkType: ld?.linkType || (data?.link ? 'external' : 'none'),
         targetId: ld?.targetId || '',
         targetName: ld?.targetName || '',
         externalUrl: ld?.linkType === 'external' ? (ld.url || '') : (data?.link || '')
      };
   };

   const [formData, setFormData] = useState(() => buildInitialState(initialData));
   const [submitting, setSubmitting] = useState(false);
   const [uploading, setUploading] = useState(false);
   const [uploadProgress, setUploadProgress] = useState<number | null>(null);
   const [uploadError, setUploadError] = useState('');
   const [ratioWarning, setRatioWarning] = useState('');
   const [ratioValid, setRatioValid] = useState<boolean | null>(null);
   const [uploadStats, setUploadStats] = useState<{ uploadedWidth: number; uploadedHeight: number; fileSize: number } | null>(null);
   const fileInputRef = useRef<HTMLInputElement>(null);

   // ── Display Order State ──────────────────────────────────────────────────
   const [positionMode, setPositionMode] = useState<'auto' | 'custom'>('auto');
   const [customPosition, setCustomPosition] = useState<number>(1);
   const [typeBanners, setTypeBanners] = useState<Banner[]>([]);
   const [loadingTypeBanners, setLoadingTypeBanners] = useState(false);

   // Current type config
   const typeConfig = getConfig(formData.type);
   const aspectRatio = typeConfig.width / typeConfig.height;

   // Fetch banners for position preview
   const fetchTypeBanners = useCallback(async (type: string) => {
      setLoadingTypeBanners(true);
      try {
         const res = await fetch(`${API_URL}/api/admin-ops/banners`);
         if (!res.ok) return;
         const all: Banner[] = await res.json();
         const filtered = all
            .filter(b => normalizeType(b.type) === type && (!isEditing || b.id !== initialData?.id))
            .sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0));
         setTypeBanners(filtered);
         if (!isEditing) setCustomPosition(filtered.length + 1);
      } catch { setTypeBanners([]); }
      finally { setLoadingTypeBanners(false); }
   }, [isEditing, initialData?.id]);

   useEffect(() => { fetchTypeBanners(formData.type); }, [formData.type, fetchTypeBanners]);

   useEffect(() => {
      if (initialData?.id) setFormData(buildInitialState(initialData));
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [initialData?.id]);

   // ── Image ratio validation ───────────────────────────────────────────────
   const validateImageRatio = (file: File, config: typeof typeConfig): Promise<{ valid: boolean; message: string; width: number; height: number }> => {
      return new Promise(resolve => {
         const img = new Image();
         const url = URL.createObjectURL(file);
         img.onload = () => {
            URL.revokeObjectURL(url);
            const expectedRatio = config.width / config.height;
            const actualRatio = img.width / img.height;
            const tolerance = 0.05; // 5% tolerance
            const valid = Math.abs(actualRatio - expectedRatio) <= tolerance;
            resolve({
               valid,
               message: valid
                  ? `✓ Aspect ratio compatible (${(img.width / img.height).toFixed(2)}:1). Image will be automatically optimized to ${config.width}×${config.height}.`
                  : `Incorrect aspect ratio: ${(img.width / img.height).toFixed(2)}:1. Expected ~${(expectedRatio).toFixed(2)}:1 for ${config.label}.`,
               width: img.width,
               height: img.height
            });
         };
         img.onerror = () => { URL.revokeObjectURL(url); resolve({ valid: true, message: '', width: 0, height: 0 }); };
         img.src = url;
      });
   };

   // ── File Upload ──────────────────────────────────────────────────────────
   const uploadFileWithProgress = (file: File, config: typeof typeConfig, onProgress: (p: number) => void, onSuccess: (url: string) => void, onError: (e: string) => void) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', `${API_URL}/api/banners/upload/image`);
      xhr.upload.onprogress = (e) => { if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100)); };
      xhr.onload = () => {
         if (xhr.status >= 200 && xhr.status < 300) {
            try { const r = JSON.parse(xhr.responseText); r.url ? onSuccess(r.url) : onError('Missing image URL'); }
            catch { onError('Invalid server response'); }
         } else { onError(`Upload failed (${xhr.status})`); }
      };
      xhr.onerror = () => onError('Network error during upload');
      const fd = new FormData(); 
      fd.append('image', file);
      fd.append('targetWidth', config.width.toString());
      fd.append('targetHeight', config.height.toString());
      xhr.send(fd);
   };

   const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      if (!file.type.startsWith('image/')) { setUploadError('Only image files allowed'); return; }

      // Validate ratio
      setRatioWarning('');
      setRatioValid(null);
      const currentConfig = getConfig(formData.type);
      const { valid, message, width, height } = await validateImageRatio(file, currentConfig);
      setRatioValid(valid);
      setRatioWarning(message);
      setUploadStats({
         uploadedWidth: width,
         uploadedHeight: height,
         fileSize: file.size
      });

      setUploading(true); setUploadError(''); setUploadProgress(0);
      uploadFileWithProgress(
         file,
         currentConfig,
         (pct) => setUploadProgress(pct),
         (url) => {
            const imageUrl = typeof url === 'string' ? url : (url as any)?.url ?? '';
            setFormData(prev => ({ ...prev, banner_image: imageUrl }));
            setUploadProgress(null); setUploading(false);
         },
         (err) => { setUploadError(err); setUploadProgress(null); setUploading(false); }
      );
   };

   // ── Submit ───────────────────────────────────────────────────────────────
   const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!formData.banner_image?.trim()) { alert('Banner Image is required.'); return; }
      if (['product', 'category', 'brand', 'vendor'].includes(formData.linkType) && !formData.targetId) {
         alert('Destination selection is required.'); return;
      }

      setSubmitting(true);
      try {
         const url = isEditing && initialData?.id
            ? `${API_URL}/api/admin-ops/banners/${initialData.id}`
            : `${API_URL}/api/admin-ops/banners`;
         const method = isEditing ? 'PUT' : 'POST';

         let linkData = null; let legacyLink = '';
         if (formData.linkType !== 'none') {
            linkData = { linkType: formData.linkType, targetId: formData.targetId, targetName: formData.targetName, url: formData.linkType === 'external' ? formData.externalUrl : undefined };
            if (formData.linkType === 'external') legacyLink = formData.externalUrl;
            if (formData.linkType === 'product') legacyLink = `/products/${formData.targetId}`;
            if (formData.linkType === 'category') legacyLink = `/categories/${formData.targetId}`;
            if (formData.linkType === 'brand') legacyLink = `/brands/${formData.targetId}`;
            if (formData.linkType === 'vendor') legacyLink = `/vendors/${formData.targetId}`;
         }

         const payload = {
            ...formData, linkData, link: legacyLink,
            startDate: formData.startDate || null, endDate: formData.endDate || null,
            display_order: positionMode === 'custom' ? customPosition : undefined
         };

         const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
         if (!res.ok) { const err = await res.json(); throw new Error(err.error || 'Failed to save'); }
         router.push('/admin/banners'); router.refresh();
      } catch (err: any) { alert(err.message || 'An error occurred.'); }
      finally { setSubmitting(false); }
   };

   // ── Position preview list ─────────────────────────────────────────────────
   const previewList = (() => {
      if (positionMode !== 'custom') return [];
      const list: Array<{ id: number | 'SELF'; title: string; position: number; isSelf: boolean }> = [];
      // For edit: insert self at new position
      const othersInOrder = [...typeBanners].sort((a, b) => a.display_order - b.display_order);
      let selfInserted = false;
      let pos = 1;
      for (const b of othersInOrder) {
         if (!selfInserted && pos === customPosition) {
            list.push({ id: 'SELF', title: formData.title || (isEditing ? 'This Banner' : 'New Banner'), position: pos++, isSelf: true });
            selfInserted = true;
         }
         list.push({ id: b.id, title: b.title || 'Untitled', position: pos++, isSelf: false });
      }
      if (!selfInserted) list.push({ id: 'SELF', title: formData.title || (isEditing ? 'This Banner' : 'New Banner'), position: pos, isSelf: true });
      return list;
   })();

   const totalInType = typeBanners.length + (isEditing ? 1 : 0);

   return (
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-10 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">

         {/* ── LEFT: Banner Details ── */}
         <div className="space-y-6">
            <div className="flex items-center justify-between border-b pb-4">
               <h2 className="text-xl font-black text-slate-900 tracking-tight">Banner Details</h2>
               {isEditing && formData.display_order > 0 && positionMode !== 'custom' && (
                  <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2">
                     <span className="text-[10px] font-black uppercase tracking-widest text-amber-600">Current Position</span>
                     <span className="text-lg font-black text-amber-700">#{formData.display_order}</span>
                  </div>
               )}
            </div>

            {/* Title */}
            <div className="space-y-2">
               <label className="text-[10px] uppercase font-black tracking-widest text-slate-400">Campaign Title (Heading) *</label>
               <input required value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })}
                  className="w-full h-14 bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 text-sm font-bold outline-none focus:border-amber-400"
                  placeholder="e.g. Product Festival or Summer Harvest" />
            </div>

            {/* Banner Type */}
            <div className="space-y-2">
               <label className="text-[10px] uppercase font-black tracking-widest text-slate-400">Banner Type *</label>
               <select required value={formData.type}
                  onChange={e => { setFormData({ ...formData, type: e.target.value }); setRatioValid(null); setRatioWarning(''); }}
                  className="w-full h-14 bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 text-sm font-bold outline-none focus:border-amber-400">
                  {Object.entries(BANNER_TYPE_CONFIG).map(([key, cfg]) => (
                     <option key={key} value={key}>{cfg.label}</option>
                  ))}
               </select>

               {/* Dynamic Type Info Card */}
               <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2 mt-1">
                  <div className="flex items-start gap-2">
                     <Info size={13} className="text-slate-400 mt-0.5 shrink-0" />
                     <div className="space-y-1.5 text-[10px] font-bold text-slate-500 w-full">
                        <p>{typeConfig.description}</p>
                        <div className="grid grid-cols-2 gap-2 pt-1">
                           <div className="bg-white border border-slate-200 rounded-xl p-2.5">
                              <p className="text-[9px] uppercase tracking-widest text-slate-400 mb-0.5">Section</p>
                              <p className="font-black text-slate-700 text-[10px]">{typeConfig.section}</p>
                           </div>
                           <div className="bg-white border border-slate-200 rounded-xl p-2.5">
                              <p className="text-[9px] uppercase tracking-widest text-slate-400 mb-0.5">Required Size</p>
                              <p className="font-black text-red-600 text-[10px]">{typeConfig.width} × {typeConfig.height} px</p>
                           </div>
                           <div className="bg-white border border-slate-200 rounded-xl p-2.5">
                              <p className="text-[9px] uppercase tracking-widest text-slate-400 mb-0.5">Aspect Ratio</p>
                              <p className="font-black text-slate-700 text-[10px]">{(typeConfig.width / typeConfig.height).toFixed(2)}:1</p>
                           </div>
                           <div className="bg-white border border-slate-200 rounded-xl p-2.5">
                              <p className="text-[9px] uppercase tracking-widest text-slate-400 mb-0.5">Auto Slide</p>
                              <p className={`font-black text-[10px] ${typeConfig.autoSlide === true ? 'text-emerald-600' : typeConfig.autoSlide === 'optional' ? 'text-amber-600' : 'text-slate-500'}`}>
                                 {typeConfig.autoSlide === true ? 'Yes' : typeConfig.autoSlide === 'optional' ? 'Optional' : 'No'}
                              </p>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
            </div>

            {/* ── DISPLAY ORDER SECTION ── */}
            <div className="border border-slate-200 rounded-2xl p-4 space-y-4 bg-slate-50/60">
               <div className="flex items-center gap-2">
                  <ListOrdered size={16} className="text-emerald-600" />
                  <span className="text-xs font-black uppercase tracking-widest text-slate-700">Display Order</span>
               </div>

               {/* Mode toggle */}
               <div className="flex gap-2">
                  <button type="button" onClick={() => setPositionMode('auto')}
                     className={`flex-1 h-10 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-1.5 border-2 transition-all ${
                        positionMode === 'auto' ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-slate-500 border-slate-200 hover:border-emerald-300'}`}>
                     <Zap size={10} /> Auto {isEditing ? '(Keep Current)' : '(Append Last)'}
                  </button>
                  <button type="button" onClick={() => setPositionMode('custom')}
                     className={`flex-1 h-10 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-1.5 border-2 transition-all ${
                        positionMode === 'custom' ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-500 border-slate-200 hover:border-slate-400'}`}>
                     <Hash size={10} /> Custom Position
                  </button>
               </div>

               {positionMode === 'auto' && (
                  <p className="text-[10px] font-bold text-slate-400 text-center py-1">
                     {isEditing
                        ? <>Keeping current position <span className="text-amber-600 font-black">#{formData.display_order}</span></>
                        : <>New banner will be added at position <span className="text-emerald-600 font-black">#{typeBanners.length + 1}</span> (last)</>
                     }
                  </p>
               )}

               {positionMode === 'custom' && (
                  <div className="space-y-3 animate-in fade-in duration-200">
                     <div className="space-y-1.5">
                        <label className="text-[10px] uppercase font-black tracking-widest text-slate-400">
                           {isEditing ? 'Change to Position' : 'Insert at Position'}
                        </label>
                        <select value={customPosition} onChange={e => setCustomPosition(parseInt(e.target.value))}
                           className="w-full h-12 bg-white border-2 border-slate-200 rounded-xl px-4 text-sm font-black outline-none focus:border-amber-400 transition-colors">
                           {Array.from({ length: totalInType }, (_, i) => i + 1).map(pos => (
                              <option key={pos} value={pos}>
                                 Position #{pos}{pos === totalInType ? ' (Last)' : ''}{isEditing && pos === formData.display_order ? ' (Current)' : ''}
                              </option>
                           ))}
                        </select>
                     </div>

                     {/* Preview list */}
                     <div className="space-y-1.5">
                        <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 flex items-center gap-1.5">
                           Order Preview
                           {loadingTypeBanners && <Loader2 size={10} className="animate-spin" />}
                        </label>
                        <div className="border border-slate-200 rounded-xl overflow-hidden bg-white divide-y divide-slate-100 max-h-52 overflow-y-auto">
                           {previewList.length === 0 ? (
                              <p className="py-4 text-center text-[10px] font-bold text-slate-400">First banner in this section</p>
                           ) : previewList.map(item => (
                              <div key={item.id} className={`flex items-center gap-3 px-4 py-2.5 ${item.isSelf ? 'bg-emerald-50 border-l-4 border-emerald-500' : 'bg-white'}`}>
                                 <span className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-black ${
                                    item.isSelf ? 'bg-emerald-500 text-white'
                                    : item.position === 1 ? 'bg-amber-400 text-white'
                                    : item.position === 2 ? 'bg-slate-400 text-white'
                                    : item.position === 3 ? 'bg-orange-400 text-white'
                                    : 'bg-slate-100 text-slate-600'}`}>
                                    #{item.position}
                                 </span>
                                 <span className={`text-xs font-bold truncate flex-1 ${item.isSelf ? 'text-emerald-700' : 'text-slate-700'}`}>{item.title}</span>
                                 {item.isSelf && <span className="shrink-0 text-[8px] font-black uppercase tracking-widest bg-emerald-500 text-white px-2 py-0.5 rounded-full">{isEditing ? 'This' : 'New'}</span>}
                              </div>
                           ))}
                        </div>
                     </div>
                  </div>
               )}
            </div>

            {/* Banner Destination */}
            <div className="border-t border-slate-100 pt-6 space-y-4">
               <h3 className="text-sm font-black text-slate-900 tracking-tight">Banner Destination</h3>
               <div className="space-y-2">
                  <label className="text-[10px] uppercase font-black tracking-widest text-slate-400">Link Type *</label>
                  <select value={formData.linkType}
                     onChange={e => setFormData({ ...formData, linkType: e.target.value, targetId: '', targetName: '', externalUrl: '' })}
                     className="w-full h-14 bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 text-sm font-bold outline-none focus:border-amber-400">
                     <option value="none">No Redirect</option>
                     <option value="product">Product</option>
                     <option value="category">Category</option>
                     <option value="brand">Brand</option>
                     <option value="vendor">Vendor</option>
                     <option value="external">External Website</option>
                  </select>
               </div>
               {formData.linkType === 'external' && (
                  <div className="space-y-2 animate-in fade-in relative z-50">
                     <label className="text-[10px] uppercase font-black tracking-widest text-slate-400">Website URL *</label>
                     <input type="url" required placeholder="https://example.com" value={formData.externalUrl} onChange={e => setFormData({ ...formData, externalUrl: e.target.value })} className="w-full h-14 bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 text-sm font-bold outline-none focus:border-amber-400" />
                  </div>
               )}
               {formData.linkType === 'product' && <div className="space-y-2 animate-in fade-in relative z-50"><label className="text-[10px] uppercase font-black tracking-widest text-slate-400">Product *</label><SearchableSelect type="product" value={formData.targetId} onChange={(val, name) => setFormData({ ...formData, targetId: val, targetName: name })} /></div>}
               {formData.linkType === 'category' && <div className="space-y-2 animate-in fade-in relative z-50"><label className="text-[10px] uppercase font-black tracking-widest text-slate-400">Category *</label><SearchableSelect type="category" value={formData.targetId} onChange={(val, name) => setFormData({ ...formData, targetId: val, targetName: name })} /></div>}
               {formData.linkType === 'brand' && <div className="space-y-2 animate-in fade-in relative z-50"><label className="text-[10px] uppercase font-black tracking-widest text-slate-400">Brand *</label><SearchableSelect type="brand" value={formData.targetId} onChange={(val, name) => setFormData({ ...formData, targetId: val, targetName: name })} /></div>}
               {formData.linkType === 'vendor' && <div className="space-y-2 animate-in fade-in relative z-50"><label className="text-[10px] uppercase font-black tracking-widest text-slate-400">Vendor *</label><SearchableSelect type="vendor" value={formData.targetId} onChange={(val, name) => setFormData({ ...formData, targetId: val, targetName: name })} /></div>}
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-6">
               <div className="space-y-2">
                  <label className="text-[10px] uppercase font-black tracking-widest text-slate-400">Start Date</label>
                  <input type="date" value={formData.startDate} onChange={e => setFormData({ ...formData, startDate: e.target.value })} className="w-full h-14 bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 text-sm font-bold outline-none focus:border-amber-400" />
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] uppercase font-black tracking-widest text-slate-400">End Date</label>
                  <input type="date" value={formData.endDate} onChange={e => setFormData({ ...formData, endDate: e.target.value })} className="w-full h-14 bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 text-sm font-bold outline-none focus:border-amber-400" />
               </div>
            </div>

            {/* Active */}
            <div className="pt-2">
               <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={formData.isActive} onChange={e => setFormData({ ...formData, isActive: e.target.checked })} className="h-5 w-5 rounded-lg accent-amber-500" />
                  <span className="text-xs font-black uppercase tracking-widest text-slate-900">Active Campaign</span>
               </label>
            </div>
         </div>

         {/* ── RIGHT: Image Upload ── */}
         <div className="space-y-6">
            <h2 className="text-xl font-black text-slate-900 tracking-tight mb-4 border-b pb-4">Image Management</h2>

            {/* Banner Size Helper Card */}
            <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-5 space-y-3 relative overflow-hidden">
               <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-100/50 rounded-full blur-2xl pointer-events-none" />
               <div className="flex items-center gap-2">
                  <Info size={16} className="text-emerald-600" />
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-emerald-900">Banner Size Guide</h4>
               </div>
               
               <div className="grid grid-cols-2 gap-4">
                  <div>
                     <p className="text-[9px] font-bold uppercase tracking-widest text-emerald-600/70">Target Placement</p>
                     <p className="text-sm font-bold text-emerald-950 mt-0.5">{typeConfig.section}</p>
                  </div>
                  <div>
                     <p className="text-[9px] font-bold uppercase tracking-widest text-emerald-600/70">Required Size</p>
                     <p className="text-sm font-black text-emerald-950 mt-0.5">{typeConfig.width} × {typeConfig.height} px</p>
                  </div>
                  <div>
                     <p className="text-[9px] font-bold uppercase tracking-widest text-emerald-600/70">Aspect Ratio</p>
                     <p className="text-sm font-black text-emerald-950 mt-0.5">{(typeConfig.width / typeConfig.height).toFixed(2)}:1</p>
                  </div>
                  <div>
                     <p className="text-[9px] font-bold uppercase tracking-widest text-emerald-600/70">Optimization</p>
                     <p className="text-xs font-bold text-emerald-800 mt-1 flex items-center gap-1">
                        <Zap size={12} className="text-amber-500" /> Auto-WebP
                     </p>
                  </div>
               </div>
               
               <div className="pt-3 border-t border-emerald-100/50">
                  <p className="text-[10px] font-bold text-emerald-800 leading-relaxed">
                     <span className="font-black text-emerald-900">Supported Uploads:</span> Any high-resolution image matching the {(typeConfig.width / typeConfig.height).toFixed(2)}:1 ratio (e.g., {typeConfig.width}×{typeConfig.height}, {Math.round(typeConfig.width*1.5)}×{Math.round(typeConfig.height*1.5)}). The system will automatically resize and compress the image without quality loss.
                  </p>
               </div>
            </div>

            <div className="space-y-3">
               <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 block">
                  Upload Background Asset *
               </label>

               {/* Dynamic aspect-ratio upload zone */}
               <div
                  onClick={() => !uploading && fileInputRef.current?.click()}
                  style={{ aspectRatio: `${typeConfig.width} / ${typeConfig.height}` }}
                  className={`w-full rounded-3xl border-2 border-dashed bg-slate-50 flex flex-col items-center justify-center gap-4 cursor-pointer transition-all overflow-hidden relative ${
                     uploading ? 'opacity-50 border-slate-200' :
                     ratioValid === false ? 'border-red-300 hover:border-red-400' :
                     ratioValid === true ? 'border-emerald-400 hover:border-emerald-500' :
                     'border-slate-200 hover:border-amber-400'
                  }`}>
                  <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />

                  {uploading ? (
                     <div className="flex flex-col items-center gap-2">
                        <Loader2 className="h-10 w-10 animate-spin text-amber-500" />
                        {uploadProgress !== null && <span className="text-[10px] font-black text-slate-500">{uploadProgress}%</span>}
                     </div>
                  ) : (formData.banner_image && formData.banner_image.trim() !== '') ? (
                     <div className="relative w-full h-full group/preview">
                        <img src={formData.banner_image} className="w-full h-full object-cover" alt="Preview" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/preview:opacity-100 transition-opacity flex items-center justify-center">
                           <span className="text-white text-[10px] font-black uppercase tracking-widest">Change Image</span>
                        </div>
                     </div>
                  ) : (
                     <>
                        <Upload className="text-slate-300" size={32} />
                        <div className="text-center px-4 space-y-1">
                           <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Upload Banner Asset</p>
                           <p className="text-[9px] font-bold text-slate-400">{typeConfig.width} × {typeConfig.height} px</p>
                        </div>
                     </>
                  )}
               </div>

               {/* Progress bar */}
               {uploadProgress !== null && (
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                     <div className="bg-amber-500 h-full transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                  </div>
               )}

               {/* Ratio validation feedback */}
               {ratioWarning && (
                  <div className={`flex items-start gap-2 p-3 rounded-xl text-xs font-bold ${ratioValid ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                     {ratioValid ? <CheckCircle2 size={14} className="shrink-0 mt-0.5" /> : <AlertCircle size={14} className="shrink-0 mt-0.5" />}
                     {ratioWarning}
                  </div>
               )}

               {/* Upload Stats / Preview Info */}
               {uploadStats && ratioValid && formData.banner_image && !uploading && (
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
                     <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Uploaded Size</span>
                        <span className="text-xs font-bold text-slate-700">{uploadStats.uploadedWidth} × {uploadStats.uploadedHeight} px</span>
                     </div>
                     <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Optimized Size</span>
                        <span className="text-xs font-black text-emerald-600">{typeConfig.width} × {typeConfig.height} px (WebP)</span>
                     </div>
                     <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Status</span>
                        <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full">Compatible</span>
                     </div>
                  </div>
               )}

               {uploadError && <p className="text-xs font-bold text-red-500 text-center">{uploadError}</p>}
            </div>

            {/* Submit */}
            <div className="pt-8 flex flex-col sm:flex-row gap-4 mt-auto">
               <button disabled={submitting} type="submit"
                  className="flex-1 h-14 bg-[var(--admin-sidebar)] text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center justify-center gap-3">
                  {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  {isEditing ? 'Save Changes' : 'Create Banner'}
               </button>
               <button type="button" onClick={() => router.push('/admin/banners')}
                  className="h-14 px-8 border-2 border-slate-100 bg-white rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:border-slate-200 transition-colors">
                  Cancel
               </button>
            </div>
         </div>
      </form>
   );
}
