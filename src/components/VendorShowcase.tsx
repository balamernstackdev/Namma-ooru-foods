'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { ArrowRight, ChevronLeft, ChevronRight, ShieldCheck, Sparkles } from 'lucide-react';
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
    const scrollAmount = isMobile ? 300 : 400;

    if (el.scrollLeft + el.clientWidth >= el.scrollWidth - 10) {
      el.scrollTo({ left: 0, behavior: 'smooth' });
    } else {
      el.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  }, []);

  const scrollLeft = () => {
    const isMobile = window.innerWidth < 768;
    const scrollAmount = isMobile ? 300 : 400;
    scrollRef.current?.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
  };

  useEffect(() => {
    if (isPaused || brandsList.length <= 4) return;
    timerRef.current = setInterval(scrollRight, 4000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [scrollRight, isPaused, brandsList.length]);

  if (error) return null;
  if (!responseData) return (
    <div className="standard-container py-20">
      <div className="h-64 animate-pulse bg-slate-50 rounded-[3rem]" />
    </div>
  );

  return (
    <section className="w-full py-4 md:py-8 bg-white relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-[0.03]">
        <div className="absolute top-10 left-10 w-64 h-64 rounded-full border-[40px] border-emerald-900" />
        <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full border-[60px] border-amber-500" />
      </div>

      <div className="standard-container">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-6 md:mb-12 gap-8">
          <div className="flex flex-col space-y-6 md:space-y-8">
            <div className="flex items-center gap-2">
              <Sparkles size={14} className="text-amber-500" />
              <span className="text-[10px] md:text-xs font-black text-amber-500 uppercase tracking-[0.4em]">Our Vendors</span>
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-7xl font-black text-emerald-950 tracking-tighter uppercase leading-[1.3] md:leading-[1.2] flex flex-col">
              <span>Curated</span>
              <span className="text-amber-500 italic lowercase font-serif font-normal">Artisan Clusters</span>
            </h2>
          </div>

        </div>

        <div className="relative group">
          <div
            ref={scrollRef}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            className="flex overflow-x-auto no-scrollbar gap-6 md:gap-8 pb-12 scroll-smooth items-stretch px-4 -mx-4 snap-x snap-mandatory"
          >
            {brandsList.map((brand: any) => (
              <Link
                key={brand.id}
                href={`/brands/${brand.id}`}
                className="group flex flex-col shrink-0 w-[280px] md:w-[320px] bg-white rounded-[2.5rem] p-4 transition-all duration-500 hover:-translate-y-3 hover:shadow-[0_40px_80px_-20px_rgba(6,78,59,0.12)] border border-slate-100 relative overflow-hidden snap-start"
              >
                {/* Brand Visual Card */}
                <div className="relative h-48 md:h-56 w-full rounded-[2rem] overflow-hidden mb-6">
                  <OptimizedImage
                    src={brand.logo || '/ai_images/placeholder_brand.png'}
                    alt={brand.name}
                    fill
                    className="object-cover transition-transform duration-[2000ms] group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/80 via-transparent to-transparent opacity-60" />

                  {/* Verification Badge */}
                  <div className="absolute top-4 right-4 h-8 px-3 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center gap-1.5">
                    <ShieldCheck size={12} className="text-emerald-400" />
                    <span className="text-[8px] font-black text-white uppercase tracking-widest">Verified Artisan</span>
                  </div>

                  <div className="absolute bottom-4 left-4">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/10">
                      <Sparkles size={10} className="text-amber-400" />
                      <span className="text-[7px] font-black text-white uppercase tracking-[0.2em]">Curated Partner</span>
                    </div>
                  </div>
                </div>

                <div className="px-2 pb-2">
                  <h3 className="text-emerald-950 font-black text-xl md:text-2xl tracking-tight mb-2 group-hover:text-emerald-700 transition-colors">
                    {brand.name}
                  </h3>
                  <p className="text-slate-400 text-[11px] md:text-xs font-medium leading-relaxed line-clamp-2">
                    {brand.description || 'Authentic artisan products sourced directly from local heritage clusters.'}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

