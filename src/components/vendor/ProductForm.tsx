'use client';

import React, { useState, useEffect } from 'react';
import { mutate } from 'swr';
import { Save, X, Package, Tag, IndianRupee, Image as ImageIcon, List, ChevronLeft, Sparkles, Plus, Trash2, Layers } from 'lucide-react';
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
      subcategoryId: '',
      image: '',
      tags: [] as string[],
      highlights: [] as string[],
      variants: [] as { name: string; price: number; stock: number; originalPrice?: string; sku?: string; weight?: string; unit?: string; barcode?: string }[],
      storageInstructions: '',
      isBestSeller: false,
      isOrganic: false,
      isFeatured: false,
      isNewArrival: false,
      inventoryMode: 'SINGLE',
      weight: '',
      unit: 'g',
      sku: '',
      stock: '0',
      gstRate: ''
   });

   const [tagInput, setTagInput] = useState('');
   const [highlightInput, setHighlightInput] = useState('');
   const [subcategories, setSubcategories] = useState<any[]>([]);

   useEffect(() => {
      fetchCategories();
      if (initialData) {
         setForm({
            ...initialData,
            price: initialData.price?.toString() || '',
            originalPrice: initialData.originalPrice?.toString() || '',
            categoryId: initialData.categoryId?.toString() || '',
            subcategoryId: initialData.subcategoryId?.toString() || '',
            tags: initialData.tags || [],
            highlights: initialData.highlights || [],
            variants: initialData.variants || [],
            storageInstructions: initialData.storageInstructions || '',
            isBestSeller: initialData.isBestSeller || false,
            isOrganic: initialData.isOrganic || false,
            isFarmerCollection: initialData.isFarmerCollection || false,
            isNewArrival: initialData.isNewArrival || false,
            inventoryMode: initialData.inventoryMode || 'SINGLE',
            weight: initialData.weight?.toString() || '',
            unit: initialData.unit || 'g',
            sku: initialData.sku || '',
            stock: initialData.stock?.toString() || '0',
            gstRate: initialData.gstRate !== undefined && initialData.gstRate !== null ? initialData.gstRate.toString() : ''
         });
         if (initialData.relatedProductsSource) {
            const allRPs = initialData.relatedProductsSource.map((rp: any) => ({
               relatedProductId: rp.relatedProductId,
               priority: rp.priority,
               type: rp.type
            }));
            setRelatedProducts(allRPs);
         }
         if (initialData.parentCombos) {
            const allCombos = initialData.parentCombos.map((c: any) => ({
               comboProductId: c.comboProductId,
               sortOrder: c.sortOrder,
               discountType: c.discountType,
               discountValue: c.discountValue,
               finalPrice: c.finalPrice
            }));
            setComboProducts(allCombos);
         }
      }
   }, [initialData]);

   useEffect(() => {
      if (form.categoryId) {
         fetchSubcategories(Number(form.categoryId));
      } else {
         setSubcategories([]);
      }
   }, [form.categoryId]);

   const fetchCategories = async () => {
      try {
         const response = await fetch(`${API_URL}/api/categories?limit=100`);
         const data = await response.json();
         setCategories(data.categories || data || []);
      } catch (error) {
         console.error('Error fetching categories:', error);
      }
   };

   const fetchSubcategories = async (catId: number) => {
      try {
         const response = await fetch(`${API_URL}/api/subcategories?categoryId=${catId}`);
         const data = await response.json();
         setSubcategories(data.subcategories || []);
      } catch (error) {
         console.error('Error fetching subcategories:', error);
      }
   };

   const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsLoading(true);

      try {
         const payload = {
            ...form,
            relatedProducts: [...relatedProducts],
            productCombos: comboProducts.map((cp: any, idx: number) => ({
               comboProductId: cp.comboProductId,
               discountType: cp.discountType,
               discountValue: cp.discountValue,
               finalPrice: cp.finalPrice,
               sortOrder: idx
            })),
            brandId: user?.brandId || undefined,
            categoryId: parseInt(form.categoryId),
            subcategoryId: form.subcategoryId ? parseInt(form.subcategoryId) : null,
            gstRate: form.gstRate ? parseInt(form.gstRate) : null,
            weight: form.weight ? parseFloat(form.weight) : null,
            stock: form.stock ? parseInt(form.stock) : 0,
            variants: form.variants.map((v: any) => ({
               name: v.name,
               price: v.price ? parseFloat(v.price.toString()) : null,
               originalPrice: v.originalPrice ? parseFloat(v.originalPrice.toString()) : null,
               stock: parseInt(v.stock?.toString() || '0'),
               sku: v.sku && typeof v.sku === 'string' ? v.sku.trim() || null : null,
               weight: v.weight ? parseFloat(v.weight.toString()) : null,
               unit: null,
               barcode: v.barcode && typeof v.barcode === 'string' ? v.barcode.trim() || null : null
            }))
         };

         const url = isEdit
            ? `${API_URL}/api/products/${initialData.id}`
            : `${API_URL}/api/products`;

         const token = typeof window !== 'undefined' ? localStorage.getItem('namma_orru_token') : null;
         const headers: Record<string, string> = { 'Content-Type': 'application/json' };
         if (token) {
            headers['Authorization'] = `Bearer ${token}`;
         }
         const response = await fetch(url, {
            method: isEdit ? 'PUT' : 'POST',
            headers,
            body: JSON.stringify(payload),
         });

         if (response.ok) {
            const data = await response.json();
            if (isEdit) {
               mutate(() => true);
               router.push('/vendor/products');
               router.refresh();
            } else {
               if (data && data.success) {
                  mutate(() => true);
                  router.push('/vendor/products');
                  router.refresh();
               } else {
                  console.error('Failed to create product:', data.message);
               }
            }
         } else {
            try {
               const data = await response.json();
               console.error('Failed to save product:', data.message || data.error);
            } catch (e) {
               console.error('Server error saving product:', response.status);
            }
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

                     {/* INVENTORY MODE SELECTOR */}
                     <div className="border-t border-slate-100 pt-6">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider mb-4 block ml-2">Variants </label>
                        <div className="flex gap-4">
                           <label className={`flex-1 flex items-center justify-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${form.inventoryMode === 'SINGLE' ? 'border-amber-500 bg-amber-50 text-amber-700' : 'border-slate-200 bg-slate-50 text-slate-500 hover:bg-white'}`}>
                              <input type="radio" name="inventoryMode" className="hidden" checked={form.inventoryMode === 'SINGLE'} onChange={() => setForm({ ...form, inventoryMode: 'SINGLE' })} />
                              <Package size={18} />
                              <span className="text-sm font-bold">Single Product (Base)</span>
                           </label>
                           <label className={`flex-1 flex items-center justify-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${form.inventoryMode === 'MULTIPLE' ? 'border-amber-500 bg-amber-50 text-amber-700' : 'border-slate-200 bg-slate-50 text-slate-500 hover:bg-white'}`}>
                              <input type="radio" name="inventoryMode" className="hidden" checked={form.inventoryMode === 'MULTIPLE'} onChange={() => setForm({ ...form, inventoryMode: 'MULTIPLE' })} />
                              <Layers size={18} />
                              <span className="text-sm font-bold">Multiple Variants</span>
                           </label>
                        </div>
                     </div>

                     {form.inventoryMode === 'SINGLE' && (
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
                     )}
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

               {/* VARIANT MANAGER */}
               {form.inventoryMode === 'MULTIPLE' && (
                  <section className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-10 space-y-8">
                     <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-4">
                           <div className="h-10 w-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600">
                              <Layers size={20} />
                           </div>
                           <h3 className="text-xl font-black text-emerald-950 tracking-tight">Variant & Inventory Manager</h3>
                        </div>
                        <button type="button" onClick={() => setForm({ ...form, variants: [...form.variants, { name: '', price: 0, originalPrice: '', stock: 0, sku: '', weight: '', unit: '' }] })} className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-[11px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-sm">+ Add Variant</button>
                     </div>
                     <div className="space-y-4">
                        {form.variants.length === 0 ? (
                           <div className="text-center py-8 text-slate-400 text-sm font-medium border-2 border-dashed border-slate-100 rounded-xl bg-slate-50/50">No variants added.</div>
                        ) : (
                           <div className="overflow-x-auto">
                              <table className="w-full text-left border-collapse">
                                 <thead>
                                    <tr className="border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                       <th className="pb-3 font-black">Variant Name</th>
                                       <th className="pb-3 font-black">Price</th>
                                       <th className="pb-3 font-black">MRP</th>
                                       <th className="pb-3 font-black">Stock</th>
                                       <th className="pb-3 font-black text-right">Actions</th>
                                    </tr>
                                 </thead>
                                 <tbody className="divide-y divide-slate-50">
                                    {form.variants.map((variant: any, idx: number) => (
                                       <tr key={idx} className="group">
                                          <td className="py-3 pr-2"><input type="text" className="w-[120px] h-11 px-3 rounded-xl border border-slate-200 text-sm font-bold outline-none focus:border-amber-400 transition-colors" placeholder="e.g. 500g" value={variant.name} onChange={e => { const newV: any = [...form.variants]; newV[idx].name = e.target.value; setForm({ ...form, variants: newV }); }} /></td>
                                          <td className="py-3 pr-2"><input type="number" className="w-[90px] h-11 px-3 rounded-xl border border-slate-200 text-sm font-bold outline-none focus:border-amber-400 transition-colors text-emerald-600" placeholder="Price" value={variant.price} onChange={e => { const newV: any = [...form.variants]; newV[idx].price = e.target.value; setForm({ ...form, variants: newV }); }} /></td>
                                          <td className="py-3 pr-2"><input type="number" className="w-[90px] h-11 px-3 rounded-xl border border-slate-200 text-sm font-bold outline-none focus:border-amber-400 transition-colors text-emerald-600" placeholder="MRP" value={variant.originalPrice} onChange={e => { const newV: any = [...form.variants]; newV[idx].originalPrice = e.target.value; setForm({ ...form, variants: newV }); }} /></td>
                                          <td className="py-3 pr-2"><input type="number" className="w-[80px] h-11 px-3 rounded-xl border border-slate-200 text-sm font-bold outline-none focus:border-amber-400 transition-colors" placeholder="Stock" value={variant.stock} onChange={e => { const newV: any = [...form.variants]; newV[idx].stock = e.target.value; setForm({ ...form, variants: newV }); }} /></td>
                                          <td className="py-3 text-right"><button type="button" onClick={() => { const newV = [...form.variants]; newV.splice(idx, 1); setForm({ ...form, variants: newV }); }} className="h-11 w-11 inline-flex items-center justify-center rounded-xl text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all"><Trash2 size={16} /></button></td>
                                       </tr>
                                    ))}
                                 </tbody>
                              </table>
                           </div>
                        )}
                     </div>
                  </section>
               )}

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

                  <div className="space-y-6">
                     <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Category</label>
                        <select
                           className="w-full h-14 px-6 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-emerald-400 focus:bg-white outline-none font-bold text-emerald-950 appearance-none cursor-pointer"
                           value={form.categoryId}
                           onChange={e => setForm({ ...form, categoryId: e.target.value, subcategoryId: '' })}
                        >
                           <option value="">Select Category</option>
                           {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                     </div>                      <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Subcategory</label>
                        <select
                           className="w-full h-14 px-6 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-emerald-400 focus:bg-white outline-none font-bold text-emerald-950 appearance-none cursor-pointer disabled:opacity-50"
                           value={form.subcategoryId}
                           onChange={e => setForm({ ...form, subcategoryId: e.target.value })}
                           disabled={!form.categoryId}
                        >
                           <option value="">Select Subcategory</option>
                           {subcategories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                     </div>



                     {form.inventoryMode === 'SINGLE' && (
                        <>
                           <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-3">
                                 <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Weight</label>
                                 <input
                                    type="number"
                                    step="any"
                                    className="w-full h-14 px-6 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-emerald-400 focus:bg-white outline-none font-bold text-emerald-950"
                                    value={form.weight}
                                    onChange={e => setForm({ ...form, weight: e.target.value })}
                                 />
                              </div>
                              <div className="space-y-3">
                                 <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Unit</label>
                                 <input
                                    type="text"
                                    className="w-full h-14 px-6 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-emerald-400 focus:bg-white outline-none font-bold text-emerald-950"
                                    placeholder="e.g. g, kg, ml, pcs"
                                    value={form.unit}
                                    onChange={e => setForm({ ...form, unit: e.target.value })}
                                 />
                              </div>
                           </div>

                           <div className="grid grid-cols-1 gap-4">
                              <div className="space-y-3">
                                 <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Base Stock</label>
                                 <input
                                    type="number"
                                    className="w-full h-14 px-6 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-emerald-400 focus:bg-white outline-none font-bold text-emerald-950"
                                    value={form.stock}
                                    onChange={e => setForm({ ...form, stock: e.target.value })}
                                 />
                              </div>
                           </div>
                        </>
                     )}

                     <div className="border-t border-slate-100 pt-4 space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Product Classification</label>
                        <div className="flex flex-col gap-2">
                           {[
                              { name: 'isBestSeller', label: 'Best Seller' },
                              { name: 'isOrganic', label: 'Organic Product' },
                              { name: 'isFarmerCollection', label: 'Farmer Collection' },
                              { name: 'isFeatured', label: 'Featured Product' },
                              { name: 'isNewArrival', label: 'New Arrival' }
                           ].map(flag => (
                              <label key={flag.name} className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-100 bg-slate-50 hover:bg-white cursor-pointer select-none transition-colors">
                                 <input
                                    type="checkbox"
                                    checked={(form as any)[flag.name]}
                                    onChange={e => setForm({ ...form, [flag.name]: e.target.checked })}
                                    className="h-4 w-4 accent-emerald-800 rounded"
                                 />
                                 <span className="text-xs font-bold text-slate-700">{flag.label}</span>
                              </label>
                           ))}
                        </div>
                     </div>
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
