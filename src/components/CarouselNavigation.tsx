'use client';

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CarouselNavigationProps {
  onPrev: () => void;
  onNext: () => void;
  canPrev?: boolean;
  canNext?: boolean;
}

export default function CarouselNavigation({
  onPrev,
  onNext,
  canPrev = true,
  canNext = true,
}: CarouselNavigationProps) {
  return (
    <>
      {/* Left Navigation Arrow */}
      <button
        type="button"
        onClick={onPrev}
        aria-label="Previous"
        className={`absolute left-0 top-1/2 -translate-y-1/2 z-30 w-9 h-9 rounded-full bg-white border border-[#E5E7EB] shadow-[0_4px_16px_rgba(0,0,0,0.10)] flex items-center justify-center text-slate-800 hover:bg-[#0F8A5F] hover:text-white hover:border-[#0F8A5F] transition-all duration-300 hover:scale-105 active:scale-95 focus:outline-none shrink-0 hidden md:flex cursor-pointer ${
          canPrev ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <ChevronLeft size={18} strokeWidth={2.5} />
      </button>

      {/* Right Navigation Arrow */}
      <button
        type="button"
        onClick={onNext}
        aria-label="Next"
        className={`absolute right-0 top-1/2 -translate-y-1/2 z-30 w-9 h-9 rounded-full bg-white border border-[#E5E7EB] shadow-[0_4px_16px_rgba(0,0,0,0.10)] flex items-center justify-center text-slate-800 hover:bg-[#0F8A5F] hover:text-white hover:border-[#0F8A5F] transition-all duration-300 hover:scale-105 active:scale-95 focus:outline-none shrink-0 hidden md:flex cursor-pointer ${
          canNext ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <ChevronRight size={18} strokeWidth={2.5} />
      </button>
    </>
  );
}
