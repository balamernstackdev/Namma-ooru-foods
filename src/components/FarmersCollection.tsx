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
    return null;
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
    />
  );
}
