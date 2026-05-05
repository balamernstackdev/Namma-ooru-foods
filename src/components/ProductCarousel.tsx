'use client';

import { useRef, useEffect, useCallback, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import ProductCard from './ProductCard';
import Link from 'next/link';

interface ProductCarouselProps {
  products: any[];
  title: string;
  subtitle: string;
  viewAllHref?: string;
  bgClass?: string;
  autoScrollInterval?: number; // ms, default 3000
}

export default function ProductCarousel({
  products,
  title,
  subtitle,
  viewAllHref = '/products',
  bgClass = 'bg-white',
  autoScrollInterval = 3000,
}: ProductCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [isPaused, setIsPaused] = useState(false);

  // Card width is ~320px + 32px gap = ~352px
  const SCROLL_STEP = 352;

  const updateButtons = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  const scrollLeft = useCallback(() => {
    scrollRef.current?.scrollBy({ left: -SCROLL_STEP, behavior: 'smooth' });
    setTimeout(updateButtons, 350);
  }, [updateButtons]);

  const scrollRight = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    // If at end, loop back to start
    if (el.scrollLeft + el.clientWidth >= el.scrollWidth - 4) {
      el.scrollTo({ left: 0, behavior: 'smooth' });
    } else {
      el.scrollBy({ left: SCROLL_STEP, behavior: 'smooth' });
    }
    setTimeout(updateButtons, 350);
  }, [updateButtons]);

  // Auto-scroll
  useEffect(() => {
    if (isPaused || products.length === 0) return;
    timerRef.current = setInterval(scrollRight, autoScrollInterval);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [scrollRight, autoScrollInterval, isPaused, products.length]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener('scroll', updateButtons, { passive: true });
    updateButtons();
    return () => el.removeEventListener('scroll', updateButtons);
  }, [updateButtons]);

  if (products.length === 0) return null;

  return (
    <section className={`py-4 ${bgClass} flex justify-center`}>
      <div className="standard-container w-full">
        {/* Header */}
        <div className="flex items-end justify-between mb-3 px-1">
          <div>
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary mb-1 inline-block">
              {subtitle}
            </span>
            <h2
              className="text-slate-900 font-black tracking-tight text-2xl md:text-3xl leading-tight"
              dangerouslySetInnerHTML={{ __html: title }}
            />
          </div>
          <div className="flex items-center gap-3">
            {/* Prev button */}
            <button
              onClick={scrollLeft}
              aria-label="Previous products"
              className="h-11 w-11 rounded-full flex items-center justify-center border border-slate-200 transition-all shadow-sm active:scale-95 hover:scale-105"
              style={{ backgroundColor: '#f1f5f9', color: '#334155' }}
            >
              <ChevronLeft size={20} strokeWidth={2.5} />
            </button>
            {/* Next button */}
            <button
              onClick={scrollRight}
              aria-label="Next products"
              className="h-11 w-11 rounded-full flex items-center justify-center transition-all shadow-md active:scale-95 hover:scale-105"
              style={{ backgroundColor: '#065f46', color: '#ffffff' }}
            >
              <ChevronRight size={20} strokeWidth={2.5} />
            </button>
            <Link
              href={viewAllHref}
              className="hidden md:inline-flex text-[10px] font-black uppercase tracking-widest ml-2 whitespace-nowrap"
              style={{ color: '#065f46' }}
            >
              View All →
            </Link>
          </div>
        </div>

        {/* Scrollable row - contained */}
        <div className="relative z-10">
          <div
            ref={scrollRef}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            className="flex gap-4 md:gap-8 overflow-x-auto scroll-smooth pb-10 pt-4 snap-x snap-mandatory no-scrollbar"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {products.map((product: any) => (
              <div
                key={product.id}
                className="shrink-0 w-[240px] md:w-[320px] snap-start"
              >
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </div>

        {/* Mobile view-all */}
        <div className="md:hidden flex justify-center mt-4">
          <Link href={viewAllHref} className="text-[10px] font-black uppercase tracking-widest text-primary hover:text-accent transition-colors">
            View All Products →
          </Link>
        </div>
      </div>
    </section>
  );
}
