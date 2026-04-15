'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, TrendingUp, Star, SlidersHorizontal, Check, ChevronDown, X } from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import { PRODUCTS } from '@/lib/staticData';
import HeroCarousel from '@/components/HeroCarousel';

const categories = ['All', 'Grains & Pulses', 'Organic Oils', 'Authentic Spices', 'Dairy Products', 'Traditional Snacks', 'Local Sweets'];

export default function BestSellingPage() {
  const bestSellingProducts = PRODUCTS.filter(p => p.tags?.includes('best-selling'));
  const [activeCategory, setActiveCategory] = useState('All');
  const [showFilters, setShowFilters] = useState(false);
  
  const filteredProducts = activeCategory === 'All' 
    ? bestSellingProducts 
    : bestSellingProducts.filter(p => p.category === activeCategory);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (showFilters) setShowFilters(false);
  }, [activeCategory]);

  return (
    <div className="flex flex-col bg-white w-full border-t border-slate-100">
      
      {/* Cinematic Banner - Responsive Height */}
      <HeroCarousel 
        images={['banners/best_1.png', 'banners/best_2.png']}
        title={<>Best <span className="text-amber-400 italic font-medium text-4xl md:text-6xl xl:text-8xl">Selling</span> Vault</>}
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

      {/* Mobile Filter Toggle (Floats on scroll) */}
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
          
          {/* SIDEBAR: MOBILE MODAL / DESKTOP ASIDE */}
          <aside className={`
            fixed inset-0 z-[60] lg:relative lg:inset-auto lg:z-0
            ${showFilters ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            transition-transform duration-500 ease-in-out
            w-full lg:w-[300px] xl:w-[320px] border-r border-slate-100 shrink-0 bg-white
          `}>
             {/* Mobile Header for Sidebar */}
             <div className="lg:hidden flex items-center justify-between p-8 border-b border-slate-50">
                <span className="text-xl font-black text-[#022c22] tracking-tighter">Filter Catalog</span>
                <button onClick={() => setShowFilters(false)} className="h-12 w-12 rounded-full bg-slate-50 flex items-center justify-center">
                   <X size={20} />
                </button>
             </div>

            <div className="p-8 xl:p-10 lg:pt-14 overflow-y-auto max-h-screen lg:max-h-none lg:sticky lg:top-[120px] flex flex-col gap-10">
               {/* Department Section */}
               <div className="flex flex-col">
                  <h3 className="text-[10px] md:text-[12px] font-black uppercase tracking-widest text-[#022c22]/30 mb-6 pl-3 pr-2">
                     Vault Departments
                  </h3>
                  <div className="flex flex-col gap-1">
                     {categories.map((cat) => (
                        <button
                           key={cat}
                           onClick={() => setActiveCategory(cat)}
                           className="group flex items-center gap-4 py-3 px-4 rounded-xl transition-all"
                        >
                           <div className={`h-5 w-5 rounded-md border-2 flex items-center justify-center transition-all ${
                              activeCategory === cat 
                                 ? 'bg-[#022c22] border-[#022c22]' 
                                 : 'border-slate-100 group-hover:border-[#022c22]'
                           }`}>
                              {activeCategory === cat && <Check size={14} className="text-white" />}
                           </div>
                           <span className={`text-[13px] font-black uppercase tracking-widest transition-colors ${
                              activeCategory === cat ? 'text-[#022c22]' : 'text-slate-400 group-hover:text-[#022c22]'
                           }`}>
                              {cat}
                           </span>
                        </button>
                     ))}
                  </div>
               </div>

               {/* Hall of Fame Card */}
               <div className="mt-4 p-8 rounded-[2rem] bg-[#022c22] text-white relative overflow-hidden group shadow-xl">
                  <div className="absolute top-0 right-0 h-40 w-40 bg-emerald-800 rounded-full blur-3xl opacity-40 -mr-20 -mt-20 group-hover:scale-150 transition-transform duration-1000" />
                  <Star className="h-8 w-8 text-amber-400 mb-6" fill="currentColor" />
                  <p className="text-[14px] font-black leading-tight mb-2">Verified Harvests</p>
                  <p className="text-[11px] opacity-50 uppercase tracking-widest">Selected by community</p>
               </div>
            </div>
          </aside>
  
          {/* CONTENT: CATALOG GRID */}
          <main className="flex-1 bg-slate-50/10 px-6 md:px-10 lg:px-16 pt-12 lg:pt-14 pb-48">
            {/* Header Module */}
            <div className="flex flex-col items-center lg:items-start lg:flex-row lg:justify-between mb-12 gap-8">
               <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
                  <div className="flex items-center gap-3 mb-4">
                     <div className="h-[2px] w-12 bg-amber-500 rounded-full" />
                     <span className="text-[10px] font-black text-amber-500 uppercase tracking-[0.5em]">Active Treasures</span>
                  </div>
                  <h1 className="text-[#022c22] font-black tracking-tighter text-4xl md:text-5xl lg:text-6xl xl:text-7xl leading-none">
                    {activeCategory === 'All' ? 'Our Bestsellers' : activeCategory}
                  </h1>
               </div>
               
               <div className="hidden md:flex items-center gap-10">
                  <div className="flex flex-col items-end gap-1">
                     <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-300">Catalog Size</span>
                     <span className="text-[14px] font-black text-[#022c22] uppercase tracking-widest">{filteredProducts.length} Items</span>
                  </div>
                  <div className="h-16 w-px bg-slate-100" />
                  <button className="flex items-center gap-4 h-16 px-10 rounded-full bg-white border-2 border-slate-50 shadow-md text-[10px] font-black uppercase tracking-[0.3em] text-[#022c22] hover:bg-amber-400 hover:border-amber-400 transition-all active:scale-95">
                    Refine <SlidersHorizontal size={18} />
                  </button>
               </div>
            </div>
  
            {/* Action Bar / Sort Filter */}
            <div className="flex flex-col md:flex-row items-center justify-between mb-16 py-8 border-y border-slate-100 gap-6">
               <span className="text-[12px] font-black text-slate-300 uppercase tracking-[0.2em]">{filteredProducts.length} Treasures discovered in our vault</span>
               <div className="flex items-center gap-6">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-200">Sort Selection</span>
                  <button className="text-[11px] font-black text-[#022c22] uppercase tracking-[0.1em] flex items-center gap-3 bg-white px-8 py-4 rounded-full shadow-sm border border-slate-100">
                    Highest Rated <ChevronDown size={14} className="text-amber-500" />
                  </button>
               </div>
            </div>

            {/* Product Grid - Responsive Columns */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8 md:gap-12 xl:gap-20">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
  
            {/* Catalog Discovery */}
            <div className="text-center pt-40">
               <button className="w-full md:w-auto h-20 px-24 rounded-full bg-[#022c22] text-white text-[11px] font-black uppercase tracking-[0.5em] hover:bg-amber-500 hover:text-[#022c22] transition-all shadow-premium hover:shadow-[0_30px_60px_rgba(2,44,34,0.3)] hover:scale-[1.05] active:scale-95 group">
                 Deep Discovery <ArrowRight className="h-4 w-4 group-hover:translate-x-4 transition-transform ml-6" />
               </button>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
