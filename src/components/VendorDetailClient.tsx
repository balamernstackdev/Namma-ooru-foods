'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, 
  ArrowRight, 
  Package, 
  ChevronRight, 
  Search,
  ChevronDown,
  TrendingUp,
  Award,
  Store
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import OptimizedImage from '@/components/ui/OptimizedImage';
import ProductCard from '@/components/ProductCard';

export default function VendorDetailClient({ vendor }: { vendor: any }) {
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('popular');

  const subBrands = vendor.subVendors || [];

  // Aggregate all products from all sub-brands
  const allProducts = useMemo(() => {
    return subBrands.flatMap((sb: any) => 
      (sb.products || []).map((p: any) => ({
        ...p,
        subVendor: sb
      }))
    );
  }, [subBrands]);

  // Extract unique categories
  const categories = useMemo(() => {
    const catMap = new Map();
    allProducts.forEach((p: any) => {
      if (p.category && !catMap.has(p.category.id)) {
        catMap.set(p.category.id, p.category);
      }
    });
    return Array.from(catMap.values());
  }, [allProducts]);

  const filteredAndSortedProducts = useMemo(() => {
    let result = [...allProducts];

    if (searchQuery) {
      result = result.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.subVendor?.name && p.subVendor.name.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    if (selectedCategoryId) {
      result = result.filter((p: any) => p.category?.id === selectedCategoryId);
    }

    if (sortBy === 'price-low') result.sort((a, b) => Number(a.price) - Number(b.price));
    if (sortBy === 'price-high') result.sort((a, b) => Number(b.price) - Number(a.price));

    return result;
  }, [allProducts, selectedCategoryId, searchQuery, sortBy]);

  return (
    <div className="ent-page bg-slate-50/50 min-h-screen">
      
      {/* --- Standard Enterprise Header --- */}
      <div className="standard-container pt-8 pb-10 md:pt-10 md:pb-12">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-5">
          <Link href="/vendors" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-emerald-950 transition-colors">
            <ArrowLeft size={12} strokeWidth={3} /> All Vendors
          </Link>
        </motion.div>

        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12 mb-8">
          
          {/* Left: Identity */}
          <div className="flex-1 space-y-6">
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-900 text-[9px] font-black uppercase tracking-[0.1em]">
                <Store size={12} /> Marketplace Vendor
              </span>
              <span className="text-slate-400 font-bold text-[9px] uppercase tracking-widest flex items-center gap-1.5">
                <Award size={12} className="text-amber-500" /> Verified Organic Partner
              </span>
            </div>
            
            <h1 className="text-3xl md:text-5xl lg:text-7xl font-[900] text-emerald-950 tracking-tighter uppercase leading-none">
              {vendor.name}
            </h1>
          </div>
        </div>

        {/* --- Sub Brand Collection Row --- */}
        <div className="mb-20">
          <div className="flex items-center justify-between mb-10">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <TrendingUp size={14} className="text-amber-500" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Regional Ecosystem</span>
              </div>
              <h2 className="text-2xl md:text-4xl font-black text-emerald-950 tracking-tighter uppercase">Explore the Brands</h2>
            </div>
            <Link href="/brands" className="text-[10px] font-black uppercase tracking-widest text-emerald-950 hover:text-emerald-600 flex items-center gap-2 transition-all">
              View All <ArrowRight size={14} />
            </Link>
          </div>

          <div className="flex items-center gap-6 overflow-x-auto no-scrollbar pb-6 snap-x snap-mandatory">
            {subBrands.map((brand: any) => (
              <Link 
                key={brand.id}
                href={`/brands/${encodeURIComponent(brand.slug || brand.id)}`}
                className="group shrink-0 w-[185px] md:w-[320px] bg-white rounded-[2rem] md:rounded-[2.5rem] p-4 md:p-6 transition-all hover:shadow-xl hover:-translate-y-2 border border-transparent hover:border-emerald-50 shadow-sm snap-start"
              >
                <div className="relative aspect-square w-full rounded-[1.5rem] md:rounded-[2rem] overflow-hidden bg-slate-50 mb-3 md:mb-6 flex items-center justify-center p-4 md:p-8 group-hover:bg-emerald-50/30 transition-colors">
                  <OptimizedImage 
                    src={brand.logo || '/brand_logos/reseller_logo.webp'} 
                    alt={brand.name}
                    fill
                    className="object-contain p-6 group-hover:scale-110 transition-transform duration-700"
                  />
                </div>
                <p className="text-xs md:text-sm font-black text-emerald-950 truncate tracking-tight uppercase mb-2 md:mb-4">{brand.name}</p>
                <div className="flex items-center justify-between pt-2 md:pt-4 border-t border-slate-50">
                  <span className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest">{brand._count?.products || 0} Products</span>
                  <div className="h-8 w-8 rounded-full flex items-center justify-center text-slate-200 group-hover:text-emerald-950 transition-colors">
                    <ChevronRight size={18} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* --- Marketplace Toolbar --- */}
        <div className="sticky top-20 md:top-24 z-40 bg-white/90 backdrop-blur-2xl border border-slate-100 shadow-sm rounded-3xl mb-12">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 p-4 md:p-6">
            
            <div className="flex items-center gap-3 overflow-x-auto no-scrollbar flex-1">
              <button
                onClick={() => setSelectedCategoryId(null)}
                className={`h-11 px-6 rounded-2xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all border ${
                  selectedCategoryId === null 
                  ? 'bg-emerald-950 border-emerald-950 text-white shadow-xl shadow-emerald-950/10' 
                  : 'bg-slate-50 border-slate-100 text-slate-400 hover:border-slate-300'
                }`}
              >
                Full Catalog
              </button>
              {categories.map((cat: any) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategoryId(cat.id)}
                  className={`h-11 px-6 rounded-2xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all border ${
                    selectedCategoryId === cat.id 
                    ? 'bg-emerald-950 border-emerald-950 text-white shadow-xl shadow-emerald-950/10' 
                    : 'bg-slate-50 border-slate-100 text-slate-400 hover:border-slate-300'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-4 w-full lg:w-auto">
              <div className="relative flex-1 lg:w-80">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  placeholder={`Search in ${vendor.name}...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-11 pl-11 pr-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-emerald-950 outline-none focus:border-emerald-500 transition-all"
                />
              </div>
              
              <div className="relative">
                <select 
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="h-11 pl-5 pr-12 rounded-2xl bg-white border border-slate-200 text-[10px] font-black uppercase tracking-widest appearance-none outline-none cursor-pointer shadow-sm"
                >
                  <option value="popular">Popular</option>
                  <option value="price-low">Price ↑</option>
                  <option value="price-high">Price ↓</option>
                </select>
                <ChevronDown size={14} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        {/* --- Product Grid --- */}
        <div className="space-y-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <h2 className="text-2xl md:text-4xl font-[900] text-emerald-950 tracking-tighter uppercase leading-none">
              {selectedCategoryId ? categories.find(c => c.id === selectedCategoryId)?.name : 'Heritage Selection'}
            </h2>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Available: {filteredAndSortedProducts.length} items
            </p>
          </div>

          <AnimatePresence mode="wait">
            {filteredAndSortedProducts.length > 0 ? (
              <motion.div 
                key={`${selectedCategoryId}-${sortBy}-${searchQuery}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-[12px] md:gap-[28px]"
              >
                {filteredAndSortedProducts.map((product: any, idx: number) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx % 12 * 0.04 }}
                  >
                    <ProductCard product={product} />
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <div className="py-32 flex flex-col items-center justify-center gap-8 bg-white rounded-[3rem] border border-slate-100 shadow-sm">
                <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center text-slate-200">
                  <Package size={32} />
                </div>
                <div className="text-center space-y-1">
                  <p className="text-xl font-black text-emerald-950 uppercase tracking-tighter">No items found</p>
                  <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Adjust filters or search query</p>
                </div>
              </div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}
