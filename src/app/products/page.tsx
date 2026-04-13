'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import ProductCard from '@/components/ProductCard';
import { ArrowRight, TrendingUp, Flame, Star, Filter, SlidersHorizontal, ShoppingBag } from 'lucide-react';
import { PRODUCTS } from '@/lib/staticData';
import HeroCarousel from '@/components/HeroCarousel';

const categories = ['All', 'Grains & Pulses', 'Organic Oils', 'Authentic Spices', 'Dairy Products', 'Traditional Snacks', 'Local Sweets'];

const categoryIcons: { [key: string]: any } = {
  'All': ShoppingBag,
  'Grains & Pulses': TrendingUp,
  'Organic Oils': Flame,
  'Authentic Spices': Star,
  'Dairy Products': ShoppingBag,
  'Traditional Snacks': Flame,
  'Local Sweets': Star
};

const ProductsContent = () => {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get('category');
  const [activeCategory, setActiveCategory] = useState('All');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  useEffect(() => {
    if (categoryParam && categories.includes(categoryParam)) {
      setActiveCategory(categoryParam);
    } else {
      setActiveCategory('All');
    }
  }, [categoryParam]);

  const filteredProducts = activeCategory === 'All' 
    ? PRODUCTS 
    : PRODUCTS.filter(p => p.category === activeCategory);

  return (
    <div className="flex flex-col bg-white w-full min-h-screen">
      <HeroCarousel 
        images={['banners/products_1.png', 'banners/products_2.png']}
        title={<>Pure <br /><span className="text-amber-400 italic">Harvest</span> Vault</>}
        subtitle="Experience the complete collection of Namma Orru's artisanal treasures. Authentic, organic, and direct from the soil."
        badges={
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-emerald-400/20 backdrop-blur-md flex items-center justify-center border border-emerald-400/30">
              <ShoppingBag className="h-5 w-5 text-emerald-300" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-300">Vault Member Access</span>
          </div>
        }
      />
 
      <div className="w-full bg-slate-50 flex justify-center border-t border-slate-100 relative">
        <div className="standard-container flex flex-col lg:flex-row gap-12 lg:gap-16 py-12 md:py-16 lg:py-24">
          
          {/* MOBILE TOGGLE BAR */}
          <div className="lg:hidden flex items-center justify-between p-4 bg-slate-50 rounded-2xl mb-8">
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-950">Refine Catalog</span>
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="flex items-center gap-2 h-10 px-5 rounded-xl bg-emerald-950 text-white text-[10px] font-black uppercase tracking-widest shadow-lg"
            >
              Filters <SlidersHorizontal className="h-4 w-4" />
            </button>
          </div>

          {/* SIDEBAR - HIGH VISIBILITY REDESIGN */}
          <div className={`fixed inset-0 z-[100] bg-emerald-950/40 backdrop-blur-md lg:hidden transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={() => setIsSidebarOpen(false)} />
          
          <aside className={`fixed lg:sticky top-0 lg:top-[140px] left-0 h-full lg:h-fit w-72 bg-white lg:bg-transparent z-[101] lg:z-10 p-8 lg:p-0 transition-transform duration-300 lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} shrink-0 overflow-y-auto lg:overflow-visible`}>
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between mb-10 lg:hidden">
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-950">Refine Your Search</span>
                <button onClick={() => setIsSidebarOpen(false)} className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center">
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-12">
                <div className="flex flex-col">
                  <div className="flex items-center gap-3 mb-8 px-2 border-b border-slate-100 pb-4">
                    <div className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                    <span className="text-[11px] font-black uppercase tracking-[0.4em] text-emerald-950">Catalog Genre</span>
                  </div>
                  <div className="flex flex-col gap-2">
                    {categories.map((cat) => {
                      const Icon = categoryIcons[cat] || Star;
                      return (
                        <button
                          key={cat}
                          onClick={() => {
                            setActiveCategory(cat);
                            setIsSidebarOpen(false);
                          }}
                          className={`group flex items-center justify-between px-5 py-4 rounded-xl transition-all duration-300 border ${
                            activeCategory === cat 
                              ? 'bg-emerald-950 border-emerald-950 text-white shadow-xl shadow-emerald-950/20 translate-x-2' 
                              : 'bg-white border-slate-100 text-slate-500 hover:border-emerald-950/20 hover:bg-emerald-50/30 hover:text-emerald-950'
                          }`}
                        >
                          <div className="flex items-center gap-4">
                            <Icon className={`h-4 w-4 ${activeCategory === cat ? 'text-amber-400' : 'text-slate-300 group-hover:text-emerald-950'}`} />
                            <span className="text-[11px] font-black uppercase tracking-widest">{cat}</span>
                          </div>
                          <ArrowRight className={`h-3.5 w-3.5 transition-all duration-500 ${activeCategory === cat ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`} />
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* PREMIUM TRUST CARD */}
                <div className="relative p-8 rounded-[2.5rem] bg-amber-50 border border-amber-200/50 overflow-hidden group/card shadow-sm">
                  <div className="absolute -top-10 -right-10 h-32 w-32 bg-amber-200/20 rounded-full blur-3xl transition-transform group-hover/card:scale-150 duration-1000" />
                  <div className="relative z-10 flex flex-col gap-6">
                    <div className="h-12 w-12 rounded-2xl bg-emerald-950 flex items-center justify-center text-amber-500 shadow-xl self-start">
                      <Star className="h-5 w-5 fill-currentColor" />
                    </div>
                    <div>
                      <p className="text-[12px] font-black text-emerald-950 uppercase tracking-[0.2em] mb-3">Hall of Fame</p>
                      <p className="text-[11px] font-bold text-amber-900/60 leading-relaxed uppercase tracking-wider">The most loved harvests from our sustainable farm network.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </aside>
  
          {/* MAIN GRID AREA */}
          <main className="flex-1">
            <div className="flex flex-col md:flex-row items-end justify-between mb-12 md:mb-16 gap-6">
               <div className="flex flex-col gap-4 text-left w-full md:w-auto">
                  <div className="flex items-center gap-3">
                    <span className="h-[2px] w-8 bg-amber-500" />
                    <span className="text-[10px] font-black text-amber-500 uppercase tracking-[0.4rem]">Inventory catalog</span>
                  </div>
                  <h1 className="text-emerald-950 font-black tracking-tighter text-3xl md:text-5xl lg:text-6xl leading-[1.1]">
                    {activeCategory === 'All' ? 'Our Collection' : activeCategory}
                  </h1>
               </div>
               
               <div className="flex items-center justify-between md:justify-end w-full md:w-auto gap-10 border-b border-slate-100 pb-4">
                  <div className="flex flex-col items-end">
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-300">Total Finds</span>
                    <span className="text-[11px] font-black text-emerald-950 tracking-tighter">{filteredProducts.length} Treasures Found</span>
                  </div>
                  <button className="flex items-center gap-3 h-11 px-6 rounded-full bg-emerald-50 text-[10px] font-black uppercase tracking-widest text-emerald-950 hover:bg-emerald-950 hover:text-white transition-all shadow-sm">
                    Refine <SlidersHorizontal className="h-3.5 w-3.5" />
                  </button>
               </div>
            </div>
  
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8 md:gap-10">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="h-[40vh] w-full rounded-[2rem] bg-slate-50 flex flex-col items-center justify-center text-center p-12 border border-slate-100">
                <ShoppingBag className="h-10 w-10 text-slate-200 mb-6" />
                <h3 className="text-emerald-950 font-bold tracking-tight">Vault Entry Empty</h3>
                <p className="text-slate-400 text-xs max-w-xs mt-3 uppercase tracking-widest leading-loose">We haven't found any treasures in this sector yet.</p>
              </div>
            )}
  
            <div className="text-center pt-24 md:pt-32">
               <button className="h-14 px-16 rounded-full bg-emerald-950 text-white text-[10px] font-black uppercase tracking-[0.3em] hover:bg-amber-500 hover:text-emerald-950 transition-all shadow-premium group">
                 Expand Selection <ArrowRight className="h-4 w-4 group-hover:translate-x-2 transition-transform ml-4" />
               </button>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default function ProductsPage() {
  return (
    <Suspense fallback={
      <div className="w-full h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 border-4 border-emerald-950 border-t-amber-400 rounded-full animate-spin" />
          <p className="text-[10px] font-black uppercase tracking-widest text-emerald-950">Preparing Harvest...</p>
        </div>
      </div>
    }>
      <ProductsContent />
    </Suspense>
  );
}
