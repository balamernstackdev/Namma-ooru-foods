'use client';

import React, { useRef, useState, useEffect } from 'react';
import useSWR from 'swr';
import Link from 'next/link';
import { API_URL } from '@/lib/api';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { QuickPick } from '@/app/admin/quick-picks/page';

const fetcher = (url: string) => fetch(url).then(r => r.json());

export default function QuickPicksStrip() {
  const { data: quickPicks, error, isLoading } = useSWR<QuickPick[]>(
    `${API_URL}/api/quick-picks`,
    fetcher
  );

  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const [isHovered, setIsHovered] = useState(false);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setShowLeftArrow(scrollLeft > 10);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [quickPicks]);

  // Auto-scrolling logic
  useEffect(() => {
    if (isHovered || !scrollRef.current || !quickPicks || quickPicks.length === 0) return;

    const interval = setInterval(() => {
      if (scrollRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
        
        // If we reached the end, scroll back to start
        if (scrollLeft >= scrollWidth - clientWidth - 10) {
          scrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          // Scroll by roughly one item width
          scrollRef.current.scrollBy({ left: 100, behavior: 'smooth' });
        }
      }
    }, 3000); // Auto scroll every 3 seconds

    return () => clearInterval(interval);
  }, [isHovered, quickPicks]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = scrollRef.current.clientWidth * 0.75;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  if (isLoading || error || !quickPicks || !Array.isArray(quickPicks) || quickPicks.length === 0) {
    return null; // Don't render anything if empty or loading to prevent layout shift
  }

  return (
    <div 
      className="w-full relative z-30"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={() => setIsHovered(true)}
      onTouchEnd={() => {
        // Delay resuming auto-scroll slightly after touch ends
        setTimeout(() => setIsHovered(false), 2000);
      }}
    >
      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 relative group">
        
        {showLeftArrow && (
          <button 
            onClick={() => scroll('left')}
            className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-md border border-slate-100 rounded-full w-8 h-8 items-center justify-center text-slate-600 hover:text-emerald-600 hover:shadow-lg transition-all"
          >
            <ChevronLeft size={20} />
          </button>
        )}

        <div 
          ref={scrollRef}
          onScroll={checkScroll}
          className="flex items-start gap-3 sm:gap-5 overflow-x-auto no-scrollbar py-2 sm:py-4 px-2 overscroll-x-contain scroll-smooth"
        >
          {quickPicks.map((pick) => {
            const imageUrl = pick.customImageUrl || pick.product?.image || pick.category?.image || '/placeholder.png';
            const title = pick.title || pick.product?.name || pick.category?.name || pick.brandId || 'Item';
            
            let href = '#';
            if (pick.type === 'PRODUCT') {
              href = `/products/${pick.product?.slug || pick.productId}${pick.isFreeDelivery ? '?freeDelivery=true' : ''}`;
            } else if (pick.type === 'CATEGORY') {
              href = `/categories/${pick.category?.slug || pick.categoryId}`;
            } else if (pick.type === 'BRAND') {
              href = `/search?q=${encodeURIComponent(pick.brandId || '')}`;
            } else if (pick.type === 'COLLECTION') {
              href = `/collection/${pick.id}`;
            }

            return (
              <Link 
                key={pick.id} 
                href={href}
                className="flex flex-col items-center shrink-0 group w-[64px] sm:w-[80px]"
              >
                <div className="relative w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={imageUrl} 
                    alt={title} 
                    className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300"
                    loading="lazy"
                  />
                  {pick.isFreeDelivery && (
                    <div className="absolute -top-1 -left-2 sm:-left-3 bg-orange-500 text-white text-[8px] sm:text-[10px] font-bold uppercase px-1.5 py-0.5 rounded-full shadow-sm whitespace-nowrap z-10 border border-white">
                      {pick.badge || 'FREE'}
                    </div>
                  )}
                  
                  {pick.badge && !pick.isFreeDelivery && (
                    <div className="absolute -top-1 -right-2 bg-emerald-600 text-white text-[8px] sm:text-[10px] font-bold uppercase px-1.5 py-0.5 rounded-full shadow-sm whitespace-nowrap z-10 border border-white">
                      {pick.badge}
                    </div>
                  )}
                </div>
                
                <div className="mt-2 text-center w-full px-0.5">
                  <span className="text-[10px] sm:text-xs font-bold text-slate-800 leading-tight block group-hover:text-emerald-700 transition-colors line-clamp-2">
                    {title}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>

        {showRightArrow && (
          <button 
            onClick={() => scroll('right')}
            className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-md border border-slate-100 rounded-full w-8 h-8 items-center justify-center text-slate-600 hover:text-emerald-600 hover:shadow-lg transition-all"
          >
            <ChevronRight size={20} />
          </button>
        )}
      </div>

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
