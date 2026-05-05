'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { API_URL } from '@/lib/api';
import { HOME_BANNERS } from '@/lib/staticData';

import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(res => res.json());

const Hero = () => {
  const [current, setCurrent] = useState(0);
  const { data: apiBanners } = useSWR(`${API_URL}/api/banners`, fetcher);

  const slides = apiBanners && Array.isArray(apiBanners) && apiBanners.length > 0
    ? apiBanners.map((b: any) => ({
        id: b.id,
        title: b.title,
        subtitle: b.tagline, // Mapping tagline to subtitle for the badge
        highlight: b.subtitle, // Mapping subtitle to highlight
        image: b.desktopImage,
        link: b.link || '/products',
        cta: b.buttonText || 'Shop Now'
      }))
    : HOME_BANNERS;

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const next = useCallback(() => setCurrent(c => (c + 1) % slides.length), [slides.length]);
  const prev = useCallback(() => setCurrent(c => (c - 1 + slides.length) % slides.length), [slides.length]);

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(next, 5000);
  }, [next]);

  useEffect(() => {
    resetTimer();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [resetTimer]);

  const slide = slides[current];

  return (
    <section className="relative w-full overflow-hidden bg-emerald-950" style={{ height: 'auto' }}>
      {/* Responsive container with proper aspect ratio */}
      <div className="relative w-full h-[260px] sm:h-[340px] md:h-[420px] lg:h-[520px] xl:h-[580px]">
        
        {/* Full-bleed background slides */}
        {slides.map((s, idx) => (
          <div
            key={s.id ?? idx}
            className="absolute inset-0 transition-all duration-[1200ms] ease-in-out"
            style={{ 
              opacity: current === idx ? 1 : 0, 
              transform: current === idx ? 'scale(1)' : 'scale(1.05)',
              zIndex: current === idx ? 1 : 0 
            }}
          >
            <Image
              src={s.image}
              alt={s.title || 'Banner'}
              fill
              className="object-cover"
              priority={idx === 0}
              sizes="100vw"
              unoptimized={s.image?.startsWith('http')}
            />
            {/* Gradient overlays for text readability */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/30" />
          </div>
        ))}

        {/* CENTER text overlay */}
        <div className="relative z-10 w-full h-full flex flex-col items-center justify-center text-center px-6">
          <div key={current} className="max-w-4xl">
            {slide?.subtitle && (
              <span
                className="inline-block text-[10px] sm:text-[11px] md:text-xs font-black uppercase tracking-[0.35em] mb-3 md:mb-5"
                style={{ color: '#f59e0b', animation: 'heroFadeUp 0.6s ease both' }}
              >
                {slide.subtitle}
              </span>
            )}
            {slide?.title && (
              <h1
                className="text-white font-black leading-[1.05] mb-4 md:mb-8 drop-shadow-2xl text-2xl sm:text-3xl md:text-5xl lg:text-6xl xl:text-7xl"
                style={{ animation: 'heroFadeUp 0.7s 0.1s ease both' }}
              >
                {slide.title}
              </h1>
            )}
            <div style={{ animation: 'heroFadeUp 0.8s 0.2s ease both', opacity: 0 }} className="animate-fill-forwards">
              <Link
                href={slide?.link || '/products'}
                className="inline-flex items-center h-11 md:h-14 px-8 md:px-12 rounded-full text-[10px] md:text-[11px] font-black uppercase tracking-widest shadow-2xl transition-all hover:scale-105 active:scale-95"
                style={{ backgroundColor: '#f59e0b', color: '#1c1917' }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#d97706')}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#f59e0b')}
              >
                {slide?.cta || 'Shop Now'} &nbsp;→
              </Link>
            </div>
          </div>
        </div>

        {/* Navigation arrows — visible on hover */}
        <button
          onClick={() => { prev(); resetTimer(); }}
          aria-label="Previous slide"
          className="absolute left-3 md:left-8 top-1/2 -translate-y-1/2 z-20 h-10 w-10 md:h-12 md:w-12 rounded-full flex items-center justify-center transition-all opacity-0 hover:opacity-100 focus:opacity-100 shadow-xl"
          style={{ backgroundColor: 'rgba(255,255,255,0.85)', color: '#1c1917' }}
        >
          <ChevronLeft size={22} strokeWidth={2.5} />
        </button>
        <button
          onClick={() => { next(); resetTimer(); }}
          aria-label="Next slide"
          className="absolute right-3 md:right-8 top-1/2 -translate-y-1/2 z-20 h-10 w-10 md:h-12 md:w-12 rounded-full flex items-center justify-center transition-all opacity-0 hover:opacity-100 focus:opacity-100 shadow-xl"
          style={{ backgroundColor: '#065f46', color: '#ffffff' }}
        >
          <ChevronRight size={22} strokeWidth={2.5} />
        </button>

        {/* Dot indicators */}
        <div className="absolute bottom-4 md:bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-2.5 items-center">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => { setCurrent(idx); resetTimer(); }}
              aria-label={`Slide ${idx + 1}`}
              className="rounded-full transition-all duration-400"
              style={{
                width: idx === current ? 32 : 8,
                height: 8,
                backgroundColor: idx === current ? '#f59e0b' : 'rgba(255,255,255,0.45)',
              }}
            />
          ))}
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes heroFadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .animate-fill-forwards { animation-fill-mode: forwards; }
        section:hover button[aria-label="Previous slide"],
        section:hover button[aria-label="Next slide"] { opacity: 0.85; }
      `}} />
    </section>
  );
};

export default Hero;
