'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import useSWR from 'swr';
import { ChevronLeft, ChevronRight, LayoutGrid } from 'lucide-react';
import { API_URL } from '@/lib/api';
import { usePlatformSettings } from '@/context/PlatformSettingsContext';

const fetcher = (url: string) => fetch(url, { cache: 'no-store' }).then(res => res.json());

interface QuickBrowseCategoriesProps {
  activeSlug?: string;
}

export default function QuickBrowseCategories({ activeSlug = 'all' }: QuickBrowseCategoriesProps) {
  const { settings } = usePlatformSettings();
  const { data: categories, error } = useSWR(`${API_URL}/api/categories/quick-browse`, fetcher);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Check if scrolling is possible in both directions
  const checkScrollLimits = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 10);
  }, []);

  const scrollLeft = () => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: -240, behavior: 'smooth' });
  };

  const scrollRight = () => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: 240, behavior: 'smooth' });
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      el.addEventListener('scroll', checkScrollLimits);
      // Run initial check after components mount/hydrate
      setTimeout(checkScrollLimits, 500);
    }
    return () => el?.removeEventListener('scroll', checkScrollLimits);
  }, [checkScrollLimits, categories]);

  // If global setting disables this bar, render nothing
  if (settings.quickBrowseEnabled === false) return null;
  if (error) return null;
  if (!categories) {
    // Skeleton Loader matching layout
    return (
      <div className="w-full bg-[#fcfdfd] border-b border-slate-100 py-3 animate-pulse">
        <div className="standard-container px-4">
          <div className="flex gap-4 md:gap-6 overflow-hidden">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="flex flex-col items-center shrink-0 gap-2">
                <div className="w-14 h-14 rounded-2xl bg-slate-100" />
                <div className="h-3 w-12 bg-slate-100 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Helper to determine if an icon is a single emoji character
  const isEmoji = (str: string) => {
    if (!str) return false;
    const charCount = Array.from(str).length;
    // Basic emoji detection: length is 1 or 2 characters and contains non-ascii
    return charCount <= 2 && /[^\x00-\x7F]/.test(str);
  };

  const renderIcon = (cat: any, isActive: boolean) => {
    const iconValue = cat.icon || '';
    
    if (isEmoji(iconValue)) {
      return (
        <span className="text-2xl select-none leading-none transform transition-transform group-hover:scale-110">
          {iconValue}
        </span>
      );
    }

    if (iconValue.startsWith('http') || iconValue.startsWith('/')) {
      return (
        <div className="relative w-7 h-7">
          <img
            src={iconValue}
            alt=""
            className="w-full h-full object-contain filter group-hover:brightness-110"
            loading="lazy"
          />
        </div>
      );
    }

    if (cat.image) {
      return (
        <div className="relative w-full h-full overflow-hidden rounded-[1.25rem]">
          <Image
            src={cat.image}
            alt={cat.name}
            fill
            className="object-cover scale-100 group-hover:scale-110 transition-transform duration-500"
            sizes="64px"
            unoptimized
          />
        </div>
      );
    }

    return (
      <LayoutGrid
        size={20}
        className={`transition-colors ${isActive ? 'text-white' : 'text-emerald-700'}`}
      />
    );
  };

  return (
    <section className="lg:hidden w-full bg-[#f8fafc] border-b border-slate-200/80 py-3 relative group/browse animate-in fade-in duration-500">
      <div className="standard-container px-4 relative flex items-center">
        
        {/* Navigation Arrow - Left */}
        {canScrollLeft && (
          <button
            onClick={scrollLeft}
            className="hidden md:flex absolute left-2 z-20 h-8 w-8 items-center justify-center rounded-full bg-white border border-slate-200 text-slate-600 hover:text-emerald-700 hover:border-emerald-100 shadow-md shadow-slate-100/50 hover:bg-slate-50 transition-all duration-300 transform -translate-y-1/2 top-1/2"
            aria-label="Scroll left"
          >
            <ChevronLeft size={16} strokeWidth={2.5} />
          </button>
        )}

        {/* Scrollable Container */}
        <div
          ref={scrollRef}
          className="w-full flex items-center overflow-x-auto no-scrollbar gap-4 md:gap-5 scroll-smooth py-1 px-1 snap-x snap-mandatory"
        >


          {/* Dynamic Categories */}
          {categories.map((category: any, idx: number) => {
            const isActive = activeSlug === category.slug || String(activeSlug) === String(category.id);
            const iconValue = category.icon || '';
            const isFullImage = category.image && !isEmoji(iconValue) && !(iconValue.startsWith('http') || iconValue.startsWith('/'));

            return (
              <div key={category.id} className="snap-start shrink-0">
                <Link
                  href={`/categories/${category.slug || category.id}`}
                  prefetch={false}
                  className="group flex flex-col items-center gap-1.5 text-center transition-all duration-300"
                >
                  <div
                    className={`w-14 h-14 md:w-16 md:h-16 rounded-[1.25rem] flex items-center justify-center transition-all duration-500 shadow-sm border ${
                      isFullImage ? 'p-0 overflow-hidden' : 'p-2.5'
                    } ${
                      isActive
                        ? isFullImage
                          ? 'border-emerald-600 ring-4 ring-emerald-600/30 scale-105'
                          : 'bg-emerald-600 border-emerald-500 shadow-md shadow-emerald-600/10 scale-105 text-white'
                        : 'bg-white border-slate-200 hover:border-emerald-200 hover:bg-emerald-50/30'
                    }`}
                  >
                    {renderIcon(category, isActive)}
                  </div>
                  <span
                    className={`text-[11px] md:text-[12px] font-bold uppercase tracking-[0.06em] leading-[1.2] px-1 max-w-[80px] line-clamp-2 transition-colors ${
                      isActive ? 'text-emerald-950 font-black' : 'text-slate-500 group-hover:text-emerald-700'
                    }`}
                  >
                    {category.name}
                  </span>
                </Link>
              </div>
            );
          })}
        </div>

        {/* Navigation Arrow - Right */}
        {canScrollRight && (
          <button
            onClick={scrollRight}
            className="hidden md:flex absolute right-2 z-20 h-8 w-8 items-center justify-center rounded-full bg-white border border-slate-200 text-slate-600 hover:text-emerald-700 hover:border-emerald-100 shadow-md shadow-slate-100/50 hover:bg-slate-50 transition-all duration-300 transform -translate-y-1/2 top-1/2"
            aria-label="Scroll right"
          >
            <ChevronRight size={16} strokeWidth={2.5} />
          </button>
        )}

      </div>
    </section>
  );
}
