'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Star, Leaf, ShieldCheck, ChevronRight, ChevronLeft, Sparkles } from 'lucide-react';

const HERO_SLIDES = [
  {
    id: 1,
    image: "/banners/home_1.png",
    title: "Taste the <span class=\"text-amber-400\">Purity</span> <br /> of Namma Orru",
    subtitle: "We bring you the finest harvest directly from sustainable local farms. No middlemen, no chemicals — just pure, authentic goodness delivered to your doorstep.",
    tagline: "8K Premium Harvest • Sourced Locally"
  },
  {
    id: 2,
    image: "/banners/home_2.png",
    title: "Real <span class=\"text-amber-400\">Organic</span> <br /> Everyday Food",
    subtitle: "Our cold-pressed oils and millets retain their complete nutritional profiles. Start your healthy journey with ancestral farming wisdom.",
    tagline: "8K Healthy Living • Farm To Table"
  }
];

const Hero = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const slide = HERO_SLIDES[currentSlide];

  return (
    <section className="relative w-full overflow-hidden bg-[#030712] flex items-center min-h-[85vh] md:min-h-[90vh]">
      {/* Background Slides */}
      {HERO_SLIDES.map((s, idx) => (
        <div key={s.id} className={`absolute inset-0 z-0 transition-opacity duration-[2000ms] ease-in-out ${currentSlide === idx ? 'opacity-100 scale-105' : 'opacity-0 scale-110'}`}>
          <Image 
            src={s.image} 
            alt=""
            fill
            className="object-cover"
            priority={idx === 0}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-950/95 via-emerald-950/50 to-transparent z-10" />
          <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-[#030712]/40 to-transparent z-10" />
        </div>
      ))}
 
      {/* Content Overlay */}
      <div className="relative z-20 w-full flex flex-col justify-center py-20 md:py-32 standard-container mx-auto">
        <div className="max-w-4xl text-left md:text-left" key={currentSlide}>
          <div className="inline-flex items-center gap-4 rounded-full bg-amber-400/10 backdrop-blur-xl border border-amber-400/20 px-6 py-2.5 md:px-8 md:py-3 mb-8 md:mb-12 animate-fade-in group cursor-default">
            <Sparkles className="h-3.5 w-3.5 md:h-4 md:w-4 text-amber-400 group-hover:rotate-12 transition-transform" />
            <span className="text-[9px] md:text-[10px] font-black tracking-[0.3em] md:tracking-[0.4em] text-amber-400 uppercase">{slide.tagline}</span>
          </div>
          
           <h1 className="text-white tracking-tight mb-8 md:mb-10 animate-slide-up text-4xl md:text-7xl lg:text-8xl" dangerouslySetInnerHTML={{ __html: slide.title }} />
          
          <p className="max-w-2xl text-lg md:text-2xl text-emerald-50/70 font-medium leading-relaxed mb-16 animate-slide-up delay-100">
            {slide.subtitle}
          </p>
          
          <div className="flex flex-col sm:flex-row items-center gap-6 animate-slide-up delay-200">
            <Link href="/products" className="h-16 px-14 rounded-full bg-amber-500 text-white font-black uppercase tracking-widest text-xs hover:bg-white hover:text-emerald-950 transition-all flex items-center justify-center shadow-premium group">
              Curated Harvest <ArrowRight className="ml-4 h-4 w-4 group-hover:translate-x-3 transition-transform" />
            </Link>
            <Link href="/about" className="h-16 px-14 rounded-full bg-transparent border border-white/30 text-white font-black uppercase tracking-widest text-xs hover:bg-white/10 transition-all flex items-center justify-center backdrop-blur-md">
              Our Heritage
            </Link>
          </div>
        </div>
      </div>
 
      {/* Slide Navigation Pagination */}
      <div className="absolute bottom-16 right-16 z-30 flex items-center gap-6">
        {HERO_SLIDES.map((_, i) => (
          <button 
            key={i} 
            onClick={() => setCurrentSlide(i)}
            className={`h-2 rounded-full transition-all duration-700 ${i === currentSlide ? 'w-24 bg-amber-400' : 'w-6 bg-white/20'}`}
          />
        ))}
      </div>
 
      <style dangerouslySetInnerHTML={{ __html: `
        .animate-fade-in { animation: fadeIn 1.5s ease-out forwards; }
        .animate-slide-up { animation: slideUp 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .delay-100 { animation-delay: 0.2s; opacity: 0; }
        .delay-200 { animation-delay: 0.4s; opacity: 0; }
        
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(60px); } to { opacity: 1; transform: translateY(0); } }
      `}} />
    </section>
  );
};

export default Hero;
