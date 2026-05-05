'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { TrendingUp, SlidersHorizontal, Check, ChevronDown, X, Star, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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
   const allProducts: any[] = Array.isArray(products) ? products : [];
   const sortedProducts = [...allProducts].sort((a, b) => {
      if (sortOrder === 'rating') return (b.avgRating ?? 0) - (a.avgRating ?? 0);
      if (sortOrder === 'price_asc') return parseFloat(a.price) - parseFloat(b.price);
      if (sortOrder === 'price_desc') return parseFloat(b.price) - parseFloat(a.price);
      return 0;
   });

   const filteredProducts = activeCategory === 'All'
      ? sortedProducts
      : sortedProducts.filter((p: any) => 
          (p.category?.name === activeCategory) || 
          (p.category === activeCategory) ||
          (Array.isArray(p.tags) && p.tags.includes(activeCategory))
        );

   useEffect(() => {
      window.scrollTo(0, 0);
   }, []);

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
            images={['/banners/best_1.png', '/banners/best_2.png']}
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
             fixed lg:static lg:sticky inset-y-0 left-0 z-[201] lg:top-[120px] lg:h-[calc(100vh-140px)]
             ${showFilters ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
             transition-transform duration-500 ease-in-out
             w-full sm:w-[320px] lg:w-[320px] xl:w-[340px] border-r border-slate-100 shrink-0 bg-white lg:bg-transparent
           `}>
                  {/* Mobile Header for Sidebar */}
                  <div className="lg:hidden flex items-center justify-between p-6 border-b border-slate-50 mt-20">
                     <span className="text-xl font-black text-[#022c22] tracking-tighter uppercase text-sm tracking-widest">Filter Products</span>
                     <button onClick={() => setShowFilters(false)} className="h-10 w-10 rounded-full bg-slate-50 flex items-center justify-center">
                        <X size={18} />
                     </button>
                  </div>

                  <div className="p-8 xl:p-10 lg:pt-0 overflow-y-auto h-full no-scrollbar flex flex-col gap-10">
                     {/* Category Section */}
                     <div className="flex flex-col">
                        <div className="flex items-center gap-2 mb-6 px-3">
                           <Sparkles size={14} className="text-amber-500" />
                           <h3 className="text-[10px] md:text-[11px] font-black uppercase tracking-[0.2em] text-[#022c22]">
                              Refine By Category
                           </h3>
                        </div>
                        <div className="flex flex-col gap-1">
                           {categoryNames.map((cat: string) => (
                              <button
                                 key={cat}
                                 onClick={() => setActiveCategory(cat)}
                                 className="group flex items-center justify-between py-3 px-4 rounded-2xl transition-all hover:bg-slate-50"
                              >
                                 <div className="flex items-center gap-4">
                                    <div className={`h-2 w-2 rounded-full transition-all ${activeCategory === cat ? 'bg-amber-500 scale-125' : 'bg-slate-200 group-hover:bg-slate-400'}`} />
                                    <span className={`text-[11px] font-black uppercase tracking-wider transition-colors text-left leading-tight ${activeCategory === cat ? 'text-[#022c22]' : 'text-slate-400 group-hover:text-[#022c22]'}`}>
                                       {cat}
                                    </span>
                                 </div>
                                 {activeCategory === cat && (
                                    <div className="h-6 w-6 rounded-full bg-emerald-50 flex items-center justify-center">
                                       <Check size={12} className="text-emerald-600" />
                                    </div>
                                 )}
                              </button>
                           ))}
                        </div>
                     </div>

                     {/* Premium Badge */}
                     <div className="mt-10 p-6 rounded-[2rem] bg-[#022c22] relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 blur-2xl rounded-full translate-x-10 -translate-y-10" />
                        <Star className="text-amber-400 mb-4 fill-amber-400" size={24} />
                        <p className="text-white text-xs font-black uppercase tracking-widest leading-relaxed">
                           Our products are <span className="text-amber-400">100% Certified</span> Organic.
                        </p>
                     </div>
                  </div>
               </aside>

               {/* CONTENT: CATALOG GRID */}
               <main className="flex-1 bg-slate-50/10 px-4 md:px-10 lg:px-12 pt-4 md:pt-10 pb-20">

                  {/* Header & Sort */}
                  <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-12 pb-8 border-b border-slate-100 gap-8">
                     <div className="flex flex-col text-left">
                        <div className="flex items-center gap-3 mb-4">
                           <div className="h-[2px] w-8 bg-amber-500" />
                           <span className="text-[10px] font-black text-amber-600 uppercase tracking-[0.4em]">Collection 2026</span>
                        </div>
                        <h1 className="text-[#022c22] font-black tracking-tighter text-4xl md:text-5xl lg:text-7xl leading-none mb-4">
                           {activeCategory === 'All' ? 'Bestsellers' : activeCategory}
                        </h1>
                        <p className="text-[12px] font-medium text-slate-400 flex items-center gap-2">
                           Showing <span className="text-[#022c22] font-black">{filteredProducts.length}</span> premium harvests
                        </p>
                     </div>

                     <div className="flex items-center gap-4">
                        <div className="relative group">
                           <select
                              value={sortOrder}
                              onChange={e => { setSortOrder(e.target.value as typeof sortOrder); setCurrentPage(1); }}
                              className="appearance-none text-[11px] font-black text-[#022c22] uppercase tracking-[0.15em] bg-white pl-8 pr-12 py-4 rounded-2xl shadow-sm border border-slate-100 hover:border-emerald-500 transition-all cursor-pointer outline-none min-w-[220px]"
                           >
                              <option value="rating">Top Rated First</option>
                              <option value="price_asc">Price: Low to High</option>
                              <option value="price_desc">Price: High to Low</option>
                           </select>
                           <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" size={14} />
                        </div>
                     </div>
                  </div>

                  {paginatedProducts.length === 0 && (
                     <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col items-center justify-center py-32 text-center"
                     >
                        <div className="h-20 w-20 rounded-full bg-slate-50 flex items-center justify-center mb-6">
                           <Sparkles className="text-slate-200" size={32} />
                        </div>
                        <p className="text-[14px] font-black uppercase tracking-widest text-[#022c22]">No harvests discovered</p>
                        <p className="text-[12px] text-slate-400 mt-2">Adjust your filters to see more products</p>
                     </motion.div>
                  )}

                  <motion.div 
                     layout
                     className="grid grid-cols-2 md:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8 lg:gap-10"
                  >
                     <AnimatePresence mode='popLayout'>
                        {paginatedProducts.map((product: any, idx: number) => (
                           <motion.div
                              layout
                              key={product.id}
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.9 }}
                              transition={{ duration: 0.4, delay: idx * 0.05 }}
                           >
                              <ProductCard product={product} />
                           </motion.div>
                        ))}
                     </AnimatePresence>
                  </motion.div>


                  {/* Pagination */}
                  {totalPages > 1 && (
                     <div className="flex items-center justify-center gap-2 mt-8 md:mt-12">
                        <button
                           disabled={currentPage === 1}
                           onClick={() => { setCurrentPage(prev => Math.max(1, prev - 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                           className="h-12 w-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-emerald-950 disabled:opacity-30 transition-all hover:bg-emerald-50 active:scale-90"
                        >
                           <ChevronDown className="rotate-90" size={18} />
                        </button>

                        {[...Array(totalPages)].map((_, i) => (
                           <button
                              key={i + 1}
                              onClick={() => { setCurrentPage(i + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
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
                           onClick={() => { setCurrentPage(prev => Math.min(totalPages, prev + 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
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
