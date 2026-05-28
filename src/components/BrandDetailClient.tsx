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

export default function BrandDetailClient({ brand }: { brand: any }) {
  const { addToast } = useToast();
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('popular');
  const [isSaved, setIsSaved] = useState(false);

  // Load saved state from localStorage on mount
  useEffect(() => {
    try {
      const savedBrands = JSON.parse(localStorage.getItem('saved_brands') || '[]');
      setIsSaved(savedBrands.includes(brand.id));
    } catch (e) {
      console.error('Failed to load saved brands:', e);
    }
  }, [brand.id]);

  const handleSaveToggle = () => {
    try {
      const savedBrands = JSON.parse(localStorage.getItem('saved_brands') || '[]');
      let updatedBrands;
      let nextSavedState;

      if (savedBrands.includes(brand.id)) {
        updatedBrands = savedBrands.filter((id: number) => id !== brand.id);
        nextSavedState = false;
        addToast('Success', `${brand.name} removed from your saved list`, 'info');
      } else {
        updatedBrands = [...savedBrands, brand.id];
        nextSavedState = true;
        addToast('Success', `${brand.name} saved to your list`, 'success');
      }

      localStorage.setItem('saved_brands', JSON.stringify(updatedBrands));
      setIsSaved(nextSavedState);
    } catch (e) {
      console.error('Failed to save brand:', e);
      addToast('Error', 'Failed to update saved brands', 'error');
    }
  };

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

  const allProducts = brand.products || [];

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

        <div className="standard-container relative z-10 py-8 md:py-14">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-8">
            <Link href="/brands" prefetch={false} className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-emerald-600 transition-colors">
              <ArrowLeft size={12} strokeWidth={3} /> Back to Brands
            </Link>
          </motion.div>

          <div className="flex flex-col md:flex-row md:items-start justify-between gap-10 md:gap-16">

            {/* Left: Brand Information */}
            <div className="flex flex-col md:flex-row items-center md:items-start gap-8 md:gap-10">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative h-36 w-36 md:h-48 md:w-48 shrink-0"
              >
                <div className="absolute inset-0 bg-white rounded-[3rem] shadow-xl rotate-3" />
                <div className="relative h-full w-full bg-white rounded-[3rem] border border-slate-100 shadow-premium overflow-hidden z-10 p-3">
                  <OptimizedImage
                    src={brand.logo || '/brand_logos/reseller_logo.webp'}
                    alt={brand.name}
                    fill
                    className="object-contain p-6"
                    priority
                  />
                </div>
                <button
                  onClick={handleSaveToggle}
                  className={`absolute -bottom-1 -right-1 text-white h-11 w-11 rounded-2xl flex items-center justify-center shadow-xl border-4 border-white z-20 transition-all hover:scale-105 active:scale-95 ${isSaved ? 'bg-rose-500 hover:bg-rose-600' : 'bg-[#059669] hover:bg-emerald-700'
                    }`}
                  aria-label="Save Brand"
                >
                  <Bookmark size={20} strokeWidth={2.5} className={isSaved ? 'fill-white' : ''} />
                </button>
              </motion.div>

              <div className="flex-1 space-y-5 text-center md:text-left">
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#064e3b] text-white text-[9px] font-black uppercase tracking-[0.15em] rounded-md">
                      <ShieldCheck size={12} className="text-emerald-400" /> Premium Organic Brand
                    </span>
                    <span className="text-emerald-700 font-bold text-[10px] uppercase tracking-widest flex items-center gap-1.5 opacity-60">
                      <Globe size={12} /> {brand.headVendor?.name || 'Native Collective'}
                    </span>
                  </div>

                  <h1 className="text-4xl md:text-6xl font-[900] text-[#0f172a] tracking-tighter leading-tight uppercase">
                    {brand.name}
                  </h1>
                </div>

                <p className="text-base md:text-lg text-slate-500 font-medium leading-relaxed max-w-xl italic font-serif">
                  "{brand.description || "Traditional heritage brand delivering authentic, farm-fresh organic products sourced with absolute integrity."}"
                </p>

                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-2">
                  <button
                    onClick={handleSaveToggle}
                    className={`h-11 px-8 rounded-xl text-[11px] font-black uppercase tracking-widest flex items-center gap-2 transition-all shadow-xl active:scale-95 ${isSaved
                      ? 'bg-rose-500 hover:bg-rose-600 text-white'
                      : 'bg-[#0f172a] hover:bg-black text-white'
                      }`}
                  >
                    <Heart size={14} className={isSaved ? 'fill-white text-white' : 'text-rose-400'} />
                    {isSaved ? 'Saved' : 'Save Brand'}
                  </button>
                  <button
                    onClick={handleShare}
                    className="h-11 px-6 rounded-xl bg-white border border-slate-200 text-slate-600 text-[11px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-slate-50 transition-all active:scale-95 shadow-sm"
                  >
                    <Share2 size={16} /> Share
                  </button>
                </div>
              </div>
            </div>

            {/* Right: Brand Metrics */}
            <div className="grid grid-cols-2 gap-4 min-w-[320px] md:min-w-[380px]">
              <div className="bg-white/80 backdrop-blur-md border border-white p-6 rounded-[2.5rem] shadow-premium-sm space-y-1">
                <div className="flex items-center gap-2 text-amber-500">
                  <Star size={18} className="fill-amber-500" />
                  <span className="text-2xl font-black text-[#0f172a]">4.9</span>
                </div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Customer Rating</div>
              </div>

              <div className="bg-white/80 backdrop-blur-md border border-white p-6 rounded-[2.5rem] shadow-premium-sm space-y-1">
                <div className="flex items-center gap-2 text-emerald-600">
                  <Package size={18} />
                  <span className="text-2xl font-black text-[#0f172a]">{allProducts.length}</span>
                </div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Live Products</div>
              </div>
            </div>
          </div>
        </div>
      </section>

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
      <section className="standard-container py-12 md:py-20 min-h-[60vh]">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
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
            {filteredAndSortedProducts.map((product: any, idx: number) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx % 12 * 0.04 }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      </section>
    </div>
  );
}
