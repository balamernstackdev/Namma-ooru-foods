/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useRef, useEffect, useCallback, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import ProductCard from './ProductCard';
import Link from 'next/link';
import BannerCarousel from './BannerCarousel';
import { useBanners } from '@/hooks/useBanners';

interface ProductCarouselProps {
  products: any[];
  title: string;
  subtitle: string;
  viewAllHref?: string;
  bgClass?: string;
  autoScrollInterval?: number; // ms, default 3000
  bannerType?: string; // e.g., 'best_sellers', 'organic_collection'
}

export default function ProductCarousel({
  products,
  title,
  subtitle,
  viewAllHref = '/products',
  bgClass = 'bg-white',
  autoScrollInterval: _autoScrollInterval = 3000,
  bannerType,
}: ProductCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

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

  // Fetch dynamic banners client-side
  const { allBanners } = useBanners();
  const banners = bannerType ? allBanners.filter((b: any) => b.type === bannerType) : [];

  // Card width is ~320px + 32px gap = ~352px

  const SCROLL_STEP = 352;

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;

    // Mobile dots calculation
    const itemWidth = el.children[0]?.clientWidth || 165;
    const gap = window.innerWidth < 768 ? 12 : 32;
    const index = Math.round(el.scrollLeft / (itemWidth + gap));
    setActiveIndex(index);
  }, []);

  const scrollLeft = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    if (el.scrollLeft <= 10) {
      el.scrollTo({ left: el.scrollWidth, behavior: 'smooth' });
    } else {
      el.scrollBy({ left: -SCROLL_STEP, behavior: 'smooth' });
    }
  }, []);

  const scrollRight = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    // If at end, loop back to start
    if (el.scrollLeft + el.clientWidth >= el.scrollWidth - 20) {
      el.scrollTo({ left: 0, behavior: 'smooth' });
    } else {
      el.scrollBy({ left: SCROLL_STEP, behavior: 'smooth' });
    }
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => el.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  if (products.length === 0) {
    return (
      <section className={`py-4 md:py-8 ${bgClass} flex justify-center`}>
        <div className="standard-container w-full flex flex-col items-center justify-center py-16 px-4 bg-white/50 backdrop-blur-sm rounded-[32px] border border-dashed border-slate-200">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
            <span className="text-2xl">📦</span>
          </div>
          <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight mb-2">No Products Available</h3>
          <p className="text-slate-500 font-medium text-sm text-center max-w-sm">
            There are currently no products available in this section. Please check back later.
          </p>
        </div>
      </section>
    );
  }
  return (
    <section className={`py-4 md:py-8 ${bgClass} flex justify-center`}>
      <div className="standard-container w-full">
        {/* Header */}
        <div className="flex items-end justify-between mb-3 px-1">
          <div>
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-amber-500 mb-4 inline-block">
              {subtitle}
            </span>
            <h2
              className="text-emerald-950 font-black tracking-tighter text-2xl md:text-4xl lg:text-5xl leading-none uppercase"
              dangerouslySetInnerHTML={{ __html: title }}
            />
          </div>
          <div className="flex items-center gap-4">
            <Link
              href={viewAllHref}
              prefetch={false}
              className="hidden md:inline-flex text-[10px] font-black uppercase tracking-widest whitespace-nowrap text-slate-400 hover:text-emerald-950 transition-colors"
            >
              View All →
            </Link>

            {/* Redesigned Carousel Navigation Arrows */}
            <div className="hidden md:flex items-center gap-2">
              <button
                type="button"
                onClick={scrollLeft}
                aria-label="Previous"
                className="w-11 h-11 rounded-full bg-white border border-[#E5E7EB] shadow-[0_8px_24px_rgba(0,0,0,0.08)] flex items-center justify-center text-slate-800 hover:bg-[#0F8A5F] hover:text-white hover:border-[#0F8A5F] transition-all duration-300 hover:scale-105 focus:outline-none shrink-0"
              >
                <ChevronLeft size={20} strokeWidth={2.5} />
              </button>
              <button
                type="button"
                onClick={scrollRight}
                aria-label="Next"
                className="w-11 h-11 rounded-full bg-white border border-[#E5E7EB] shadow-[0_8px_24px_rgba(0,0,0,0.08)] flex items-center justify-center text-slate-800 hover:bg-[#0F8A5F] hover:text-white hover:border-[#0F8A5F] transition-all duration-300 hover:scale-105 focus:outline-none shrink-0"
              >
                <ChevronRight size={20} strokeWidth={2.5} />
              </button>
            </div>
          </div>
        </div>

        {/* Banners (if present) */}
        {banners && banners.length > 0 && (
          <div className="mb-4 px-1">
            <BannerCarousel banners={banners} />
          </div>
        )}

        {/* Scrollable row - contained */}
        <div className="relative z-10 group/carousel w-full">
          <div
            ref={scrollRef}
            onMouseDown={onMouseDown}
            onMouseLeave={onMouseLeave}
            onMouseUp={onMouseUp}
            onMouseMove={onMouseMove}
            onKeyDown={onKeyDown}
            tabIndex={0}
            className={`flex gap-3 md:gap-8 overflow-x-auto scroll-smooth pb-10 pt-4 snap-x snap-mandatory no-scrollbar px-[10px] md:px-[20px] xl:px-[70px] cursor-grab active:cursor-grabbing focus:outline-none ${products.length < 4 ? 'lg:justify-center' : ''
              }`}
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {products.map((product: any) => (
              <div
                key={product.id}
                className="shrink-0 w-[165px] md:w-[320px] snap-start h-full"
              >
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </div>

        {/* Mobile Pagination Dots */}
        <div className="md:hidden flex justify-center gap-1.5 mt-[-10px] mb-4">
          {products.slice(0, 10).map((_, idx) => (
            <div
              key={idx}
              className={`h-1.5 rounded-full transition-all duration-300 ${idx === activeIndex ? 'w-4 bg-[#0f9d58]' : 'w-1.5 bg-slate-300'}`}
            />
          ))}
        </div>

        {/* Mobile view-all */}
        <div className="md:hidden flex justify-center mt-0">
          <Link href={viewAllHref} prefetch={false} className="text-[10px] font-black uppercase tracking-widest text-primary hover:text-accent transition-colors border-b border-primary/20 pb-1">
            View All Products →
          </Link>
        </div>
      </div>
    </section>
  );
}
