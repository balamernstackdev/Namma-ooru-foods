'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { ArrowLeft, ArrowRight, Sparkles, LayoutGrid, Award, ShieldCheck, ChevronRight, ChevronLeft, Layers, Package } from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import { motion, AnimatePresence } from 'framer-motion';
import { useBanners } from '@/hooks/useBanners';
import QuickBrowseCategories from '@/components/QuickBrowseCategories';

interface SubcategoryItem {
  id: number;
  name: string;
  slug: string;
  code?: string;
  image?: string | null;
  description?: string | null;
  productCount: number;
}

interface CategoryDetailClientProps {
  categoryId: string;
  category: {
    id: number;
    name: string;
    description?: string | null;
    image?: string | null;
    slug?: string;
    subcategories?: SubcategoryItem[];
    children?: any[];
    products?: any[];
    totalProductsCount?: number;
    totalSubcategoriesCount?: number;
  };
  categoryProducts: any[];
  initialSubSlug?: string;
}

export default function CategoryDetailClient({
  categoryId,
  category,
  categoryProducts = [],
  initialSubSlug,
}: CategoryDetailClientProps) {
  const router = useRouter();
  const pathname = usePathname();

  // Unified list of subcategories with counts
  const subcategoriesList: SubcategoryItem[] = useMemo(() => {
    if (category?.subcategories && category.subcategories.length > 0) {
      return category.subcategories;
    }
    const childrenList = category?.children || [];
    return childrenList.map((c: any, idx: number) => {
      const slug = c.slug || c.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-');
      const count = (categoryProducts || []).filter(
        (p: any) => p.subcategoryId === c.id || p.categoryId === c.id || p.category?.id === c.id || p.category?.slug === slug
      ).length;
      return {
        id: c.id,
        name: c.name,
        slug: slug,
        code: c.code || `SUB-${String(idx + 1).padStart(2, '0')}`,
        image: c.image || null,
        description: c.description || null,
        productCount: count,
      };
    });
  }, [category, categoryProducts]);

  const categoryName = category?.name || categoryId
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  // Admin Banner Matching
  const { categoryBanners } = useBanners();
  const activeBanners = categoryBanners.filter((b: any) => b.isActive !== false);
  const matchedBanner = activeBanners.find((b: any) => {
    let ld = b.linkData;
    if (typeof ld === 'string') {
      try { ld = JSON.parse(ld); } catch { ld = null; }
    }
    if (!ld) return false;
    const { linkType, targetId } = ld;
    if (linkType !== 'category') return false;
    return (
      String(targetId) === String(category?.id) ||
      String(targetId) === String(category?.slug) ||
      (categoryId && String(targetId) === String(categoryId))
    );
  }) || activeBanners?.[0] || null;

  const bannerImage = matchedBanner?.banner_image || category?.image || null;
  const bannerTitle = matchedBanner?.title || categoryName;
  const bannerSubtitle = matchedBanner?.subtitle || category?.description || `Explore our premium range of ${categoryName.toLowerCase()} sourced directly from native farms.`;
  const bannerTagline = matchedBanner?.tagline || '100% Organic & Native';
  const bannerLink = (matchedBanner as any)?.linkUrl || null;
  const buttonText = matchedBanner?.buttonText || 'Shop Collection';

  const categoryDesc = category?.description || `Explore our premium range of ${categoryName.toLowerCase()} sourced directly from native farms.`;
  const totalProductsCount = category?.totalProductsCount ?? categoryProducts.length;
  const totalSubcategoriesCount = category?.totalSubcategoriesCount ?? subcategoriesList.length;

  const isSubcategoryPage = Boolean(initialSubSlug && initialSubSlug !== 'all');
  const hasSubcategories = subcategoriesList.length > 0;

  // Selected subcategory slug state
  const [activeSubSlug, setActiveSubSlug] = useState<string>(initialSubSlug || 'all');
  const [subCurrentPage, setSubCurrentPage] = useState(1);
  const subItemsPerPage = 10;

  useEffect(() => {
    if (initialSubSlug) {
      setActiveSubSlug(initialSubSlug);
    } else {
      setActiveSubSlug('all');
    }
  }, [initialSubSlug]);

  const activeSubcategory = useMemo(() => {
    if (activeSubSlug === 'all') return null;
    return subcategoriesList.find(
      (s) => s.slug === activeSubSlug || String(s.id) === activeSubSlug
    );
  }, [activeSubSlug, subcategoriesList]);

  // Handle Subcategory Selection (navigates to dedicated subcategory route)
  const handleSelectSubcategory = (slug: string) => {
    const categorySlug = category?.slug || categoryId;
    if (slug === 'all') {
      router.push(`/categories/${categorySlug}`);
    } else {
      router.push(`/categories/${categorySlug}/${slug}`);
    }
  };

  // Filter products by selected subcategory
  const displayedProducts = useMemo(() => {
    if (!activeSubSlug || activeSubSlug === 'all') {
      return categoryProducts;
    }
    if (!activeSubcategory) {
      return categoryProducts.filter((p: any) => {
        const catSlug = p.category?.slug || p.subcategory?.slug || '';
        return catSlug === activeSubSlug;
      });
    }
    return categoryProducts.filter(
      (p: any) =>
        p.subcategoryId === activeSubcategory.id ||
        p.categoryId === activeSubcategory.id ||
        p.category?.id === activeSubcategory.id ||
        (p.category?.slug && p.category.slug === activeSubcategory.slug)
    );
  }, [categoryProducts, activeSubSlug, activeSubcategory]);

  return (
    <div className="flex flex-col bg-white w-full min-h-screen font-sans">

      {/* BREADCRUMBS */}
      <div className="w-full bg-slate-50 border-b border-slate-200/80 py-3">
        <div className="standard-container px-4">
          <nav className="flex items-center gap-2 text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest overflow-x-auto no-scrollbar">
            <Link href="/" className="hover:text-emerald-800 transition-colors shrink-0">Home</Link>
            <ChevronRight size={10} className="shrink-0" />
            <Link href="/categories" className="hover:text-emerald-800 transition-colors shrink-0">Categories</Link>
            <ChevronRight size={10} className="shrink-0" />
            {isSubcategoryPage ? (
              <>
                <Link href={`/categories/${category?.slug || categoryId}`} className="hover:text-emerald-800 transition-colors shrink-0">
                  {categoryName}
                </Link>
                <ChevronRight size={10} className="shrink-0" />
                <span className="text-emerald-950 font-black shrink-0">
                  {activeSubcategory?.name || initialSubSlug}
                </span>
              </>
            ) : (
              <span className="text-emerald-950 font-black shrink-0">
                {categoryName}
              </span>
            )}
          </nav>
        </div>
      </div>

      {/* Quick Browse Categories Strip */}
      <QuickBrowseCategories activeSlug={category?.slug || categoryId} />

      {/* DEDICATED SUBCATEGORY PAGE HEADER */}
      {isSubcategoryPage ? (
        <div className="w-full bg-slate-900 text-white py-8 md:py-12 relative overflow-hidden">
          <div className="absolute right-0 top-0 w-96 h-96 bg-emerald-700/20 rounded-full blur-3xl" />
          <div className="standard-container px-4 relative z-10">
            <Link
              href={`/categories/${category?.slug || categoryId}`}
              className="inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300 text-xs font-black uppercase tracking-wider mb-4 transition-colors"
            >
              <ArrowLeft size={14} /> Back to {categoryName}
            </Link>

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <span className="text-amber-400 text-[10px] md:text-xs font-black uppercase tracking-[0.3em] block mb-1">
                  {categoryName} Subcategory
                </span>
                <h1 className="text-2xl md:text-4xl font-black uppercase tracking-tight text-white">
                  {activeSubcategory?.name || initialSubSlug}
                </h1>
                {activeSubcategory?.description && (
                  <p className="text-slate-300 text-xs md:text-sm font-medium mt-2 max-w-xl">
                    {activeSubcategory.description}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10 text-center">
                  <span className="text-[9px] font-black uppercase tracking-wider text-slate-300 block">Available Products</span>
                  <span className="text-lg font-black text-white">{displayedProducts.length}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* MAIN CATEGORY PAGE HERO & BANNER */
        <>
          {bannerImage ? (
            <div className="w-full py-4 md:py-6 flex justify-center animate-in fade-in duration-500">
              <div className="standard-container px-4">
                {bannerLink ? (
                  <Link href={bannerLink} className="block relative w-full aspect-[2/1] md:aspect-[1400/340] rounded-2xl md:rounded-3xl overflow-hidden group shadow-md bg-slate-100 border border-slate-200">
                    <Image
                      src={bannerImage}
                      alt={bannerTitle}
                      fill
                      priority
                      className="w-full h-full object-cover transition-transform duration-[2000ms] group-hover:scale-105"
                      unoptimized
                    />
                  </Link>
                ) : (
                  <div className="relative w-full aspect-[2/1] md:aspect-[1400/340] rounded-2xl md:rounded-3xl overflow-hidden shadow-md bg-slate-100 border border-slate-200">
                    <Image
                      src={bannerImage}
                      alt={bannerTitle}
                      fill
                      priority
                      className="w-full h-full object-cover"
                      unoptimized
                    />
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="w-full py-6 flex justify-center">
              <div className="standard-container px-4">
                <div className="bg-emerald-950 text-white rounded-3xl p-8 md:p-12 relative overflow-hidden shadow-lg">
                  <div className="absolute right-0 top-0 w-96 h-96 bg-emerald-800/20 rounded-full blur-3xl" />
                  <div className="relative z-10 max-w-2xl space-y-3">
                    <span className="text-amber-400 text-xs font-black uppercase tracking-[0.3em]">Agrarian Collection</span>
                    <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tight">{categoryName}</h1>
                    <p className="text-slate-300 text-sm font-medium leading-relaxed">{categoryDesc}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* METRICS & DETAILS */}
          <div className="w-full pt-4 pb-0 md:py-4 bg-white">
            <div className="standard-container px-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 md:pb-4 border-b border-slate-100">
                <div>
                  <h2 className="text-xl md:text-3xl font-black text-slate-900 uppercase tracking-tight">
                    {categoryName}
                  </h2>
                  {categoryDesc && (
                    <p className="text-slate-500 text-xs md:text-sm font-medium mt-1">
                      {categoryDesc}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* SUBCATEGORY CARDS SECTION */}
          {hasSubcategories && (
            <div className="w-full pt-4 pb-8 md:py-8 bg-slate-50/60 border-y border-slate-100">
              <div className="standard-container px-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-700 block">Subcategories</span>
                    <h3 className="text-lg md:text-xl font-black text-slate-900 uppercase tracking-tight">Select a Subcategory</h3>
                  </div>

                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
                  {subcategoriesList.slice((subCurrentPage - 1) * subItemsPerPage, subCurrentPage * subItemsPerPage).map((sub, idx) => {
                    const globalIdx = (subCurrentPage - 1) * subItemsPerPage + idx;
                    const subImg = sub.image || category.image || '/ai_images/organic_grains_1776231059575.png';
                    const subCode = sub.code || `SUB-${String(globalIdx + 1).padStart(2, '0')}`;
                    const isSelected = activeSubSlug === sub.slug;
                    return (
                      <button
                        key={sub.id}
                        type="button"
                        onClick={() => handleSelectSubcategory(sub.slug)}
                        className={`relative flex flex-col h-full rounded-2xl bg-white border text-left transition-all duration-300 group cursor-pointer overflow-hidden ${isSelected ? 'border-emerald-600 ring-2 ring-emerald-600/20 shadow-lg' : 'border-slate-200/90 hover:border-emerald-600 hover:shadow-xl shadow-xs'}`}
                      >
                        {/* Top Image Box */}
                        <div className="relative w-full aspect-square bg-slate-50 overflow-hidden flex items-center justify-center p-2 border-b border-slate-100">
                          <Image
                            src={subImg}
                            alt={sub.name}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                            unoptimized
                          />
                        </div>

                        {/* Details */}
                        <div className="flex flex-col flex-1 p-3.5 flex-grow justify-between bg-white">
                          <div>
                            <div className="flex items-center justify-between gap-1 mb-1">
                              <div className="flex items-center gap-1 text-[10px]">
                                <span className="font-black tracking-wider uppercase text-emerald-700 leading-tight">
                                  {categoryName}
                                </span>
                              </div>
                              <span className="text-[8px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-mono font-bold border border-slate-200 shrink-0">
                                {subCode}
                              </span>
                            </div>

                            <p className="text-[13px] md:text-[15px] font-bold text-[#1e293b] leading-snug line-clamp-2 tracking-tight group-hover:text-[#052e16] transition-colors uppercase mb-1">
                              {sub.name}
                            </p>

                            {sub.description && (
                              <p className="text-[10px] text-slate-400 font-medium line-clamp-2 leading-tight mb-2">
                                {sub.description}
                              </p>
                            )}
                          </div>


                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* --- Subcategories Pagination Controls --- */}
                {Math.ceil(subcategoriesList.length / subItemsPerPage) > 1 && (
                  <div className="mt-8 flex justify-center items-center gap-2">
                    <button
                      onClick={() => {
                        setSubCurrentPage(prev => Math.max(prev - 1, 1));
                        window.scrollTo({ top: 300, behavior: 'smooth' });
                      }}
                      disabled={subCurrentPage === 1}
                      className="h-8 w-8 md:h-10 md:w-10 rounded-full border border-slate-200 flex items-center justify-center text-emerald-900 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-emerald-50 transition-colors"
                    >
                      <ChevronLeft size={16} />
                    </button>

                    <div className="flex items-center gap-2 px-3">
                      <span className="text-xs md:text-sm font-bold text-slate-600">
                        Page {subCurrentPage} of {Math.ceil(subcategoriesList.length / subItemsPerPage)}
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        setSubCurrentPage(prev => Math.min(prev + 1, Math.ceil(subcategoriesList.length / subItemsPerPage)));
                        window.scrollTo({ top: 300, behavior: 'smooth' });
                      }}
                      disabled={subCurrentPage === Math.ceil(subcategoriesList.length / subItemsPerPage)}
                      className="h-8 w-8 md:h-10 md:w-10 rounded-full border border-slate-200 flex items-center justify-center text-emerald-900 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-emerald-50 transition-colors"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}

      {/* PRODUCT LISTING GRID (Loaded when a subcategory or All Products is selected, or if main category has no subcategories) */}
      {(isSubcategoryPage || !hasSubcategories || activeSubSlug !== 'all') && (
        <div className="w-full py-8">
          <div className="standard-container px-4">
            <div className="flex items-center justify-between mb-6 pb-3 border-b border-slate-100">
              <span className="text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-widest">
                Showing {displayedProducts.length} Premium Item{displayedProducts.length === 1 ? '' : 's'} {activeSubcategory ? `in ${activeSubcategory.name}` : ''}
              </span>
              <div className="flex items-center gap-2 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                <LayoutGrid size={14} className="text-emerald-800" /> Grid View
              </div>
            </div>

            <AnimatePresence mode="popLayout">
              {displayedProducts.length > 0 ? (
                <motion.div
                  layout
                  className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2.5 sm:gap-4 lg:gap-6"
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
                  className="flex flex-col items-center justify-center text-center py-20 bg-slate-50 rounded-3xl border border-slate-200/80 my-4"
                >
                  <div className="h-16 w-16 rounded-full bg-white flex items-center justify-center shadow-sm text-2xl mb-4 border border-slate-100">
                    📦
                  </div>
                  <h3 className="text-base md:text-lg font-black text-slate-900 uppercase tracking-tight mb-1">
                    No products found
                  </h3>
                  <p className="text-xs text-slate-500 font-medium max-w-xs leading-relaxed mb-4">
                    {activeSubcategory
                      ? `No products currently listed under "${activeSubcategory.name}".`
                      : 'No products currently listed in this category.'
                    }
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}

    </div>
  );
}
