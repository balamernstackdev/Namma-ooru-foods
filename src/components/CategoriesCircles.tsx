'use client';

import React, { useRef, useEffect, useCallback, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import useSWR from 'swr';
import { API_URL } from '@/lib/api';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const fetcher = (url: string) => fetch(url).then(res => res.json());

const CategoriesCircles = () => {
  const { data: responseData, error } = useSWR(`${API_URL}/api/categories`, fetcher);
  const scrollRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [isPaused, setIsPaused] = useState(false);

  const apiCategories = responseData?.categories || [];

  const displayCategories = apiCategories.length > 0
    ? apiCategories.filter((cat: any) => !cat.parentId).slice(0, 12).map((cat: any) => ({
      name: cat.name,
      image: cat.image || '/ai_images/indian_spices_1776231045209.png',
      href: `/products?category=${encodeURIComponent(cat.name)}`,
    }))
    : [];

  const scrollRight = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const scrollAmount = 200;
    if (el.scrollLeft + el.clientWidth >= el.scrollWidth - 10) {
      el.scrollTo({ left: 0, behavior: 'smooth' });
    } else {
      el.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  }, []);

  const scrollLeft = () => {
    scrollRef.current?.scrollBy({ left: -200, behavior: 'smooth' });
  };

  useEffect(() => {
    if (isPaused || displayCategories.length === 0) return;
    timerRef.current = setInterval(scrollRight, 3500);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [scrollRight, isPaused, displayCategories.length]);

  if (!responseData && !error) return null;

  return (
    <section className="w-full pt-8 pb-8 bg-white overflow-hidden">
      <div className="standard-container">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 md:mb-12 gap-4">
          <div className="flex flex-col">
            <span className="text-[10px] md:text-xs font-black text-amber-500 uppercase tracking-[0.4em] mb-3">Curated For You</span>
            <h2 className="text-3xl md:text-5xl font-black text-emerald-950 tracking-tighter uppercase leading-[0.9]">
              Shop by <span className="text-amber-500 italic lowercase font-serif">Category</span>
            </h2>
          </div>
          <Link href="/products" className="text-[10px] font-black text-emerald-950 uppercase tracking-widest hover:text-amber-500 transition-colors border-b-2 border-emerald-950/10 pb-1 shrink-0 self-start md:self-auto">
            View All Categories
          </Link>
        </div>

        {/* Scrollable Container */}
         {/* Horizontally scrollable row */}
        <div
          ref={scrollRef}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          className="flex overflow-x-auto no-scrollbar gap-6 md:gap-10 pb-6 scroll-smooth items-start px-1"
        >
          {displayCategories.map((category: any) => (
            <Link
              key={category.name}
              href={category.href}
              className="group flex flex-col items-center gap-3 shrink-0 transition-all hover:-translate-y-1"
            >
              <div
                className="relative overflow-hidden transition-all duration-300 group-hover:shadow-xl"
                style={{
                  width: 'clamp(80px, 12vw, 130px)',
                  height: 'clamp(80px, 12vw, 130px)',
                  borderRadius: '50%',
                  border: '3px solid #f1f5f9',
                }}
              >
                <Image
                  src={category.image}
                  alt={category.name}
                  fill
                  sizes="130px"
                  className="transition-transform duration-700 group-hover:scale-110 object-cover"
                  unoptimized={category.image?.startsWith('http')}
                />
              </div>

              <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-center leading-tight text-slate-400 group-hover:text-emerald-950 transition-colors">
                {category.name}
              </span>
            </Link>
          ))}
        </div>

          {/* Navigation Arrows (Desktop) */}
          <button 
            onClick={scrollLeft}
            className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-6 h-10 w-10 rounded-full bg-white shadow-lg items-center justify-center text-emerald-950 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all z-20 hover:bg-emerald-950 hover:text-white"
          >
            <ChevronLeft size={20} />
          </button>
          <button 
            onClick={scrollRight}
            className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-6 h-10 w-10 rounded-full bg-white shadow-lg items-center justify-center text-emerald-950 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all z-20 hover:bg-emerald-950 hover:text-white"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </section>
    );
};

export default CategoriesCircles;
