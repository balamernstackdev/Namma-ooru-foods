'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import ProductCard from '@/components/ProductCard';
import { ArrowRight, TrendingUp, Flame, Star, Filter, SlidersHorizontal, ShoppingBag, Droplets, Utensils, Zap, X, ChevronDown, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import HeroCarousel from '@/components/HeroCarousel';
import PremiumLoader from '@/components/ui/PremiumLoader';

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
import useSWR from 'swr';
import { API_URL } from '@/lib/api';

const fetcher = (url: string) => fetch(url).then(res => res.json());

const ProductsContent = () => {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get('category');
  const [activeCategory, setActiveCategory] = useState('All');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOrder, setSortOrder] = useState<'rating' | 'price_asc' | 'price_desc'>('rating');
  const itemsPerPage = 9;

  // Fetch live products
  const { data: products, error: productsError } = useSWR(`${API_URL}/api/products`, fetcher);
  // Fetch live categories
  const { data: apiCategories } = useSWR(`${API_URL}/api/categories`, fetcher);

  const dynamicCategories = apiCategories ? ['All', ...apiCategories.map((c: any) => c.name)] : categories;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (categoryParam && dynamicCategories.includes(categoryParam)) {
      setActiveCategory(categoryParam);
    } else {
      setActiveCategory('All');
    }
  }, [categoryParam, apiCategories]);

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
    setCurrentPage(1);
  }, [activeCategory]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Find sub-categories of active category
  const activeCategoryObj = apiCategories?.find((c: any) => c.name === activeCategory);
  const subCategories = apiCategories?.filter((c: any) => c.parentId === activeCategoryObj?.id) || [];

  if (!products && !productsError) {
     return <PremiumLoader fullScreen={false} />;
  }

  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": activeCategory === 'All' ? "Organic Food Collection" : `${activeCategory} | Namma Orru Foods`,
    "description": "Explore our curated collection of authentic, organic, and farm-fresh products sourced directly from local agrarian clusters.",
    "url": `https://nammaorrufoods.com/products?category=${activeCategory}`,
    "mainEntity": {
      "@type": "ItemList",
      "itemListElement": paginatedProducts.map((p: any, idx: number) => ({
        "@type": "ListItem",
        "position": idx + 1,
        "url": `https://nammaorrufoods.com/products/${p.slug || p.id}`
      }))
    }
  };

  return (
    <div className="flex flex-col bg-white w-full min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }}
      />
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

          {/* SIDEBAR */}
          <div className={`fixed inset-0 z-[100] bg-emerald-950/40 backdrop-blur-md lg:hidden transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={() => setIsSidebarOpen(false)} />

          <aside className={`fixed lg:static lg:sticky top-0 lg:top-[120px] lg:h-[calc(100vh-140px)] left-0 w-80 bg-white lg:bg-transparent z-[201] lg:z-10 transition-transform duration-300 lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} shrink-0 overflow-y-auto no-scrollbar`}>
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
                    <span className="text-[11px] font-black uppercase tracking-[0.4em] text-emerald-950">Shop by Category</span>
                  </div>
                  <div className="flex flex-col gap-3">
                    {dynamicCategories.map((cat) => {
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
                            <span className="text-[11px] font-black uppercase tracking-wider text-left leading-tight">{cat}</span>
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
          <main className="flex-1 bg-slate-50/10 px-4 md:px-10 lg:px-12 pt-4 md:pt-10 pb-20">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-12 pb-8 border-b border-slate-100 gap-8">
               <div className="flex flex-col text-left">
                  <div className="flex items-center gap-3 mb-4">
                     <div className="h-[2px] w-8 bg-amber-500" />
                     <span className="text-[10px] font-black text-amber-600 uppercase tracking-[0.4em]">Our Harvests</span>
                  </div>
                  <h1 className="text-[#022c22] font-black tracking-tighter text-4xl md:text-5xl lg:text-7xl leading-none mb-4 uppercase">
                     {activeCategory === 'All' ? 'Collection' : activeCategory}
                  </h1>
                  <p className="text-[12px] font-medium text-slate-400 flex items-center gap-2">
                     Showing <span className="text-[#022c22] font-black">{filteredProducts.length}</span> artisanal items
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


            {paginatedProducts.length > 0 ? (
               <>
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
                      onClick={() => {
                        setCurrentPage(prev => Math.max(1, prev - 1));
                        window.scrollTo({ top: 0, behavior: 'smooth' });
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
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className={`h-12 w-12 rounded-xl text-[11px] font-bold transition-all ${currentPage === i + 1
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
                        window.scrollTo({ top: 0, behavior: 'smooth' });
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
    <Suspense fallback={<PremiumLoader fullScreen={true} />}>
      <ProductsContent />
    </Suspense>
  );
}
