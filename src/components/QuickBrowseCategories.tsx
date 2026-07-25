'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import useSWR from 'swr';
import { 
  ChevronLeft, 
  ChevronRight, 
  LayoutGrid,
  Wheat, 
  Utensils, 
  Droplet, 
  Carrot, 
  Cookie, 
  Nut, 
  Flame,
  Leaf, 
  Coffee,
  PackageOpen
} from 'lucide-react';

const getCategoryIcon = (name: string) => {
  if (!name) return LayoutGrid;
  const lower = name.toLowerCase();
  if (lower.includes('rice') || lower.includes('millet')) return Wheat;
  if (lower.includes('flour') || lower.includes('powder')) return Utensils;
  if (lower.includes('oil')) return Droplet;
  if (lower.includes('pickle') || lower.includes('thokku')) return Carrot;
  if (lower.includes('snack') || lower.includes('sweet') || lower.includes('cookie') || lower.includes('cake') || lower.includes('bake') || lower.includes('chocolate') || lower.includes('mix')) return Cookie;
  if (lower.includes('nut') || lower.includes('dry fruit') || lower.includes('date') || lower.includes('almond') || lower.includes('honey')) return Nut;
  if (lower.includes('spice') || lower.includes('masala')) return Flame;
  if (lower.includes('health') || lower.includes('drink') || lower.includes('soup')) return Coffee;
  if (lower.includes('organic') || lower.includes('herbal') || lower.includes('amla') || lower.includes('moringa') || lower.includes('palm')) return Leaf;
  if (lower.includes('eat') || lower.includes('ready')) return PackageOpen;
  return LayoutGrid;
};
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
                <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-slate-100" />
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
    const IconComp = getCategoryIcon(cat.name);
    return (
      <IconComp
        size={24}
        strokeWidth={1.5}
        className={`transition-colors ${isActive ? 'text-amber-400' : 'text-emerald-800'}`}
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
                    className={`w-12 h-12 md:w-14 md:h-14 rounded-[1rem] flex items-center justify-center transition-all duration-500 p-2 md:p-2.5 ${
                      isActive
                        ? 'bg-slate-900 shadow-md scale-105'
                        : 'bg-transparent hover:bg-emerald-50/50'
                    }`}
                  >
                    {renderIcon(category, isActive)}
                  </div>
                  <span
                    className={`max-w-[72px] md:max-w-[88px] whitespace-normal break-words text-[10px] md:text-[11px] font-bold capitalize leading-tight px-1 transition-colors ${
                      isActive ? 'text-emerald-950' : 'text-slate-600 group-hover:text-emerald-800'
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
