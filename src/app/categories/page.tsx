'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, LayoutGrid, ChevronLeft, ChevronRight } from 'lucide-react';
import { API_URL } from '@/lib/api';
import HeroCarousel from '@/components/HeroCarousel';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(res => res.json());

const CategoriesPage = () => {
  // Pagination State
  const [currentPage, setCurrentPage] = React.useState(1);
  const itemsPerPage = 12;

  // Fetch with dynamic query arguments
  const { data: responseData, error } = useSWR(`${API_URL}/api/categories?page=${currentPage}&limit=${itemsPerPage}`, fetcher);

  const categories = responseData?.categories || [];
  const totalPages = responseData?.totalPages || 1;
  const paginatedCategories = Array.isArray(categories) ? categories : [];

  if (!responseData && !error) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 border-4 border-emerald-950 border-t-amber-400 rounded-full animate-spin" />
          <p className="text-[10px] font-black uppercase tracking-widest text-emerald-950">Fetching Collections...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-white min-h-screen">
      <HeroCarousel
        images={['banners/categories_1.png', 'banners/categories_2.png']}
        title={<>Organic <br /><span className="text-amber-400 italic">Collections</span></>}
        subtitle="Explore our diverse range of traditional and healthy food products, sourced directly from local artisans across India."
        badges={
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-amber-500/20 backdrop-blur-md flex items-center justify-center border border-amber-500/30">
              <LayoutGrid className="h-5 w-5 text-amber-400" />
            </div>
            <span className="text-[11px] font-black uppercase tracking-[0.4em] text-amber-500">Explore Collections</span>
          </div>
        }
      />

      <div className="w-full py-12 md:py-16 flex justify-center">
        <div className="standard-container">

          <div className="flex flex-col md:flex-row items-center md:justify-between mb-10 md:mb-16 border-b border-slate-50 pb-8 gap-10">
            <h2 className="text-emerald-950 tracking-tight font-black text-2xl md:text-4xl">Browse By Genre</h2>
            <div className="h-2 w-24 bg-amber-400 rounded-full" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
            {paginatedCategories.map((cat: any) => (
              <Link
                href={`/products?category=${cat.name}`}
                key={cat.id}
                className="group flex flex-col bg-slate-50 rounded-xl md:rounded-[3rem] border border-transparent hover:bg-white hover:border-slate-100 hover:shadow-premium hover:-translate-y-3 transition-all duration-700 overflow-hidden"
              >
                <div className="relative aspect-square w-full overflow-hidden">
                  <Image
                    src={cat.image || '/ai_images/organic_grains_1776231059575.png'}
                    alt={cat.name}
                    fill
                    className="object-cover transition-transform duration-1000 group-hover:scale-110"
                  />
                  <div className="absolute top-6 right-6 bg-emerald-950/90 backdrop-blur-md text-white px-5 py-2 rounded-full shadow-2xl">
                    <span className="text-[10px] font-black uppercase tracking-widest">{cat._count?.products || 0} Items</span>
                  </div>
                </div>

                <div className="flex flex-col flex-1 p-6 md:p-8">
                  <h3 className="text-emerald-950 tracking-tight font-black group-hover:text-amber-600 transition-colors mb-2 uppercase text-sm md:text-lg leading-tight">{cat.name}</h3>
                  <p className="text-slate-500 text-[10px] md:text-xs font-medium leading-relaxed mb-4 line-clamp-2">{cat.description}</p>

                  <div className="mt-auto pt-4 flex items-center justify-between border-t border-slate-100/50">
                    <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-emerald-950/40 group-hover:text-amber-600 transition-colors">
                      Enter Products
                    </span>
                    <div className="h-8 w-8 md:h-10 md:w-10 rounded-full bg-white border border-slate-100 flex items-center justify-center text-emerald-950 group-hover:bg-emerald-950 group-hover:text-white transition-all shadow-sm">
                      <ArrowRight className="h-3 w-3 md:h-4 md:w-4" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Pagination Control */}
          {totalPages > 1 && (
            <div className="mt-20 flex items-center justify-center gap-4">
              <button
                disabled={currentPage === 1}
                onClick={() => { setCurrentPage(currentPage - 1); window.scrollTo({ top: 400, behavior: 'smooth' }); }}
                className="h-14 px-8 rounded-2xl border border-slate-100 flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-emerald-950 disabled:opacity-20 hover:bg-slate-50 transition-all"
              >
                <ChevronLeft size={16} /> Prev
              </button>
              
              <div className="flex items-center gap-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => { setCurrentPage(page); window.scrollTo({ top: 400, behavior: 'smooth' }); }}
                    className={`h-14 w-14 rounded-2xl text-[11px] font-black transition-all ${
                      currentPage === page 
                      ? 'bg-emerald-950 text-white shadow-xl shadow-emerald-900/20' 
                      : 'text-slate-400 hover:bg-slate-50'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>

              <button
                disabled={currentPage === totalPages}
                onClick={() => { setCurrentPage(currentPage + 1); window.scrollTo({ top: 400, behavior: 'smooth' }); }}
                className="h-14 px-8 rounded-2xl border border-slate-100 flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-emerald-950 disabled:opacity-20 hover:bg-slate-50 transition-all"
              >
                Next <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CategoriesPage;
