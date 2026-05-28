'use client';

import React, { useRef, useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import {
   ChevronRight,
   ChevronLeft,
   Star,
   ShoppingCart,
   Heart,
   Sparkles,
   Store,
   Leaf,
   TrendingUp,
   ArrowRight,
   Package,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCartStore } from '@/store/useCartStore';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';

// ─── Types ──────────────────────────────────────────────────────────────────
interface Product {
   id: number;
   name: string;
   price: number | string;
   originalPrice?: number | string | null;
   image?: string;
   images?: { url: string }[];
   avgRating?: number | null;
   averageRating?: number | null;
   reviewCount?: number;
   subVendor?: { name: string; id: number; slug?: string };
   category?: { name: string };
   slug?: string;
   status?: string;
   subVendorId?: number;
   categoryId?: number;
}

interface RecommendedProductsSectionProps {
   product: any;
   relatedProducts: Product[] | undefined | null;
   isLoading: boolean;
   sectionTitle: string;
   sectionSubtitle: string;
   fallbackImage: string;
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function SkeletonCard() {
   return (
      <div className="shrink-0 w-[200px] md:w-[220px] rounded-2xl bg-white border border-slate-100 overflow-hidden animate-pulse">
         <div className="aspect-square bg-slate-100" />
         <div className="p-4 space-y-2.5">
            <div className="h-2 bg-slate-100 rounded-full w-2/3" />
            <div className="h-3 bg-slate-100 rounded-full" />
            <div className="h-3 bg-slate-100 rounded-full w-3/4" />
            <div className="flex items-center justify-between pt-1">
               <div className="h-5 bg-slate-100 rounded-full w-16" />
               <div className="h-8 w-8 rounded-full bg-slate-100" />
            </div>
         </div>
      </div>
   );
}

function RecommendationCard({
   p,
   fallbackImage,
}: {
   p: Product;
   fallbackImage: string;
}) {
   const { addToCart } = useCartStore();
   const [imgErr, setImgErr] = useState(false);
   const [isWishlisted, setIsWishlisted] = useState(false);
   const [addingToCart, setAddingToCart] = useState(false);

   const price = Number(p.price || 0);
   const originalPrice = Number(p.originalPrice || 0);
   const discount = originalPrice > price ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;
   const img = imgErr ? fallbackImage : (p.image || (p.images?.[0]?.url) || fallbackImage);
   const rating = p.avgRating || p.averageRating || 0;

   const handleAddToCart = (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setAddingToCart(true);
      addToCart({
         productId: p.id,
         name: p.name,
         price,
         quantity: 1,
         image: img,
         variant: 'Standard Pack',
      });
      confetti({
         particleCount: 30,
         spread: 50,
         origin: { y: 0.8 },
         colors: ['#16A34A', '#f59e0b'],
         zIndex: 9999,
      });
      toast.success(`${p.name} added to cart!`);
      setTimeout(() => setAddingToCart(false), 1200);
   };

   return (
      <motion.div
         initial={{ opacity: 0, y: 12 }}
         animate={{ opacity: 1, y: 0 }}
         className="shrink-0 w-[200px] md:w-[220px] group"
      >
         <Link href={`/products/detail?id=${p.id}`} className="block">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-lg hover:border-emerald-200 hover:-translate-y-1 transition-all duration-300">
               {/* Image */}
               <div className="relative aspect-square bg-slate-50 overflow-hidden">
                  <img
                     src={img}
                     alt={p.name}
                     onError={() => setImgErr(true)}
                     className="w-full h-full object-contain mix-blend-multiply p-3 group-hover:scale-105 transition-transform duration-500"
                  />
                  {/* Badges */}
                  {discount > 0 && (
                     <div className="absolute top-2.5 left-2.5 bg-rose-500 text-white text-[9px] font-black px-2 py-0.5 rounded-lg uppercase tracking-wider shadow-sm">
                        -{discount}%
                     </div>
                  )}
                  {/* Wishlist btn */}
                  <button
                     onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setIsWishlisted(!isWishlisted);
                     }}
                     className={`absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-white/90 backdrop-blur-sm shadow-sm border border-slate-100 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 ${isWishlisted ? 'text-rose-500' : 'text-slate-300 hover:text-rose-500'}`}
                  >
                     <Heart size={13} className={isWishlisted ? 'fill-rose-500' : ''} />
                  </button>
               </div>

               {/* Info */}
               <div className="p-4 space-y-2">
                  {/* Vendor */}
                  {p.subVendor?.name && (
                     <span className="text-[9px] font-black text-emerald-600 uppercase tracking-wider truncate block">
                        {p.subVendor.name}
                     </span>
                  )}
                  {/* Name */}
                  <h4 className="text-[12px] font-black text-slate-900 leading-tight line-clamp-2 uppercase tracking-tight">
                     {p.name}
                  </h4>

                  {/* Rating */}
                  {rating > 0 && (
                     <div className="flex items-center gap-1">
                        <div className="flex">
                           {[1, 2, 3, 4, 5].map((s) => (
                              <Star
                                 key={s}
                                 size={10}
                                 className={s <= Math.round(rating) ? 'fill-amber-400 text-amber-400' : 'fill-slate-200 text-slate-200'}
                              />
                           ))}
                        </div>
                        {p.reviewCount ? (
                           <span className="text-[9px] text-slate-400 font-bold">({p.reviewCount})</span>
                        ) : null}
                     </div>
                  )}

                  {/* Price row */}
                  <div className="flex items-center justify-between pt-1">
                     <div className="flex items-baseline gap-1.5">
                        <span className="text-[15px] font-[900] text-slate-900 tracking-tight">₹{price}</span>
                        {originalPrice > price && (
                           <span className="text-[10px] text-slate-400 line-through font-semibold">₹{originalPrice}</span>
                        )}
                     </div>
                     <button
                        onClick={handleAddToCart}
                        className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 shadow-sm border ${addingToCart
                              ? 'bg-emerald-600 border-emerald-600 text-white scale-90'
                              : 'bg-white border-slate-200 text-slate-500 hover:bg-emerald-600 hover:border-emerald-600 hover:text-white hover:scale-110'
                           }`}
                     >
                        <ShoppingCart size={13} strokeWidth={2.5} />
                     </button>
                  </div>
               </div>
            </div>
         </Link>
      </motion.div>
   );
}

// ─── Section Header Icons ────────────────────────────────────────────────────
const SECTION_ICONS: Record<string, React.ElementType> = {
   'More From This Vendor': Store,
   'Similar Organic Products': Leaf,
   'Trending Organic': TrendingUp,
   'Recommended Essentials': Sparkles,
   'default': Package,
};

// ─── Main Component ──────────────────────────────────────────────────────────
export default function RecommendedProductsSection({
   product,
   relatedProducts,
   isLoading,
   sectionTitle,
   sectionSubtitle,
   fallbackImage,
}: RecommendedProductsSectionProps) {
   const scrollRef = useRef<HTMLDivElement>(null);
   const [canScrollLeft, setCanScrollLeft] = useState(false);
   const [canScrollRight, setCanScrollRight] = useState(true);

   const checkScroll = useCallback(() => {
      const el = scrollRef.current;
      if (!el) return;
      setCanScrollLeft(el.scrollLeft > 8);
      setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 8);
   }, []);

   useEffect(() => {
      const el = scrollRef.current;
      if (!el) return;
      checkScroll();
      el.addEventListener('scroll', checkScroll, { passive: true });
      return () => el.removeEventListener('scroll', checkScroll);
   }, [checkScroll, relatedProducts]);

   const scroll = (dir: 'left' | 'right') => {
      const el = scrollRef.current;
      if (!el) return;
      el.scrollBy({ left: dir === 'left' ? -450 : 450, behavior: 'smooth' });
   };

   const SectionIcon = SECTION_ICONS[sectionTitle] || SECTION_ICONS['default'];
   const products = Array.isArray(relatedProducts) ? relatedProducts : [];

   if (!isLoading && products.length === 0) return null;

   return (
      <section className="py-16 bg-gradient-to-b from-white to-slate-50 border-t border-slate-100 overflow-hidden">
         <div className="standard-container">
            {/* ─── HEADER ─────────────────────────────────────────────── */}
            <div className="flex items-end justify-between mb-8 gap-4">
               <div className="space-y-2">
                  {/* Sub-label */}
                  <div className="flex items-center gap-2">
                     <div className="h-7 w-7 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                        <SectionIcon size={14} />
                     </div>
                     <span className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-600">
                        {sectionSubtitle}
                     </span>
                  </div>
                  {/* Main title */}
                  <h2 className="text-[26px] md:text-[34px] font-[900] text-slate-900 tracking-tighter leading-none">
                     {sectionTitle}
                  </h2>
               </div>

               {/* Desktop: Nav + View All */}
               <div className="hidden md:flex items-center gap-3 shrink-0">
                  <button
                     onClick={() => scroll('left')}
                     disabled={!canScrollLeft}
                     className="h-9 w-9 rounded-full border border-slate-200 bg-white flex items-center justify-center text-slate-500 hover:bg-slate-50 hover:text-slate-900 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
                  >
                     <ChevronLeft size={16} />
                  </button>
                  <button
                     onClick={() => scroll('right')}
                     disabled={!canScrollRight}
                     className="h-9 w-9 rounded-full border border-slate-200 bg-white flex items-center justify-center text-slate-500 hover:bg-slate-50 hover:text-slate-900 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
                  >
                     <ChevronRight size={16} />
                  </button>
                  <Link
                     href="/products"
                     className="h-9 px-5 rounded-xl border border-slate-200 bg-white flex items-center gap-2 text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm text-slate-600"
                  >
                     View All <ArrowRight size={13} />
                  </Link>
               </div>
            </div>

            {/* ─── SCROLL TRACK ────────────────────────────────────────── */}
            <div className="relative">
               {/* Left fade gradient */}
               <AnimatePresence>
                  {canScrollLeft && (
                     <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none"
                     />
                  )}
               </AnimatePresence>

               {/* Right fade gradient */}
               <AnimatePresence>
                  {canScrollRight && (
                     <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-slate-50 to-transparent z-10 pointer-events-none"
                     />
                  )}
               </AnimatePresence>

               {/* Scrollable row */}
               <div
                  ref={scrollRef}
                  className="flex gap-4 overflow-x-auto no-scrollbar pb-4 scroll-smooth snap-x snap-mandatory"
                  style={{ WebkitOverflowScrolling: 'touch' }}
               >
                  {isLoading
                     ? Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />)
                     : products.map((p) => (
                        <div key={p.id} className="snap-start">
                           <RecommendationCard p={p} fallbackImage={fallbackImage} />
                        </div>
                     ))
                  }
               </div>
            </div>

            {/* Mobile: View All CTA */}
            <div className="mt-6 flex justify-center md:hidden">
               <Link
                  href="/products"
                  className="h-11 px-8 rounded-full border border-slate-200 bg-white flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-all shadow-sm"
               >
                  Explore All Products <ArrowRight size={13} />
               </Link>
            </div>
         </div>
      </section>
   );
}
