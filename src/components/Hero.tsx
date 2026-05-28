'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { API_URL } from '@/lib/api';
import useSWR from 'swr';

const FALLBACK_BANNERS = [
  { id: 1, image: '/ai_images/banner_farm_fresh.png', title: 'Farm Fresh Delivered to You', subtitle: '🌿 Just Producted Today', cta: 'Shop Fresh', link: '/products' },
  { id: 2, image: '/ai_images/banner_heritage_spices.png', title: 'Authentic Spices', subtitle: '🌶️ Secret of South Indian Taste', cta: 'Explore Spices', link: '/products' }
];

const fetcher = (url: string) => fetch(url).then(res => res.json());

const Hero = () => {
  const [current, setCurrent] = useState(0);
  const { data: apiBanners } = useSWR(`${API_URL}/api/banners`, fetcher);

  const slides = apiBanners && Array.isArray(apiBanners) && apiBanners.length > 0
    ? apiBanners
      .filter((b: any) => b.desktopImage && typeof b.desktopImage === 'string' && b.desktopImage.trim() !== '')
      .map((b: any) => ({
        id: b.id,
        title: b.title,
        subtitle: b.tagline,
        highlight: b.subtitle,
        image: b.desktopImage,
        link: b.link || '/products',
        cta: b.buttonText || 'Shop Now'
      }))
    : FALLBACK_BANNERS;

  const activeSlides = slides.length > 0 ? slides : FALLBACK_BANNERS;
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const next = useCallback(() => setCurrent(c => (c + 1) % activeSlides.length), [activeSlides.length]);
  const prev = useCallback(() => setCurrent(c => (c - 1 + activeSlides.length) % activeSlides.length), [activeSlides.length]);

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(next, 6000);
  }, [next]);

  useEffect(() => {
    resetTimer();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [resetTimer]);

  return (
    <section className="w-full pt-2 md:pt-4 pb-2 bg-white overflow-hidden relative">
      <div className="standard-container">
        <div className="relative w-full h-[180px] sm:h-[260px] md:h-[320px] lg:h-[360px] rounded-[1.5rem] md:rounded-[2.5rem] overflow-hidden group shadow-xl bg-slate-100">

          {/* Slides */}
          {activeSlides.map((s, idx) => (
            <div
              key={s.id ?? idx}
              className="absolute inset-0 transition-all duration-[1200ms] ease-in-out"
              style={{
                opacity: current === idx ? 1 : 0,
                transform: current === idx ? 'scale(1)' : 'scale(1.08)',
                zIndex: current === idx ? 5 : 1
              }}
            >
              <Image
                src={s.image || '/ai_images/banner_farm_fresh.png'}
                alt={s.title || 'Banner'}
                fill
                className="object-cover"
                priority={idx === 0}
                sizes="100vw"
                unoptimized={true}
              />
              {/* Modern Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/20 to-transparent z-10" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent z-10" />
            </div>
          ))}

          {/* Content Overlay - Left Aligned for Modern Look */}
          <div className="relative z-10 h-full flex flex-col justify-center px-6 sm:px-10 md:px-16 lg:px-20">
            <div key={current} className="max-w-lg md:max-w-xl">
              <span
                className="inline-block text-[8px] md:text-[10px] font-black uppercase tracking-[0.3em] mb-2 md:mb-4 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 backdrop-blur-sm"
                style={{ animation: 'heroSlideRight 0.6s ease both' }}
              >
                {activeSlides[current]?.subtitle || 'namma ooru Essentials'}
              </span>

              <h1
                className="text-white font-black leading-[1.1] mb-4 md:mb-6 text-2xl sm:text-3xl md:text-4xl lg:text-[44px] drop-shadow-lg uppercase tracking-tight"
                style={{ animation: 'heroSlideRight 0.7s 0.1s ease both' }}
              >
                {activeSlides[current]?.title}
              </h1>

              <div style={{ animation: 'heroSlideRight 0.8s 0.2s ease both', opacity: 0 }} className="animate-fill-forwards">
                <Link
                  href={activeSlides[current]?.link || '/products'}
                  className="group inline-flex items-center gap-3 h-10 md:h-12 px-6 md:px-10 rounded-full bg-amber-500 text-slate-950 font-black uppercase tracking-widest text-[9px] md:text-[10px] shadow-lg transition-all hover:bg-white hover:scale-105 active:scale-95"
                >
                  {activeSlides[current]?.cta || 'Explore Now'}
                  <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </div>

          {/* Minimalist Controls */}
          <div className="absolute bottom-4 md:bottom-6 right-6 md:right-10 z-20 flex items-center gap-4">
            {/* Pagination Dots */}
            <div className="flex gap-2.5 items-center">
              {activeSlides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => { setCurrent(idx); resetTimer(); }}
                  className="h-1.5 transition-all duration-500 rounded-full"
                  style={{
                    width: idx === current ? 40 : 10,
                    backgroundColor: idx === current ? '#f59e0b' : 'rgba(255,255,255,0.3)',
                  }}
                />
              ))}
            </div>

            {/* Navigation Arrows */}
            <div className="hidden md:flex gap-3 ml-4">
              <button
                onClick={() => { prev(); resetTimer(); }}
                className="h-12 w-12 rounded-full border border-white/20 bg-white/10 backdrop-blur-md text-white flex items-center justify-center hover:bg-white hover:text-emerald-950 transition-all active:scale-90"
              >
                <ChevronLeft size={20} strokeWidth={3} />
              </button>
              <button
                onClick={() => { next(); resetTimer(); }}
                className="h-12 w-12 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center hover:bg-white transition-all active:scale-90"
              >
                <ChevronRight size={20} strokeWidth={3} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes heroSlideRight {
          from { opacity: 0; transform: translateX(-30px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        .animate-fill-forwards { animation-fill-mode: forwards; }
      `}} />
    </section>
  );
};

export default Hero;
