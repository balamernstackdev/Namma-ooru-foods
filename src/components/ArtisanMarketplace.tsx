'use client';

import React, { useRef, useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { ChevronRight, Sparkle } from 'lucide-react';
import useSWR from 'swr';
import { motion } from 'framer-motion';

import { API_URL } from '@/lib/api';
import OptimizedImage from './ui/OptimizedImage';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function ArtisanMarketplace() {
  const { data: brandsData, error } = useSWR(`${API_URL}/api/sub-vendors?limit=15`, fetcher);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const brands = brandsData?.subVendors || [];

  const scrollRight = () => {
    const el = scrollRef.current;
    if (!el) return;
    const SCROLL_STEP = el.clientWidth < 640 ? 180 : 252; // card width + gap depending on viewport
    if (el.scrollLeft + el.clientWidth >= el.scrollWidth - 20) {
      el.scrollTo({ left: 0, behavior: 'smooth' });
    } else {
      el.scrollBy({ left: SCROLL_STEP, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    if (brands.length === 0) return;
    const interval = setInterval(scrollRight, 3500);
    return () => clearInterval(interval);
  }, [brands.length]);

  if (error || brands.length === 0) return null;

  return (
    <section className="w-full pt-2 md:pt-4 pb-4 md:pb-6 bg-white relative overflow-hidden">
      
      {/* Decorative luxurious ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-radial from-amber-50/40 to-transparent rounded-full pointer-events-none opacity-70" />

      <div className="standard-container relative z-10">
        
        {/* --- SECTION HEADER --- */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 md:mb-8 gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-slate-400">
              <Sparkle size={12} className="text-amber-500 fill-amber-500" />
              <span className="text-[10px] md:text-xs font-extrabold uppercase tracking-[0.35em]">Brand Collections</span>
            </div>
            <h2 className="text-xl md:text-[32px] lg:text-[36px] font-[900] text-emerald-950 tracking-tighter leading-none uppercase">
              Explore the <span className="text-amber-500 italic lowercase font-serif font-normal ml-1">Brands</span>
            </h2>
          </div>

          {/* Clean Discovery Controls */}
          <div className="flex items-center gap-5">
            <Link
              href="/brands"
              className="hidden sm:flex items-center gap-1 text-[11px] font-black text-slate-400 hover:text-emerald-950 uppercase tracking-[0.2em] transition-colors"
            >
              <span>View All</span>
              <ChevronRight size={14} />
            </Link>
          </div>
        </div>

        {/* --- THE PREMIUM SQUIRCLE DECK --- */}
        <div className="relative -mx-6 md:-mx-8 px-6 md:px-8">
          <div 
            ref={scrollRef}
            className="flex overflow-x-auto no-scrollbar gap-6 md:gap-10 pb-4 snap-x snap-mandatory scroll-smooth items-start"
          >
            {brands.map((brand: any, idx: number) => {
              const count = brand._count?.products || 0;
              const imageUrl = brand.logo || '/brand_logos/reseller_logo.webp';

              return (
                <motion.div
                  key={brand.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-20px" }}
                  transition={{ duration: 0.6, delay: idx * 0.05 }}
                  className="snap-start shrink-0 w-[150px] md:w-[210px]"
                >
                  <Link
                    href={`/brands/${brand.slug || brand.id}`}
                    prefetch={false}
                    className="group flex flex-col items-center text-center relative"
                  >
                    {/* Premium Taller Fashion-Style Aspect Image Container */}
                    <div className="relative w-full aspect-[3/4] rounded-[2.2rem] md:rounded-[3rem] overflow-hidden bg-[#fafaf9] border border-slate-100 shadow-[0_8px_30px_rgba(0,0,0,0.015)] transition-all duration-700 group-hover:shadow-[0_24px_48px_-12px_rgba(6,78,59,0.15)] group-hover:-translate-y-2 group-hover:border-emerald-100 flex items-center justify-center">
                      <OptimizedImage
                        src={imageUrl}
                        alt={brand.name}
                        fill
                        className="object-cover scale-100 group-hover:scale-105 transition-transform duration-[1000ms] ease-[0.25,1,0.5,1]"
                        sizes="(max-width: 768px) 150px, 210px"
                      />
                      
                      {/* Dark overlay for luxury depth */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80 transition-opacity duration-500" />
                      
                      {/* Floating Glassmorphic Label Overlay */}
                      <div className="absolute inset-x-3 bottom-3 p-3 md:p-4 bg-white/90 backdrop-blur-md rounded-[1.6rem] border border-white/20 shadow-lg flex flex-col gap-1 items-start text-left transition-all duration-500 group-hover:bg-emerald-950/95 group-hover:border-emerald-900 group-hover:text-white">
                        <span className="text-[8px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full group-hover:bg-white/10 group-hover:text-amber-300 transition-colors">
                          {count} {count === 1 ? 'Product' : 'Products'}
                        </span>
                        <p className="text-emerald-950 font-black text-xs md:text-sm tracking-tight uppercase leading-tight w-full group-hover:text-white transition-colors">
                          {brand.name}
                        </p>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>

      </div>
    </section>
  );
}
