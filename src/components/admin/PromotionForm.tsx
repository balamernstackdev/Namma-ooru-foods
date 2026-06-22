'use client'
import React, { useState, useRef } from 'react';
import { ArrowLeft, ChevronRight, Save, Upload, Megaphone, Calendar, Tag, Info, Palette, Loader2, Layers, DollarSign, BarChart, Search, X, Check, Plus, Link as LinkIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/context/ToastContext';
import useSWR from 'swr';
import { API_URL } from '@/lib/api';

const fetcher = (url: string) => fetch(url).then(res => res.json());

interface PromotionFormProps {
   initialData?: any;
   mode: 'create' | 'edit';
}

const PROMO_TYPES = [
   { id: 'STANDARD', label: 'Standard Ticket Voucher', desc: 'Standalone clickable voucher with coupon codes.' },
   { id: 'HERO_CAROUSEL', label: 'Hero Campaign Slider', desc: 'Immersive sliding banner at the top of the page.' },
   { id: 'QUICK_STRIP', label: 'Quick Horizontal Strip', desc: 'Compact pill indicators for instant offers.' },
   { id: 'FLASH_DEAL', label: 'Lightning Flash Deal', desc: 'Time-sensitive deals with live claim bars.' },
   { id: 'WALLET_OFFER', label: 'Wallet & Payment Offer', desc: 'Cashbacks via GPay, PhonePe, or Bank partnerships.' },
   { id: 'COMBO_DEAL', label: 'Premium Bundle Combo', desc: 'Bundled products at dynamic discount rates.' },
];

export default function PromotionForm({ initialData, mode }: PromotionFormProps) {
   const router = useRouter();
   const { addToast } = useToast();
   const { data: categoriesData } = useSWR(`${API_URL}/api/categories?all=true&limit=1000`, fetcher);
   const categories = categoriesData?.categories || [];
   const { data: productsData } = useSWR(`${API_URL}/api/products?limit=1000&status=all`, fetcher);

   const [isLoading, setIsLoading] = useState(false);
   const [isUploading, setIsUploading] = useState(false);
   const fileInputRef = useRef<HTMLInputElement>(null);

   // Search filters for mapping
   const [productQuery, setProductQuery] = useState('');
   const [categoryQuery, setCategoryQuery] = useState('');

   // Relational Mappings
   const [selectedProductIds, setSelectedProductIds] = useState<number[]>(
      initialData?.products?.map((p: any) => p.id) || []
   );
   const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>(
      initialData?.categories?.map((c: any) => c.id) || []
   );

   // Ensure dates are sliced properly for the type="date" inputs
   const formatInitialDate = (val: any) => {
      if (!val) return '';
      try {
         return new Date(val).toISOString().split('T')[0];
      } catch {
         return '';
      }
   };

   const [formData, setFormData] = useState({
      title: initialData?.title || '',
      subtitle: initialData?.subtitle || '',
      discount: initialData?.discount || '',
      category: initialData?.category || '',
      code: initialData?.code || '',
      description: initialData?.description || '',
      image: initialData?.image || '',
      color: initialData?.color || '#FF5733',
      active: initialData?.isActive ?? initialData?.active ?? true,
      end: formatInitialDate(initialData?.endDate || initialData?.end),

      // New Campaign Engine fields
      type: initialData?.type || 'STANDARD',
      actionText: initialData?.actionText || '',
      actionLink: initialData?.actionLink || '',
      tag: initialData?.tag || '',
      originalPrice: initialData?.originalPrice || '',
      salePrice: initialData?.salePrice || '',
      claimedPercent: initialData?.claimedPercent ?? 0,
      provider: initialData?.provider || '',
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
            addToast('Upload Success', 'Campaign hero image updated.');
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
               claimedPercent: Number(formData.claimedPercent),
               productIds: selectedProductIds,
               categoryIds: selectedCategoryIds,
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
      <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-24">
         {/* Navigation Header */}
         <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
               <button
                  onClick={() => router.push('/admin/promotions')}
                  className="h-14 w-14 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-emerald-600 hover:bg-slate-50 transition-all shadow-sm"
               >
                  <ArrowLeft size={24} />
               </button>
               <div className="flex flex-col">
                  <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 mb-1">
                     <span>Marketing Engine</span>
                     <ChevronRight size={10} />
                     <span className="text-emerald-600">{mode === 'edit' ? 'Refine Campaign' : 'Generate Offer'}</span>
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
                  className="h-14 px-10 rounded-2xl bg-slate-900 text-white text-[11px] font-black uppercase tracking-widest flex items-center gap-3 shadow-2xl hover:opacity-90 transition-all active:scale-95 disabled:opacity-50"
               >
                  <Save size={18} />
                  {mode === 'edit' ? 'Save Changes' : 'Deploy Campaign'}
               </button>
            </div>
         </div>

         {/* Form UI */}
         <div className="grid grid-cols-12 gap-10">
            {/* Left Column */}
            <div className="col-span-12 lg:col-span-8 space-y-8">

               {/* SECTION 1: CAMPAIGN PLACEMENT */}
               <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm space-y-8">
                  <div className="flex items-center gap-3">
                     <div className="h-8 w-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                        <Layers size={18} />
                     </div>
                     <h4 className="text-xl font-black text-slate-800 tracking-tighter">Campaign Engine Type</h4>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                     {PROMO_TYPES.map(type => (
                        <label
                           key={type.id}
                           className={`p-6 rounded-2xl border-2 cursor-pointer transition-all flex flex-col gap-2 hover:shadow-md ${formData.type === type.id
                                 ? 'border-emerald-500 bg-emerald-50/30 text-emerald-950'
                                 : 'border-slate-100 bg-slate-50/50 text-slate-600 hover:border-slate-200'
                              }`}
                        >
                           <div className="flex items-center justify-between">
                              <span className="font-black text-sm tracking-tight uppercase">{type.label}</span>
                              <input
                                 type="radio"
                                 name="promo-type"
                                 checked={formData.type === type.id}
                                 onChange={() => setFormData({ ...formData, type: type.id })}
                                 className="h-4 w-4 text-emerald-600 focus:ring-emerald-500"
                              />
                           </div>
                           <p className="text-[11px] opacity-70 font-semibold leading-relaxed">{type.desc}</p>
                        </label>
                     ))}
                  </div>
               </div>

               {/* SECTION 2: CORE CONTENT */}
               <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm space-y-8">
                  <div className="space-y-8">
                     <div className="flex flex-col gap-4">
                        <label className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400">Main Display Title</label>
                        <div className="relative">
                           <Megaphone className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={24} />
                           <input
                              type="text"
                              required
                              placeholder="e.g. Summer Product Organic Sale"
                              className="h-20 pl-16 pr-8 w-full rounded-3xl bg-slate-50/50 border border-slate-100 outline-none font-black text-2xl text-slate-800 focus:bg-white focus:border-emerald-500/30 focus:ring-8 ring-emerald-500/5 transition-all"
                              value={formData.title}
                              onChange={e => setFormData({ ...formData, title: e.target.value })}
                           />
                        </div>
                     </div>

                     {/* Conditional Subtitle Field for Hero/Combo */}
                     {(formData.type === 'HERO_CAROUSEL' || formData.type === 'COMBO_DEAL') && (
                        <div className="flex flex-col gap-4 animate-in fade-in duration-300">
                           <label className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400">Subheading / Tagline</label>
                           <input
                              type="text"
                              placeholder="e.g. Upto 40% off on Premium Products"
                              className="h-16 px-8 rounded-2xl bg-slate-50/50 border border-slate-100 outline-none font-bold text-lg text-slate-800 focus:bg-white transition-all"
                              value={formData.subtitle}
                              onChange={e => setFormData({ ...formData, subtitle: e.target.value })}
                           />
                        </div>
                     )}

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="flex flex-col gap-4">
                           <label className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400">Discount Tag</label>
                           <input
                              type="text"
                              placeholder="e.g. 40% OFF or Buy 1 Get 1"
                              className="h-16 px-8 rounded-2xl bg-slate-50/50 border border-slate-100 outline-none font-bold text-lg text-slate-800 focus:bg-white transition-all"
                              value={formData.discount}
                              onChange={e => setFormData({ ...formData, discount: e.target.value })}
                           />
                        </div>
                        <div className="flex flex-col gap-4">
                           <label className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400">Coupon Code</label>
                           <div className="relative">
                              <Tag className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                              <input
                                 type="text"
                                 placeholder="e.g. Product40"
                                 className="h-16 pl-14 pr-8 w-full rounded-2xl bg-slate-50/50 border border-slate-100 outline-none font-mono font-bold text-lg text-emerald-700 focus:bg-white transition-all uppercase"
                                 value={formData.code}
                                 onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                              />
                           </div>
                        </div>
                     </div>

                     <div className="flex flex-col gap-4">
                        <label className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400">Marketing Description</label>
                        <textarea
                           rows={3}
                           placeholder="Experience 100% traditional authentic wood-pressed..."
                           className="p-8 rounded-[2rem] bg-slate-50/50 border border-slate-100 outline-none font-bold text-lg text-slate-700 focus:bg-white focus:border-emerald-500/30 transition-all resize-none leading-relaxed"
                           value={formData.description}
                           onChange={e => setFormData({ ...formData, description: e.target.value })}
                        />
                     </div>
                  </div>
               </div>

               {/* SECTION 3: CAMPAIGN TYPE-SPECIFIC ATTRIBUTES */}
               <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm space-y-8">
                  <div className="flex items-center gap-3">
                     <div className="h-8 w-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                        <Info size={18} />
                     </div>
                     <h4 className="text-xl font-black text-slate-800 tracking-tighter uppercase">Advanced Settings</h4>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     {/* Action Link & Text for Interactive items */}
                     {['HERO_CAROUSEL', 'COMBO_DEAL', 'WALLET_OFFER'].includes(formData.type) && (
                        <>
                           <div className="flex flex-col gap-4">
                              <label className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400">Button Text</label>
                              <input
                                 type="text"
                                 placeholder="e.g. Shop The Festival"
                                 className="h-16 px-8 rounded-2xl bg-slate-50/50 border border-slate-100 outline-none font-bold text-lg text-slate-800 focus:bg-white transition-all"
                                 value={formData.actionText}
                                 onChange={e => setFormData({ ...formData, actionText: e.target.value })}
                              />
                           </div>
                           <div className="flex flex-col gap-4">
                              <label className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400">Navigation Link</label>
                              <div className="relative">
                                 <LinkIcon className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                                 <input
                                    type="text"
                                    placeholder="e.g. /best-selling"
                                    className="h-16 pl-14 pr-8 w-full rounded-2xl bg-slate-50/50 border border-slate-100 outline-none font-bold text-lg text-slate-800 focus:bg-white transition-all"
                                    value={formData.actionLink}
                                    onChange={e => setFormData({ ...formData, actionLink: e.target.value })}
                                 />
                              </div>
                           </div>
                        </>
                     )}

                     {/* Wallet Partner */}
                     {formData.type === 'WALLET_OFFER' && (
                        <div className="col-span-2 flex flex-col gap-4">
                           <label className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400">Payment Provider</label>
                           <input
                              type="text"
                              placeholder="e.g. Google Pay, PhonePe, ICICI"
                              className="h-16 px-8 rounded-2xl bg-slate-50/50 border border-slate-100 outline-none font-bold text-lg text-slate-800 focus:bg-white transition-all"
                              value={formData.provider}
                              onChange={e => setFormData({ ...formData, provider: e.target.value })}
                           />
                        </div>
                     )}

                     {/* Combo/Flash specific metrics */}
                     {['FLASH_DEAL', 'COMBO_DEAL'].includes(formData.type) && (
                        <>
                           <div className="flex flex-col gap-4">
                              <label className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400">Original / Pre-Discount Price</label>
                              <div className="relative">
                                 <DollarSign className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                                 <input
                                    type="text"
                                    placeholder="e.g. ₹850"
                                    className="h-16 pl-14 pr-8 w-full rounded-2xl bg-slate-50/50 border border-slate-100 outline-none font-bold text-lg text-slate-800 focus:bg-white transition-all"
                                    value={formData.originalPrice}
                                    onChange={e => setFormData({ ...formData, originalPrice: e.target.value })}
                                 />
                              </div>
                           </div>
                           <div className="flex flex-col gap-4">
                              <label className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400">Sale / Deal Price</label>
                              <div className="relative">
                                 <DollarSign className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                                 <input
                                    type="text"
                                    placeholder="e.g. ₹599"
                                    className="h-16 pl-14 pr-8 w-full rounded-2xl bg-slate-50/50 border border-slate-100 outline-none font-bold text-lg text-emerald-600 focus:bg-white transition-all"
                                    value={formData.salePrice}
                                    onChange={e => setFormData({ ...formData, salePrice: e.target.value })}
                                 />
                              </div>
                           </div>
                        </>
                     )}

                     {/* Flash Claim percent */}
                     {formData.type === 'FLASH_DEAL' && (
                        <div className="col-span-2 flex flex-col gap-4">
                           <div className="flex items-center justify-between">
                              <label className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400">Claimed Percentage ({formData.claimedPercent}%)</label>
                              <span className="text-xs font-black text-emerald-600">{formData.claimedPercent}% Claimed</span>
                           </div>
                           <div className="relative flex items-center gap-4">
                              <BarChart className="text-slate-300 shrink-0" size={20} />
                              <input
                                 type="range"
                                 min="0"
                                 max="100"
                                 className="flex-1 h-3 bg-slate-100 rounded-full appearance-none outline-none transition-all accent-emerald-600 cursor-pointer"
                                 value={formData.claimedPercent}
                                 onChange={e => setFormData({ ...formData, claimedPercent: Number(e.target.value) })}
                              />
                           </div>
                        </div>
                     )}

                     {/* Tags for Carousel/Combos */}
                     {['HERO_CAROUSEL', 'COMBO_DEAL'].includes(formData.type) && (
                        <div className="col-span-2 flex flex-col gap-4">
                           <label className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400">Offer Ribbon Tag</label>
                           <input
                              type="text"
                              placeholder="e.g. BEST SELLING, HOT COMBO, MEMBER EXCLUSIVE"
                              className="h-16 px-8 rounded-2xl bg-slate-50/50 border border-slate-100 outline-none font-bold text-lg text-slate-800 focus:bg-white transition-all"
                              value={formData.tag}
                              onChange={e => setFormData({ ...formData, tag: e.target.value })}
                           />
                        </div>
                     )}
                  </div>
               </div>

               {/* SECTION 4: TARGETING RELATIONS */}
               <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm space-y-8">
                  <div className="flex items-center gap-3">
                     <div className="h-8 w-8 rounded-lg bg-rose-50 flex items-center justify-center text-rose-600">
                        <Layers size={18} />
                     </div>
                     <h4 className="text-xl font-black text-slate-800 tracking-tighter uppercase">Database Integration</h4>
                  </div>

                  {/* Product Multi-Select Picker */}
                  <div className="flex flex-col gap-4 border-b border-slate-50 pb-8">
                     <div className="flex flex-col">
                        <span className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400">Map Products ({selectedProductIds.length})</span>
                        <span className="text-[10px] text-slate-400 font-medium mt-1">Linking products enables auto-routing, price inheritance, and automated bundle logic.</span>
                     </div>

                     <div className="relative">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                        <input
                           type="text"
                           placeholder="Search products by name..."
                           className="h-16 pl-14 pr-8 w-full rounded-2xl bg-slate-50 border border-slate-100 outline-none font-bold text-lg text-slate-800 focus:bg-white transition-all"
                           value={productQuery}
                           onChange={e => setProductQuery(e.target.value)}
                        />
                     </div>

                     {/* Search Results Dropdown */}
                     {productQuery.trim() !== '' && productsData?.products && (
                        <div className="max-h-64 overflow-y-auto bg-white border-2 border-slate-100 rounded-2xl shadow-2xl p-2 animate-in slide-in-from-top-2 duration-200 z-20">
                           {productsData.products
                              .filter((p: any) => p.name.toLowerCase().includes(productQuery.toLowerCase()))
                              .slice(0, 15)
                              .map((prod: any) => {
                                 const isSelected = selectedProductIds.includes(prod.id);
                                 return (
                                    <div
                                       key={prod.id}
                                       onClick={() => {
                                          if (isSelected) {
                                             setSelectedProductIds(prev => prev.filter(id => id !== prod.id));
                                          } else {
                                             setSelectedProductIds(prev => [...prev, prod.id]);
                                          }
                                       }}
                                       className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all ${isSelected ? 'bg-emerald-50 text-emerald-900' : 'hover:bg-slate-50 text-slate-700'
                                          }`}
                                    >
                                       <div className="flex items-center gap-3">
                                          {prod.image && <img src={prod.image} className="h-10 w-10 rounded-lg object-cover" />}
                                          <span className="font-black text-xs uppercase tracking-wider">{prod.name}</span>
                                       </div>
                                       {isSelected ? <Check className="text-emerald-600 h-4 w-4" /> : <Plus className="text-slate-300 h-4 w-4" />}
                                    </div>
                                 );
                              })
                           }
                           {productsData.products.filter((p: any) => p.name.toLowerCase().includes(productQuery.toLowerCase())).length === 0 && (
                              <div className="p-4 text-center text-[10px] font-black text-slate-400 uppercase">No products match query</div>
                           )}
                        </div>
                     )}

                     {/* Selected Product Badges */}
                     {selectedProductIds.length > 0 && productsData?.products && (
                        <div className="flex flex-wrap gap-2 pt-2">
                           {selectedProductIds.map(pid => {
                              const foundProd = productsData.products.find((p: any) => p.id === pid);
                              if (!foundProd) return null;
                              return (
                                 <span key={pid} className="inline-flex items-center gap-2 bg-slate-900 text-white pl-3 pr-2 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider shadow-md animate-in zoom-in-95 duration-200">
                                    {foundProd.name}
                                    <button
                                       type="button"
                                       onClick={() => setSelectedProductIds(prev => prev.filter(id => id !== pid))}
                                       className="h-5 w-5 bg-white/10 rounded-lg flex items-center justify-center hover:bg-white/25 transition-colors text-white"
                                    >
                                       <X size={12} />
                                    </button>
                                 </span>
                              );
                           })}
                        </div>
                     )}
                  </div>

                  {/* Relational Category Mapping */}
                  <div className="flex flex-col gap-4">
                     <div className="flex flex-col">
                        <span className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400">Relational Categories ({selectedCategoryIds.length})</span>
                        <span className="text-[10px] text-slate-400 font-medium mt-1">Map this offer directly into specific shop categories.</span>
                     </div>

                     <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {categories?.map((cat: any) => {
                           const isSelected = selectedCategoryIds.includes(cat.id);
                           return (
                              <div
                                 key={cat.id}
                                 onClick={() => {
                                    if (isSelected) {
                                       setSelectedCategoryIds(prev => prev.filter(id => id !== cat.id));
                                    } else {
                                       setSelectedCategoryIds(prev => [...prev, cat.id]);
                                    }
                                 }}
                                 className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center justify-between ${isSelected ? 'border-emerald-500 bg-emerald-50/30 text-emerald-900 shadow-inner' : 'border-slate-100 bg-slate-50/50 text-slate-600 hover:border-slate-200'
                                    }`}
                              >
                                 <span className="font-black text-[10px] uppercase tracking-wider truncate">{cat.name}</span>
                                 <div className={`h-4 w-4 rounded flex items-center justify-center border transition-all ${isSelected ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300 bg-white'
                                    }`}>
                                    {isSelected && <Check size={10} />}
                                 </div>
                              </div>
                           );
                        })}
                     </div>
                  </div>
               </div>

               {/* SECTION 5: SCHEDULING */}
               <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm space-y-8">
                  <div className="flex items-center gap-3">
                     <div className="h-8 w-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
                        <Calendar size={18} />
                     </div>
                     <h4 className="text-xl font-black text-slate-800 tracking-tighter">Targeting & Schedule</h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                     <div className="flex flex-col gap-4">
                        <label className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400">Target Category / Tags</label>
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

               {/* Campaign Visual Asset (Required for Slider/Deals/Combos) */}
               {formData.type !== 'QUICK_STRIP' && (
                  <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm space-y-8">
                     <label className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400">Campaign Hero Asset</label>
                     <div
                        onClick={() => !isUploading && fileInputRef.current?.click()}
                        className={`aspect-video bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2rem] flex flex-col items-center justify-center gap-6 group cursor-pointer hover:border-emerald-500/50 transition-all overflow-hidden relative shadow-inner mb-6 ${isUploading ? 'opacity-50 cursor-wait' : ''}`}
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
                              <Loader2 className="h-10 w-10 text-emerald-600 animate-spin" />
                              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-600">Uploading...</span>
                           </div>
                        ) : (formData.image && formData.image.trim() !== '') ? (
                           <img src={formData.image || undefined} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" alt="Promotion" />
                        ) : (
                           <>
                              <div className="h-16 w-16 rounded-2xl bg-white flex items-center justify-center shadow-md text-slate-300 transition-all">
                                 <Upload size={28} />
                              </div>
                              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 text-center px-4">Upload Image / Graphics</span>
                           </>
                        )}
                     </div>
                  </div>
               )}

               <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm space-y-8">
                  <div className="flex flex-col gap-6">
                     <div className="flex flex-col gap-4">
                        <label className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400">Theme Accent Identity</label>
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
                        <div className="flex flex-col text-left">
                           <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">Campaign Deployment</span>
                           <span className={`text-sm font-bold ${formData.active ? 'text-emerald-600' : 'text-slate-400'}`}>
                              {formData.active ? 'Live on Storefront' : 'Disabled / Hidden'}
                           </span>
                        </div>
                        <button
                           type="button"
                           onClick={() => setFormData({ ...formData, active: !formData.active })}
                           className={`w-14 h-8 rounded-full transition-all relative ${formData.active ? 'bg-emerald-500 shadow-lg shadow-emerald-500/30' : 'bg-slate-200'}`}
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
