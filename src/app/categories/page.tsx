'use client';

import React from 'react';
import { LayoutGrid, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { API_URL } from '@/lib/api';
import HeroCarousel from '@/components/HeroCarousel';
import MarketplaceCategoryGrid from '@/components/MarketplaceCategoryGrid';
import useSWR from 'swr';
import { motion } from 'framer-motion';

const fetcher = (url: string) => fetch(url).then(res => res.json());

const CategoriesPage = () => {
  // Pagination State
  const [currentPage, setCurrentPage] = React.useState(1);
  const itemsPerPage = 15; // Increased for 5-column grid (3 rows)

  // Fetch categories
  const { data: responseData, error, isLoading } = useSWR(`${API_URL}/api/categories?page=${currentPage}&limit=${itemsPerPage}`, fetcher);

  const categories = responseData?.categories || [];
  const totalPages = responseData?.totalPages || 1;

  if (isLoading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <div className="h-16 w-16 border-4 border-emerald-950/5 border-t-emerald-600 rounded-full animate-spin" />
          <p className="text-[10px] font-black uppercase tracking-widest text-emerald-950/40">Syncing Marketplace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-slate-50/30 min-h-screen">
      <HeroCarousel
        images={['banners/categories_1.png', 'banners/categories_2.png']}
        title={<>Curated <br /><span className="text-emerald-600 italic">Marketplace</span></>}
        subtitle="Explore our scientifically sourced organic collections, built to connect traditional artisans with modern wellness."
        badges={
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-emerald-600/10 backdrop-blur-md flex items-center justify-center border border-emerald-600/20">
              <Sparkles className="h-5 w-5 text-emerald-600" />
            </div>
            <span className="text-[11px] font-black uppercase tracking-[0.4em] text-emerald-600">Premium Categories</span>
          </div>
        }
      />

      <div className="w-full py-12 md:py-20 flex justify-center overflow-hidden">
        <div className="standard-container px-4">

          {/* Section Header */}
          <div className="flex flex-col md:flex-row items-end justify-between mb-12 md:mb-16 gap-6">
            <div className="max-w-2xl">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                className="flex items-center gap-2 mb-4"
              >
                <div className="h-px w-8 bg-emerald-600" />
                <span className="text-[11px] font-black uppercase tracking-widest text-emerald-600">Discovery Hub</span>
              </motion.div>
              <h2 className="text-emerald-950 tracking-tighter font-black text-3xl md:text-5xl leading-none">
                Browse By Genre
              </h2>
            </div>

            <div className="hidden md:flex items-center gap-4 bg-white p-2 rounded-2xl shadow-sm border border-slate-100">
              <div className="h-10 px-4 flex items-center gap-2 rounded-xl bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase tracking-widest">
                <LayoutGrid size={14} />
                Grid View
              </div>
            </div>
          </div>

          {/* Categories Discovery Grid */}
          <MarketplaceCategoryGrid categories={categories} />

          {/* Pagination Control */}
          {totalPages > 1 && (
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              className="mt-20 flex items-center justify-center gap-6"
            >
              <button
                disabled={currentPage === 1}
                onClick={() => { setCurrentPage(currentPage - 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                className="h-12 w-12 md:h-14 md:w-14 rounded-full border border-slate-200 flex items-center justify-center text-emerald-950 disabled:opacity-20 hover:bg-emerald-950 hover:text-white transition-all shadow-sm hover:shadow-xl hover:shadow-emerald-900/20 group"
              >
                <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
              </button>

              <div className="flex items-center gap-3">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => { setCurrentPage(page); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                    className={`h-10 w-10 md:h-12 md:w-12 rounded-full text-[12px] font-black transition-all ${currentPage === page
                        ? 'bg-emerald-600 text-white shadow-xl shadow-emerald-600/20'
                        : 'text-slate-400 hover:bg-emerald-50 hover:text-emerald-700 border border-transparent hover:border-emerald-100'
                      }`}
                  >
                    {page}
                  </button>
                ))}
              </div>

              <button
                disabled={currentPage === totalPages}
                onClick={() => { setCurrentPage(currentPage + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                className="h-12 w-12 md:h-14 md:w-14 rounded-full border border-slate-200 flex items-center justify-center text-emerald-950 disabled:opacity-20 hover:bg-emerald-950 hover:text-white transition-all shadow-sm hover:shadow-xl hover:shadow-emerald-900/20 group"
              >
                <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </motion.div>
          )}

          {/* Marketplace Stats Footer */}
          <div className="mt-24 pt-12 border-t border-slate-200 flex flex-wrap justify-center gap-12 md:gap-24 opacity-60 grayscale hover:grayscale-0 transition-all duration-700">
            <div className="flex flex-col items-center">
              <span className="text-2xl font-black text-emerald-950">25+</span>
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Service Regions</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-2xl font-black text-emerald-950">500+</span>
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Artisanal Units</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-2xl font-black text-emerald-950">2.5k+</span>
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Products</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoriesPage;
