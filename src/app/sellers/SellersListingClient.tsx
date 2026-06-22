'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Search, Package, ChevronRight, LayoutGrid, ArrowRight, Store } from 'lucide-react';
import { motion } from 'framer-motion';
import useSWR from 'swr';
import { API_URL } from '@/lib/api';
import OptimizedImage from '@/components/ui/OptimizedImage';
import { usePlatformSettings } from '@/context/PlatformSettingsContext';

const fetcher = (url: string) => fetch(url).then(res => res.json());

const formatName = (name: string) => {
  if (!name) return '';
  return name
    .replace(/[-_]+/g, ' ')
    .split(' ')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
};

export default function SellersListingClient() {
  const [searchQuery, setSearchQuery] = useState('');
  const { settings } = usePlatformSettings();

  // Fetch sub-vendors (brands/sellers) — never expose head-vendor groups
  const { data: responseData, isLoading } = useSWR(
    `${API_URL}/api/sub-vendors?limit=200`,
    fetcher
  );
  const sellers = (responseData?.subVendors || []) as any[];

  const filtered = useMemo(() =>
    sellers.filter((s: any) =>
      s.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.description?.toLowerCase().includes(searchQuery.toLowerCase())
    ), [sellers, searchQuery]);

  if (isLoading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <div className="h-16 w-16 border-4 border-emerald-950/5 border-t-emerald-600 rounded-full animate-spin" />
          <p className="text-[11px] font-black uppercase tracking-[0.3em] text-emerald-950/30">Loading Sellers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen pb-24 lg:pb-0">

      {/* ─── SIMPLE HEADER ─── */}
      <div className="standard-container pt-10 pb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h1 className="text-3xl md:text-5xl font-[900] text-emerald-950 tracking-tighter uppercase leading-none">
            Our Sellers
          </h1>

          {/* Search */}
          <div className="relative w-full sm:w-[320px]">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search sellers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-12 pl-11 pr-4 bg-slate-50 rounded-2xl border border-slate-100 text-sm font-semibold text-emerald-950 placeholder:text-slate-400 outline-none focus:border-emerald-400 transition-all"
            />
          </div>
        </div>
      </div>

      {/* ─── SELLER GRID ─── */}
      <div className="standard-container py-12 md:py-16">
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 md:gap-6">
            {filtered.map((seller: any, idx: number) => (
              <motion.div
                key={seller.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: (idx % 12) * 0.04, duration: 0.4 }}
              >
                <Link
                  href={`/sellers/detail?slug=${encodeURIComponent(seller.slug || seller.id)}`}
                  className="group flex flex-col bg-white rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 overflow-hidden"
                >
                  {/* Logo area */}
                  <div className="relative aspect-[4/3] bg-slate-50 flex items-center justify-center p-8 group-hover:bg-emerald-50/40 transition-colors overflow-hidden">
                    <OptimizedImage
                      src={seller.logo || settings.logo || '/logo.webp'}
                      alt={seller.name}
                      fill
                      className="object-contain p-6 group-hover:scale-105 transition-transform duration-500"
                    />
                    {/* Verified badge */}
                    <div className="absolute top-4 right-4 h-7 w-7 rounded-full bg-white shadow flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="h-3 w-3 rounded-full bg-emerald-500" />
                    </div>
                  </div>

                  {/* Info */}
                  <div className="flex flex-col flex-1 p-5 gap-3">
                    <div>
                      <h3 className="text-base font-[900] text-emerald-950 tracking-tight line-clamp-2 leading-snug group-hover:text-emerald-700 transition-colors">
                        {formatName(seller.name)}
                      </h3>
                      {seller.description && (
                        <p className="mt-1.5 text-[12px] font-medium text-slate-400 line-clamp-2 leading-relaxed">
                          {seller.description}
                        </p>
                      )}
                    </div>

                    {/* Stats row */}
                    <div className="flex items-center gap-4 pt-3 border-t border-slate-50 mt-auto">
                      <div className="flex items-center gap-1.5">
                        <Package size={13} className="text-slate-300 shrink-0" />
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                          {seller._count?.products ?? 0} Products
                        </span>
                      </div>
                      {seller._count?.categories != null && (
                        <div className="flex items-center gap-1.5">
                          <LayoutGrid size={13} className="text-slate-300 shrink-0" />
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                            {seller._count.categories} Categories
                          </span>
                        </div>
                      )}
                    </div>

                    {/* CTA */}
                    <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-emerald-600 group-hover:text-emerald-700 transition-colors pt-1">
                      <span>View Products</span>
                      <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="py-24 flex flex-col items-center gap-4 text-center">
            <div className="h-20 w-20 rounded-[1.5rem] bg-slate-50 flex items-center justify-center">
              <Store size={28} className="text-slate-200" />
            </div>
            <h2 className="text-xl font-[900] text-slate-800 uppercase tracking-tighter">No Sellers Found</h2>
            <p className="text-slate-400 font-semibold max-w-xs">
              {searchQuery ? `No results for "${searchQuery}"` : 'Sellers will appear here once added.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
