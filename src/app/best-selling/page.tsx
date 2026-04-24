'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { TrendingUp, SlidersHorizontal, Check, ChevronDown, X } from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import HeroCarousel from '@/components/HeroCarousel';
import useSWR from 'swr';
import { API_URL } from '@/lib/api';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function BestSellingPage() {
   const { data: products } = useSWR(`${API_URL}/api/products`, fetcher);
   const { data: categoriesData } = useSWR(`${API_URL}/api/categories`, fetcher);

   const [activeCategory, setActiveCategory] = useState('All');
   const [showFilters, setShowFilters] = useState(false);
   const [currentPage, setCurrentPage] = useState(1);
   const [sortOrder, setSortOrder] = useState<'rating' | 'price_asc' | 'price_desc'>('rating');
   const itemsPerPage = 9;

   // Dynamic category list from API
   const categoryNames: string[] = ['All', ...(categoriesData?.map((c: any) => c.name) || [])];

   // All products — sorted by selected order
   const allProducts: any[] = products || [];
   const sortedProducts = [...allProducts].sort((a, b) => {
      if (sortOrder === 'rating') return (b.avgRating ?? 0) - (a.avgRating ?? 0);
      if (sortOrder === 'price_asc') return parseFloat(a.price) - parseFloat(b.price);
      if (sortOrder === 'price_desc') return parseFloat(b.price) - parseFloat(a.price);
      return 0;
   });

   const filteredProducts = activeCategory === 'All'
      ? sortedProducts
      : sortedProducts.filter((p: any) => p.category?.name === activeCategory);

   useEffect(() => {
      if (showFilters) setShowFilters(false);
      setCurrentPage(1);
   }, [activeCategory]);

   const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
   const paginatedProducts = filteredProducts.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
   );

   return (
      <div className="flex flex-col bg-white w-full border-t border-slate-100">

         {/* Cinematic Banner */}
         <HeroCarousel
            images={['banners/best_1.png', 'banners/best_2.png']}
            title={<>Best <span className="text-amber-400 italic font-bold">Selling</span> Products</>}
            subtitle="Experience the gold standard of organic South Indian harvests. Verified for purity and tradition."
            badges={
               <div className="flex items-center gap-3">
                  <div className="h-8 md:h-10 w-8 md:w-10 rounded-full bg-amber-500/20 backdrop-blur-md flex items-center justify-center border border-amber-500/30">
                     <TrendingUp className="h-4 w-4 text-amber-400" />
                  </div>
                  <span className="text-[8px] md:text-[9px] font-black uppercase tracking-[0.5em] text-amber-500">Global Favorites</span>
               </div>
            }
         />

         {/* Mobile Filter Toggle */}
         <div className="lg:hidden sticky top-[100px] z-30 px-4 py-3 bg-white/80 backdrop-blur-md border-b border-slate-100 flex items-center justify-between">
            <button
               onClick={() => setShowFilters(true)}
               className="flex items-center gap-3 px-6 py-3 rounded-full bg-[#022c22] text-white text-[10px] font-black uppercase tracking-widest shadow-xl"
            >
               Filter Selection <SlidersHorizontal size={14} />
            </button>
            <span className="text-[10px] font-black text-[#022c22]/40 uppercase tracking-widest">{filteredProducts.length} Items</span>
         </div>

         {/* Main Listing Interface */}
         <div className="w-full bg-white relative">
            <div className="max-w-[1536px] mx-auto flex flex-col lg:flex-row">

               {/* SIDEBAR: MOBILE DRAWER / DESKTOP ASIDE */}
               <div className={`fixed inset-0 z-[200] bg-emerald-950/40 backdrop-blur-md lg:hidden transition-opacity duration-300 ${showFilters ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={() => setShowFilters(false)} />

               <aside className={`
             fixed inset-y-0 left-0 z-[201] lg:relative lg:inset-auto lg:z-0
             ${showFilters ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
             transition-transform duration-500 ease-in-out
             w-full sm:w-[320px] lg:w-[300px] xl:w-[320px] border-r border-slate-100 shrink-0 bg-white
           `}>
                  {/* Mobile Header for Sidebar */}
                  <div className="lg:hidden flex items-center justify-between p-6 border-b border-slate-50 mt-20">
                     <span className="text-xl font-black text-[#022c22] tracking-tighter uppercase text-sm tracking-widest">Filter Products</span>
                     <button onClick={() => setShowFilters(false)} className="h-10 w-10 rounded-full bg-slate-50 flex items-center justify-center">
                        <X size={18} />
                     </button>
                  </div>

                  <div className="p-8 xl:p-10 lg:pt-14 overflow-y-auto max-h-screen lg:max-h-none lg:sticky lg:top-[120px] flex flex-col gap-10">
                     {/* Category Section */}
                     <div className="flex flex-col">
                        <h3 className="text-[10px] md:text-[12px] font-black uppercase tracking-widest text-[#022c22]/30 mb-6 pl-3 pr-2">
                           Shop by Category
                        </h3>
                        <div className="flex flex-col gap-1">
                           {categoryNames.map((cat: string) => (
                              <button
                                 key={cat}
                                 onClick={() => setActiveCategory(cat)}
                                 className="group flex items-center gap-4 py-3 px-4 rounded-xl transition-all"
                              >
                                 <div className={`h-5 w-5 rounded-md border-2 flex items-center justify-center transition-all ${activeCategory === cat
                                    ? 'bg-[#022c22] border-[#022c22]'
                                    : 'border-slate-100 group-hover:border-[#022c22]'
                                    }`}>
                                    {activeCategory === cat && <Check size={14} className="text-white" />}
                                 </div>
                                 <span className={`text-[13px] font-black uppercase tracking-widest transition-colors ${activeCategory === cat ? 'text-[#022c22]' : 'text-slate-400 group-hover:text-[#022c22]'
                                    }`}>
                                    {cat}
                                 </span>
                              </button>
                           ))}
                        </div>
                     </div>
                  </div>
               </aside>

               {/* CONTENT: CATALOG GRID */}
               <main className="flex-1 bg-slate-50/10 px-6 md:px-10 lg:px-16 pt-4 md:pt-8 pb-6">

                  {/* Header & Sort */}
                  <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-10 pb-6 border-b border-slate-200 gap-6">
                     <div className="flex flex-col text-left">
                        <div className="flex items-center gap-3 mb-2">
                           <span className="text-[10px] font-bold text-amber-500 uppercase tracking-[0.5em]">Active Items</span>
                        </div>
                        <h1 className="text-[#022c22] font-black tracking-tighter text-4xl md:text-5xl lg:text-6xl leading-none mb-3">
                           {activeCategory === 'All' ? 'Our Bestsellers' : activeCategory}
                        </h1>
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em]">{filteredProducts.length} Items discovered in our collection</span>
                     </div>

                     <div className="flex items-center gap-4">
                        <span className="hidden md:inline-block text-[10px] font-black uppercase tracking-[0.2em] text-slate-300">Sort Selection</span>
                        <select
                           value={sortOrder}
                           onChange={e => { setSortOrder(e.target.value as typeof sortOrder); setCurrentPage(1); }}
                           className="text-[10px] sm:text-[11px] font-bold text-[#022c22] uppercase tracking-[0.1em] bg-white px-6 md:px-8 py-3 md:py-4 rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-100 hover:border-amber-400 transition-all cursor-pointer outline-none"
                        >
                           <option value="rating">Highest Rated</option>
                           <option value="price_asc">Price: Low to High</option>
                           <option value="price_desc">Price: High to Low</option>
                        </select>
                     </div>
                  </div>

                  {paginatedProducts.length === 0 && (
                     <div className="flex flex-col items-center justify-center py-24 text-center">
                        <span className="text-5xl mb-4">🌿</span>
                        <p className="text-[13px] font-black uppercase tracking-widest text-slate-400">No products found</p>
                        <p className="text-[11px] text-slate-300 mt-2">Try selecting a different category</p>
                     </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8 md:gap-12 xl:gap-20">
                     {paginatedProducts.map((product: any) => (
                        <ProductCard key={product.id} product={product} />
                     ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                     <div className="flex items-center justify-center gap-2 mt-8 md:mt-12">
                        <button
                           disabled={currentPage === 1}
                           onClick={() => { setCurrentPage(prev => Math.max(1, prev - 1)); window.scrollTo({ top: 400, behavior: 'smooth' }); }}
                           className="h-12 w-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-emerald-950 disabled:opacity-30 transition-all hover:bg-emerald-50 active:scale-90"
                        >
                           <ChevronDown className="rotate-90" size={18} />
                        </button>

                        {[...Array(totalPages)].map((_, i) => (
                           <button
                              key={i + 1}
                              onClick={() => { setCurrentPage(i + 1); window.scrollTo({ top: 400, behavior: 'smooth' }); }}
                              className={`h-12 w-12 rounded-xl text-[11px] font-black transition-all ${currentPage === i + 1
                                 ? 'bg-emerald-950 text-white shadow-lg'
                                 : 'bg-white border border-slate-200 text-slate-400 hover:bg-slate-50'
                                 }`}
                           >
                              {String(i + 1).padStart(2, '0')}
                           </button>
                        ))}

                        <button
                           disabled={currentPage === totalPages}
                           onClick={() => { setCurrentPage(prev => Math.min(totalPages, prev + 1)); window.scrollTo({ top: 400, behavior: 'smooth' }); }}
                           className="h-12 w-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-emerald-950 disabled:opacity-30 transition-all hover:bg-emerald-50 active:scale-90"
                        >
                           <ChevronDown className="-rotate-90" size={18} />
                        </button>
                     </div>
                  )}

               </main>
            </div>
         </div>
      </div>
   );
}
