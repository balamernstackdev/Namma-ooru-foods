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
  banner_image: string;
  link: string | null;
  accentColor?: string;
}

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function HomeBanner({ apiUrl }: HomeBannerProps) {
  const [current, setCurrent] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const { data: apiBanners } = useSWR(`${apiUrl}/api/banners`, fetcher);
  const { data: apiAnnouncements } = useSWR(
    `${apiUrl}/api/offer-announcements?activeOnly=true`,
    fetcher,
    { refreshInterval: 30000 }
  );

  // Image banners from admin
  const imageBanners = apiBanners && Array.isArray(apiBanners) && apiBanners.length > 0
    ? apiBanners
        .filter((b: any) => b.banner_image && typeof b.banner_image === 'string' && b.banner_image.trim() !== '')
        .map((b: BannerData) => ({
          id: b.id,
          title: b.title,
          highlight: b.tagline || null,
          subtitle: b.subtitle || null,
          image: b.banner_image,
          link: b.link || '/products',
          accentColor: b.accentColor || '#5cb338',
          isAnnouncement: false,
        }))
    : null;

  // Approved announcements (admin + vendor) converted to banner slides
  const announcementSlides = Array.isArray(apiAnnouncements)
    ? apiAnnouncements
        .filter((a: any) => a.publishHomepage === true || a.announcementType === 'HERO_BANNER')
        .map((a: any) => ({
          id: `ann_${a.id}`,
          title: a.title,
          highlight: a.couponCode ? `Use Code: ${a.couponCode}` : (a.offerType || 'Special Offer'),
          subtitle: a.message,
          image: null as any,
          link: a.redirectUrl || '/products',
          accentColor: a.bgColor || '#065f46',
          bgColor: a.bgColor || '#014421',
          textColor: a.textColor || '#FFFFFF',
          isAnnouncement: true,
        }))
    : [];

  const combinedBanners = [
    ...(imageBanners || []),
    ...announcementSlides,
  ];

  const displayBanners = combinedBanners;

  // Prevent out-of-bounds index when list of banners changes dynamically (e.g. SWR load)
  useEffect(() => {
    if (current >= displayBanners.length) {
      setCurrent(0);
    }
  }, [displayBanners.length, current]);

  const activeBanner = displayBanners[current] || displayBanners[0];

  const next = useCallback(() => {
    setCurrent(c => (c + 1) % (displayBanners.length || 1));
  }, [displayBanners.length]);

  const prev = useCallback(() => {
    setCurrent(c => (c - 1 + displayBanners.length) % (displayBanners.length || 1));
  }, [displayBanners.length]);

  useEffect(() => {
    if (displayBanners.length > 0) {
      timerRef.current = setInterval(next, 6000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [next, displayBanners.length]);

  if (displayBanners.length === 0) return null;

  const hasOverlay = (activeBanner as any).isAnnouncement || !!(activeBanner.subtitle || activeBanner.highlight);

  return (
    <section className="w-full py-4 md:py-10">
      <div className="standard-container w-full px-4 md:px-0">
        <div className="relative w-full aspect-[12/5] rounded-[2rem] md:rounded-[3.5rem] overflow-hidden group shadow-2xl bg-slate-100">

          {/* Background slides */}
          {displayBanners.map((b: any, i) => (
            <div
              key={b.id}
              className="absolute inset-0 transition-all duration-[1200ms] ease-in-out"
              style={{
                opacity: i === current ? 1 : 0,
                transform: i === current ? 'scale(1)' : 'scale(1.08)',
              }}
            >
              {b.isAnnouncement ? (
                // Announcement slide: color gradient background
                <div
                  className="absolute inset-0"
                  style={{
                    background: `linear-gradient(135deg, ${b.bgColor || '#014421'} 0%, ${b.accentColor || '#065f46'} 50%, #022c22 100%)`
                  }}
                >
                  <div className="absolute inset-0 opacity-[0.06]"
                    style={{ backgroundImage: 'radial-gradient(circle at 30% 60%, white 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
                </div>
              ) : (
                <>
                  {b.image && (
                    <Image
                      src={b.image}
                      alt={b.title || "Banner"}
                      fill
                      className="w-full h-full object-cover"
                      priority={i === 0}
                      sizes="100vw"
                      unoptimized={true}
                    />
                  )}
                </>
              )}
              {/* Rich overlays */}
              {hasOverlay && (
                <>
                  <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/40 to-transparent" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20" />
                </>
              )}
            </div>
          ))}

          {/* Text content */}
          {hasOverlay && (
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
                    color: activeBanner.accentColor,
                    borderColor: `${activeBanner.accentColor}50`,
                    backgroundColor: `${activeBanner.accentColor}15`
                  }}
                >
                  namma ooru Foods
                </span>
                {activeBanner.title && (
                  <h2 className="text-white text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-black tracking-tight leading-[1.05] mb-2 md:mb-4 drop-shadow-lg">
                    {activeBanner.title} <br />
                    {activeBanner.highlight && (
                      <span style={{ color: activeBanner.accentColor }}>
                        {activeBanner.highlight}
                      </span>
                    )}
                  </h2>
                )}
                {activeBanner.subtitle && (
                  <p className="text-white/70 text-sm md:text-lg font-medium mb-6 md:mb-10 max-w-md">
                    {activeBanner.subtitle}
                  </p>
                )}
                <Link
                  href={activeBanner.link || "/products"}
                  prefetch={false}
                  className="inline-flex h-11 md:h-14 px-8 md:px-14 rounded-full text-white text-[10px] md:text-xs font-black uppercase tracking-widest hover:scale-105 transition-all shadow-xl items-center justify-center"
                  style={{ backgroundColor: activeBanner.accentColor }}
                >
                  Shop Now →
                </Link>
              </motion.div>
            </div>
          )}

          {/* Full Banner Click Link if no text overlay */}
          {!hasOverlay && activeBanner.link && (
            <Link
              href={activeBanner.link}
              className="absolute inset-0 z-30 cursor-pointer"
              aria-label={activeBanner.title || 'Promo Banner'}
            />
          )}

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
                className={`h-2 transition-all rounded-full ${i === current ? 'w-10 md:w-12' : 'w-2'
                  }`}
                style={{
                  backgroundColor: i === current ? activeBanner.accentColor : 'rgba(255,255,255,0.35)'
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
