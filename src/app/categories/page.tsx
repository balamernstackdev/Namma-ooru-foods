'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Search, ChevronRight, Home, LayoutGrid, Sparkles, Layers, Package } from 'lucide-react';
import { API_URL } from '@/lib/api';
import MarketplaceCategoryGrid from '@/components/MarketplaceCategoryGrid';
import useSWR from 'swr';
import { motion } from 'framer-motion';
import PremiumLoader from '@/components/ui/PremiumLoader';

const fetcher = (url: string) => fetch(url, { cache: 'no-store' }).then(res => res.json());

export default function CategoriesPage() {
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch all parent categories with counts
  const { data: responseData, error, isLoading } = useSWR(
    `${API_URL}/api/categories?parentOnly=true&all=true&limit=100`,
    fetcher
  );

  const rawCategories = Array.isArray(responseData)
    ? responseData
    : (responseData && Array.isArray((responseData as any).categories) ? (responseData as any).categories : []);

  // Filter categories by search query
  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return rawCategories;
    const q = searchQuery.toLowerCase().trim();
    return rawCategories.filter((cat: any) =>
      cat.name?.toLowerCase().includes(q) ||
      cat.description?.toLowerCase().includes(q) ||
      cat.subtitle?.toLowerCase().includes(q)
    );
  }, [rawCategories, searchQuery]);

  if (isLoading) {
    return <PremiumLoader fullScreen={true} />;
  }

  return (
    <div className="w-full bg-[#f8fafc] min-h-screen flex flex-col">
      {/* BREADCRUMB BAR */}
      <div className="w-full bg-white border-b border-slate-200 sticky top-0 z-[40] shadow-xs">
        <div className="max-w-[1600px] mx-auto px-4 md:px-6 py-3 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2 font-medium">
            <Link href="/" className="hover:text-emerald-900 transition-colors flex items-center gap-1">
              <Home size={12} /> Home
            </Link>
            <ChevronRight size={12} className="opacity-60" />
            <span className="text-slate-900 font-bold uppercase tracking-wider">Categories</span>
          </div>
          <div className="flex items-center gap-2 text-slate-900 font-bold">
            <span className="bg-emerald-50 text-emerald-800 px-2.5 py-1 rounded-full text-[10px] font-mono border border-emerald-100 flex items-center gap-1">
              <Layers size={12} /> {rawCategories.length} Active Categories
            </span>
          </div>
        </div>
      </div>

      {/* HEADER SECTION */}
      <div className="w-full bg-white border-b border-slate-200/80 py-8 md:py-12">
        <div className="max-w-[1600px] mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.3em] text-emerald-700 block">
                  Our Collections
                </span>
              </div>
              <h1 className="text-2xl md:text-4xl lg:text-5xl font-black text-slate-950 tracking-tight uppercase leading-tight">
                Explore Categories
              </h1>
              <p className="text-slate-500 text-xs md:text-sm font-medium leading-relaxed">
                Discover traditional Indian staples, cold-pressed oils, hand-ground spices, and millet mixes sourced directly from village farmers.
              </p>
            </div>

            {/* REALTIME CATEGORIES SEARCH BAR */}
            <div className="w-full md:w-[360px] relative">
              <div className="relative flex items-center">
                <Search size={16} className="absolute left-4 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search categories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-11 pl-11 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-600 focus:bg-white transition-all shadow-xs"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CATEGORIES GRID SECTION */}
      <main className="flex-1 max-w-[1600px] w-full mx-auto px-4 md:px-6 py-8 md:py-12">
        {filteredCategories.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 py-16 px-6 text-center flex flex-col items-center justify-center">
            <LayoutGrid size={36} className="text-slate-300 mb-3" />
            <h3 className="text-slate-900 font-bold uppercase text-sm tracking-wider">No Categories Found</h3>
            <p className="text-slate-500 text-xs mt-1">No category matched "{searchQuery}". Try a different keyword.</p>
            <button
              onClick={() => setSearchQuery('')}
              className="mt-4 px-4 py-2 bg-emerald-800 text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-emerald-900 transition-colors"
            >
              Clear Search
            </button>
          </div>
        ) : (
          <MarketplaceCategoryGrid categories={filteredCategories} />
        )}
      </main>
    </div>
  );
}
