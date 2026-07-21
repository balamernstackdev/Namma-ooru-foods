/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useRef, useEffect, useCallback, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import ProductCard from './ProductCard';
import Link from 'next/link';
import BannerCarousel from './BannerCarousel';
import { useBanners } from '@/hooks/useBanners';
import CarouselNavigation from './CarouselNavigation';

interface ProductCarouselProps {
  products: any[];
  title: string;
  subtitle: string;
  viewAllHref?: string;
  bgClass?: string;
  autoScrollInterval?: number; // ms, default 3000
  bannerType?: string; // e.g., 'best_sellers', 'organic_collection'
  children?: React.ReactNode; // For filters or sub-headers in sections
}

export default function ProductCarousel({
  products,
  title,
  subtitle,
  viewAllHref = '/products',
  bgClass = 'bg-white',
  autoScrollInterval = 3000,
  bannerType,
  children,
}: ProductCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

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

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;

    // Dot navigation index calculation
    const itemWidth = el.children[0]?.clientWidth || 165;
    const gap = window.innerWidth < 768 ? 16 : (window.innerWidth < 1440 ? 20 : 24);
    const index = Math.round(el.scrollLeft / (itemWidth + gap));
    setActiveIndex(index);

    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 10);
  }, []);

  const scrollLeft = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;

    const itemWidth = el.children[0]?.clientWidth || 320;
    const gap = window.innerWidth < 768 ? 12 : (window.innerWidth < 1440 ? 20 : 24);
    const scrollStep = itemWidth + gap;

    if (el.scrollLeft <= 10) {
      el.scrollTo({ left: el.scrollWidth, behavior: 'smooth' });
    } else {
      el.scrollBy({ left: -scrollStep, behavior: 'smooth' });
    }
  }, []);

  const scrollRight = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;

    const itemWidth = el.children[0]?.clientWidth || 320;
    const gap = window.innerWidth < 768 ? 12 : (window.innerWidth < 1440 ? 20 : 24);
    const scrollStep = itemWidth + gap;

    // If at end, loop back to start
    if (el.scrollLeft + el.clientWidth >= el.scrollWidth - 15) {
      el.scrollTo({ left: 0, behavior: 'smooth' });
    } else {
      el.scrollBy({ left: scrollStep, behavior: 'smooth' });
    }
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener('scroll', handleScroll, { passive: true });
    // Initial check
    setTimeout(handleScroll, 200);
    return () => el.removeEventListener('scroll', handleScroll);
  }, [handleScroll, products]);

  // Auto-scroll logic (pauses on hover)
  useEffect(() => {
    if (!autoScrollInterval || products.length === 0) return;

    let intervalId: NodeJS.Timeout;
    let isHovered = false;

    const startInterval = () => {
      intervalId = setInterval(() => {
        if (!isHovered) {
          scrollRight();
        }
      }, autoScrollInterval);
    };

    startInterval();

    const el = scrollRef.current;
    const handleMouseEnter = () => {
      isHovered = true;
      clearInterval(intervalId);
    };
    const handleMouseLeave = () => {
      isHovered = false;
      startInterval();
    };

    if (el) {
      el.addEventListener('mouseenter', handleMouseEnter);
      el.addEventListener('mouseleave', handleMouseLeave);
    }

    return () => {
      clearInterval(intervalId);
      if (el) {
        el.removeEventListener('mouseenter', handleMouseEnter);
        el.removeEventListener('mouseleave', handleMouseLeave);
      }
    };
  }, [scrollRight, autoScrollInterval, products.length]);

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
    <section className={`py-6 md:py-8 ${bgClass} flex justify-center`}>
      <div className="standard-container w-full">
        
        {/* Header Block */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-3 md:mb-4 gap-4">
          <div className="space-y-1">
            {subtitle && (
              <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.35em] text-amber-500 block mb-1">
                {subtitle}
              </span>
            )}
            <h2
              className="text-emerald-950 font-black tracking-tighter text-2xl md:text-3xl lg:text-4xl leading-tight uppercase"
              dangerouslySetInnerHTML={{ __html: title }}
            />
          </div>

          {/* Desktop & Tablet Navigation Link (Arrows removed) */}
          <div className="hidden md:flex items-center shrink-0">
            <Link
              href={viewAllHref}
              prefetch={false}
              className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-emerald-950 transition-colors"
            >
              View All
            </Link>
          </div>
        </div>

        {/* Children slot (Filters or category tabs) */}
        {children && <div className="mb-4">{children}</div>}

        {/* Banners */}
        {banners && banners.length > 0 && (
          <div className="mb-4">
            <BannerCarousel banners={banners} />
          </div>
        )}

        {/* Scrollable Track with standardized float arrows wrapper */}
        {/* px-8 creates space for the absolute arrows so they float outside the track without overlapping cards */}
        <div className="relative w-full px-0 md:px-8">
          <div
            ref={scrollRef}
            onMouseDown={onMouseDown}
            onMouseLeave={onMouseLeave}
            onMouseUp={onMouseUp}
            onMouseMove={onMouseMove}
            onKeyDown={onKeyDown}
            tabIndex={0}
            className="product-carousel-track pb-3 pt-1 cursor-grab active:cursor-grabbing focus:outline-none items-stretch overflow-x-auto px-4 md:px-0"
          >
            {products.map((product: any, index: number) => (
              <div
                key={product.id}
                className="product-carousel-item"
              >
                <ProductCard product={product} index={index} />
              </div>
            ))}
          </div>

          {/* Reusable premium navigation arrows float outside */}
          <CarouselNavigation
            onPrev={scrollLeft}
            onNext={scrollRight}
            canPrev={canScrollLeft}
            canNext={canScrollRight}
          />
        </div>

        {/* Mobile Pagination Dots */}
        <div className="md:hidden flex justify-center gap-1.5 mt-1.5 mb-2">
          {products.slice(0, Math.min(10, products.length)).map((_, idx) => (
            <div
              key={idx}
              className={`h-1 rounded-full transition-all duration-300 ${idx === activeIndex ? 'w-4 bg-[#0f9d58]' : 'w-1 bg-slate-300'}`}
            />
          ))}
        </div>

        {/* Mobile centered View All link */}
        <div className="md:hidden flex justify-center mt-1.5">
          <Link
            href={viewAllHref}
            prefetch={false}
            className="h-10 px-8 rounded-full border border-slate-200 bg-white flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-all shadow-sm"
          >
            Explore All Products <ArrowRight size={13} />
          </Link>
        </div>

      </div>
    </section>
  );
}
