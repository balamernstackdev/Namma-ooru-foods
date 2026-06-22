'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Sparkles, LayoutGrid, Award, ShieldCheck } from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import { motion, AnimatePresence } from 'framer-motion';
import { useBanners } from '@/hooks/useBanners';

interface CategoryDetailClientProps {
  categoryId: string;
  category: {
    id: number;
    name: string;
    description: string | null;
    image: string | null;
    banner_image: string | null;
    children?: { id: number; name: string; slug: string | null }[];
    subcategories?: { id: number; name: string; slug: string | null }[];
  };
  categoryProducts: any[];
}

export default function CategoryDetailClient({ categoryId, category, categoryProducts }: CategoryDetailClientProps) {
  const [selectedSubcategoryId, setSelectedSubcategoryId] = React.useState<number | null>(null);

  // Use either children or subcategories list
  const subcategoriesList = category?.children || category?.subcategories || [];

  // Filter products by subcategory if selected
  const displayedProducts = selectedSubcategoryId
    ? categoryProducts.filter((p: any) => p.subcategoryId === selectedSubcategoryId || p.category?.id === selectedSubcategoryId)
    : categoryProducts;

  const categoryName = category?.name || categoryId
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  const { categoryBanners } = useBanners();
  const activeBanners = categoryBanners.filter((b: any) => b.isActive !== false);
  const matchedBanner = activeBanners?.[0] || null;

  const categoryDesc = category?.description || `Premium selection of organic ${categoryName.toLowerCase()} sourced directly from native farms.`;
  const bannerImage = matchedBanner?.banner_image || category?.banner_image;
  const bannerTitle = matchedBanner?.title || categoryName;
  const bannerSubtitle = matchedBanner?.subtitle || categoryDesc;
  const bannerTagline = matchedBanner?.tagline || "Agrarian Collection";
  const bannerLink = matchedBanner?.link || null;
  const buttonText = matchedBanner?.buttonText || "Shop Now";

  return (
    <div className="flex flex-col bg-white w-full min-h-screen font-sans">
      {/* Breadcrumbs */}
      <div className="w-full bg-slate-50 border-b border-slate-100 py-3">
        <div className="standard-container px-4">
          <Link href="/categories" className="inline-flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-emerald-700 transition-colors">
            <ArrowLeft size={12} /> Back to Catalog
          </Link>
        </div>
      </div>

      {/* Premium Dynamic Category Banner */}
      {bannerImage ? (
        <div className="w-full py-6 flex justify-center animate-in fade-in duration-700">
          <div className="standard-container px-4">
            <div className="relative w-full aspect-[2.2/1] md:aspect-[1400/320] rounded-3xl overflow-hidden group shadow-lg bg-slate-100 border border-slate-200">
              {/* Dark gradient overlay for text readability */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/45 to-transparent z-10" />

              {/* Banner Image */}
              <Image
                src={bannerImage}
                alt={bannerTitle}
                fill
                priority
                className="w-full h-full object-cover transition-transform duration-[2000ms] group-hover:scale-103"
                unoptimized
              />

              {/* Overlaid Banner Content */}
              <div className="absolute inset-0 flex flex-col justify-center px-6 md:px-16 z-20 max-w-xl md:max-w-2xl text-left">
                <div className="flex items-center gap-2 mb-2">
                  <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
                  <span className="text-amber-400 text-[10px] md:text-xs font-black uppercase tracking-[0.3em] drop-shadow-md">
                    {bannerTagline}
                  </span>
                </div>
                
                <h1 className="text-white text-2xl md:text-5xl font-black mb-3 leading-tight tracking-tighter uppercase drop-shadow-lg">
                  {bannerTitle}
                </h1>
                
                <p className="text-white/80 text-[11px] md:text-sm font-medium mb-4 line-clamp-3 leading-relaxed drop-shadow">
                  {bannerSubtitle}
                </p>

                {bannerLink ? (
                  <div className="pt-2">
                    <Link 
                      href={bannerLink} 
                      className="inline-flex h-9 md:h-11 px-6 md:px-8 rounded-full bg-amber-500 text-slate-900 font-black uppercase tracking-widest text-[9px] md:text-[10px] hover:bg-white hover:scale-105 transition-all items-center shadow-md active:scale-95"
                    >
                      {buttonText}
                    </Link>
                  </div>
                ) : (
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
                )}
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* Subcategories Filter Pills */}
      {subcategoriesList.length > 0 && (
        <div className="w-full pb-4">
          <div className="standard-container px-4">
            <div className="flex flex-col gap-3">
              <span className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 flex items-center gap-2">
                <Sparkles size={12} className="text-emerald-600" /> Filter by Sub-Category
              </span>
              <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar -mx-4 px-4 md:mx-0 md:px-0 flex-wrap">
                <button
                  onClick={() => setSelectedSubcategoryId(null)}
                  className={`h-9 px-5 rounded-full text-[10px] font-black uppercase tracking-wider transition-all duration-300 border ${
                    selectedSubcategoryId === null
                      ? 'bg-emerald-950 border-emerald-950 text-white shadow-md shadow-emerald-900/10'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  All Offerings
                </button>
                {subcategoriesList.map((sub: any) => (
                  <button
                    key={sub.id}
                    onClick={() => setSelectedSubcategoryId(sub.id)}
                    className={`h-9 px-5 rounded-full text-[10px] font-black uppercase tracking-wider transition-all duration-300 border ${
                      selectedSubcategoryId === sub.id
                        ? 'bg-emerald-950 border-emerald-950 text-white shadow-md shadow-emerald-900/10'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {sub.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Products Catalog Grid */}
      <div className="w-full py-6">
        <div className="standard-container px-4">
          <div className="flex items-center justify-between mb-6 pb-3 border-b border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Showing {displayedProducts.length} premium item{displayedProducts.length === 1 ? '' : 's'}
            </span>
            <div className="flex items-center gap-2 text-slate-400 text-[10px] font-black uppercase tracking-widest">
              <LayoutGrid size={14} className="text-emerald-800" /> Grid Layout
            </div>
          </div>

          <AnimatePresence mode="popLayout">
            {displayedProducts.length > 0 ? (
              <motion.div 
                layout
                className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-[12px] md:gap-[28px]"
              >
                {displayedProducts.map((product) => (
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
