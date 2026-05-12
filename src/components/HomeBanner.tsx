'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import useSWR from 'swr';

interface HomeBannerProps {
  apiUrl: string;
}

interface BannerData {
  id: number;
  title: string | null;
  subtitle: string | null;
  tagline: string | null;
  desktopImage: string;
  link: string | null;
  accentColor?: string;
}

const fetcher = (url: string) => fetch(url).then(res => res.json());

const STATIC_BANNERS = [
  {
    id: 101,
    title: "Nature's Freshest",
    highlight: "Just for You",
    subtitle: "Experience the purity of farm-to-home organic produce",
    image: '/ai_images/banner_farm_fresh.png',
    link: '/products',
    accentColor: '#5cb338',
  },
  {
    id: 102,
    title: "Pure Heritage",
    highlight: "Traditional Spices",
    subtitle: "Hand-pounded spices from the heart of Tamil Nadu",
    image: '/ai_images/banner_heritage_spices.png',
    link: '/products?category=Authentic Spices',
    accentColor: '#d97706',
  },
  {
    id: 103,
    title: "Cold Pressed",
    highlight: "Pure Oils & Honey",
    subtitle: "Nourish your family with nature's finest extracts",
    image: '/ai_images/banner_natural_products.png',
    link: '/products?category=Organic Oils',
    accentColor: '#065f46',
  }
];

export default function HomeBanner({ apiUrl }: HomeBannerProps) {
  const [current, setCurrent] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const { data: apiBanners, error } = useSWR(`${apiUrl}/api/banners`, fetcher);

  const banners = apiBanners && Array.isArray(apiBanners) && apiBanners.length > 0
    ? apiBanners
        .filter((b: any) => b.desktopImage && typeof b.desktopImage === 'string' && b.desktopImage.trim() !== '')
        .map((b: BannerData) => ({
          id: b.id,
          title: b.title || "Namma Orru",
          highlight: b.tagline || "Special Offer",
          subtitle: b.subtitle || "Premium quality products",
          image: b.desktopImage,
          link: b.link || '/products',
          accentColor: b.accentColor || '#5cb338' // Default green
        }))
    : STATIC_BANNERS;

  // Final fallback if filtered API list is empty
  const displayBanners = banners.length > 0 ? banners : STATIC_BANNERS;

  const next = useCallback(() => {
    setCurrent(c => (c + 1) % displayBanners.length);
  }, [displayBanners.length]);

  const prev = useCallback(() => {
    setCurrent(c => (c - 1 + displayBanners.length) % displayBanners.length);
  }, [displayBanners.length]);

  useEffect(() => {
    timerRef.current = setInterval(next, 6000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [next]);

  return (
    <section className="w-full py-4 md:py-10">
      <div className="standard-container w-full px-4 md:px-0">
        <div className="relative w-full h-[280px] sm:h-[350px] md:h-[420px] lg:h-[480px] rounded-[2rem] md:rounded-[3.5rem] overflow-hidden group shadow-2xl">
          
          {/* Background slides */}
          {displayBanners.map((b, i) => (
            <div
              key={b.id}
              className="absolute inset-0 transition-all duration-[1200ms] ease-in-out"
              style={{ 
                opacity: i === current ? 1 : 0, 
                transform: i === current ? 'scale(1)' : 'scale(1.08)',
              }}
            >
              <Image
                src={b.image}
                alt={b.title}
                fill
                className="object-cover"
                priority={i === 0}
                sizes="100vw"
              />
              {/* Rich overlays */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/40 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20" />
            </div>
          ))}

          {/* Text content */}
          <div className="relative z-10 h-full flex items-center px-8 md:px-16 lg:px-24">
            <motion.div
              key={current}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="max-w-2xl"
            >
              <span 
                className="inline-block text-[10px] md:text-xs font-black uppercase tracking-[0.3em] mb-3 md:mb-5 px-4 py-1.5 rounded-full border"
                style={{ 
                  color: displayBanners[current].accentColor, 
                  borderColor: `${displayBanners[current].accentColor}50`,
                  backgroundColor: `${displayBanners[current].accentColor}15`
                }}
              >
                Namma Orru Foods
              </span>
              <h2 className="text-white text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-black tracking-tight leading-[1.05] mb-2 md:mb-4 drop-shadow-lg">
                {displayBanners[current].title} <br />
                <span style={{ color: displayBanners[current].accentColor }}>
                  {displayBanners[current].highlight}
                </span>
              </h2>
              <p className="text-white/70 text-sm md:text-lg font-medium mb-6 md:mb-10 max-w-md">
                {displayBanners[current].subtitle}
              </p>
              <Link 
                href={displayBanners[current].link}
                className="inline-flex h-11 md:h-14 px-8 md:px-14 rounded-full text-white text-[10px] md:text-xs font-black uppercase tracking-widest hover:scale-105 transition-all shadow-xl items-center justify-center"
                style={{ backgroundColor: displayBanners[current].accentColor }}
              >
                Shop Now →
              </Link>
            </motion.div>
          </div>

          {/* Navigation Arrows */}
          <button
            onClick={(e) => { e.stopPropagation(); prev(); }}
            className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 h-10 w-10 md:h-14 md:w-14 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-white/40 hover:scale-110 active:scale-95 z-20"
          >
            <ChevronLeft size={20} strokeWidth={2.5} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); next(); }}
            className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 h-10 w-10 md:h-14 md:w-14 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-white/40 hover:scale-110 active:scale-95 z-20"
          >
            <ChevronRight size={20} strokeWidth={2.5} />
          </button>

          {/* Dots Indicator */}
          <div className="absolute bottom-4 md:bottom-8 left-1/2 -translate-x-1/2 flex gap-2.5 z-20">
            {displayBanners.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`h-2 transition-all rounded-full ${
                  i === current ? 'w-10 md:w-12' : 'w-2'
                }`}
                style={{ 
                  backgroundColor: i === current ? displayBanners[current].accentColor : 'rgba(255,255,255,0.35)' 
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
