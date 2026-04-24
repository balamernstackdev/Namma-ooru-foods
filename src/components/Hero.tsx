'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Star, Leaf, ShieldCheck, ChevronRight, ChevronLeft, Sparkles } from 'lucide-react';
import { API_URL } from '@/lib/api';

const HERO_SLIDES = [
  {
    id: 1,
    image: "/banners/home_1.png",
    title: "Taste the <span class=\"text-amber-400\">Purity</span> <br /> of Namma Orru",
    subtitle: "We bring you the finest Products directly from sustainable local farms. No middlemen, no chemicals — just pure, authentic goodness delivered to your doorstep.",
    tagline: "Fresh from Local Farms",
    link: "/products"
  },
  {
    id: 2,
    image: "/banners/home_2.png",
    title: "Real <span class=\"text-amber-400\">Organic</span> <br /> Everyday Food",
    subtitle: "Our cold-pressed oils and millets retain their complete nutritional profiles. Start your healthy journey with ancestral farming wisdom.",
    tagline: "Quality You Can Trust",
    link: "/products"
  }
];

const Hero = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [slides, setSlides] = useState<any[]>(HERO_SLIDES);

  useEffect(() => {
    // Fetch dynamic banners from admin
    fetch(`${API_URL}/api/admin-ops/banners/active`)
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          const dynamicSlides = data.map((b: any) => ({
            id: b.id,
            image: b.image,
            title: b.title,
            subtitle: b.subtitle || "Exclusive platform campaign. Shop the collection now for premium harvests.",
            tagline: b.tagline || "Special Promotion",
            link: b.link || "/products"
          }));
          setSlides(dynamicSlides);
        }
      })
      .catch(err => console.error('Hero banner fetch failed:', err));
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [slides]);

  const slide = slides[currentSlide];

  return (
    <section className="relative w-full overflow-hidden bg-[#030712] flex items-center min-h-[450px] md:min-h-[550px] lg:min-h-[600px]">
      {/* Background Slides */}
      {slides.map((s, idx) => (
        <div key={s.id} className={`absolute inset-0 z-0 transition-opacity duration-[2000ms] ease-in-out ${currentSlide === idx ? 'opacity-100 scale-105' : 'opacity-0 scale-110'}`}>
          <Image
            src={s.image}
            alt=""
            fill
            className="object-cover"
            priority={idx === 0}
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent z-10" />
          <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-[#030712]/40 to-transparent z-10" />
        </div>
      ))}

      {/* Content Overlay */}
      <div className="relative z-20 w-full flex flex-col justify-center py-12 md:py-24 standard-container mx-auto">
        <div className="max-w-4xl text-left" key={currentSlide}>
          <div className="inline-flex items-center gap-4 rounded-full bg-amber-400/10 backdrop-blur-xl border border-amber-400/20 px-6 py-2.5 md:px-8 md:py-3 mb-8 md:mb-12 animate-fade-in group cursor-default">
            <Sparkles className="h-3.5 w-3.5 md:h-4 md:w-4 text-amber-400 group-hover:rotate-12 transition-transform" />
            <span className="text-[9px] md:text-[10px] font-black tracking-[0.3em] md:tracking-[0.4em] text-amber-400 uppercase">{slide.tagline}</span>
          </div>

          <h1 className="text-white tracking-tight mb-6 md:mb-10 animate-slide-up text-[2rem] sm:text-5xl md:text-7xl lg:text-8xl leading-tight drop-shadow-[0_4px_4px_rgba(0,0,0,0.25)]" dangerouslySetInnerHTML={{ __html: slide.title }} />

          <p className="max-w-2xl text-sm md:text-lg lg:text-2xl text-white font-medium leading-relaxed mb-10 md:mb-16 animate-slide-up delay-100 drop-shadow-[0_2px_2px_rgba(0,0,0,0.5)]">
            {slide.subtitle}
          </p>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-start gap-4 md:gap-6 animate-slide-up delay-200">
            <Link href={slide.link} className="w-full sm:w-auto sm:min-w-[180px] h-11 md:h-14 px-8 md:px-12 rounded-full bg-amber-500 !text-white font-black uppercase tracking-[0.2em] text-[10px] md:text-[11px] hover:bg-white hover:!text-emerald-950 transition-all flex items-center justify-center shadow-2xl group whitespace-nowrap">
              Start Shopping <ArrowRight className="ml-3 h-4 w-4 md:h-5 md:w-5 group-hover:translate-x-3 transition-all" />
            </Link>
            <Link href="/about" className="w-full sm:w-auto sm:min-w-[180px] h-11 md:h-14 px-8 md:px-12 rounded-full bg-white/10 border-2 border-white/30 backdrop-blur-xl !text-white font-black uppercase tracking-[0.2em] text-[10px] md:text-[11px] hover:bg-white/20 transition-all flex items-center justify-center whitespace-nowrap">
              Our Story
            </Link>
          </div>
        </div>
      </div>



      <style dangerouslySetInnerHTML={{
        __html: `
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
