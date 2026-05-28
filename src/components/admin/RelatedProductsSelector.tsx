'use client'
import React, { useState, useMemo } from 'react';
import useSWR from 'swr';
import {
   Search, Plus, Trash2, ChevronUp, ChevronDown, Check, Sparkles,
   Filter, Package, AlertCircle, Zap, Star, Tag, ShoppingBag
} from 'lucide-react';
import { API_URL } from '@/lib/api';

const fetcher = (url: string) => fetch(url).then(res => res.json());


interface RelatedProductItem {
   relatedProductId: number;
   priority: number;
   type: string;
   name?: string;
   image?: string;
   price?: number;
}

interface RelatedProductsSelectorProps {
   relatedProducts: RelatedProductItem[];
   onChange: (items: RelatedProductItem[]) => void;
   isAdmin?: boolean;
   currentProductId?: number;
}

const TYPE_LABELS: Record<string, { label: string; color: string }> = {
   RECOMMENDED: { label: 'Recommended', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
   COMBO: { label: 'Combo Deal', color: 'text-blue-700 bg-blue-50 border-blue-200' },
   CROSS_SELL: { label: 'Cross-Sell', color: 'text-purple-700 bg-purple-50 border-purple-200' },
};

export default function RelatedProductsSelector({
   relatedProducts,
   onChange,
   isAdmin = false,
   currentProductId
}: RelatedProductsSelectorProps) {
   const { data: productsData } = useSWR(`${API_URL}/api/products?limit=1000&status=all`, fetcher);
   const { data: categoriesData } = useSWR(`${API_URL}/api/categories?all=true&limit=100`, fetcher);

   const [maxRelated, setMaxRelated] = useState<number>(() => {
      return Math.max(8, relatedProducts.length);
   });

   const products = productsData?.products || [];
   const categories = categoriesData?.categories || categoriesData || [];

   const [searchQuery, setSearchQuery] = useState('');
   const [selectedCategory, setSelectedCategory] = useState('');
   const [selectedVendor, setSelectedVendor] = useState('');
   const [onlyBestsellers, setOnlyBestsellers] = useState(false);

   const vendors = useMemo(() => {
      const vendorSet = new Set<string>();
      const vendorMap: { id: number; name: string }[] = [];
      products.forEach((p: any) => {
         if (p.subVendor && p.subVendor.name && !vendorSet.has(p.subVendor.name)) {
            vendorSet.add(p.subVendor.name);
            vendorMap.push({ id: p.subVendorId, name: p.subVendor.name });
         }
      });
      return vendorMap;
   }, [products]);

   const filteredCandidates = useMemo(() => {
      return products.filter((p: any) => {
         if (currentProductId && p.id === currentProductId) return false;
         if (relatedProducts.some(rp => rp.relatedProductId === p.id)) return false;
         if (searchQuery && !p.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
         if (selectedCategory && p.categoryId !== parseInt(selectedCategory)) return false;
         if (selectedVendor && p.subVendorId !== parseInt(selectedVendor)) return false;
         if (onlyBestsellers && !((p.avgRating && p.avgRating >= 4.0) || p.averageRating >= 4.0)) return false;
         return p.status === 'APPROVED';
      }).slice(0, 10);
   }, [products, searchQuery, selectedCategory, selectedVendor, onlyBestsellers, relatedProducts, currentProductId]);

   const selectedItemsWithDetails = useMemo(() => {
      return relatedProducts.map(rp => {
         const details = products.find((p: any) => p.id === rp.relatedProductId);
         return {
            ...rp,
            name: details?.name || rp.name || 'Unknown Product',
            image: details?.image || rp.image || '',
            price: details?.price || rp.price || 0,
            avgRating: details?.avgRating || details?.averageRating || 0,
            subVendorName: details?.subVendor?.name || 'Storefront',
            categoryName: details?.category?.name || '',
         };
      }).sort((a, b) => a.priority - b.priority);
   }, [relatedProducts, products]);

   const handleAddProduct = (product: any) => {
      if (relatedProducts.length >= maxRelated) return;
      const newItems = [
         ...relatedProducts,
         {
            relatedProductId: product.id,
            priority: relatedProducts.length,
            type: 'RECOMMENDED',
            name: product.name,
            image: product.image,
            price: product.price
         }
      ];
      onChange(newItems);
   };

   const handleRemoveProduct = (productId: number) => {
      const filtered = relatedProducts.filter(rp => rp.relatedProductId !== productId);
      const updated = filtered.map((rp, idx) => ({ ...rp, priority: idx }));
      onChange(updated);
   };

   const handleTypeChange = (productId: number, type: string) => {
      const updated = relatedProducts.map(rp =>
         rp.relatedProductId === productId ? { ...rp, type } : rp
      );
      onChange(updated);
   };

   const moveItem = (index: number, direction: 'up' | 'down') => {
      const items = [...selectedItemsWithDetails];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= items.length) return;

      const temp = items[index];
      items[index] = items[targetIndex];
      items[targetIndex] = temp;

      const updated = items.map((item, idx) => ({
         relatedProductId: item.relatedProductId,
         priority: idx,
         type: item.type
      }));
      onChange(updated);
   };

   const atLimit = relatedProducts.length >= maxRelated;

   return (
      <div className="space-y-6">
         {/* Stats Bar */}
         <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-lg border border-slate-200">
               <ShoppingBag size={12} className="text-emerald-600" />
               <span className="text-[10px] font-black text-slate-700 uppercase tracking-wider">
                  {relatedProducts.length} / {maxRelated} Selected
               </span>
            </div>

            {/* Dynamic Limit Customizer */}
            <div className="flex items-center gap-2 px-3 py-1 bg-white border border-slate-200 rounded-lg shadow-sm">
               <span className="text-[9px] font-black text-slate-500 uppercase tracking-wider">Max Limit:</span>
               <input
                  type="number"
                  min="1"
                  max="50"
                  className="w-12 h-6 px-1.5 text-center text-xs font-black text-slate-700 bg-slate-50 border border-slate-200 rounded-md outline-none focus:border-emerald-500 focus:bg-white transition-all"
                  value={maxRelated}
                  onChange={(e) => {
                     const val = parseInt(e.target.value) || 1;
                     setMaxRelated(Math.max(1, Math.min(50, val)));
                  }}
               />
               <span className="text-[9px] font-bold text-slate-400 uppercase">Items</span>
            </div>

            {atLimit && (
               <div className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 rounded-lg border border-rose-200">
                  <AlertCircle size={11} className="text-rose-600" />
                  <span className="text-[9px] font-black text-rose-700 uppercase tracking-wider">Reached Limit</span>
               </div>
            )}
         </div>

         {/* Capacity bar */}
         <div className="space-y-1.5">
            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
               <div
                  className={`h-full rounded-full transition-all duration-500 ${atLimit ? 'bg-rose-500' : 'bg-emerald-500'}`}
                  style={{ width: `${(relatedProducts.length / maxRelated) * 100}%` }}
               />
            </div>
         </div>

         {/* Main Grid */}
         <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

            {/* ── Left: Search & Filter ─────────────────────── */}
            <div className="lg:col-span-6 bg-slate-50/50 p-5 rounded-2xl border border-slate-100 space-y-4">
               <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                     <Filter size={11} className="text-slate-400" /> Product Catalog
                  </span>
                  <span className="text-[9px] text-slate-400 font-bold">{filteredCandidates.length} Results</span>
               </div>

               {/* Search */}
               <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300" size={14} />
                  <input
                     type="text"
                     placeholder="Search by product name..."
                     className="h-10 pl-10 pr-4 w-full rounded-xl bg-white border border-slate-200 outline-none text-xs font-bold text-slate-800 focus:border-emerald-400 focus:ring-2 ring-emerald-400/10 transition-all placeholder:text-slate-300"
                     value={searchQuery}
                     onChange={e => setSearchQuery(e.target.value)}
                  />
               </div>

               {/* Filters */}
               <div className="grid grid-cols-2 gap-2.5">
                  <div className="relative">
                     <Tag size={11} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" />
                     <select
                        className="h-9 pl-7 pr-3 w-full rounded-xl bg-white border border-slate-200 outline-none text-[10px] font-black uppercase text-slate-600 appearance-none cursor-pointer focus:border-emerald-400 transition-all"
                        value={selectedCategory}
                        onChange={e => setSelectedCategory(e.target.value)}
                     >
                        <option value="">All Categories</option>
                        {categories.map((c: any) => (
                           <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                     </select>
                  </div>

                  {isAdmin ? (
                     <div className="relative">
                        <Package size={11} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" />
                        <select
                           className="h-9 pl-7 pr-3 w-full rounded-xl bg-white border border-slate-200 outline-none text-[10px] font-black uppercase text-slate-600 appearance-none cursor-pointer focus:border-emerald-400 transition-all"
                           value={selectedVendor}
                           onChange={e => setSelectedVendor(e.target.value)}
                        >
                           <option value="">All Vendors</option>
                           {vendors.map(v => (
                              <option key={v.id} value={v.id}>{v.name}</option>
                           ))}
                        </select>
                     </div>
                  ) : (
                     <div className="flex items-center px-3 bg-white border border-slate-200 rounded-xl">
                        <span className="text-[9px] font-black text-slate-400 uppercase">My Products Only</span>
                     </div>
                  )}
               </div>

               {/* Bestseller toggle */}
               <label className="flex items-center gap-2.5 cursor-pointer py-0.5 select-none group">
                  <div
                     onClick={() => setOnlyBestsellers(!onlyBestsellers)}
                     className={`w-8 h-4 rounded-full transition-all relative cursor-pointer ${onlyBestsellers ? 'bg-amber-400' : 'bg-slate-200'}`}
                  >
                     <div className={`absolute top-0.5 left-0.5 w-3 h-3 rounded-full bg-white shadow-sm transition-transform ${onlyBestsellers ? 'translate-x-4' : ''}`} />
                  </div>
                  <div className="flex items-center gap-1.5">
                     <Star size={10} className={`transition-colors ${onlyBestsellers ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
                     <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Bestsellers Only (4.0+)</span>
                  </div>
               </label>

               {/* Results */}
               <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1 space-y-1">
                  {filteredCandidates.map((prod: any) => (
                     <div
                        key={prod.id}
                        className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-slate-100 shadow-sm hover:border-emerald-400/30 hover:shadow transition-all group"
                     >
                        <div className="flex items-center gap-2.5 min-w-0">
                           <div className="h-9 w-9 rounded-lg overflow-hidden bg-slate-50 border border-slate-100 flex items-center justify-center p-0.5 shrink-0">
                              <img src={prod.image || '/placeholder.png'} className="h-full w-full object-contain" alt="" onError={(e) => { (e.target as any).src = '/placeholder.png'; }} />
                           </div>
                           <div className="min-w-0">
                              <span className="text-[11px] font-black text-slate-800 truncate uppercase tracking-tight block">{prod.name}</span>
                              <div className="flex items-center gap-2">
                                 <span className="text-[9px] text-slate-400 font-bold">{prod.subVendor?.name || 'Organic Farm'}</span>
                                 {(prod.avgRating || prod.averageRating) >= 4 && (
                                    <span className="flex items-center gap-0.5 text-[8px] font-black text-amber-600">
                                       <Star size={7} className="fill-amber-500" />{prod.avgRating || prod.averageRating}
                                    </span>
                                 )}
                              </div>
                           </div>
                        </div>
                        <button
                           type="button"
                           disabled={atLimit}
                           onClick={() => handleAddProduct(prod)}
                           className="h-7 px-2.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white text-[9px] font-black uppercase tracking-wider flex items-center gap-1 transition-all disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                        >
                           <Plus size={10} /> Add
                        </button>
                     </div>
                  ))}
                  {filteredCandidates.length === 0 && (
                     <div className="p-8 text-center text-[10px] font-black text-slate-400 uppercase tracking-wider bg-white rounded-xl border border-dashed border-slate-200">
                        {products.length === 0 ? 'Loading catalog...' : 'No matching products'}
                     </div>
                  )}
               </div>
            </div>

            {/* ── Right: Selected Products ───────────────────── */}
            <div className="lg:col-span-6 bg-white p-5 rounded-2xl border border-slate-200 space-y-4">
               <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                     <Sparkles size={11} className="text-purple-500" />
                     Manual Picks ({relatedProducts.length})
                  </span>
                  {relatedProducts.length > 0 && (
                     <span className="text-[8px] font-black uppercase tracking-widest text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
                        Priority Order Active
                     </span>
                  )}
               </div>

               <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                  {selectedItemsWithDetails.map((item, idx) => {
                     const typeStyle = TYPE_LABELS[item.type] || TYPE_LABELS['RECOMMENDED'];
                     return (
                        <div
                           key={item.relatedProductId}
                           className="flex items-center gap-3 p-3 bg-slate-50/60 rounded-xl border border-slate-100 hover:border-slate-200 transition-all"
                        >
                           {/* Priority Reorder */}
                           <div className="flex flex-col gap-0.5 shrink-0">
                              <button
                                 type="button"
                                 disabled={idx === 0}
                                 onClick={() => moveItem(idx, 'up')}
                                 className="p-0.5 hover:bg-slate-200 rounded text-slate-400 hover:text-slate-700 disabled:opacity-20 transition-colors"
                              >
                                 <ChevronUp size={12} />
                              </button>
                              <div className="text-[8px] font-black text-slate-400 text-center">{idx + 1}</div>
                              <button
                                 type="button"
                                 disabled={idx === selectedItemsWithDetails.length - 1}
                                 onClick={() => moveItem(idx, 'down')}
                                 className="p-0.5 hover:bg-slate-200 rounded text-slate-400 hover:text-slate-700 disabled:opacity-20 transition-colors"
                              >
                                 <ChevronDown size={12} />
                              </button>
                           </div>

                           {/* Image */}
                           <div className="h-10 w-10 rounded-lg overflow-hidden bg-white border border-slate-150 flex items-center justify-center p-0.5 shrink-0">
                              <img src={item.image || '/placeholder.png'} className="h-full w-full object-contain" alt="" onError={(e) => { (e.target as any).src = '/placeholder.png'; }} />
                           </div>

                           {/* Info */}
                           <div className="min-w-0 flex-1">
                              <span className="text-[10px] font-black text-slate-800 truncate uppercase tracking-tight block">{item.name}</span>
                              <span className="text-[8px] text-slate-400 font-bold">{item.subVendorName}</span>
                           </div>

                           {/* Type + Delete */}
                           <div className="flex items-center gap-2 shrink-0">
                              <select
                                 className={`h-7 px-2 rounded-lg text-[8px] font-black uppercase cursor-pointer border outline-none appearance-none ${typeStyle.color}`}
                                 value={item.type}
                                 onChange={e => handleTypeChange(item.relatedProductId, e.target.value)}
                              >
                                 <option value="RECOMMENDED">Recommended</option>
                                 <option value="COMBO">Combo Deal</option>
                                 <option value="CROSS_SELL">Cross-Sell</option>
                              </select>

                              <button
                                 type="button"
                                 onClick={() => handleRemoveProduct(item.relatedProductId)}
                                 className="h-7 w-7 rounded-lg hover:bg-rose-50 text-slate-300 hover:text-rose-500 flex items-center justify-center transition-colors"
                              >
                                 <Trash2 size={12} />
                              </button>
                           </div>
                        </div>
                     );
                  })}

                  {relatedProducts.length === 0 && (
                     <div className="p-10 flex flex-col items-center text-center bg-slate-50/50 rounded-2xl border border-dashed border-slate-200 gap-3">
                        <div className="h-12 w-12 rounded-2xl bg-slate-100 flex items-center justify-center">
                           <Sparkles size={20} className="text-slate-300" />
                        </div>
                        <div>
                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">No Manual Picks</p>
                           <p className="text-[9px] text-slate-400 font-medium mt-1">
                              Smart fallback will auto-recommend products
                           </p>
                        </div>
                     </div>
                  )}
               </div>

               {/* Priority Hint */}
               {relatedProducts.length > 1 && (
                  <p className="text-[9px] text-slate-400 font-medium text-center border-t border-slate-100 pt-3">
                     Use ↑↓ arrows to set display priority order
                  </p>
               )}
            </div>
         </div>
      </div>
   );
}
