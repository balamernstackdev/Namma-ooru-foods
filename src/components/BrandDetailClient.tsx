'use client';

import React from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ArrowLeft, ShieldCheck } from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import OptimizedImage from '@/components/ui/OptimizedImage';

export default function BrandDetailClient({ brand }: { brand: any }) {
  const searchParams = useSearchParams();
  const selectedCategoryId = searchParams.get('category');

  const allProducts = brand.products || [];
  
  // Extract unique categories from products
  const categoriesMap = new Map();
  allProducts.forEach((p: any) => {
    if (p.category && !categoriesMap.has(p.category.id)) {
      categoriesMap.set(p.category.id, p.category);
    }
  });
  const categories = Array.from(categoriesMap.values());

  const filteredProducts = selectedCategoryId 
    ? allProducts.filter((p: any) => p.categoryId === parseInt(selectedCategoryId))
    : [];

  const selectedCategory = categories.find(c => c.id === parseInt(selectedCategoryId || '0'));

  return (
    <div className="bg-[#fffefc] min-h-screen w-full flex justify-center">
      <div className="standard-container pt-2 md:pt-4 pb-10 space-y-2 md:space-y-4">
        
        {/* Navigation Breadcrumb */}
        <Link href="/brands" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-emerald-600 transition-colors">
           <ArrowLeft size={14} /> Back to Partners
        </Link>

        {/* Brand Hero Header */}
        <div className="relative bg-white rounded-3xl md:rounded-[3rem] border border-slate-100 p-6 md:p-8 shadow-premium overflow-hidden">
           <div className="absolute top-0 right-0 p-8 text-slate-100 rotate-12 -translate-y-6 translate-x-6 pointer-events-none">
              <ShieldCheck size={400} />
           </div>
           
           <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-6 text-center md:text-left">
              <div className="h-40 w-40 md:h-48 md:w-48 rounded-[2.5rem] bg-slate-50 border-4 border-white shadow-2xl overflow-hidden shrink-0">
                 <img src={brand.logo || '/brand_logos/reseller_logo.webp'} className="w-full h-full object-cover" alt={brand.name} />
              </div>
              
              <div className="flex-1 space-y-2 pt-0">
                 <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                    <div className="space-y-1">
                       <span className="text-[11px] font-black uppercase tracking-[0.4em] text-amber-500">Verified Business Partner</span>
                       <h1 className="text-4xl md:text-6xl font-black text-emerald-950 tracking-tighter">{brand.name}</h1>
                    </div>
                 </div>
                 
                 <p className="text-base md:text-lg text-slate-500 font-medium leading-snug max-w-3xl">
                    {brand.description || "Authentic producer from our network of local farmers and artisans."}
                 </p>
              </div>
           </div>
        </div>

        {/* Dynamic Section */}
        {!selectedCategoryId ? (
           <div className="space-y-6">
              <div className="text-center md:text-left">
                 <span className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400 mb-2 inline-block">Departmental Mapping</span>
                 <h2 className="text-3xl md:text-4xl font-black text-emerald-950 tracking-tight">Explore Categories</h2>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                 {categories.map((cat: any) => (
                    <Link 
                       key={cat.id} 
                       href={`/brands/${brand.id}?category=${cat.id}`}
                       className="group bg-white p-6 md:p-8 rounded-[2.5rem] border border-slate-100 flex flex-col items-center gap-4 hover:shadow-premium transition-all duration-500 hover:-translate-y-1"
                    >
                       <div className="relative h-24 w-24 md:h-32 md:w-32 rounded-full bg-slate-50 flex items-center justify-center border-4 border-white shadow-lg overflow-hidden group-hover:border-amber-400 group-hover:scale-105 transition-all duration-700">
                          <OptimizedImage 
                            src={cat.image} 
                            alt={cat.name}
                            fill
                            className="object-cover transition-transform duration-700 group-hover:scale-110" 
                            fallback="/ai_images/organic_grains_1776231059575.png"
                          />
                       </div>
                       <h3 className="text-lg md:text-xl font-bold text-emerald-950 tracking-tight group-hover:text-amber-600 transition-colors">{cat.name}</h3>
                       <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                          {allProducts.filter((p: any) => p.categoryId === cat.id).length} Products
                       </span>
                    </Link>
                 ))}
              </div>
           </div>
        ) : (
           <div className="space-y-12">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-100">
                 <div>
                    <Link href={`/brands/${brand.id}`} className="text-emerald-600 font-black text-[10px] uppercase tracking-widest mb-2 inline-block">← All Categories</Link>
                    <h2 className="text-3xl md:text-5xl font-black text-emerald-950 tracking-tighter">{selectedCategory?.name}</h2>
                 </div>
                 <span className="px-6 py-2 rounded-full bg-emerald-50 text-emerald-600 font-black text-[10px] uppercase tracking-[0.2em]">{filteredProducts.length} Items Found</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-10">
                 {filteredProducts.map((product: any) => (
                    <ProductCard key={product.id} product={product} />
                 ))}
              </div>
           </div>
        )}
      </div>
    </div>
  );
}
