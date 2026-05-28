'use client';

import React, { useState, useEffect } from 'react';
import { Save, X, Package, Tag, IndianRupee, Image as ImageIcon, List, ChevronLeft, Sparkles, Plus, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import RelatedProductsSelector from '../admin/RelatedProductsSelector';
import ComboProductsSelector from '../admin/ComboProductsSelector';
import { useAuth } from '@/context/AuthContext';
import { API_URL } from '@/lib/api';

interface Category {
   id: number;
   name: string;
}

interface ProductFormProps {
   initialData?: any;
   isEdit?: boolean;
}

export default function ProductForm({ initialData, isEdit }: ProductFormProps) {
   const router = useRouter();
   const { user } = useAuth();
   const [categories, setCategories] = useState<Category[]>([]);
   const [isLoading, setIsLoading] = useState(false);
   const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
   const [comboProducts, setComboProducts] = useState<any[]>([]);

   const [form, setForm] = useState({
      name: '',
      description: '',
      price: '',
      originalPrice: '',
      categoryId: '',
      image: '',
      tags: [] as string[],
      highlights: [] as string[],
      variants: [] as { name: string; price: number; stock: number }[],
      storageInstructions: ''
   });

   const [tagInput, setTagInput] = useState('');
   const [highlightInput, setHighlightInput] = useState('');

   useEffect(() => {
      fetchCategories();
      if (initialData) {
         setForm({
            ...initialData,
            price: initialData.price?.toString() || '',
            originalPrice: initialData.originalPrice?.toString() || '',
            categoryId: initialData.categoryId?.toString() || '',
            tags: initialData.tags || [],
            highlights: initialData.highlights || [],
            variants: initialData.variants || [],
               storageInstructions: initialData.storageInstructions || ''
         });
          if (initialData.relatedProductsSource) {
             const allRPs = initialData.relatedProductsSource.map((rp: any) => ({
                relatedProductId: rp.relatedProductId,
                priority: rp.priority,
                type: rp.type
             }));
             setRelatedProducts(allRPs.filter((rp: any) => rp.type !== 'COMBO'));
             setComboProducts(allRPs.filter((rp: any) => rp.type === 'COMBO'));
          }
      }
   }, [initialData]);

   const fetchCategories = async () => {
      try {
         const response = await fetch(`${API_URL}/api/categories`);
         const data = await response.json();
         setCategories(data);
      } catch (error) {
         console.error('Error fetching categories:', error);
      }
   };

   const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsLoading(true);

      try {
         const payload = {
            ...form,
             relatedProducts: [...relatedProducts, ...comboProducts.map((cp: any, idx: number) => ({
               ...cp, type: 'COMBO', priority: relatedProducts.length + idx
            }))],
            brandId: user?.brandId, // Force the vendor's brand ID
         };

         const url = isEdit
            ? `${API_URL}/api/products/${initialData.id}`
            : `${API_URL}/api/products`;

         const token = typeof window !== 'undefined' ? localStorage.getItem('namma_orru_token') : null;
         const headers = { 'Content-Type': 'application/json' };
         if (token) {
            headers['Authorization'] = `Bearer ${token}`;
         }
         const response = await fetch(url, {
            method: isEdit ? 'PUT' : 'POST',
            headers,
            body: JSON.stringify(payload),
         });

         if (response.ok) {
            router.push('/vendor/products');
            router.refresh();
         }
      } catch (error) {
         console.error('Error saving product:', error);
      } finally {
         setIsLoading(false);
      }
   };

   const addTag = () => {
      if (tagInput && !form.tags.includes(tagInput)) {
         setForm({ ...form, tags: [...form.tags, tagInput] });
         setTagInput('');
      }
   };

   const addHighlight = () => {
      if (highlightInput && !form.highlights.includes(highlightInput)) {
         setForm({ ...form, highlights: [...form.highlights, highlightInput] });
         setHighlightInput('');
      }
   };

   return (
      <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">

         {/* Form Header */}
         <div className="flex items-center justify-between">
            <button onClick={() => router.back()} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-emerald-950 transition-colors">
               <ChevronLeft size={16} /> Back to Products
            </button>
            <div className="flex gap-4">
               <button
                  onClick={() => router.back()}
                  className="h-12 px-6 rounded-xl border-2 border-slate-100 text-slate-400 text-[11px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all"
               >
                  Discard
               </button>
               <button
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="h-12 px-8 rounded-xl bg-emerald-950 text-white text-[11px] font-black uppercase tracking-widest flex items-center gap-3 hover:bg-emerald-800 shadow-lg shadow-emerald-900/20 disabled:opacity-50 transition-all"
               >
                  {isLoading ? 'Processing...' : <><Save size={18} /> {isEdit ? 'Update Product' : 'Publish Product'}</>}
               </button>
            </div>
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* LEFT COLUMN: CORE INFO */}
            <div className="lg:col-span-2 space-y-8">
               <section className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-10 space-y-8">
                  <div className="flex items-center gap-4 mb-2">
                     <div className="h-10 w-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600">
                        <Package size={20} />
                     </div>
                     <h3 className="text-xl font-black text-emerald-950 tracking-tight">Basic Details</h3>
                  </div>

                  <div className="space-y-6">
                     <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Product Name</label>
                        <input
                           type="text"
                           placeholder="e.g. Traditional Spicy Mango Pickle"
                           className="w-full h-14 px-6 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-amber-400 focus:bg-white outline-none font-bold text-emerald-950 transition-all"
                           value={form.name}
                           onChange={e => setForm({ ...form, name: e.target.value })}
                        />
                     </div>

                     <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Description / Story</label>
                        <textarea
                           rows={5}
                           placeholder="Tell the story of this Product..."
                           className="w-full p-6 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-amber-400 focus:bg-white outline-none font-bold text-emerald-950 transition-all resize-none"
                           value={form.description}
                           onChange={e => setForm({ ...form, description: e.target.value })}
                        />
                     </div>

                     <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Storage Instructions</label>
                        <textarea
                           rows={3}
                           placeholder="e.g. Store in a cool, dry, airtight environment away from excessive heat."
                           className="w-full p-6 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-amber-400 focus:bg-white outline-none font-bold text-emerald-950 transition-all resize-none"
                           value={form.storageInstructions}
                           onChange={e => setForm({ ...form, storageInstructions: e.target.value })}
                        />
                     </div>

                     <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-3">
                           <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Selling Price (₹)</label>
                           <div className="relative">
                              <IndianRupee className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                              <input
                                 type="number"
                                 placeholder="0.00"
                                 className="w-full h-14 pl-14 pr-6 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-amber-400 focus:bg-white outline-none font-bold text-emerald-950 transition-all"
                                 value={form.price}
                                 onChange={e => setForm({ ...form, price: e.target.value })}
                              />
                           </div>
                        </div>
                        <div className="space-y-3">
                           <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Original Price (₹)</label>
                           <div className="relative">
                              <IndianRupee className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                              <input
                                 type="number"
                                 placeholder="0.00"
                                 className="w-full h-14 pl-14 pr-6 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-amber-400 focus:bg-white outline-none font-bold text-emerald-950 transition-all"
                                 value={form.originalPrice}
                                 onChange={e => setForm({ ...form, originalPrice: e.target.value })}
                              />
                           </div>
                        </div>
                     </div>
                  </div>
               </section>

               <section className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-10">
                  <div className="flex items-center gap-4 mb-8">
                     <div className="h-10 w-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
                        <Sparkles size={20} />
                     </div>
                     <h3 className="text-xl font-black text-emerald-950 tracking-tight">Features & Highlights</h3>
                  </div>

                  <div className="space-y-8">
                     <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Highlights (Bullet Points)</label>
                        <div className="flex gap-4">
                           <input
                              type="text"
                              placeholder="e.g. 100% Organic, No Artificial Colors"
                              className="flex-1 h-12 px-6 rounded-xl bg-slate-50 border-2 border-transparent focus:border-blue-400 focus:bg-white outline-none font-bold text-emerald-950 transition-all"
                              value={highlightInput}
                              onChange={e => setHighlightInput(e.target.value)}
                              onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), addHighlight())}
                           />
                           <button onClick={addHighlight} className="h-12 w-12 rounded-xl bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition-all">
                              <Plus size={20} />
                           </button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                           {form.highlights.map((h, i) => (
                              <div key={i} className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg text-[11px] font-bold flex items-center gap-2 border border-blue-100">
                                 {h}
                                 <button onClick={() => setForm({ ...form, highlights: form.highlights.filter(it => it !== h) })}><X size={14} /></button>
                              </div>
                           ))}
                        </div>
                     </div>

                     <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Search Tags</label>
                        <div className="flex gap-4">
                           <input
                              type="text"
                              placeholder="e.g. organic, healthy, traditional"
                              className="flex-1 h-12 px-6 rounded-xl bg-slate-50 border-2 border-transparent focus:border-emerald-400 focus:bg-white outline-none font-bold text-emerald-950 transition-all"
                              value={tagInput}
                              onChange={e => setTagInput(e.target.value)}
                              onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), addTag())}
                           />
                           <button onClick={addTag} className="h-12 w-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center hover:bg-emerald-700 transition-all">
                              <Plus size={20} />
                           </button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                           {form.tags.map((t, i) => (
                              <div key={i} className="px-4 py-2 bg-emerald-50 text-emerald-700 rounded-lg text-[11px] font-bold flex items-center gap-2 border border-emerald-100">
                                 #{t}
                                 <button onClick={() => setForm({ ...form, tags: form.tags.filter(it => it !== t) })}><X size={14} /></button>
                              </div>
                           ))}
                        </div>
                     </div>
                  </div>
               </section>

               {/* RELATED PRODUCTS */}
               <section className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-10 space-y-8">
                  <div className="flex items-center gap-4 mb-2">
                     <div className="h-10 w-10 rounded-xl bg-purple-100 flex items-center justify-center text-purple-600">
                        <Sparkles size={20} />
                     </div>
                     <h3 className="text-xl font-black text-emerald-950 tracking-tight">Related Products / Recommended Essentials</h3>
                  </div>
                  <RelatedProductsSelector
                     relatedProducts={relatedProducts}
                     onChange={setRelatedProducts}
                     isAdmin={false}
                     currentProductId={initialData?.id}
                  />
               </section>

               {/* COMBO & BUNDLE MANAGEMENT */}
               <section className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-10 space-y-8">
                  <div className="flex items-center gap-4 mb-2">
                     <div className="h-10 w-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600">
                        <Package size={20} />
                     </div>
                     <div>
                        <h3 className="text-xl font-black text-emerald-950 tracking-tight">Combo & Bundle Management</h3>
                        <p className="text-[11px] text-slate-400 font-medium mt-0.5">Set product-specific "Frequently Bought Together" items</p>
                     </div>
                  </div>
                  <ComboProductsSelector
                     comboProducts={comboProducts}
                     onChange={setComboProducts}
                     isAdmin={false}
                     currentProductId={initialData?.id}
                  />
               </section>
            </div>

            {/* RIGHT COLUMN: TAXONOMY & MEDIA */}
            <div className="space-y-8">
               <section className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-10 space-y-8">
                  <div className="flex items-center gap-4 mb-2">
                     <div className="h-10 w-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600">
                        <List size={20} />
                     </div>
                     <h3 className="text-xl font-black text-emerald-950 tracking-tight">Organization</h3>
                  </div>

                  <div className="space-y-3">
                     <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Category</label>
                     <select
                        className="w-full h-14 px-6 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-emerald-400 focus:bg-white outline-none font-bold text-emerald-950 appearance-none cursor-pointer"
                        value={form.categoryId}
                        onChange={e => setForm({ ...form, categoryId: e.target.value })}
                     >
                        <option value="">Select Category</option>
                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                     </select>
                  </div>
               </section>

               <section className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-10 space-y-8">
                  <div className="flex items-center gap-4 mb-2">
                     <div className="h-10 w-10 rounded-xl bg-pink-100 flex items-center justify-center text-pink-600">
                        <ImageIcon size={20} />
                     </div>
                     <h3 className="text-xl font-black text-emerald-950 tracking-tight">Main Visual</h3>
                  </div>

                  <div className="space-y-6">
                     <div className="aspect-square rounded-[2rem] bg-slate-50 border-2 border-dashed border-slate-200 overflow-hidden relative group cursor-pointer hover:border-emerald-400 transition-all flex items-center justify-center">
                        {form.image ? (
                           <img src={form.image} className="h-full w-full object-cover" />
                        ) : (
                           <div className="flex flex-col items-center gap-4 text-slate-400">
                              <ImageIcon size={40} strokeWidth={1.5} />
                              <span className="text-[10px] font-black uppercase tracking-widest">Image Preview</span>
                           </div>
                        )}
                     </div>
                     <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Image URL</label>
                        <input
                           type="text"
                           placeholder="Paste image link here..."
                           className="w-full h-12 px-6 rounded-xl bg-slate-50 border-2 border-transparent focus:border-pink-400 focus:bg-white outline-none font-bold text-emerald-950 text-xs transition-all"
                           value={form.image}
                           onChange={e => setForm({ ...form, image: e.target.value })}
                        />
                     </div>
                  </div>
               </section>
            </div>

         </div>
      </div>
   );
}
