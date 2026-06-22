'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useBanners } from '@/hooks/useBanners';
import useSWR from 'swr';
import { API_URL } from '@/lib/api';

const fetcher = (url: string) => fetch(url).then(res => res.json());

const Hero = () => {
  const [current, setCurrent] = useState(0);
  const { heroBanners } = useBanners();

  const { data: rawAnnouncements } = useSWR<any[]>(
    `${API_URL}/api/offer-announcements?activeOnly=true`,
    fetcher,
    { refreshInterval: 30000 }
  );

  const announcementSlides = React.useMemo(() => {
    if (!Array.isArray(rawAnnouncements)) return [];
    return rawAnnouncements
      .filter((a: any) => a.publishHomepage === true || a.announcementType === 'HERO_BANNER')
      .map((a: any) => ({
        id: `ann_${a.id}`,
        title: a.title,
        message: a.message,
        couponCode: a.couponCode,
        buttonText: a.buttonText || 'Shop Now',
        link: a.redirectUrl || '/products',
        bgColor: a.bgColor || '#014421',
        textColor: a.textColor || '#FFFFFF',
        isAnnouncement: true,
      }));
  }, [rawAnnouncements]);

  const activeSlides = React.useMemo(() => {
    // Only render active banners, excluding inactive or legacy banners without status 'active' or isActive: false
    const activeHeroBanners = heroBanners.filter(b => b.isActive !== false);
    return [
      ...activeHeroBanners.map((b) => ({
        id: b.id,
        image: b.banner_image,
        link: b.link || '/products',
        isAnnouncement: false,
      })),
      ...announcementSlides
    ];
  }, [heroBanners, announcementSlides]);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const next = useCallback(() => setCurrent(c => (c + 1) % (activeSlides.length || 1)), [activeSlides.length]);
  const prev = useCallback(() => setCurrent(c => (c - 1 + activeSlides.length) % (activeSlides.length || 1)), [activeSlides.length]);

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (activeSlides.length > 0 && !isPaused) {
      timerRef.current = setInterval(() => {
        setCurrent(c => (c + 1) % (activeSlides.length || 1));
      }, 5000);
    }
  }, [activeSlides.length, isPaused]);

  // Console debug check
  useEffect(() => {
    console.log({
      currentSlide: current,
      totalBanners: activeSlides.length,
      activeSlidesList: activeSlides.map(s => s.id)
    });
  }, [current, activeSlides]);

  useEffect(() => {
    resetTimer();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [resetTimer]);

  const handleNext = () => {
    if (isAnimating || activeSlides.length <= 1) return;
    setIsAnimating(true);
    next();
    resetTimer();
    setTimeout(() => setIsAnimating(false), 500);
  };

  const handlePrev = () => {
    if (isAnimating || activeSlides.length <= 1) return;
    setIsAnimating(true);
    prev();
    resetTimer();
    setTimeout(() => setIsAnimating(false), 500);
  };

  // Keyboard controls
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (activeSlides.length <= 1) return;
    if (e.key === 'ArrowLeft') {
      handlePrev();
    } else if (e.key === 'ArrowRight') {
      handleNext();
    }
  };

  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  const handleTouchStart = (e: React.TouchEvent) => setTouchStart(e.targetTouches[0].clientX);
  const handleTouchMove = (e: React.TouchEvent) => setTouchEnd(e.targetTouches[0].clientX);
  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd || isAnimating) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;
    if (isLeftSwipe) { handleNext(); }
    if (isRightSwipe) { handlePrev(); }
    setTouchStart(0);
    setTouchEnd(0);
  };

  if (activeSlides.length === 0) return null;

  return (
    <section className="w-full pt-2 md:pt-4 pb-2 bg-white overflow-hidden relative">
      <div className="standard-container px-4 md:px-0">
        <div 
          tabIndex={0}
          onKeyDown={handleKeyDown}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          className="relative w-full aspect-[1920/600] rounded-[24px] overflow-hidden group shadow-sm bg-slate-50 focus:outline-none"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Slides Track */}
          <div 
            className="flex h-full w-full transition-transform duration-500 ease-in-out"
            style={{ 
              transform: `translateX(-${current * 100}%)`
            }}
          >
            {activeSlides.map((s: any, idx: number) => (
              <div
                key={s.id ?? idx}
                className="w-full h-full shrink-0 relative"
              >
                {s.isAnnouncement ? (
                  <div 
                    className="w-full h-full flex flex-col justify-center px-8 md:px-20 lg:px-32 text-left relative overflow-hidden"
                    style={{ backgroundColor: s.bgColor, color: s.textColor }}
                  >
                    {/* Decorative background shapes */}
                    <div className="absolute top-[-50%] right-[-10%] w-[60%] aspect-square rounded-full bg-white/5 blur-3xl pointer-events-none" />
                    <div className="absolute bottom-[-30%] left-[-10%] w-[40%] aspect-square rounded-full bg-black/10 blur-2xl pointer-events-none" />
                    
                    <div className="max-w-2xl relative z-10 space-y-3 md:space-y-4">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em]">
                        📢 Special Offer
                      </span>
                      
                      <h2 className="text-xl sm:text-3xl md:text-5xl lg:text-6xl font-black tracking-tight leading-tight uppercase">
                        {s.title}
                      </h2>
                      
                      <p className="text-xs sm:text-sm md:text-lg opacity-90 font-medium max-w-lg">
                        {s.message}
                      </p>
                      
                      {s.couponCode && (
                        <div className="inline-flex items-center gap-2 bg-white/15 border border-white/20 rounded-xl px-3 py-1.5 text-xs font-black tracking-wider w-fit">
                          <span>Use Coupon:</span>
                          <span className="text-amber-400 select-all font-mono tracking-widest">{s.couponCode}</span>
                        </div>
                      )}
                      
                      <div className="pt-2">
                        <Link 
                          href={s.link}
                          className="inline-flex h-10 md:h-12 px-6 md:px-8 rounded-full bg-amber-400 hover:bg-amber-500 text-slate-900 font-black uppercase tracking-widest text-[9px] md:text-[10px] hover:scale-105 transition-all items-center justify-center shadow-lg active:scale-95 pointer-events-auto"
                        >
                          {s.buttonText}
                        </Link>
                      </div>
                    </div>
                  </div>
                ) : (
                  s.image && (
                    <>
                      <Image
                        src={s.image}
                        alt={s.title || 'Banner'}
                        fill
                        className="w-full h-full object-cover object-center"
                        priority={idx === 0}
                        sizes="100vw"
                        quality={90}
                      />
                      {/* HTML Overlay for Text Content */}
                      {(s.title || s.subtitle || s.tagline || s.buttonText) && (
                        <div className="absolute inset-0 z-[5] flex flex-col justify-center px-8 md:px-20 lg:px-32 pointer-events-none">
                          <div className="max-w-2xl space-y-3 md:space-y-4 bg-black/20 md:bg-transparent backdrop-blur-sm md:backdrop-blur-none p-6 md:p-0 rounded-3xl md:rounded-none">
                            {s.tagline && (
                              <span className="inline-block px-4 py-1.5 rounded-full bg-emerald-600/95 text-white text-[10px] md:text-xs font-black uppercase tracking-[0.2em] shadow-lg">
                                {s.tagline}
                              </span>
                            )}
                            {s.title && (
                              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-black text-white tracking-tight leading-none uppercase drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)]">
                                {s.title}
                              </h2>
                            )}
                            {s.subtitle && (
                              <p className="text-sm sm:text-base md:text-xl lg:text-2xl font-bold text-white/95 leading-snug drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] max-w-xl">
                                {s.subtitle}
                              </p>
                            )}
                            {s.buttonText && (
                              <div className="pt-4">
                                <span className="inline-flex h-12 md:h-14 px-8 md:px-10 rounded-full bg-amber-400 hover:bg-amber-500 text-slate-900 font-black uppercase tracking-[0.2em] text-[11px] md:text-sm items-center justify-center shadow-xl transition-all hover:scale-105 active:scale-95 pointer-events-auto cursor-pointer">
                                  {s.buttonText}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </>
                  )
                )}
              </div>
            ))}
          </div>

          {/* Full Banner Click Link */}
          {activeSlides[current]?.link && !activeSlides[current]?.isAnnouncement && (
            <Link
              href={activeSlides[current].link}
              className="absolute inset-0 z-30 cursor-pointer pointer-events-auto"
              aria-label='Promo Banner'
            />
          )}

          {/* Responsive Navigation Arrows */}
          <div className="flex absolute inset-y-0 left-2 right-2 md:left-4 md:right-4 z-40 items-center justify-between pointer-events-none">
            <button
              onClick={(e) => { e.stopPropagation(); handlePrev(); }}
              className="h-8 w-8 md:h-10 md:w-10 rounded-full bg-black/30 backdrop-blur-md border border-white/20 text-white flex items-center justify-center transition-all hover:bg-black/55 hover:scale-110 active:scale-95 pointer-events-auto shadow-sm opacity-100 md:opacity-0 md:group-hover:opacity-100 hero-slider-btn"
              aria-label="Previous banner"
            >
              <ChevronLeft className="h-4 w-4 md:h-5 md:w-5" strokeWidth={2.5} />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); handleNext(); }}
              className="h-8 w-8 md:h-10 md:w-10 rounded-full bg-black/30 backdrop-blur-md border border-white/20 text-white flex items-center justify-center transition-all hover:bg-black/55 hover:scale-110 active:scale-95 pointer-events-auto shadow-sm opacity-100 md:opacity-0 md:group-hover:opacity-100 hero-slider-btn"
              aria-label="Next banner"
            >
              <ChevronRight className="h-4 w-4 md:h-5 md:w-5" strokeWidth={2.5} />
            </button>
          </div>

          {/* Minimalist Bottom Indicators (Pagination Dots) */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-45 flex gap-2 items-center pointer-events-none">
            {activeSlides.map((_: any, idx: number) => (
              <button
                key={idx}
                onClick={(e) => {
                  e.stopPropagation();
                  if (isAnimating) return;
                  setIsAnimating(true);
                  setCurrent(idx);
                  resetTimer();
                  setTimeout(() => setIsAnimating(false), 500);
                }}
                className="h-1.5 transition-all duration-500 rounded-full pointer-events-auto"
                style={{
                  width: idx === current ? 16 : 6,
                  backgroundColor: idx === current ? '#ffffff' : 'rgba(255,255,255,0.5)',
                }}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
