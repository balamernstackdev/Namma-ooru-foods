'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface HeroCarouselProps {
  images: string[];
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  badges?: React.ReactNode;
  height?: string;
  overlayColor?: string;
}

const HeroCarousel = ({ 
  images, 
  title, 
  subtitle, 
  badges, 
  height = 'h-[280px] md:h-[400px]',
  overlayColor = 'rgba(5, 44, 30, 0.7)' // Default Emerald Black overlay
}: HeroCarouselProps) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % images.length);
    }, 5000); // 5 seconds auto-slide
    return () => clearInterval(timer);
  }, [images.length]);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % images.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + images.length) % images.length);

  return (
    <section className={`relative w-full overflow-hidden flex items-center justify-center ${height}`}>
      {/* Background Slides */}
      {images.map((img, index) => (
        <div 
          key={img} 
          className={`absolute inset-0 transition-all duration-[2400ms] cubic-bezier(0.4, 0, 0.2, 1) ${index === currentSlide ? 'opacity-100 scale-100 blur-0' : 'opacity-0 scale-110 blur-xl'}`}
        >
          <Image 
            src={img.startsWith('http') || img.startsWith('/') ? img : `/${img}`} 
            alt=""
            fill
            className="object-cover"
            priority={index === 0}
            sizes="100vw"
          />
          {/* Multi-layered gradient for depth and text protection */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-black/60 z-10" />
          <div className="absolute inset-0 bg-emerald-950/40 mix-blend-multiply z-10" />
          <div className="absolute inset-0 bg-black/20 z-10" />
        </div>
      ))}
 
      {/* Content Overlay */}
      <div className="relative z-20 w-full flex flex-col items-center justify-center text-center px-4 pt-8 md:pt-20">
        <div className="w-full max-w-5xl mx-auto">
          <div className="flex flex-col items-center">
            {badges && <div className="mb-6 md:mb-12 animate-in fade-in slide-in-from-bottom-5 duration-1000">{badges}</div>}
            <div className="overflow-hidden mb-4 md:mb-8">
              <h1 className="text-white tracking-tighter text-3xl sm:text-5xl md:text-8xl lg:text-9xl font-black leading-[0.9] animate-in slide-in-from-bottom-full duration-1000 drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)]">
                {title}
              </h1>
            </div>
            
            {subtitle && (
              <p className="text-sm md:text-2xl text-white font-medium leading-relaxed mb-8 md:mb-16 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300 px-2 drop-shadow-[0_2px_8px_rgba(0,0,0,0.4)]">
                {subtitle}
              </p>
            )}
            

          </div>
        </div>
      </div>
 
      {/* Sleek Minimalist Arrows */}
      <button 
        onClick={prevSlide}
        className="absolute left-8 top-1/2 -translate-y-1/2 h-20 w-20 flex items-center justify-center text-white/20 hover:text-white transition-all z-30 group hidden xl:flex"
      >
        <ChevronLeft className="h-10 w-10 group-hover:-translate-x-3 transition-transform" strokeWidth={1} />
      </button>
      <button 
        onClick={nextSlide}
        className="absolute right-8 top-1/2 -translate-y-1/2 h-20 w-20 flex items-center justify-center text-white/20 hover:text-white transition-all z-30 group hidden xl:flex"
      >
        <ChevronRight className="h-10 w-10 group-hover:translate-x-3 transition-transform" strokeWidth={1} />
      </button>
    </section>
  );
};

export default HeroCarousel;
