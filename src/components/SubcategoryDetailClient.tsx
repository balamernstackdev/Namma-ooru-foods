'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Sparkles, LayoutGrid, Award, ShieldCheck } from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import { motion, AnimatePresence } from 'framer-motion';

interface SubcategoryDetailClientProps {
  subcategoryId: string;
  subcategory: {
    id: number;
    name: string;
    imageUrl: string | null;
    metaDescription?: string | null;
    category?: { id: number; name: string; slug: string | null };
  };
  subcategoryProducts: any[];
}

export default function SubcategoryDetailClient({ subcategoryId, subcategory, subcategoryProducts }: SubcategoryDetailClientProps) {
  const subcategoryName = subcategory?.name || subcategoryId
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  const subcategoryDesc = subcategory?.metaDescription || `Premium selection of organic items under ${subcategoryName.toLowerCase()} category.`;
  const bannerImage = subcategory?.imageUrl;

  return (
    <div className="flex flex-col bg-white w-full min-h-screen font-sans">
      {/* Breadcrumbs */}
      <div className="w-full bg-slate-50 border-b border-slate-100 py-3">
        <div className="standard-container px-4">
          <div className="flex items-center gap-2">
            <Link href="/categories" className="inline-flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-emerald-700 transition-colors">
              <ArrowLeft size={12} /> Catalog
            </Link>
            {subcategory?.category && (
              <>
                <span className="text-slate-300 text-[10px] font-black">/</span>
                <Link 
                  href={`/categories/${subcategory.category.slug || subcategory.category.id}`} 
                  className="inline-flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-emerald-700 transition-colors"
                >
                  {subcategory.category.name}
                </Link>
              </>
            )}
            <span className="text-slate-300 text-[10px] font-black">/</span>
            <span className="text-emerald-700 text-[9px] font-black uppercase tracking-[0.2em]">{subcategoryName}</span>
          </div>
        </div>
      </div>

      {/* Dynamic Subcategory Banner */}
      {bannerImage ? (
        <div className="w-full py-6 flex justify-center animate-in fade-in duration-700">
          <div className="standard-container px-4">
            <div className="relative w-full aspect-[2.2/1] md:aspect-[1400/320] rounded-3xl overflow-hidden group shadow-lg bg-slate-100 border border-slate-200">
              <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/45 to-transparent z-10" />
              <Image
                src={bannerImage}
                alt={subcategoryName}
                fill
                priority
                className="w-full h-full object-cover transition-transform duration-[2000ms] group-hover:scale-103"
                unoptimized
              />
              <div className="absolute inset-0 flex flex-col justify-center px-6 md:px-16 z-20 max-w-xl md:max-w-2xl text-left">
                <div className="flex items-center gap-2 mb-2">
                  <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
                  <span className="text-amber-400 text-[10px] md:text-xs font-black uppercase tracking-[0.3em] drop-shadow-md">
                    Sub-Category Offerings
                  </span>
                </div>
                <h1 className="text-white text-2xl md:text-5xl font-black mb-3 leading-tight tracking-tighter uppercase drop-shadow-lg">
                  {subcategoryName}
                </h1>
                <p className="text-white/80 text-[11px] md:text-sm font-medium mb-4 line-clamp-3 leading-relaxed drop-shadow">
                  {subcategoryDesc}
                </p>
                <div className="flex flex-wrap items-center gap-4 text-white/90 text-[10px] font-black uppercase tracking-wider">
                  <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10">
                    <Award size={12} className="text-amber-400" />
                    <span>100% Native</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10">
                    <ShieldCheck size={12} className="text-emerald-400" />
                    <span>Chemical-Free</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="w-full py-8 bg-slate-50 border-b border-slate-100 flex justify-center">
          <div className="standard-container px-4">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="h-4 w-4 text-emerald-600" />
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Sub-Category offerings</span>
              </div>
              <h1 className="text-3xl md:text-5xl font-[900] text-emerald-950 uppercase tracking-tighter mb-4">{subcategoryName}</h1>
              <p className="text-slate-500 font-medium text-xs md:text-sm leading-relaxed">{subcategoryDesc}</p>
            </div>
          </div>
        </div>
      )}

      {/* Products Catalog Grid */}
      <div className="w-full py-6">
        <div className="standard-container px-4">
          <div className="flex items-center justify-between mb-6 pb-3 border-b border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Showing {subcategoryProducts.length} premium item{subcategoryProducts.length === 1 ? '' : 's'}
            </span>
            <div className="flex items-center gap-2 text-slate-400 text-[10px] font-black uppercase tracking-widest">
              <LayoutGrid size={14} className="text-emerald-800" /> Grid Layout
            </div>
          </div>

          <AnimatePresence mode="popLayout">
            {subcategoryProducts.length > 0 ? (
              <motion.div 
                layout
                className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2.5 sm:gap-4 lg:gap-6"
              >
                {subcategoryProducts.map((product) => (
                  <motion.div
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    key={product.id}
                  >
                    <ProductCard product={product} />
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center text-center py-20 bg-slate-50 rounded-3xl border border-slate-100 mt-6"
              >
                <div className="h-20 w-20 rounded-full bg-white flex items-center justify-center shadow-sm text-3xl mb-6">
                  🌾
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-2">No Products Available</h3>
                <p className="text-sm text-slate-400 max-w-xs leading-relaxed">
                  We are updating this specific collection. Please check back shortly or explore other categories.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
