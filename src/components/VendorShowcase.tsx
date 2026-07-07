/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useRef, useState } from 'react';
import Link from 'next/link';
import { Sparkles, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import useSWR from 'swr';
import { motion } from 'framer-motion';

import { API_URL } from '@/lib/api';
import OptimizedImage from './ui/OptimizedImage';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function VendorShowcase() {
  const { data: responseData, error } = useSWR(`${API_URL}/api/head-vendors?limit=50`, fetcher);
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

  const vendorsList = responseData?.headVendors || [];

  const [activeIndex, setActiveIndex] = React.useState(0);
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

  React.useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      el.addEventListener('scroll', checkScrollLimits);
      setTimeout(checkScrollLimits, 500);
    }
    return () => el?.removeEventListener('scroll', checkScrollLimits);
  }, [checkScrollLimits]);

  if (error || vendorsList.length === 0) return null;

  return (
    <section className="w-full pt-2 md:pt-4 pb-4 md:pb-6 bg-white relative overflow-hidden">

      {/* Decorative luxurious ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-radial from-amber-50/40 to-transparent rounded-full pointer-events-none opacity-70" />

      <div className="standard-container relative z-10">

        {/* --- Header matching premium brand style --- */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 md:mb-8 gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-slate-400">
              <Sparkles size={12} className="text-amber-500 fill-amber-500" />
              <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.35em] text-slate-400">Supporting Organization</span>
            </div>
            <h2 className="text-xl md:text-[32px] lg:text-[36px] font-[900] text-emerald-950 tracking-tighter leading-none uppercase">
              Featured <span className="text-amber-500 italic lowercase font-serif font-normal ml-1">Vendors</span>
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/sellers" className="hidden sm:flex items-center gap-1 text-[11px] font-black text-slate-400 hover:text-emerald-950 uppercase tracking-[0.2em] transition-colors group">
              <span>View All Vendors</span>
            </Link>
          </div>
        </div>

        {/* --- The Premium Squircle Deck matching Categories --- */}
        <div className="relative group/carousel w-full">
          {/* Banner style Left Arrow */}
          <button
            type="button"
            onClick={scrollLeft}
            aria-label="Previous"
            className={`absolute left-0 top-[40%] -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white border border-[#E5E7EB] shadow-[0_8px_24px_rgba(0,0,0,0.08)] flex items-center justify-center text-slate-800 hover:bg-[#0F8A5F] hover:text-white hover:border-[#0F8A5F] transition-all duration-300 hover:scale-105 focus:outline-none shrink-0 transition-opacity duration-300 hidden md:flex ${
              canScrollLeft ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
          >
            <ChevronLeft size={20} strokeWidth={2.5} />
          </button>

          <div
            ref={scrollRef}
            onMouseDown={onMouseDown}
            onMouseLeave={onMouseLeave}
            onMouseUp={onMouseUp}
            onMouseMove={onMouseMove}
            onKeyDown={onKeyDown}
            tabIndex={0}
            className="flex overflow-x-auto no-scrollbar pb-4 snap-x snap-mandatory scroll-smooth items-start px-[10px] md:px-[20px] xl:px-[70px] gap-6 md:gap-10 cursor-grab active:cursor-grabbing focus:outline-none"
          >
            {vendorsList.map((vendor: any, idx: number) => (
              <motion.div
                key={vendor.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-20px" }}
                transition={{ duration: 0.6, delay: idx * 0.05 }}
                className="snap-start shrink-0 w-[140px] md:w-[180px]"
              >
                <Link
                  href={`/sellers/detail?slug=${vendor.slug || vendor.id}`}
                  prefetch={false}
                  className="group flex flex-col items-center text-center"
                >
                  {/* Premium Squircle Image Box */}
                  <div className="relative w-full aspect-square rounded-[2rem] md:rounded-[2.8rem] overflow-hidden bg-[#fafaf9] border border-slate-200 shadow-[0_8px_30px_rgba(0,0,0,0.02)] transition-all duration-700 group-hover:shadow-[0_24px_48px_-12px_rgba(6,78,59,0.12)] group-hover:-translate-y-2 group-hover:border-emerald-100 relative flex items-center justify-center">

                    <div className="absolute inset-0 m-2 rounded-[1.6rem] md:rounded-[2.2rem] overflow-hidden bg-white shadow-inner p-3 flex items-center justify-center">
                      {vendor.logo ? (
                        <OptimizedImage
                          src={vendor.logo}
                          alt={vendor.name}
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
                    <p className="text-emerald-950 text-[10px] md:text-[12px] font-[900] uppercase tracking-[0.06em] group-hover:text-amber-600 transition-colors duration-300 leading-[1.4] text-center px-1 break-words w-full">
                      {vendor.name}
                    </p>
                    {(!vendor._count?.subVendors || vendor._count.subVendors === 0) ? (
                      <span className="text-[9px] md:text-[10px] font-bold text-amber-600 uppercase tracking-widest leading-none shrink-0 bg-amber-50 px-2 py-0.5 rounded">
                        Coming Soon
                      </span>
                    ) : (
                      <span className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none shrink-0">
                        {vendor._count.subVendors} {vendor._count.subVendors === 1 ? 'Brand' : 'Brands'}
                      </span>
                    )}
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Banner style Right Arrow */}
          <button
            type="button"
            onClick={scrollRight}
            aria-label="Next"
            className={`absolute right-0 top-[40%] -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white border border-[#E5E7EB] shadow-[0_8px_24px_rgba(0,0,0,0.08)] flex items-center justify-center text-slate-800 hover:bg-[#0F8A5F] hover:text-white hover:border-[#0F8A5F] transition-all duration-300 hover:scale-105 focus:outline-none shrink-0 transition-opacity duration-300 hidden md:flex ${
              canScrollRight ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
          >
            <ChevronRight size={20} strokeWidth={2.5} />
          </button>
        </div>

        {/* Mobile Pagination Dots */}
        <div className="md:hidden flex justify-center gap-1.5 mt-[-10px] mb-4">
          {vendorsList.slice(0, 10).map((_: any, idx: number) => (
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
