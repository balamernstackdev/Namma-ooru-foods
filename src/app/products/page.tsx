'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { 
   TrendingUp, SlidersHorizontal, Check, ChevronDown, X, Star, Sparkles, 
   ChevronRight, Home, LayoutGrid, Grid, List, ArrowUpDown, ShieldCheck, ShoppingBag
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ProductCard from '@/components/ProductCard';
import PremiumLoader from '@/components/ui/PremiumLoader';
import useSWR from 'swr';
import { API_URL } from '@/lib/api';

const fetcher = (url: string) => fetch(url).then(res => res.json());

function ProductsContent() {
   const searchParams = useSearchParams();
   const categoryParam = searchParams.get('category');

   const { data: products, error: productsError } = useSWR(`${API_URL}/api/products?limit=100`, fetcher);
   const { data: categoriesData } = useSWR(`${API_URL}/api/categories?limit=100`, fetcher);

   const [activeCategory, setActiveCategory] = useState<string>('All');
   const [priceFilter, setPriceFilter] = useState<string>('all');
   const [ratingFilter, setRatingFilter] = useState<number>(0);
   const [showFilters, setShowFilters] = useState(false);
   const [currentPage, setCurrentPage] = useState(1);
   const [sortOrder, setSortOrder] = useState<'rating' | 'price_asc' | 'price_desc' | 'newest'>('rating');
   const itemsPerPage = 12;

   // Collapsible state for groups
   const [collapsedGroups, setCollapsedGroups] = useState({
      categories: false,
      price: false,
      rating: false
   });

   const toggleGroup = (group: keyof typeof collapsedGroups) => {
      setCollapsedGroups(prev => ({ ...prev, [group]: !prev[group] }));
   };

   const liveProductsList = Array.isArray(products) 
      ? products 
      : (products && Array.isArray((products as any).products) ? (products as any).products : []);

   const liveCategoriesList = Array.isArray(categoriesData) 
      ? categoriesData 
      : (categoriesData && Array.isArray((categoriesData as any).categories) ? (categoriesData as any).categories : []);

   const allProducts: any[] = liveProductsList;
   const categoryNames: string[] = ['All', ...liveCategoriesList.map((c: any) => c.name)];

   // Effect: Listen to URL Param change
   useEffect(() => {
      if (categoryParam) {
         const matched = categoryNames.find(
            cat => cat.toLowerCase() === categoryParam.toLowerCase()
         );
         if (matched) {
            setActiveCategory(matched);
         } else {
            setActiveCategory('All');
         }
      } else {
         setActiveCategory('All');
      }
   }, [categoryParam, categoriesData]);

   const resetFilters = () => {
      setActiveCategory('All');
      setPriceFilter('all');
      setRatingFilter(0);
      setCurrentPage(1);
   };

   // Filtering Logic
   const filteredProducts = allProducts.filter((p: any) => {
      // Category filter
      const catMatch = activeCategory === 'All' || 
                      p.category?.name === activeCategory || 
                      p.category === activeCategory ||
                      (Array.isArray(p.tags) && p.tags.includes(activeCategory));
      if (!catMatch) return false;

      // Price Filter
      const price = parseFloat(p.price);
      if (priceFilter === 'under200' && price >= 200) return false;
      if (priceFilter === '200to500' && (price < 200 || price > 500)) return false;
      if (priceFilter === 'above500' && price <= 500) return false;

      // Rating Filter
      const pRating = p.rating || p.avgRating || 4.5;
      if (ratingFilter > 0 && pRating < ratingFilter) return false;

      return true;
   });

   // Sorting Logic
   const sortedProducts = [...filteredProducts].sort((a, b) => {
      if (sortOrder === 'rating') return (b.rating || b.avgRating || 0) - (a.rating || a.avgRating || 0);
      if (sortOrder === 'price_asc') return parseFloat(a.price) - parseFloat(b.price);
      if (sortOrder === 'price_desc') return parseFloat(b.price) - parseFloat(a.price);
      if (sortOrder === 'newest') return (b.id || 0) - (a.id || 0);
      return 0;
   });

   useEffect(() => {
      window.scrollTo(0, 0);
   }, []);

   const totalPages = Math.ceil(sortedProducts.length / itemsPerPage);
   const paginatedProducts = sortedProducts.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
   );

   if (!products && !productsError) {
      return <PremiumLoader fullScreen={true} />;
   }

   return (
      <div className="flex flex-col bg-[#f8fafc] w-full min-h-screen">
         
         {/* COMPACT BREADCRUMB BAR */}
         <div className="w-full bg-white border-b border-slate-200 sticky top-0 z-[100] shadow-sm shadow-slate-100/50">
            <div className="max-w-[1600px] mx-auto px-4 md:px-6 py-3 flex items-center justify-between text-xs text-slate-500">
               <div className="flex items-center gap-2 font-medium">
                  <Link href="/" className="hover:text-emerald-900 transition-colors flex items-center gap-1">
                     <Home size={12} /> Home
                  </Link>
                  <ChevronRight size={12} className="opacity-60" />
                  <span className="text-slate-900 font-bold uppercase tracking-wider">Shop Harvests</span>
               </div>
               <div className="hidden md:flex items-center gap-4 text-slate-900 font-bold">
                  <div className="flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full text-[10px]">
                     <ShieldCheck size={12} /> Secure Direct Sourcing
                  </div>
               </div>
            </div>
         </div>

         {/* MAIN INTERFACE */}
         <div className="w-full bg-[#f8fafc]">
            <div className="max-w-[1600px] mx-auto flex flex-col lg:flex-row">

               {/* DESKTOP SIDEBAR */}
               <aside className="hidden lg:block w-[280px] xl:w-[310px] shrink-0 bg-white border-r border-slate-200 h-[calc(100vh-40px)] sticky top-10 overflow-y-auto no-scrollbar">
                  <div className="p-6 flex flex-col gap-6">
                     
                     <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                        <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                           <SlidersHorizontal size={14} className="text-emerald-600" /> Filters
                        </h2>
                        {(activeCategory !== 'All' || priceFilter !== 'all' || ratingFilter > 0) && (
                           <button onClick={resetFilters} className="text-[11px] font-bold text-emerald-600 hover:underline">
                              CLEAR ALL
                           </button>
                        )}
                     </div>

                     {/* Categories Group */}
                     <div className="border-b border-slate-100 pb-5">
                        <button 
                           onClick={() => toggleGroup('categories')}
                           className="flex items-center justify-between w-full text-left mb-3 font-black uppercase text-[11px] tracking-widest text-slate-800"
                        >
                           <span>Shop By Category</span>
                           <ChevronDown size={14} className={`text-slate-400 transition-transform ${collapsedGroups.categories ? '-rotate-90' : ''}`} />
                        </button>
                        {!collapsedGroups.categories && (
                           <div className="flex flex-col gap-1 max-h-[320px] overflow-y-auto pr-2 no-scrollbar">
                              {categoryNames.map(cat => {
                                 const count = cat === 'All' ? allProducts.length : allProducts.filter(p => p.category?.name === cat || p.category === cat).length;
                                 return (
                                    <button
                                       key={cat}
                                       onClick={() => { setActiveCategory(cat); setCurrentPage(1); }}
                                       className={`flex items-center justify-between py-2 px-3 rounded-lg text-[12px] font-semibold transition-all ${activeCategory === cat ? 'bg-emerald-50 text-emerald-800' : 'text-slate-600 hover:bg-slate-50'}`}
                                    >
                                       <span className="truncate mr-2">{cat}</span>
                                       <span className="text-[10px] opacity-60 shrink-0">({count})</span>
                                    </button>
                                 );
                              })}
                           </div>
                        )}
                     </div>

                     {/* Price Bucket Group */}
                     <div className="border-b border-slate-100 pb-5">
                        <button 
                           onClick={() => toggleGroup('price')}
                           className="flex items-center justify-between w-full text-left mb-3 font-black uppercase text-[11px] tracking-widest text-slate-800"
                        >
                           <span>Price Filter</span>
                           <ChevronDown size={14} className={`text-slate-400 transition-transform ${collapsedGroups.price ? '-rotate-90' : ''}`} />
                        </button>
                        {!collapsedGroups.price && (
                           <div className="flex flex-col gap-2 text-[12px]">
                              {[
                                 { value: 'all', label: 'Any Price' },
                                 { value: 'under200', label: 'Under ₹200' },
                                 { value: '200to500', label: '₹200 to ₹500' },
                                 { value: 'above500', label: 'Above ₹500' }
                              ].map(opt => (
                                 <label key={opt.value} className="flex items-center gap-2.5 cursor-pointer font-semibold text-slate-600 hover:text-slate-900 transition-colors">
                                    <input 
                                       type="radio" 
                                       name="mainPriceFilter" 
                                       checked={priceFilter === opt.value}
                                       onChange={() => { setPriceFilter(opt.value); setCurrentPage(1); }}
                                       className="h-4 w-4 rounded-full accent-emerald-700 border-slate-300"
                                    />
                                    <span>{opt.label}</span>
                                 </label>
                              ))}
                           </div>
                        )}
                     </div>

                     {/* Rating Threshold */}
                     <div className="pb-4">
                        <button 
                           onClick={() => toggleGroup('rating')}
                           className="flex items-center justify-between w-full text-left mb-3 font-black uppercase text-[11px] tracking-widest text-slate-800"
                        >
                           <span>Ratings Filter</span>
                           <ChevronDown size={14} className={`text-slate-400 transition-transform ${collapsedGroups.rating ? '-rotate-90' : ''}`} />
                        </button>
                        {!collapsedGroups.rating && (
                           <div className="flex flex-col gap-2 text-[12px]">
                              {[0, 4.5, 4.0, 3.5].map(val => (
                                 <button
                                    key={val}
                                    onClick={() => { setRatingFilter(val); setCurrentPage(1); }}
                                    className={`flex items-center gap-2 py-1.5 font-bold text-left transition-colors ${ratingFilter === val ? 'text-emerald-700' : 'text-slate-600 hover:text-slate-900'}`}
                                 >
                                    <div className={`h-4 w-4 rounded border flex items-center justify-center ${ratingFilter === val ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-300'}`}>
                                       {ratingFilter === val && <Check size={10} strokeWidth={3} />}
                                    </div>
                                    {val === 0 ? 'Any reviews' : (
                                       <span className="flex items-center gap-1">
                                          {val} <Star size={12} className="fill-amber-400 text-amber-400" /> & Above
                                       </span>
                                    )}
                                 </button>
                              ))}
                           </div>
                        )}
                     </div>
                  </div>
               </aside>

               {/* CATALOG SPACE */}
               <main className="flex-1 px-4 md:px-8 py-6 md:py-8 flex flex-col gap-6 min-h-screen max-w-full overflow-hidden">
                  
                  {/* TOOLBAR */}
                  <div className="bg-white border border-slate-200 rounded-xl p-4 md:p-5 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between shadow-sm shadow-slate-100">
                     <div className="flex flex-col">
                        <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight uppercase leading-none mb-1.5">
                           {activeCategory === 'All' ? 'Organic Pantry' : activeCategory}
                        </h1>
                        <span className="text-xs text-slate-400 font-medium">
                           Showing <strong className="text-slate-800 font-black">{sortedProducts.length}</strong> farm products discovered
                        </span>
                     </div>

                     {/* Sorting Widget */}
                     <div className="flex items-center gap-3 w-full md:w-auto">
                        <div className="flex items-center gap-2 text-[11px] font-black uppercase text-slate-400 shrink-0">
                           <ArrowUpDown size={12} /> Sort By
                        </div>
                        <div className="relative flex-1 md:flex-initial min-w-[180px]">
                           <select
                              value={sortOrder}
                              onChange={e => { setSortOrder(e.target.value as any); setCurrentPage(1); }}
                              className="w-full h-10 border border-slate-200 bg-white pl-4 pr-10 text-[11px] font-black uppercase tracking-wider text-slate-800 rounded-lg appearance-none cursor-pointer transition-all hover:border-emerald-500 focus:outline-none"
                           >
                              <option value="rating">Top Rated</option>
                              <option value="price_asc">Price: Low to High</option>
                              <option value="price_desc">Price: High to Low</option>
                              <option value="newest">Newest Harvest</option>
                           </select>
                           <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
                        </div>
                     </div>
                  </div>

                  {/* CHIPS ROW */}
                  {(activeCategory !== 'All' || priceFilter !== 'all' || ratingFilter > 0) && (
                     <div className="flex flex-wrap items-center gap-2 py-1">
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 mr-1">Filtered By:</span>
                        {activeCategory !== 'All' && (
                           <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-900 px-3 py-1.5 rounded-full text-[11px] font-bold border border-emerald-100 shadow-sm">
                              {activeCategory}
                              <button onClick={() => setActiveCategory('All')} className="hover:text-rose-500 ml-1"><X size={12} /></button>
                           </div>
                        )}
                        {priceFilter !== 'all' && (
                           <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-900 px-3 py-1.5 rounded-full text-[11px] font-bold border border-emerald-100 shadow-sm">
                              {priceFilter === 'under200' ? 'Under ₹200' : priceFilter === '200to500' ? '₹200-₹500' : 'Above ₹500'}
                              <button onClick={() => setPriceFilter('all')} className="hover:text-rose-500 ml-1"><X size={12} /></button>
                           </div>
                        )}
                        {ratingFilter > 0 && (
                           <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-900 px-3 py-1.5 rounded-full text-[11px] font-bold border border-emerald-100 shadow-sm">
                              {ratingFilter}★ & Above
                              <button onClick={() => setRatingFilter(0)} className="hover:text-rose-500 ml-1"><X size={12} /></button>
                           </div>
                        )}
                        <button onClick={resetFilters} className="text-[11px] font-black text-emerald-600 underline uppercase tracking-wider ml-1 hover:text-emerald-800">Clear All</button>
                     </div>
                  )}

                  {/* CATALOG GRID GRID GRID */}
                  {sortedProducts.length === 0 ? (
                     <div className="bg-white rounded-2xl border border-slate-200 py-24 flex flex-col items-center justify-center text-center">
                        <ShoppingBag size={36} className="text-slate-200 mb-3" />
                        <h3 className="text-slate-800 font-black uppercase text-[14px] tracking-wider">Empty Catalog Grid</h3>
                        <p className="text-slate-400 text-[12px] mt-1">We couldn't find matching entries for current filters.</p>
                        <button onClick={resetFilters} className="mt-5 px-5 py-2 bg-emerald-900 text-white rounded-lg text-[11px] font-bold uppercase">Clear Filters</button>
                     </div>
                  ) : (
                     <div className="w-full">
                        {/* COMPACT HIGH DENSITY GRID */}
                        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-4 md:gap-5 lg:gap-6">
                           <AnimatePresence mode='popLayout'>
                              {paginatedProducts.map((product: any) => (
                                 <motion.div 
                                    key={product.id}
                                    layout
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                 >
                                    <ProductCard product={product} />
                                 </motion.div>
                              ))}
                           </AnimatePresence>
                        </div>

                        {/* GRID PAGINATION */}
                        {totalPages > 1 && (
                           <div className="flex items-center justify-center gap-2 mt-10 md:mt-14 border-t border-slate-200 pt-8">
                              <button
                                 disabled={currentPage === 1}
                                 onClick={() => { setCurrentPage(p => Math.max(1, p - 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                                 className="h-10 px-4 rounded-lg bg-white border border-slate-200 flex items-center gap-1 text-[11px] font-black text-slate-600 disabled:opacity-40 hover:bg-slate-50"
                              >
                                 Prev
                              </button>
                              {[...Array(totalPages)].map((_, i) => (
                                 <button
                                    key={i}
                                    onClick={() => { setCurrentPage(i + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                                    className={`h-10 w-10 rounded-lg text-[11px] font-black ${currentPage === i + 1 ? 'bg-emerald-900 text-white shadow-md' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                                 >
                                    {i + 1}
                                 </button>
                              ))}
                              <button
                                 disabled={currentPage === totalPages}
                                 onClick={() => { setCurrentPage(p => Math.min(totalPages, p + 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                                 className="h-10 px-4 rounded-lg bg-white border border-slate-200 flex items-center gap-1 text-[11px] font-black text-slate-600 disabled:opacity-40 hover:bg-slate-50"
                              >
                                 Next
                              </button>
                           </div>
                        )}
                     </div>
                  )}
               </main>
            </div>
         </div>

         {/* FLOATING MOBILE TRIGGERS */}
         <div className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-slate-900 text-white px-2.5 py-2 rounded-full shadow-2xl shadow-slate-950/50 border border-slate-700/40 font-black uppercase tracking-widest text-[10px]">
            <button 
               onClick={() => setShowFilters(true)}
               className="flex items-center gap-2 py-2.5 px-5 bg-emerald-800 text-white rounded-full border border-emerald-700 active:scale-95"
            >
               <SlidersHorizontal size={12} /> Filters
            </button>
            <div className="w-[1px] h-5 bg-slate-700" />
            <span className="px-3 text-slate-300">{sortedProducts.length} Total</span>
         </div>

         {/* MOBILE FILTER DRAWER */}
         <AnimatePresence>
            {showFilters && (
               <>
                  <motion.div 
                     initial={{ opacity: 0 }}
                     animate={{ opacity: 1 }}
                     exit={{ opacity: 0 }}
                     onClick={() => setShowFilters(false)}
                     className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm lg:hidden"
                  />
                  <motion.div
                     initial={{ y: '100%' }}
                     animate={{ y: 0 }}
                     exit={{ y: '100%' }}
                     transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
                     className="fixed inset-x-0 bottom-0 z-[201] h-[85vh] bg-white rounded-t-[2rem] flex flex-col overflow-hidden lg:hidden"
                  >
                     <div className="flex justify-center py-3"><div className="w-12 h-1 bg-slate-200 rounded-full" /></div>
                     <div className="flex items-center justify-between px-6 pb-4 border-b border-slate-100">
                        <span className="text-sm font-black text-slate-900 uppercase tracking-widest">Filter Options</span>
                        <button onClick={() => setShowFilters(false)} className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center"><X size={16} /></button>
                     </div>

                     <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-8 no-scrollbar">
                        {/* Sort */}
                        <div className="space-y-3">
                           <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-400">Sorting Order</h4>
                           <div className="grid grid-cols-2 gap-2">
                              {(['rating', 'price_asc', 'price_desc', 'newest'] as const).map(opt => (
                                 <button 
                                    key={opt}
                                    onClick={() => { setSortOrder(opt); setCurrentPage(1); }}
                                    className={`py-3 px-4 rounded-xl text-[11px] font-bold border transition-all text-center ${sortOrder === opt ? 'bg-emerald-900 border-emerald-900 text-white' : 'border-slate-200 text-slate-700 bg-slate-50'}`}
                                 >
                                    {opt === 'rating' ? 'Top Rated' : opt === 'price_asc' ? 'Price: Low' : opt === 'price_desc' ? 'Price: High' : 'New Arrivals'}
                                 </button>
                              ))}
                           </div>
                        </div>

                        {/* Categories */}
                        <div className="space-y-3">
                           <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-400">Category Selection</h4>
                           <div className="flex flex-wrap gap-2">
                              {categoryNames.map(cat => (
                                 <button
                                    key={cat}
                                    onClick={() => { setActiveCategory(cat); setCurrentPage(1); }}
                                    className={`py-2.5 px-4 rounded-xl text-[11px] font-bold border transition-all ${activeCategory === cat ? 'bg-emerald-900 border-emerald-900 text-white' : 'border-slate-200 text-slate-700 bg-slate-50'}`}
                                 >
                                    {cat}
                                 </button>
                              ))}
                           </div>
                        </div>

                        {/* Prices */}
                        <div className="space-y-3">
                           <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-400">Price Bucket</h4>
                           <div className="flex flex-col gap-2 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                              {[
                                 { value: 'all', label: 'Any Price' },
                                 { value: 'under200', label: 'Under ₹200' },
                                 { value: '200to500', label: '₹200 to ₹500' },
                                 { value: 'above500', label: 'Above ₹500' }
                              ].map(opt => (
                                 <label key={opt.value} className="flex items-center justify-between p-2.5 font-bold text-slate-700 cursor-pointer text-[12px]">
                                    <span>{opt.label}</span>
                                    <input 
                                       type="radio" 
                                       name="mobilePriceProducts"
                                       checked={priceFilter === opt.value}
                                       onChange={() => { setPriceFilter(opt.value); setCurrentPage(1); }}
                                       className="h-4 w-4 accent-emerald-700" 
                                    />
                                 </label>
                              ))}
                           </div>
                        </div>
                     </div>

                     <div className="p-6 border-t border-slate-100 flex gap-3 bg-white">
                        <button onClick={resetFilters} className="flex-1 h-12 border border-slate-200 text-slate-700 rounded-xl font-bold text-xs uppercase">Reset</button>
                        <button onClick={() => setShowFilters(false)} className="flex-1 h-12 bg-emerald-900 text-white rounded-xl font-bold text-xs uppercase shadow-lg">Apply</button>
                     </div>
                  </motion.div>
               </>
            )}
         </AnimatePresence>
      </div>
   );
}

export default function ProductsPage() {
   return (
      <Suspense fallback={<PremiumLoader fullScreen={true} />}>
         <ProductsContent />
      </Suspense>
   );
}
