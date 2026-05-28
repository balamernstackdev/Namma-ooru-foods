'use client';
import React, { useState, useMemo } from 'react';
import useSWR from 'swr';
import {
   Search, Plus, Trash2, ChevronUp, ChevronDown,
   Package, Tag, Star, ShoppingBag, Zap, AlertCircle, Info
} from 'lucide-react';
import { API_URL } from '@/lib/api';

const fetcher = (url: string) => fetch(url).then(res => res.json());


interface ComboProductItem {
   relatedProductId: number;
   priority: number;
   type: string; // always 'COMBO'
   name?: string;
   image?: string;
   price?: number;
}

interface ComboProductsSelectorProps {
   comboProducts: ComboProductItem[];
   onChange: (items: ComboProductItem[]) => void;
   isAdmin?: boolean;
   currentProductId?: number;
   comboDiscount?: number;
   onDiscountChange?: (d: number) => void;
}

export default function ComboProductsSelector({
   comboProducts,
   onChange,
   isAdmin = false,
   currentProductId,
   comboDiscount = 10,
   onDiscountChange
}: ComboProductsSelectorProps) {
   const { data: productsData } = useSWR(`${API_URL}/api/products?limit=1000&status=all`, fetcher);
   const { data: categoriesData } = useSWR(`${API_URL}/api/categories?all=true&limit=100`, fetcher);

   const [maxCombo, setMaxCombo] = useState<number>(() => {
      return Math.max(3, comboProducts.length);
   });

   const products = productsData?.products || [];
   const categories = categoriesData?.categories || categoriesData || [];

   const [searchQuery, setSearchQuery] = useState('');
   const [selectedCategory, setSelectedCategory] = useState('');

   const vendors = useMemo(() => {
      const seen = new Set<number>();
      return products
         .filter((p: any) => p.subVendor && !seen.has(p.subVendorId) && seen.add(p.subVendorId))
         .map((p: any) => ({ id: p.subVendorId, name: p.subVendor.name }));
   }, [products]);

   const [selectedVendor, setSelectedVendor] = useState('');

   const filteredCandidates = useMemo(() => {
      return products.filter((p: any) => {
         if (currentProductId && p.id === currentProductId) return false;
         if (comboProducts.some(cp => cp.relatedProductId === p.id)) return false;
         if (searchQuery && !p.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
         if (selectedCategory && p.categoryId !== parseInt(selectedCategory)) return false;
         if (selectedVendor && p.subVendorId !== parseInt(selectedVendor)) return false;
         return p.status === 'APPROVED';
      }).slice(0, 12);
   }, [products, searchQuery, selectedCategory, selectedVendor, comboProducts, currentProductId]);

   const selectedWithDetails = useMemo(() => {
      return [...comboProducts]
         .sort((a, b) => a.priority - b.priority)
         .map(cp => {
            const details = products.find((p: any) => p.id === cp.relatedProductId);
            return {
               ...cp,
               name: details?.name || cp.name || 'Unknown Product',
               image: details?.image || cp.image || '',
               price: details?.price || cp.price || 0,
               avgRating: details?.avgRating || details?.averageRating || 0,
               subVendorName: details?.subVendor?.name || 'Store',
               categoryName: details?.category?.name || '',
            };
         });
   }, [comboProducts, products]);

   const handleAdd = (product: any) => {
      if (comboProducts.length >= maxCombo) return;
      onChange([...comboProducts, {
         relatedProductId: product.id,
         priority: comboProducts.length,
         type: 'COMBO',
         name: product.name,
         image: product.image,
         price: product.price
      }]);
   };

   const handleRemove = (id: number) => {
      const filtered = comboProducts.filter(cp => cp.relatedProductId !== id);
      onChange(filtered.map((cp, idx) => ({ ...cp, priority: idx })));
   };

   const moveItem = (index: number, dir: 'up' | 'down') => {
      const items = [...selectedWithDetails];
      const target = dir === 'up' ? index - 1 : index + 1;
      if (target < 0 || target >= items.length) return;
      [items[index], items[target]] = [items[target], items[index]];
      onChange(items.map((item, idx) => ({
         relatedProductId: item.relatedProductId,
         priority: idx,
         type: 'COMBO'
      })));
   };

   const atLimit = comboProducts.length >= maxCombo;

   return (
      <div className="space-y-5">
         {/* Info + Discount bar */}
         <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
            <div className="flex flex-wrap items-center gap-3">
               <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 rounded-lg border border-amber-100">
                  <ShoppingBag size={11} className="text-amber-600" />
                  <span className="text-[10px] font-black text-amber-700 uppercase tracking-wider">
                     {comboProducts.length} / {maxCombo} Combo Items
                  </span>
               </div>

               {/* Dynamic Combo Limit Input */}
               <div className="flex items-center gap-2 px-3 py-1 bg-white border border-slate-200 rounded-lg shadow-sm">
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-wider">Max Limit:</span>
                  <input
                     type="number"
                     min="1"
                     max="20"
                     className="w-12 h-6 px-1.5 text-center text-xs font-black text-slate-700 bg-slate-50 border border-slate-200 rounded-md outline-none focus:border-amber-500 focus:bg-white transition-all"
                     value={maxCombo}
                     onChange={(e) => {
                        const val = parseInt(e.target.value) || 1;
                        setMaxCombo(Math.max(1, Math.min(20, val)));
                     }}
                  />
                  <span className="text-[9px] font-bold text-slate-400 uppercase">Items</span>
               </div>

               {/* Bundle Discount Control */}
               {onDiscountChange && (
                  <div className="flex items-center gap-2">
                     <span className="text-[9px] font-black text-slate-500 uppercase tracking-wider">Bundle Discount:</span>
                     <div className="flex items-center gap-1">
                        {[5, 10, 15, 20].map(d => (
                           <button
                              key={d}
                              type="button"
                              onClick={() => onDiscountChange(d)}
                              className={`h-6 px-2 rounded-md text-[9px] font-black uppercase border transition-all ${comboDiscount === d
                                 ? 'bg-emerald-600 border-emerald-600 text-white'
                                 : 'bg-white border-slate-200 text-slate-500 hover:border-emerald-400'
                                 }`}
                           >
                              {d}%
                           </button>
                        ))}
                     </div>
                  </div>
               )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
               {comboProducts.length === 0 && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 rounded-lg border border-blue-100">
                     <Zap size={11} className="text-blue-500" />
                     <span className="text-[9px] font-black text-blue-600 uppercase tracking-wider">Auto-fallback Active</span>
                  </div>
               )}
               {atLimit && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 rounded-lg border border-rose-200">
                     <AlertCircle size={11} className="text-rose-500" />
                     <span className="text-[9px] font-black text-rose-600 uppercase tracking-wider">Reached Limit</span>
                  </div>
               )}
            </div>
         </div>

         {/* Capacity bar */}
         <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div
               className={`h-full rounded-full transition-all duration-500 ${atLimit ? 'bg-rose-500' : 'bg-amber-500'}`}
               style={{ width: `${(comboProducts.length / maxCombo) * 100}%` }}
            />
         </div>


         {/* Main grid */}
         <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

            {/* ── Left: Search Catalog ─────────────────────────── */}
            <div className="lg:col-span-6 bg-slate-50/50 p-4 rounded-2xl border border-slate-100 space-y-3">
               <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Product Catalog</span>
                  <span className="text-[9px] text-slate-400 font-bold">{filteredCandidates.length} Results</span>
               </div>

               {/* Search */}
               <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={13} />
                  <input
                     type="text"
                     placeholder="Search products..."
                     className="h-9 pl-9 pr-4 w-full rounded-xl bg-white border border-slate-200 outline-none text-xs font-bold text-slate-800 focus:border-amber-400 focus:ring-2 ring-amber-400/10 transition-all placeholder:text-slate-300"
                     value={searchQuery}
                     onChange={e => setSearchQuery(e.target.value)}
                  />
               </div>

               {/* Filters */}
               <div className="grid grid-cols-2 gap-2">
                  <div className="relative">
                     <Tag size={10} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" />
                     <select
                        className="h-8 pl-7 pr-2 w-full rounded-lg bg-white border border-slate-200 outline-none text-[9px] font-black uppercase text-slate-600 appearance-none cursor-pointer focus:border-amber-400 transition-all"
                        value={selectedCategory}
                        onChange={e => setSelectedCategory(e.target.value)}
                     >
                        <option value="">All Categories</option>
                        {categories.map((c: any) => (
                           <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                     </select>
                  </div>
                  {isAdmin && (
                     <div className="relative">
                        <Package size={10} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" />
                        <select
                           className="h-8 pl-7 pr-2 w-full rounded-lg bg-white border border-slate-200 outline-none text-[9px] font-black uppercase text-slate-600 appearance-none cursor-pointer focus:border-amber-400 transition-all"
                           value={selectedVendor}
                           onChange={e => setSelectedVendor(e.target.value)}
                        >
                           <option value="">All Vendors</option>
                           {vendors.map((v: any) => (
                              <option key={v.id} value={v.id}>{v.name}</option>
                           ))}
                        </select>
                     </div>
                  )}
               </div>

               {/* Product list */}
               <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
                  {filteredCandidates.map((prod: any) => (
                     <div
                        key={prod.id}
                        className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-slate-100 shadow-sm hover:border-amber-300/40 transition-all"
                     >
                        <div className="flex items-center gap-2.5 min-w-0">
                           <div className="h-8 w-8 rounded-lg overflow-hidden bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
                              <img src={prod.image || '/placeholder.png'} className="h-full w-full object-contain" alt="" onError={(e) => { (e.target as any).src = '/placeholder.png'; }} />
                           </div>
                           <div className="min-w-0">
                              <span className="text-[10px] font-black text-slate-800 truncate uppercase tracking-tight block">{prod.name}</span>
                              <div className="flex items-center gap-2">
                                 <span className="text-[8px] text-slate-400 font-bold">₹{Number(prod.price)}</span>
                                 {(prod.avgRating || prod.averageRating) >= 4 && (
                                    <span className="flex items-center gap-0.5 text-[7px] font-black text-amber-500">
                                       <Star size={7} className="fill-amber-400" />{prod.avgRating || prod.averageRating}
                                    </span>
                                 )}
                              </div>
                           </div>
                        </div>
                        <button
                           type="button"
                           disabled={atLimit}
                           onClick={() => handleAdd(prod)}
                           className="h-7 px-2.5 rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-500 hover:text-white text-[9px] font-black uppercase tracking-wider flex items-center gap-1 transition-all disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                        >
                           <Plus size={10} /> Add
                        </button>
                     </div>
                  ))}
                  {filteredCandidates.length === 0 && (
                     <div className="p-8 text-center text-[10px] font-black text-slate-400 uppercase tracking-wider bg-white rounded-xl border border-dashed border-slate-200">
                        {products.length === 0 ? 'Loading products...' : 'No results found'}
                     </div>
                  )}
               </div>
            </div>

            {/* ── Right: Selected Combos ──────────────────────── */}
            <div className="lg:col-span-6 bg-white p-4 rounded-2xl border border-slate-200 space-y-3">
               <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                     Combo Items ({comboProducts.length})
                  </span>
                  {comboProducts.length > 0 && (
                     <span className="text-[8px] font-black uppercase tracking-widest text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                        Drag to reorder
                     </span>
                  )}
               </div>

               <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                  {selectedWithDetails.map((item, idx) => (
                     <div key={item.relatedProductId} className="flex items-center gap-2.5 p-3 bg-amber-50/40 rounded-xl border border-amber-100 hover:border-amber-200 transition-all">
                        {/* Sort controls */}
                        <div className="flex flex-col gap-0.5 shrink-0">
                           <button
                              type="button"
                              disabled={idx === 0}
                              onClick={() => moveItem(idx, 'up')}
                              className="p-0.5 hover:bg-amber-100 rounded text-slate-400 hover:text-amber-700 disabled:opacity-20 transition-colors"
                           >
                              <ChevronUp size={11} />
                           </button>
                           <div className="text-[7px] font-black text-slate-400 text-center">{idx + 1}</div>
                           <button
                              type="button"
                              disabled={idx === selectedWithDetails.length - 1}
                              onClick={() => moveItem(idx, 'down')}
                              className="p-0.5 hover:bg-amber-100 rounded text-slate-400 hover:text-amber-700 disabled:opacity-20 transition-colors"
                           >
                              <ChevronDown size={11} />
                           </button>
                        </div>

                        {/* Image */}
                        <div className="h-10 w-10 rounded-lg overflow-hidden bg-white border border-slate-150 flex items-center justify-center p-0.5 shrink-0">
                           <img src={item.image || '/placeholder.png'} className="h-full w-full object-contain" alt="" onError={(e) => { (e.target as any).src = '/placeholder.png'; }} />
                        </div>

                        {/* Details */}
                        <div className="min-w-0 flex-1">
                           <span className="text-[10px] font-black text-slate-800 truncate uppercase tracking-tight block">{item.name}</span>
                           <div className="flex items-center gap-2">
                              <span className="text-[8px] text-amber-700 font-bold">₹{Number(item.price)}</span>
                              <span className="text-[7px] text-slate-400 font-bold">{item.subVendorName}</span>
                           </div>
                        </div>

                        {/* Delete */}
                        <button
                           type="button"
                           onClick={() => handleRemove(item.relatedProductId)}
                           className="h-7 w-7 rounded-lg hover:bg-rose-50 text-slate-300 hover:text-rose-500 flex items-center justify-center transition-colors shrink-0"
                        >
                           <Trash2 size={12} />
                        </button>
                     </div>
                  ))}

                  {comboProducts.length === 0 && (
                     <div className="p-8 flex flex-col items-center gap-3 bg-amber-50/30 rounded-2xl border border-dashed border-amber-200">
                        <div className="h-10 w-10 rounded-xl bg-amber-100 flex items-center justify-center">
                           <ShoppingBag size={18} className="text-amber-400" />
                        </div>
                        <div className="text-center">
                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">No Combo Items</p>
                           <p className="text-[9px] text-slate-400 mt-1">Smart fallback will auto-suggest products</p>
                        </div>
                     </div>
                  )}
               </div>
            </div>
         </div>
      </div>
   );
}
