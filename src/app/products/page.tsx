'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import ProductCard from '@/components/ProductCard';
import { ArrowRight, TrendingUp, Flame, Star, Filter, SlidersHorizontal, ShoppingBag, Droplets, Utensils, Zap, X } from 'lucide-react';
import { PRODUCTS } from '@/lib/staticData';
import HeroCarousel from '@/components/HeroCarousel';

const categories = ['All', 'Grains & Pulses', 'Organic Oils', 'Authentic Spices', 'Dairy Products', 'Indian Snacks', 'Local Sweets'];

const categoryIcons: { [key: string]: any } = {
  'All': ShoppingBag,
  'Grains & Pulses': TrendingUp,
  'Organic Oils': Droplets,
  'Authentic Spices': Star,
  'Dairy Products': ShoppingBag,
  'Indian Snacks': Zap,
  'Local Sweets': Utensils
};

const ProductsContent = () => {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get('category');
  const [activeCategory, setActiveCategory] = useState('All');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;


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

  useEffect(() => {
    setCurrentPage(1); // Reset to first page on category change
  }, [activeCategory]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );


  return (
    <div className="flex flex-col bg-white w-full min-h-screen">
      <HeroCarousel
        images={['banners/products_1.png', 'banners/products_2.png']}
        title={<>Pure <br /><span className="text-amber-400 italic"> Organic  </span> Products</>}
        subtitle="Experience the complete collection of Namma Orru's artisanal Items. Authentic, organic, and direct from the soil."
        badges={
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-emerald-400/20 backdrop-blur-md flex items-center justify-center border border-emerald-400/30">
              <ShoppingBag className="h-5 w-5 text-emerald-300" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-300">Explore Products</span>
          </div>
        }
      />

      <div className="w-full flex justify-center border-t border-slate-100 relative">
        <div className="standard-container flex flex-col lg:flex-row gap-8 lg:gap-14 pt-2 md:pt-6 pb-6">


          {/* MOBILE TOGGLE BAR */}
          <div className="lg:hidden flex items-center justify-between p-4 bg-slate-50 rounded-2xl mb-4">
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

          <aside className={`fixed lg:sticky top-0 lg:top-[120px] left-0 h-full lg:h-fit w-72 bg-white lg:bg-transparent z-[201] lg:z-10 p-8 lg:p-0 transition-transform duration-300 lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} shrink-0 overflow-y-auto lg:overflow-visible`}>
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between mb-10 lg:hidden mt-20">
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-950">Refine Your Search</span>
                <button onClick={() => setIsSidebarOpen(false)} className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-12">
                <div className="flex flex-col">
                  <div className="flex items-center gap-3 mb-8 px-2">
                    <div className="h-2 w-2 rounded-full bg-amber-500" />
                    <span className="text-[11px] font-black uppercase tracking-[0.4em] text-emerald-950">Catalog Genre</span>
                  </div>
                  <div className="flex flex-col gap-3">
                    {categories.map((cat) => {
                      const Icon = categoryIcons[cat] || Star;
                      const isActive = activeCategory === cat;
                      return (
                        <button
                          key={cat}
                          onClick={() => {
                            setActiveCategory(cat);
                            setIsSidebarOpen(false);
                          }}
                          className={`group flex items-center justify-between px-6 py-4 rounded-[2rem] transition-all duration-500 ${isActive
                            ? 'bg-[#06241c] text-white shadow-xl shadow-emerald-950/20 translate-x-2'
                            : 'bg-white border border-slate-50 text-slate-400 hover:shadow-lg hover:shadow-slate-100 hover:text-emerald-950'
                            }`}
                        >
                          <div className="flex items-center gap-4">
                            <Icon className={`h-4 w-4 ${isActive ? 'text-amber-400' : 'text-slate-300 group-hover:text-emerald-950'}`} />
                            <span className="text-[11px] font-black uppercase tracking-widest">{cat}</span>
                          </div>
                          <ArrowRight className={`h-3.5 w-3.5 transition-all duration-500 ${isActive ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 ml-2'}`} />
                        </button>
                      );
                    })}
                  </div>
                </div>


              </div>
            </div>
          </aside>

          {/* MAIN GRID AREA */}
          <main className="flex-1 bg-slate-50/10 px-0 md:px-4 lg:px-6 pt-4 lg:pt-6 pb-6">
            <div className="flex flex-col md:flex-row items-end justify-between mb-4 md:mb-8 gap-6 px-4 md:px-0">
              <div className="flex flex-col gap-5 text-left w-full md:w-auto">
                <div className="flex items-center gap-4">
                  <div className="h-[2px] w-10 bg-amber-500" />
                  <span className="text-[11px] font-black text-amber-500 uppercase tracking-[0.4rem]">Inventory catalog</span>
                </div>
                <h1 className="text-[#022c22] font-black tracking-tighter text-5xl md:text-6xl lg:text-[5.5rem] leading-[0.9]">
                  {activeCategory === 'All' ? 'Our Collection' : activeCategory}
                </h1>
              </div>

              <div className="flex items-center justify-between md:justify-end w-full md:w-auto gap-8 border-b border-slate-100 pb-8">
                <div className="flex flex-col items-end">
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Total Finds</span>
                  <span className="text-[12px] font-black text-[#022c22] tracking-tighter">{filteredProducts.length} Items Found</span>
                </div>
                <button className="flex items-center gap-3 h-14 px-8 rounded-full bg-emerald-50 border border-emerald-100/50 text-[11px] font-black uppercase tracking-widest text-[#022c22] hover:bg-[#022c22] hover:text-white transition-all shadow-sm">
                  Refine <SlidersHorizontal className="h-4 w-4" />
                </button>
              </div>
            </div>



            {paginatedProducts.length > 0 ? (
              <>
                <div className="grid grid-cols-2 xl:grid-cols-3 gap-4 md:gap-10">
                  {paginatedProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                {/* Pagination Component */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-8 md:mt-12">

                    <button
                      disabled={currentPage === 1}
                      onClick={() => {
                        setCurrentPage(prev => Math.max(1, prev - 1));
                        window.scrollTo({ top: 400, behavior: 'smooth' });
                      }}
                      className="h-12 w-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-emerald-950 disabled:opacity-30 transition-all hover:bg-emerald-50 active:scale-90"
                    >
                      <ArrowRight className="rotate-180" size={18} />
                    </button>

                    {[...Array(totalPages)].map((_, i) => (
                      <button
                        key={i + 1}
                        onClick={() => {
                          setCurrentPage(i + 1);
                          window.scrollTo({ top: 400, behavior: 'smooth' });
                        }}
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
                      onClick={() => {
                        setCurrentPage(prev => Math.min(totalPages, prev + 1));
                        window.scrollTo({ top: 400, behavior: 'smooth' });
                      }}
                      className="h-12 w-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-emerald-950 disabled:opacity-30 transition-all hover:bg-emerald-50 active:scale-90"
                    >
                      <ArrowRight size={18} />
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="h-[40vh] w-full rounded-[2rem] bg-slate-50 flex flex-col items-center justify-center text-center p-12 border border-slate-100">
                <ShoppingBag className="h-10 w-10 text-slate-200 mb-6" />
                <h3 className="text-emerald-950 font-bold tracking-tight">Products Entry Empty</h3>
                <p className="text-slate-400 text-xs max-w-xs mt-3 uppercase tracking-widest leading-loose">We haven't found any Items in this sector yet.</p>
              </div>
            )}


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
