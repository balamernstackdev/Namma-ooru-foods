'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface BannerCarouselProps {
  banners: any[];
  autoSlideInterval?: number; // ms, default 5000
}

export default function BannerCarousel({ banners, autoSlideInterval = 5000 }: BannerCarouselProps) {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const next = useCallback(() => {
    if (banners.length <= 1) return;
    setCurrent(c => (c + 1) % banners.length);
  }, [banners.length]);

  const prev = useCallback(() => {
    if (banners.length <= 1) return;
    setCurrent(c => (c - 1 + banners.length) % banners.length);
  }, [banners.length]);

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (banners.length > 1 && !isPaused) {
      timerRef.current = setInterval(next, autoSlideInterval);
    }
  }, [banners.length, isPaused, next, autoSlideInterval]);

  useEffect(() => {
    resetTimer();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [resetTimer]);

  const handleNext = () => {
    if (isAnimating || banners.length <= 1) return;
    setIsAnimating(true);
    next();
    resetTimer();
    setTimeout(() => setIsAnimating(false), 500);
  };

  const handlePrev = () => {
    if (isAnimating || banners.length <= 1) return;
    setIsAnimating(true);
    prev();
    resetTimer();
    setTimeout(() => setIsAnimating(false), 500);
  };

  // Keyboard Support
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (banners.length <= 1) return;
    if (e.key === 'ArrowLeft') {
      handlePrev();
    } else if (e.key === 'ArrowRight') {
      handleNext();
    }
  };

  // Touch & Swipe Support
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd || isAnimating || banners.length <= 1) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;
    if (isLeftSwipe) handleNext();
    if (isRightSwipe) handlePrev();
    setTouchStart(0);
    setTouchEnd(0);
  };

  if (!banners || banners.length === 0) return null;

  return (
    <div
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="relative w-full overflow-hidden group rounded-2xl border border-slate-100 shadow-md bg-slate-50 focus:outline-none"
      style={{ aspectRatio: '1400/320' }}
    >
      {/* Slides track */}
      <div
        className="flex h-full w-full transition-transform duration-500 ease-in-out"
        style={{ transform: `translateX(-${current * 100}%)` }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {banners.map((b, idx) => (
          <div key={b.id || idx} className="w-full h-full shrink-0 relative flex items-center">
            {b.link ? (
              <Link href={b.link} className="absolute inset-0 z-10" aria-label={b.title || 'Promotion'} />
            ) : null}
            <img
              src={b.banner_image || b.image}
              alt={b.title || 'Promotion'}
              className="w-full h-full object-cover"
            />
          </div>
        ))}
      </div>

      {/* Slider Controls (Arrows) */}
      {banners.length > 1 && (
        <div className="absolute inset-0 flex items-center justify-between p-2 md:p-4 pointer-events-none z-20">
          <button
            onClick={(e) => { e.stopPropagation(); handlePrev(); }}
            className="h-8 w-8 md:h-10 md:w-10 rounded-full bg-black/30 hover:bg-black/55 backdrop-blur-md border border-white/20 text-white flex items-center justify-center transition-all hover:scale-105 active:scale-95 pointer-events-auto shadow-sm opacity-100 md:opacity-0 md:group-hover:opacity-100"
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-4 w-4 md:h-5 md:w-5" strokeWidth={2.5} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); handleNext(); }}
            className="h-8 w-8 md:h-10 md:w-10 rounded-full bg-black/30 hover:bg-black/55 backdrop-blur-md border border-white/20 text-white flex items-center justify-center transition-all hover:scale-105 active:scale-95 pointer-events-auto shadow-sm opacity-100 md:opacity-0 md:group-hover:opacity-100"
            aria-label="Next slide"
          >
            <ChevronRight className="h-4 w-4 md:h-5 md:w-5" strokeWidth={2.5} />
          </button>
        </div>
      )}

      {/* Pagination indicators */}
      {banners.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-1.5 items-center pointer-events-none">
          {banners.map((_, idx) => (
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
              className="h-2 w-2 rounded-full transition-all duration-300 pointer-events-auto"
              style={{
                backgroundColor: idx === current ? '#ffffff' : 'rgba(255, 255, 255, 0.4)',
                transform: idx === current ? 'scale(1.2)' : 'scale(1)',
              }}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
