'use client';

import React, { useRef, useEffect, useState } from 'react';
import Link from 'next/link';
import { Sparkles } from 'lucide-react';
import useSWR from 'swr';
import { motion } from 'framer-motion';
import { usePlatformSettings } from '@/context/PlatformSettingsContext';
import CarouselNavigation from './CarouselNavigation';

import { API_URL } from '@/lib/api';
import OptimizedImage from './ui/OptimizedImage';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function ArtisanMarketplace() {
  const { settings } = usePlatformSettings();
  const { data: brandsData, error } = useSWR(`${API_URL}/api/sub-vendors?limit=100&includeEmpty=true`, fetcher);
  const brands = brandsData?.subVendors || [];
  const isLoading = !brandsData && !error;

  const scrollRef = useRef<HTMLDivElement>(null);

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
      scrollRight();
    }
  };

  // Vendor visibility should not depend on product count
  const activeBrands = brands;
  const [activeIndex, setActiveIndex] = useState(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScrollLimits = React.useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;

    // Mobile dots calculation
    const itemWidth = el.children[0]?.clientWidth || 140;
    const gap = window.innerWidth < 768 ? 24 : 40;
    const index = Math.round(el.scrollLeft / (itemWidth + gap));
    setActiveIndex(index);

    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 10);
  }, []);

  const getScrollStep = (el: HTMLElement) => el.clientWidth < 640 ? 164 : 220;

  const scrollLeft = React.useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    if (el.scrollLeft <= 10) {
      el.scrollTo({ left: el.scrollWidth, behavior: 'smooth' });
    } else {
      el.scrollBy({ left: -getScrollStep(el), behavior: 'smooth' });
    }
  }, []);

  const scrollRight = React.useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    if (el.scrollLeft + el.clientWidth >= el.scrollWidth - 20) {
      el.scrollTo({ left: 0, behavior: 'smooth' });
    } else {
      el.scrollBy({ left: getScrollStep(el), behavior: 'smooth' });
    }
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      el.addEventListener('scroll', checkScrollLimits);
      setTimeout(checkScrollLimits, 500);
    }
    return () => el?.removeEventListener('scroll', checkScrollLimits);
  }, [checkScrollLimits, activeBrands]);

  // Auto-scroll logic (pauses on hover)
  useEffect(() => {
    if (activeBrands.length === 0) return;

    let intervalId: NodeJS.Timeout;
    let isHovered = false;

    const startInterval = () => {
      intervalId = setInterval(() => {
        if (!isHovered) {
          scrollRight();
        }
      }, 4500);
    };

    startInterval();

    const el = scrollRef.current;
    const handleMouseEnter = () => {
      isHovered = true;
      clearInterval(intervalId);
    };
    const handleMouseLeave = () => {
      isHovered = false;
      startInterval();
    };

    if (el) {
      el.addEventListener('mouseenter', handleMouseEnter);
      el.addEventListener('mouseleave', handleMouseLeave);
    }

    return () => {
      clearInterval(intervalId);
      if (el) {
        el.removeEventListener('mouseenter', handleMouseEnter);
        el.removeEventListener('mouseleave', handleMouseLeave);
      }
    };
  }, [scrollRight, activeBrands.length]);

  if (error || (!isLoading && activeBrands.length === 0)) return null;

  return (
    <section className="w-full pt-2 md:pt-4 pb-4 md:pb-6 bg-white relative overflow-hidden">


      <div className="standard-container relative z-10">

        {/* --- Header matching premium vendor style --- */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 md:mb-8 gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-slate-400">
              <Sparkles size={12} className="text-amber-500 fill-amber-500" />
              <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.35em] text-slate-400">Our Trusted Resellers</span>
            </div>
            <h2 className="text-xl md:text-[32px] lg:text-[36px] font-[900] text-emerald-950 tracking-tighter leading-none uppercase">
              Featured <span className="text-amber-500 italic lowercase font-serif font-normal ml-1">Brands</span>
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/brands" className="hidden sm:flex items-center gap-1 text-[11px] font-black text-slate-400 hover:text-emerald-950 uppercase tracking-[0.2em] transition-colors group">
              <span>View All Brands</span>
            </Link>
          </div>
        </div>

        {/* --- The Premium Squircle Deck matching Vendors --- */}
        <div className="relative group/carousel w-full">

          <div
            ref={scrollRef}
            onMouseDown={onMouseDown}
            onMouseLeave={onMouseLeave}
            onMouseUp={onMouseUp}
            onMouseMove={onMouseMove}
            onKeyDown={onKeyDown}
            tabIndex={0}
            className="flex overflow-x-auto no-scrollbar pb-4 pt-2 snap-x snap-mandatory scroll-smooth items-start justify-start px-4 md:px-8 gap-6 md:gap-10 cursor-grab active:cursor-grabbing focus:outline-none"
          >
            {isLoading ? (
              // Loading Skeleton
              [...Array(4)].map((_, i) => (
                <div key={i} className="snap-start shrink-0 w-[140px] md:w-[180px] animate-pulse">
                  <div className="w-full aspect-square rounded-[2rem] md:rounded-[2.8rem] bg-slate-100" />
                  <div className="h-3 bg-slate-100 rounded-full w-2/3 mx-auto mt-4" />
                </div>
              ))
            ) : (
              activeBrands.map((brand: any, idx: number) => (
                <motion.div
                  key={brand.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-20px" }}
                  transition={{ duration: 0.6, delay: idx * 0.05 }}
                  className="snap-start shrink-0 w-[140px] md:w-[180px]"
                >
                  <Link
                    href={`/brands/detail?slug=${brand.slug || brand.id}`}
                    prefetch={false}
                    className="group flex flex-col items-center text-center"
                  >
                    {/* Premium Squircle Image Box */}
                    <div className="relative w-full aspect-square rounded-[2rem] md:rounded-[2.8rem] overflow-hidden bg-[#fafaf9] border border-slate-200 shadow-[0_8px_30px_rgba(0,0,0,0.02)] transition-all duration-700 group-hover:shadow-[0_24px_48px_-12px_rgba(6,78,59,0.12)] group-hover:-translate-y-2 group-hover:border-emerald-100 relative flex items-center justify-center">

                      <div className="absolute inset-0 m-2 rounded-[1.6rem] md:rounded-[2.2rem] overflow-hidden bg-white shadow-inner p-3 flex items-center justify-center">
                        {brand.logo ? (
                          <OptimizedImage
                            src={brand.logo}
                            alt={brand.name}
                            fill
                            className="object-contain p-1 scale-100 group-hover:scale-110 transition-transform duration-[1000ms] ease-[0.25,1,0.5,1]"
                          />
                        ) : (
                          <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest text-center p-2">No Logo</span>
                        )}
                        {/* Dark overlay on hover for luxury depth */}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500" />
                      </div>

                    </div>

                    {/* Text Block placed BELOW the card */}
                    <div className="mt-5 w-full flex flex-col items-center gap-2">
                      <p className="text-emerald-950 text-[10px] md:text-[12px] font-[900] uppercase tracking-[0.08em] group-hover:text-amber-600 transition-colors duration-300 leading-[1.3] text-center px-1">
                        {brand.name}
                      </p>
                    </div>

                  </Link>
                </motion.div>
              ))
            )}
          </div>

          {/* Standardized Navigation Arrows */}
          <CarouselNavigation
            onPrev={scrollLeft}
            onNext={scrollRight}
            canPrev={canScrollLeft}
            canNext={canScrollRight}
          />
        </div>

        {/* Mobile Pagination Dots */}
        <div className="md:hidden flex justify-center gap-1.5 mt-[-10px] mb-4">
          {activeBrands.slice(0, 10).map((_: any, idx: number) => (
            <div
              key={idx}
              className={`h-1.5 rounded-full transition-all duration-300 ${idx === activeIndex ? 'w-4 bg-[#0f9d58]' : 'w-1.5 bg-slate-300'}`}
            />
          ))}
        </div>

      </div>
    </section>
  );
}
