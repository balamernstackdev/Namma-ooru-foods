'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  ShieldCheck,
  MapPin,
  Package,
  Star,
  Search,
  ChevronDown,
  Share2,
  Heart,
  Truck,
  Filter,
  CheckCircle2,
  TrendingUp,
  Globe,
  Award,
  Bookmark
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ProductCard from '@/components/ProductCard';
import OptimizedImage from '@/components/ui/OptimizedImage';
import { useToast } from '@/context/ToastContext';
import { usePlatformSettings } from '@/context/PlatformSettingsContext';
import BrandBanner from '@/components/BrandBanner';

export default function BrandDetailClient({ brand }: { brand: any }) {
  const { addToast } = useToast();
  const { settings } = usePlatformSettings();
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('popular');
  const allProducts = brand.products || [];

  const handleShare = async () => {
    const shareData = {
      title: brand.name,
      text: brand.description || `Check out ${brand.name} on namma ooru Foods!`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.error('Error sharing:', err);
        }
      }
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href);
        addToast('Success', 'Brand page link copied to clipboard!', 'success');
      } catch (err) {
        console.error('Failed to copy URL:', err);
        addToast('Error', 'Failed to copy link to clipboard', 'error');
      }
    }
  };


  // Extract unique categories
  const categoriesMap = new Map();
  allProducts.forEach((p: any) => {
    if (p.category && !categoriesMap.has(p.category.id)) {
      categoriesMap.set(p.category.id, p.category);
    }
  });
  const categories = Array.from(categoriesMap.values());

  const filteredAndSortedProducts = useMemo(() => {
    let result = [...allProducts];

    if (searchQuery) {
      result = result.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.category?.name && p.category.name.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    if (selectedCategoryId) {
      result = result.filter((p: any) => p.categoryId === selectedCategoryId);
    }

    if (sortBy === 'price-low') result.sort((a, b) => Number(a.price) - Number(b.price));
    if (sortBy === 'price-high') result.sort((a, b) => Number(b.price) - Number(a.price));

    return result;
  }, [allProducts, selectedCategoryId, searchQuery, sortBy]);

  return (
    <div className="bg-white min-h-screen">
      {/* 1. COMPACT BRAND HEADER SECTION */}
      <section className="relative w-full overflow-hidden bg-gradient-to-br from-[#f8fafc] via-[#f1f5f9] to-white border-b border-slate-200/60">
        <div className="absolute top-0 right-0 w-[40%] h-full bg-emerald-100/10 blur-[120px] rounded-full translate-x-1/4 -translate-y-1/2" />

        <div className="standard-container relative z-10 py-6 md:py-8">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6">
            <Link href="/brands" prefetch={false} className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-emerald-600 transition-colors">
              <ArrowLeft size={12} strokeWidth={3} /> Back to Brands
            </Link>
          </motion.div>

          <div className="flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative h-28 w-28 md:h-32 md:w-32 shrink-0"
            >
              <div className="absolute inset-0 bg-white rounded-3xl shadow-xl rotate-3" />
              <div className="relative h-full w-full bg-white rounded-3xl border border-slate-100 shadow-premium overflow-hidden z-10 p-2 flex items-center justify-center">
                {brand.logo ? (
                  <OptimizedImage
                    src={brand.logo}
                    alt={brand.name}
                    fill
                    className="object-contain p-4"
                    priority
                  />
                ) : (
                  <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest text-center p-2">No Logo</span>
                )}
              </div>
            </motion.div>

            <div className="flex-1 space-y-3 text-center md:text-left md:pt-4">
              <h1 className="text-3xl md:text-5xl font-[900] text-[#0f172a] tracking-tighter leading-tight uppercase">
                {brand.name}
              </h1>
              <p className="text-sm md:text-base text-slate-500 font-medium leading-relaxed max-w-2xl italic font-serif">
                "{brand.description || "Traditional heritage brand delivering authentic, farm-fresh organic products sourced with absolute integrity."}"
              </p>
              <div className="flex items-center justify-center md:justify-start pt-2">
                <button
                  onClick={handleShare}
                  className="h-10 px-5 rounded-xl bg-white border border-slate-200 text-slate-600 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-slate-50 transition-all active:scale-95 shadow-sm"
                >
                  <Share2 size={14} /> Share
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Brand Banner — renders banners with type='Brand' from admin */}
      <BrandBanner />

      {/* 2. STICKY FILTERS BAR */}
      <div className="sticky top-20 md:top-24 z-40 bg-white/90 backdrop-blur-2xl border-b border-slate-100 shadow-sm">
        <div className="standard-container">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 py-4 md:py-6">

            <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-1 flex-1 max-w-full">
              <button
                onClick={() => setSelectedCategoryId(null)}
                className={`h-11 px-6 rounded-2xl text-[11px] font-black uppercase tracking-widest whitespace-nowrap transition-all border ${selectedCategoryId === null
                  ? 'bg-[#0f172a] border-[#0f172a] text-white'
                  : 'bg-slate-50 border-slate-100 text-slate-500'
                  }`}
              >
                All Collections
              </button>
              {categories.map((cat: any) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategoryId(cat.id)}
                  className={`h-11 px-6 rounded-2xl text-[11px] font-black uppercase tracking-widest whitespace-nowrap transition-all border ${selectedCategoryId === cat.id
                    ? 'bg-[#0f172a] border-[#0f172a] text-white'
                    : 'bg-slate-50 border-slate-100 text-slate-500'
                    }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3 w-full lg:w-auto shrink-0">
              <div className="relative flex-1 lg:w-80">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search in this brand..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-11 pl-11 pr-4 bg-slate-100 rounded-2xl border-none text-sm font-semibold"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. PRODUCT GRID SECTION */}
      <section className="standard-container py-8 md:py-12 min-h-[60vh]">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div className="space-y-2">
            <h2 className="text-3xl md:text-5xl font-[900] text-[#0f172a] tracking-tight leading-none uppercase">
              {selectedCategoryId ? categories.find(c => c.id === selectedCategoryId)?.name : 'Brand products'}
            </h2>
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={`${selectedCategoryId}-${sortBy}-${searchQuery}`}
            className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-10"
          >
            {filteredAndSortedProducts.length > 0 ? (
              filteredAndSortedProducts.map((product: any, idx: number) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx % 12 * 0.04 }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))
            ) : (
              <div className="col-span-full py-20 flex flex-col items-center justify-center text-center">
                <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                  <Package size={40} className="text-slate-300" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-2">No Products Available</h3>
                <p className="text-slate-500 font-medium max-w-sm mb-8">This brand currently has no active products.</p>
                <Link href="/brands" className="h-12 px-8 rounded-xl bg-emerald-600 text-white text-[12px] font-bold uppercase tracking-wider hover:bg-emerald-700 transition-colors flex items-center justify-center">
                  Browse Other Brands
                </Link>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </section>
    </div>
  );
}
