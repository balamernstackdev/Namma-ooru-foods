'use client';
import React, { useState, useMemo } from 'react';
import useSWR from 'swr';
import {
   Search, Plus, Trash2, ChevronUp, ChevronDown,
   Package, Tag, Star, ShoppingBag, Zap, AlertCircle
} from 'lucide-react';
import { API_URL } from '@/lib/api';

const fetcher = (url: string) => fetch(url).then(res => res.json());

interface ComboProductItem {
   comboProductId: number;
   sortOrder: number;
   discountType: 'percentage' | 'fixed';
   discountValue: number;
   finalPrice: number;
   name?: string;
   image?: string;
   price?: number;
}

interface ComboProductsSelectorProps {
   comboProducts: ComboProductItem[];
   onChange: (items: ComboProductItem[]) => void;
   isAdmin?: boolean;
   currentProductId?: number;
   isFallbackEnabled?: boolean;
   onFallbackToggle?: (enabled: boolean) => void;
}

export default function ComboProductsSelector({
   comboProducts,
   onChange,
   isAdmin = false,
   currentProductId,
   isFallbackEnabled = true,
   onFallbackToggle,
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
         if (comboProducts.some(cp => cp.comboProductId === p.id)) return false;
         if (searchQuery && !p.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
         if (selectedCategory && p.categoryId !== parseInt(selectedCategory)) return false;
         if (selectedVendor && p.subVendorId !== parseInt(selectedVendor)) return false;
         return p.status === 'APPROVED';
      }).slice(0, 12);
   }, [products, searchQuery, selectedCategory, selectedVendor, comboProducts, currentProductId]);

   const selectedWithDetails = useMemo(() => {
      return [...comboProducts]
         .sort((a, b) => a.sortOrder - b.sortOrder)
         .map(cp => {
            const details = products.find((p: any) => p.id === cp.comboProductId);
            const price = details?.price || cp.price || 0;
            return {
               ...cp,
               name: details?.name || cp.name || 'Unknown Product',
               image: details?.image || cp.image || '',
               price: price,
               avgRating: details?.avgRating || details?.averageRating || 0,
               subVendorName: details?.subVendor?.name || 'Store',
               categoryName: details?.category?.name || '',
            };
         });
   }, [comboProducts, products]);

   const handleAdd = (product: any) => {
      if (comboProducts.length >= maxCombo) return;
      const initialPrice = product.price || 0;
      onChange([...comboProducts, {
         comboProductId: product.id,
         sortOrder: comboProducts.length,
         discountType: 'percentage',
         discountValue: 0,
         finalPrice: initialPrice,
         name: product.name,
         image: product.image,
         price: initialPrice
      }]);
   };

   const handleRemove = (id: number) => {
      const filtered = comboProducts.filter(cp => cp.comboProductId !== id);
      onChange(filtered.map((cp, idx) => ({ ...cp, sortOrder: idx })));
   };

   const moveItem = (index: number, dir: 'up' | 'down') => {
      const items = [...selectedWithDetails];
      const target = dir === 'up' ? index - 1 : index + 1;
      if (target < 0 || target >= items.length) return;
      [items[index], items[target]] = [items[target], items[index]];
      onChange(items.map((item, idx) => ({
         comboProductId: item.comboProductId,
         sortOrder: idx,
         discountType: item.discountType,
         discountValue: item.discountValue,
         finalPrice: item.finalPrice
      })));
   };

   const handleUpdateItem = (id: number, field: string, value: any) => {
      onChange(comboProducts.map(cp => {
         if (cp.comboProductId === id) {
            const updated = { ...cp, [field]: value };
            const originalPrice = cp.price || 0;
            let numVal = Number(updated.discountValue);
            if (isNaN(numVal)) numVal = 0;
            
            let finalPrice = originalPrice;
            
            if (updated.discountType === 'percentage') {
               const clampedVal = Math.min(90, Math.max(0, numVal));
               finalPrice = originalPrice - (originalPrice * clampedVal / 100);
            } else {
               const clampedVal = Math.min(originalPrice, Math.max(0, numVal));
               finalPrice = originalPrice - clampedVal;
            }
            finalPrice = Math.max(0, finalPrice);
            updated.finalPrice = finalPrice;
            
            return updated;
         }
         return cp;
      }));
   };

   const atLimit = comboProducts.length >= maxCombo;

   const { originalTotal, bundleTotal } = useMemo(() => {
      return selectedWithDetails.reduce((acc, curr) => {
         acc.originalTotal += Number(curr.price || 0);
         acc.bundleTotal += Number(curr.finalPrice ?? curr.price ?? 0);
         return acc;
      }, { originalTotal: 0, bundleTotal: 0 });
   }, [selectedWithDetails]);
   
   const savings = originalTotal - bundleTotal;

   return (
      <div className="space-y-5">
         {/* Info + Capacity bar */}
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
            </div>

            <div className="flex flex-wrap items-center gap-2">
               {onFallbackToggle && (
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-lg border border-slate-100">
                     <span className="text-[9px] font-black text-slate-500 uppercase tracking-wider">Auto-Fallback</span>
                     <button
                        type="button"
                        onClick={() => onFallbackToggle(!isFallbackEnabled)}
                        className={`relative inline-flex h-4 w-7 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${isFallbackEnabled ? 'bg-emerald-500' : 'bg-slate-300'}`}
                     >
                        <span className={`pointer-events-none inline-block h-3 w-3 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${isFallbackEnabled ? 'translate-x-3' : 'translate-x-0'}`} />
                     </button>
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
         <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">

            {/* ── Left: Search Catalog ─────────────────────────── */}
            <div className="xl:col-span-5 bg-slate-50/50 p-4 rounded-2xl border border-slate-100 space-y-3 flex flex-col max-h-[600px]">
               <div className="flex items-center justify-between shrink-0">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Product Catalog</span>
                  <span className="text-[9px] text-slate-400 font-bold">{filteredCandidates.length} Results</span>
               </div>

               {/* Search */}
               <div className="relative shrink-0">
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
               <div className="grid grid-cols-2 gap-2 shrink-0">
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
               <div className="space-y-1.5 overflow-y-auto pr-1 flex-1">
                  {filteredCandidates.map((prod: any) => (
                     <div
                        key={prod.id}
                        className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-slate-100 shadow-sm hover:border-amber-300/40 transition-all"
                     >
                        <div className="flex items-center gap-2.5 min-w-0">
                           <div className="h-8 w-8 rounded-lg overflow-hidden bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
                              {prod.image ? (
                                 <img src={prod.image} className="h-full w-full object-contain" alt="" />
                              ) : (
                                 <span className="text-[6px] font-black text-slate-400 uppercase text-center leading-none">No Image</span>
                              )}
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
            <div className="xl:col-span-7 bg-white p-4 rounded-2xl border border-slate-200 space-y-3 flex flex-col max-h-[600px]">
               <div className="flex items-center justify-between shrink-0">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                     Combo Items ({comboProducts.length})
                  </span>
                  {comboProducts.length > 0 && (
                     <span className="text-[8px] font-black uppercase tracking-widest text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                        Drag to reorder
                     </span>
                  )}
               </div>

               <div className="space-y-3 overflow-y-auto pr-1 flex-1">
                  {selectedWithDetails.map((item, idx) => (
                     <div key={item.comboProductId} className="flex gap-4 p-4 bg-white rounded-2xl border border-slate-200 hover:border-amber-300/60 shadow-sm hover:shadow-md transition-all">
                        {/* Sort controls */}
                        <div className="flex flex-col gap-0.5 shrink-0 justify-center">
                           <button
                              type="button"
                              disabled={idx === 0}
                              onClick={() => moveItem(idx, 'up')}
                              className="p-1 hover:bg-amber-50 rounded-lg text-slate-300 hover:text-amber-600 disabled:opacity-20 transition-colors"
                           >
                              <ChevronUp size={14} />
                           </button>
                           <div className="text-[9px] font-black text-slate-400 text-center">{idx + 1}</div>
                           <button
                              type="button"
                              disabled={idx === selectedWithDetails.length - 1}
                              onClick={() => moveItem(idx, 'down')}
                              className="p-1 hover:bg-amber-50 rounded-lg text-slate-300 hover:text-amber-600 disabled:opacity-20 transition-colors"
                           >
                              <ChevronDown size={14} />
                           </button>
                        </div>

                        {/* Image */}
                        <div className="h-20 w-20 rounded-xl overflow-hidden bg-slate-50 border border-slate-100 flex items-center justify-center p-1 shrink-0">
                           {item.image ? (
                              <img src={item.image} className="h-full w-full object-contain mix-blend-multiply" alt="" />
                           ) : (
                              <span className="text-[8px] font-black text-slate-400 uppercase text-center leading-none">No Image</span>
                           )}
                        </div>

                        {/* Details */}
                        <div className="flex-1 flex flex-col justify-between min-w-0">
                           <div>
                              <div className="flex justify-between items-start gap-2">
                                 <span className="text-xs font-black text-slate-800 uppercase tracking-tight block truncate leading-tight">{item.name}</span>
                                 <button
                                    type="button"
                                    onClick={() => handleRemove(item.comboProductId)}
                                    className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-300 hover:text-rose-500 transition-colors shrink-0 -mt-1 -mr-1"
                                 >
                                    <Trash2 size={14} />
                                 </button>
                              </div>
                              <span className="text-[10px] text-slate-400 font-bold mt-1 block">Original Price: ₹{Number(item.price || 0).toFixed(2)}</span>
                           </div>

                           <div className="flex items-end gap-3 mt-3">
                              <div className="flex-1 space-y-1.5">
                                 <label className="text-[8px] font-black uppercase tracking-widest text-slate-400">Discount Type</label>
                                 <select 
                                    className="w-full h-8 px-2 rounded-lg bg-slate-50 border border-slate-200 outline-none text-[10px] font-bold text-slate-700"
                                    value={item.discountType}
                                    onChange={e => handleUpdateItem(item.comboProductId, 'discountType', e.target.value)}
                                 >
                                    <option value="percentage">Percentage (%)</option>
                                    <option value="fixed">Fixed Amount (₹)</option>
                                 </select>
                              </div>
                              <div className="flex-1 space-y-1.5">
                                 <label className="text-[8px] font-black uppercase tracking-widest text-slate-400">Value</label>
                                 <input 
                                    type="text"
                                    inputMode="decimal"
                                    className="w-full h-8 px-3 rounded-lg bg-slate-50 border border-slate-200 outline-none text-[10px] font-bold text-slate-700 focus:border-amber-400 focus:bg-white transition-colors"
                                    value={item.discountValue}
                                    onChange={e => handleUpdateItem(item.comboProductId, 'discountValue', e.target.value)}
                                 />
                              </div>
                              <div className="flex-1 space-y-1.5 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100">
                                 <span className="text-[8px] font-black uppercase tracking-widest text-emerald-600 block">Bundle Price</span>
                                 <span className="text-sm font-black text-emerald-700">₹{Number(item.finalPrice ?? item.price ?? 0).toFixed(2)}</span>
                              </div>
                           </div>
                           <div className="mt-2 text-[10px] text-slate-500 font-bold bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-lg w-max">
                              Preview: ₹{Number(item.price || 0).toFixed(2)} → <span className="text-emerald-600">₹{Number(item.finalPrice ?? item.price ?? 0).toFixed(2)}</span>
                           </div>
                        </div>
                     </div>
                  ))}

                  {comboProducts.length === 0 && (
                     <div className="p-12 flex flex-col items-center gap-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                        <div className="h-12 w-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center shadow-sm">
                           <ShoppingBag size={20} className="text-slate-300" />
                        </div>
                        <div className="text-center">
                           <h4 className="text-[11px] font-black text-slate-700 uppercase tracking-wider mb-1">No Combo Items Selected</h4>
                           <p className="text-[10px] text-slate-400 font-medium">Add products from the catalog to create a bundle offer.</p>
                        </div>
                     </div>
                  )}
               </div>

               {/* Combo Summary Section */}
               {comboProducts.length > 0 && (
                  <div className="shrink-0 p-4 bg-slate-50 rounded-xl border border-slate-200 mt-2">
                     <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3">Combo Summary</h4>
                     <div className="flex flex-wrap items-center justify-between gap-4">
                        <div>
                           <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Original Total</span>
                           <span className="text-sm font-black text-slate-700 line-through decoration-slate-300">₹{originalTotal.toFixed(2)}</span>
                        </div>
                        <div>
                           <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Bundle Total</span>
                           <span className="text-lg font-black text-emerald-600 bg-emerald-50 px-2 rounded-md">₹{bundleTotal.toFixed(2)}</span>
                        </div>
                        <div className="text-right">
                           <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Customer Savings</span>
                           <span className="text-sm font-black text-amber-600 bg-amber-50 px-2 rounded-md">₹{savings.toFixed(2)}</span>
                        </div>
                     </div>
                  </div>
               )}

            </div>
         </div>
      </div>
   );
}
