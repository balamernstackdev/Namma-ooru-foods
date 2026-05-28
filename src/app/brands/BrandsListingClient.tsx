'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Search, Package, ShieldCheck, ChevronRight, Award, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import useSWR from 'swr';
import { API_URL } from '@/lib/api';
import OptimizedImage from '@/components/ui/OptimizedImage';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function BrandsListingClient() {
  const [searchQuery, setSearchQuery] = useState('');

  const { data: responseData, isLoading } = useSWR(`${API_URL}/api/sub-vendors?limit=100`, fetcher);
  const brands = responseData?.subVendors || [];

  const filteredBrands = useMemo(() => {
    return brands.filter((brand: any) =>
      brand.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (brand.headVendor?.name && brand.headVendor.name.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [brands, searchQuery]);

  if (isLoading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-white">
        <div className="h-16 w-16 border-4 border-emerald-950/5 border-t-emerald-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="ent-page bg-slate-50/50 min-h-screen pb-24 lg:pb-0">

      {/* --- Standard Enterprise Header --- */}
      <div className="standard-container py-12 md:py-20">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-slate-400">
              <TrendingUp size={14} className="text-amber-500" />
              <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.2em] text-slate-400">Premium Brands</span>
            </div>
            <h1 className="text-3xl md:text-5xl lg:text-7xl font-[900] text-emerald-950 tracking-tighter uppercase leading-none">
              The <span className="text-emerald-900">Brands</span>
            </h1>
            <p className="max-w-2xl text-slate-500 text-sm md:text-lg font-bold uppercase tracking-tight opacity-70">
              Discover independent heritage brands and artisanal production units, each delivering a unique legacy of pure Products.
            </p>
          </div>

          {/* Inline Search Bar */}
          <div className="relative w-full md:w-[400px]">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search brands or vendors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-14 pl-12 pr-4 bg-white rounded-2xl border border-slate-100 text-sm font-semibold text-emerald-950 shadow-sm outline-none focus:border-emerald-500 transition-all"
            />
          </div>
        </div>

        {/* --- High Density Brand Grid --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
          {filteredBrands.map((brand: any, idx: number) => (
            <motion.div
              key={brand.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx % 10 * 0.05 }}
            >
              <Link
                href={`/brands/${encodeURIComponent(brand.slug || brand.id)}`}
                className="group block bg-white rounded-[2.5rem] p-6 transition-all hover:shadow-xl hover:-translate-y-2 border border-transparent hover:border-emerald-50 shadow-sm"
              >
                {/* Brand Logo Squircle */}
                <div className="relative aspect-square rounded-[2rem] overflow-hidden bg-slate-50 flex items-center justify-center p-8 transition-colors group-hover:bg-emerald-50/30">
                  <OptimizedImage
                    src={brand.logo || '/brand_logos/reseller_logo.webp'}
                    alt={brand.name}
                    fill
                    className="object-contain p-8 group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute top-4 right-4 h-8 w-8 rounded-full bg-white shadow-sm flex items-center justify-center text-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ShieldCheck size={16} />
                  </div>
                </div>

                <div className="mt-8 space-y-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5">
                      <Award size={12} className="text-amber-500" />
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest truncate">
                        {brand.headVendor?.name || 'Native Collective'}
                      </span>
                    </div>
                    <h3 className="text-lg md:text-2xl font-black text-emerald-950 uppercase tracking-tight line-clamp-1">
                      {brand.name}
                    </h3>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                    <div className="flex items-center gap-2">
                      <Package size={14} className="text-slate-300" />
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{brand._count?.products || 0} Products</span>
                    </div>
                    <div className="h-8 w-8 rounded-full flex items-center justify-center text-slate-200 group-hover:text-emerald-950 transition-colors">
                      <ChevronRight size={18} />
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
