/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Filter } from 'lucide-react';
import ProductCarousel from './ProductCarousel';

interface FarmersCollectionProps {
  products: any[];
}

type FilterTab = string;

export default function FarmersCollection({ products }: FarmersCollectionProps) {
  const [activeTab, setActiveTab] = useState<FilterTab>('all');

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

    if (activeTab === 'all') return farmFreshProducts.slice(0, 12);

    return farmFreshProducts
      .filter((p: any) => {
        const catName = p.category?.name || p.category || '';
        const id = catName.toLowerCase().replace(/\s+/g, '-');
        return id === activeTab;
      })
      .slice(0, 12);
  }, [products, activeTab]);

  if (!products || products.length === 0) {
    return (
      <section className="w-full py-4 md:py-16 bg-stone-50 relative overflow-hidden border-y border-slate-100 flex justify-center">
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
    <ProductCarousel
      products={filteredProducts}
      title='Natural Farmers&apos; <span class="text-amber-500 italic lowercase font-serif font-normal ml-1">Collections</span>'
      subtitle="Direct From Native Farms"
      viewAllHref="/products"
      bgClass="bg-stone-50 relative overflow-hidden border-y border-slate-100"
      bannerType="farmer_collection"
      autoScrollInterval={4500}
    >


      {/* Filter Tabs layout rendered inside the carousel header bottom block */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/60 pb-4 mb-2 relative z-10">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 -mx-4 px-4 md:mx-0 md:px-0 scroll-smooth shrink-0">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                type="button"
                className={`relative px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-all duration-300 whitespace-nowrap shrink-0 cursor-pointer ${
                  isActive
                    ? 'text-white font-extrabold'
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

        <div className="hidden md:flex items-center justify-center gap-2 text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest bg-white px-4 py-2.5 rounded-full border border-slate-100 shadow-sm shrink-0">
          <Filter size={12} className="text-emerald-700" />
          <span>Showing {filteredProducts.length} Premium Products</span>
        </div>
      </div>
    </ProductCarousel>
  );
}
