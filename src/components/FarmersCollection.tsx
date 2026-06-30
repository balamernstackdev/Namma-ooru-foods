/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Leaf, Sparkles, ArrowRight, Filter } from 'lucide-react';
import Link from 'next/link';
import ProductCard from './ProductCard';
import BannerCarousel from './BannerCarousel';
import { useBanners } from '@/hooks/useBanners';
import { ChevronLeft, ChevronRight } from 'lucide-react'
interface FarmersCollectionProps {
  products: any[];
}

type FilterTab = string;

export default function FarmersCollection({ products }: FarmersCollectionProps) {
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  // Mouse drag scrolling support
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeftPos, setScrollLeftPos] = useState(0);

  const onMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = scrollRef.current;
    if (!el) return;
    setIsMouseDown(true);
    setStartX(e.pageX - el.offsetLeft);
    setScrollLeftPos(el.scrollLeft);
  };

  const onMouseLeave = () => {
    setIsMouseDown(false);
  };

  const onMouseUp = () => {
    setIsMouseDown(false);
  };

  const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isMouseDown) return;
    e.preventDefault();
    const el = scrollRef.current;
    if (!el) return;
    const x = e.pageX - el.offsetLeft;
    const walk = (x - startX) * 1.5;
    el.scrollLeft = scrollLeftPos - walk;
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      scrollLeft();
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      scrollRightManual();
    }
  };

  const checkScrollLimits = React.useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;

    // Mobile dots calculation
    const itemWidth = el.children[0]?.clientWidth || 165;
    const gap = window.innerWidth < 768 ? 16 : 32;
    const index = Math.round(el.scrollLeft / (itemWidth + gap));
    setActiveIndex(index);
  }, []);

  // Fetch dynamic banners client-side
  const { allBanners } = useBanners();
  const banners = allBanners.filter((b: any) => b.type === 'farmer_collection');

  // Dynamically generate tabs based on available products
  const tabs = useMemo(() => {
    const tabsMap = new Map<string, string>();
    tabsMap.set('all', 'All Products');

    if (!products) return Array.from(tabsMap.entries()).map(([id, label]) => ({ id, label: label as string }));

    const farmFreshProducts = products.filter((p: any) => !!(p.subVendor || p.subVendorId || p.brand || p.brandId));

    farmFreshProducts.forEach((p: any) => {
      const catName = p.category?.name || p.category;
      if (catName && typeof catName === 'string') {
        const id = catName.toLowerCase().replace(/\s+/g, '-');
        if (!tabsMap.has(id)) {
          tabsMap.set(id, catName);
        }
      }
    });

    return Array.from(tabsMap.entries()).map(([id, label]) => ({ id, label: label as string })).slice(0, 6);
  }, [products]);

  const filteredProducts = useMemo(() => {
    if (!products || products.length === 0) return [];

    // Filter to represent products that actually have a farmer (vendor) assigned
    const farmFreshProducts = products.filter((p: any) => {
      const hasFarmer = !!(p.subVendor || p.subVendorId || p.brand || p.brandId);
      if (!hasFarmer) return false;
      return true;
    });

    if (activeTab === 'all') return farmFreshProducts.slice(0, 8);

    return farmFreshProducts
      .filter((p: any) => {
        const catName = p.category?.name || p.category || '';
        const id = catName.toLowerCase().replace(/\s+/g, '-');
        return id === activeTab;
      })
      .slice(0, 8);
  }, [products, activeTab]);

  React.useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      el.addEventListener('scroll', checkScrollLimits);
      setTimeout(checkScrollLimits, 500);
    }
    return () => el?.removeEventListener('scroll', checkScrollLimits);
  }, [checkScrollLimits]);

  const scrollLeft = React.useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    if (el.scrollLeft <= 0) {
      el.scrollTo({ left: el.scrollWidth, behavior: 'smooth' });
    } else {
      el.scrollBy({ left: -316, behavior: 'smooth' });
    }
  }, []);

  const scrollRightManual = React.useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    if (el.scrollLeft + el.clientWidth >= el.scrollWidth - 10) {
      el.scrollTo({ left: 0, behavior: 'smooth' });
    } else {
      el.scrollBy({ left: 316, behavior: 'smooth' });
    }
  }, []);

  if (!products || products.length === 0) {
    return (
      <section className="w-full py-4 md:py-16 bg-stone-50 relative overflow-hidden border-y border-slate-100">
        <div className="standard-container w-full flex flex-col items-center justify-center py-16 px-4 bg-white/50 backdrop-blur-sm rounded-[32px] border border-dashed border-slate-200">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
            <span className="text-2xl">📦</span>
          </div>
          <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight mb-2">No Products Available</h3>
          <p className="text-slate-500 font-medium text-sm text-center max-w-sm">
            There are currently no products available in this farmers collection. Please check back later.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="w-full py-4 md:py-16 bg-stone-50 relative overflow-hidden border-y border-slate-100">
      {/* Decorative organic background assets */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-radial from-emerald-50/50 to-transparent rounded-full pointer-events-none opacity-60" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-radial from-amber-50/40 to-transparent rounded-full pointer-events-none opacity-60" />

      <div className="standard-container relative z-10">

        {/* --- HEADER BLOCK --- */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-2 md:mb-10 gap-3 md:gap-6">
          <div className="space-y-1 md:space-y-3">
            <div className="flex items-center gap-2 text-slate-400">
              <Leaf size={14} className="text-emerald-600 fill-emerald-600/20" />
              <span className="text-[10px] md:text-xs font-extrabold uppercase tracking-[0.35em] text-emerald-700">Direct From Native Farms</span>
            </div>
            <h2 className="text-2xl md:text-[36px] lg:text-[42px] font-[900] text-emerald-950 tracking-tighter leading-none uppercase">
              Natural Farmers&apos; <span className="text-amber-500 italic lowercase font-serif font-normal ml-1">Collections</span>
            </h2>
            <p className="hidden md:block text-slate-500 text-xs md:text-sm max-w-2xl font-medium">
              Sourced directly from local farmer cooperatives, organic clusters, and small-scale tribal Producters. Pure, authentic, and 100% chemical-free.
            </p>
          </div>

          <div className="hidden md:flex items-center gap-4">
            <Link
              href="/products"
              className="flex items-center gap-2 text-[11px] font-black text-emerald-800 hover:text-emerald-950 uppercase tracking-[0.2em] transition-all bg-white hover:bg-emerald-50 px-6 py-3.5 rounded-full border border-slate-200/80 shadow-sm hover:shadow group"
            >
              <span>Explore Full Catalog</span>
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </Link>

            {/* Redesigned Carousel Navigation Arrows */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={scrollLeft}
                aria-label="Previous"
                className="w-11 h-11 rounded-full bg-white border border-[#E5E7EB] shadow-[0_8px_24px_rgba(0,0,0,0.08)] flex items-center justify-center text-slate-800 hover:bg-[#0F8A5F] hover:text-white hover:border-[#0F8A5F] transition-all duration-300 hover:scale-105 focus:outline-none shrink-0"
              >
                <ChevronLeft size={20} strokeWidth={2.5} />
              </button>
              <button
                type="button"
                onClick={scrollRightManual}
                aria-label="Next"
                className="w-11 h-11 rounded-full bg-white border border-[#E5E7EB] shadow-[0_8px_24px_rgba(0,0,0,0.08)] flex items-center justify-center text-slate-800 hover:bg-[#0F8A5F] hover:text-white hover:border-[#0F8A5F] transition-all duration-300 hover:scale-105 focus:outline-none shrink-0"
              >
                <ChevronRight size={20} strokeWidth={2.5} />
              </button>
            </div>
          </div>
        </div>

        {/* Banners (if present) */}
        {banners && banners.length > 0 && (
          <div className="mb-4">
            <BannerCarousel banners={banners} />
          </div>
        )}

        {/* --- INTERACTIVE MINI-PAGE FILTER BAR --- */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/60 pb-2 md:pb-6 mb-2 md:mb-8">
          {/* Scrollable Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 -mx-4 px-4 md:mx-0 md:px-0 scroll-smooth shrink-0">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-all duration-300 whitespace-nowrap shrink-0 ${isActive
                    ? 'text-white'
                    : 'text-slate-500 hover:text-emerald-900 bg-white hover:bg-slate-100/50 border border-slate-200/80'
                    }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeFarmersTab"
                      className="absolute inset-0 bg-emerald-800 rounded-full z-0 shadow-md shadow-emerald-900/10"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10">{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Items Counter */}
          <div className="hidden md:flex items-center justify-center gap-2 text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest self-center md:self-auto w-full md:w-auto shrink-0 bg-white px-4 py-2.5 rounded-full border border-slate-100 shadow-sm">
            <Filter size={12} className="text-emerald-700" />
            <span>Showing {filteredProducts.length} Premium Products</span>
          </div>
        </div>

        {/* --- DYNAMIC PRODUCT GRID WITH ANIMATIONS --- */}
        <div className="relative group/carousel w-full">
          <motion.div
            layout
            ref={scrollRef}
            onMouseDown={onMouseDown}
            onMouseLeave={onMouseLeave}
            onMouseUp={onMouseUp}
            onMouseMove={onMouseMove}
            onKeyDown={onKeyDown}
            tabIndex={0}
            className="flex gap-4 md:gap-8 overflow-x-auto pb-4 md:pb-8 snap-x snap-mandatory no-scrollbar scroll-smooth px-[10px] md:px-[20px] xl:px-[70px] cursor-grab active:cursor-grabbing focus:outline-none"
          >
            <AnimatePresence mode="popLayout">
              {filteredProducts.map((product) => (
                <motion.div
                  key={product.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.35, ease: 'easeOut' }}
                  className="w-[165px] md:w-[300px] shrink-0 snap-start h-full"
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Mobile Pagination Dots */}
        <div className="md:hidden flex justify-center gap-1.5 mt-[-10px] mb-4">
          {filteredProducts.slice(0, 10).map((_, idx) => (
            <div
              key={idx}
              className={`h-1.5 rounded-full transition-all duration-300 ${idx === activeIndex ? 'w-4 bg-[#0f9d58]' : 'w-1.5 bg-slate-300'}`}
            />
          ))}
        </div>

        {/* Empty state fallback */}
        {filteredProducts.length === 0 && (
          <div className="w-full py-16 flex flex-col items-center justify-center text-center bg-white rounded-3xl border border-dashed border-slate-200 p-8 shadow-inner">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
              <span className="text-2xl">📦</span>
            </div>
            <h3 className="text-emerald-950 font-black text-lg uppercase tracking-wider mb-2">No Products Available</h3>
            <p className="text-slate-400 text-xs max-w-md">
              There are currently no products available for this filter. Please check back later.
            </p>
          </div>
        )}

      </div>
    </section>
  );
}
