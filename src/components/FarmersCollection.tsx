'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Leaf, Sparkles, ArrowRight, Filter } from 'lucide-react';
import Link from 'next/link';
import ProductCard from './ProductCard';

interface FarmersCollectionProps {
  products: any[];
}

type FilterTab = 'all' | 'grains' | 'oils' | 'honey' | 'snacks';

export default function FarmersCollection({ products }: FarmersCollectionProps) {
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const timerRef = React.useRef<NodeJS.Timeout | null>(null);
  const [isPaused, setIsPaused] = useState(false);

  // Curated categories mapping
  const filteredProducts = useMemo(() => {
    if (!products || products.length === 0) return [];

    // Filter to represent products that actually have a farmer (vendor) assigned
    const farmFreshProducts = products.filter((p: any) => {
      // Must have a farmer (vendor/brand) assigned
      const hasFarmer = !!(p.subVendor || p.subVendorId || p.brand || p.brandId);
      if (!hasFarmer) return false;

      return true;
    });

    if (activeTab === 'all') return farmFreshProducts.slice(0, 8);

    return farmFreshProducts
      .filter((p: any) => {
        const cat = (p.category?.name || p.category || '').toLowerCase();
        if (activeTab === 'grains') {
          return cat.includes('rice') || cat.includes('millet') || cat.includes('flour');
        }
        if (activeTab === 'oils') {
          return cat.includes('oil');
        }
        if (activeTab === 'honey') {
          return cat.includes('honey') || cat.includes('natural');
        }
        if (activeTab === 'snacks') {
          return cat.includes('snack') || cat.includes('murukku') || cat.includes('pickle') || cat.includes('thokku');
        }
        return true;
      })
      .slice(0, 8);
  }, [products, activeTab]);

  const tabs: { id: FilterTab; label: string }[] = [
    { id: 'all', label: 'All Products' },
    { id: 'grains', label: 'Traditional Grains' },
    { id: 'oils', label: 'Artisanal Oils' },
    { id: 'honey', label: 'Forest Honey' },
    { id: 'snacks', label: 'Native Snacks' },
  ];

  if (!products || products.length === 0) return null;

  // Auto-scroll logic
  // eslint-disable-next-line react-hooks/rules-of-hooks
  React.useEffect(() => {
    if (isPaused || filteredProducts.length === 0) return;

    const SCROLL_STEP = 316; // approx product card width + gap
    const scrollRight = () => {
      const el = scrollRef.current;
      if (!el) return;
      if (el.scrollLeft + el.clientWidth >= el.scrollWidth - 10) {
        el.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        el.scrollBy({ left: SCROLL_STEP, behavior: 'smooth' });
      }
    };

    timerRef.current = setInterval(scrollRight, 3500);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isPaused, filteredProducts.length]);

  return (
    <section className="w-full py-16 bg-stone-50 relative overflow-hidden border-y border-slate-100">
      {/* Decorative organic background assets */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-radial from-emerald-50/50 to-transparent rounded-full pointer-events-none opacity-60" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-radial from-amber-50/40 to-transparent rounded-full pointer-events-none opacity-60" />

      <div className="standard-container relative z-10">

        {/* --- HEADER BLOCK --- */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-10 gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-slate-400">
              <Leaf size={14} className="text-emerald-600 fill-emerald-600/20" />
              <span className="text-[10px] md:text-xs font-extrabold uppercase tracking-[0.35em] text-emerald-700">Direct From Native Farms</span>
            </div>
            <h2 className="text-2xl md:text-[36px] lg:text-[42px] font-[900] text-emerald-950 tracking-tighter leading-none uppercase">
              Farmers&apos; <span className="text-amber-500 italic lowercase font-serif font-normal ml-1">Collections</span>
            </h2>
            <p className="text-slate-500 text-xs md:text-sm max-w-2xl font-medium">
              Sourced directly from local farmer cooperatives, organic clusters, and small-scale tribal Producters. Pure, authentic, and 100% chemical-free.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/products"
              className="flex items-center gap-2 text-[11px] font-black text-emerald-800 hover:text-emerald-950 uppercase tracking-[0.2em] transition-all bg-white hover:bg-emerald-50 px-6 py-3.5 rounded-full border border-slate-200/80 shadow-sm hover:shadow group"
            >
              <span>Explore Full Catalog</span>
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        {/* --- INTERACTIVE MINI-PAGE FILTER BAR --- */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/60 pb-6 mb-8">
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
          <div className="flex items-center justify-center gap-2 text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest self-center md:self-auto w-full md:w-auto shrink-0 bg-white px-4 py-2.5 rounded-full border border-slate-100 shadow-sm">
            <Filter size={12} className="text-emerald-700" />
            <span>Showing {filteredProducts.length} Premium Products</span>
          </div>
        </div>

        {/* --- DYNAMIC PRODUCT GRID WITH ANIMATIONS --- */}
        <motion.div
          layout
          ref={scrollRef}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={() => setIsPaused(true)}
          onTouchEnd={() => setIsPaused(false)}
          className="flex gap-4 md:gap-8 overflow-x-auto pb-8 snap-x snap-mandatory no-scrollbar scroll-smooth"
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

        {/* Empty state fallback */}
        {filteredProducts.length === 0 && (
          <div className="w-full py-16 flex flex-col items-center justify-center text-center bg-white rounded-3xl border border-dashed border-slate-200 p-8 shadow-inner">
            <Sparkles className="text-amber-400 h-10 w-10 animate-bounce mb-4" />
            <h3 className="text-emerald-950 font-black text-lg uppercase tracking-wider mb-2">Products Coming Soon</h3>
            <p className="text-slate-400 text-xs max-w-md">
              Our small-batch organic farmers are currently preparing the next fresh Product. Check back shortly!
            </p>
          </div>
        )}

      </div>
    </section>
  );
}
