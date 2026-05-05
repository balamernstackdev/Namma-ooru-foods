'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import useSWR from 'swr';

import { API_URL } from '@/lib/api';
import OptimizedImage from './ui/OptimizedImage';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function VendorShowcase() {
  const { data: responseData, error } = useSWR(`${API_URL}/api/brands`, fetcher);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const brandsList = responseData?.brands || [];

  const scrollRight = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;

    const isMobile = window.innerWidth < 768;
    const scrollAmount = isMobile ? 120 : 240;

    if (el.scrollLeft + el.clientWidth >= el.scrollWidth - 10) {
      el.scrollTo({ left: 0, behavior: 'smooth' });
    } else {
      el.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  }, []);

  const scrollLeft = () => {
    const isMobile = window.innerWidth < 768;
    const scrollAmount = isMobile ? 120 : 240;
    scrollRef.current?.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
  };

  useEffect(() => {
    if (isPaused || brandsList.length <= 3) return;
    timerRef.current = setInterval(scrollRight, 3000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [scrollRight, isPaused, brandsList.length]);

  if (error) return null;
  if (!responseData) return <div className="h-40 animate-pulse bg-slate-50 rounded-[3rem]" />;

  return (
    <section className="w-full pt-8 pb-8 bg-white overflow-hidden">
      <div className="standard-container">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 md:mb-12 gap-4">
          <div className="flex flex-col">
            <span className="text-[10px] md:text-xs font-black text-amber-500 uppercase tracking-[0.4em] mb-3">Premium Selection</span>
            <h2 className="text-3xl md:text-5xl font-black text-emerald-950 tracking-tighter uppercase leading-[0.9]">
              Brands <span className="text-amber-500 italic lowercase font-serif">You Love</span>
            </h2>
          </div>
          <Link href="/brands" className="text-[10px] font-black text-emerald-950 uppercase tracking-widest hover:text-amber-500 transition-colors border-b-2 border-emerald-950/10 pb-1 flex items-center gap-2 group shrink-0 self-start md:self-auto">
            Explore All Partners <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="relative group">
          <div
            ref={scrollRef}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            className="flex overflow-x-auto no-scrollbar gap-6 md:gap-10 pb-6 scroll-smooth items-start"
          >
            {brandsList.map((brand: any) => (
              <Link
                key={brand.id}
                href={`/brands/${brand.id}`}
                className="group flex flex-col items-center gap-4 shrink-0 transition-all hover:-translate-y-2"
              >
                <div
                  className="relative overflow-hidden transition-all duration-500 group-hover:shadow-2xl border-4 border-slate-50 bg-white"
                  style={{
                    width: 'clamp(90px, 12vw, 140px)',
                    height: 'clamp(90px, 12vw, 140px)',
                    borderRadius: '50%',
                  }}
                >
                  <OptimizedImage
                    src={brand.logo || '/ai_images/placeholder_brand.png'}
                    alt={brand.name}
                    fill
                    className="object-contain p-4 transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-emerald-950/0 group-hover:bg-emerald-950/5 transition-colors" />
                </div>
                <span className="text-[10px] md:text-[11px] font-black uppercase tracking-widest text-center leading-tight text-slate-400 group-hover:text-emerald-950 transition-colors">
                  {brand.name}
                </span>
              </Link>
            ))}
          </div>

          {/* Navigation Arrows (Desktop) */}
          <button 
            onClick={scrollLeft}
            className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-6 h-12 w-12 rounded-full bg-white shadow-xl items-center justify-center text-emerald-950 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all z-20 hover:bg-emerald-950 hover:text-white"
          >
            <ChevronLeft size={24} />
          </button>
          <button 
            onClick={scrollRight}
            className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-6 h-12 w-12 rounded-full bg-white shadow-xl items-center justify-center text-emerald-950 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all z-20 hover:bg-emerald-950 hover:text-white"
          >
            <ChevronRight size={24} />
          </button>
        </div>
      </div>
    </section>
  );
}
