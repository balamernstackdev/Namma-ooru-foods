'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useBanners } from '@/hooks/useBanners';

interface BrandBannerProps {
  products?: any[];
}

export default function BrandBanner({ products = [] }: BrandBannerProps) {
  const { brandBanners: banners } = useBanners();

  if (banners.length === 0) return null;

  return (
    <section className="w-full py-8 flex justify-center bg-white animate-in fade-in duration-700">
      <div className="standard-container px-4 md:px-0 space-y-12">
        {banners.map((banner) => {
          const hasOverlay = !!(banner.tagline || banner.subtitle);
          const viewAllLink = banner.link || '/brands';

          return (
            <div key={banner.id} className="w-full space-y-6 pb-12 border-b border-slate-100 last:border-0 last:pb-0">
              
              {/* Promotional Brand Banner */}
              <div 
                className="relative w-full aspect-[2.2/1] md:aspect-[1400/350] rounded-[2rem] overflow-hidden group cursor-pointer shadow-xl bg-slate-50 border border-slate-100"
              >
                {banner.link && !hasOverlay ? (
                  <Link href={banner.link} className="absolute inset-0 z-30" aria-label={banner.title || 'Brand Promotion'} />
                ) : null}

                {banner.banner_image && (
                  <Image
                    src={banner.banner_image}
                    alt={banner.title || 'Brand Promotion'}
                    fill
                    className="w-full h-full object-cover transition-transform duration-[1500ms] group-hover:scale-105"
                    unoptimized={true}
                  />
                )}
                
                {hasOverlay && (
                  <>
                    <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent flex flex-col justify-center px-8 md:px-20 z-10" />
                    
                    <div className="absolute inset-0 flex flex-col justify-center px-8 md:px-20 z-20 max-w-lg md:max-w-xl text-left">
                      {banner.tagline && (
                        <span className="inline-block text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] mb-3 px-3 py-1 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 backdrop-blur-sm self-start drop-shadow">
                          {banner.tagline}
                        </span>
                      )}
                      {banner.title && (
                        <h3 className="text-white text-2xl md:text-4xl font-black mb-4 leading-tight tracking-tight uppercase drop-shadow-lg">
                          {banner.title}
                        </h3>
                      )}
                      {banner.subtitle && (
                        <p className="text-white/80 text-xs md:text-sm font-medium mb-6 max-w-md drop-shadow">
                          {banner.subtitle}
                        </p>
                      )}
                      <div>
                        <Link 
                          href={viewAllLink} 
                          className="inline-flex h-10 md:h-12 px-8 md:px-10 rounded-full bg-emerald-500 text-white font-black uppercase tracking-widest text-[9px] md:text-[10px] hover:bg-white hover:text-emerald-950 hover:scale-105 transition-all items-center shadow-lg active:scale-95"
                        >
                          {banner.buttonText || 'Discover Store'}
                        </Link>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* View All Button */}
              <div className="flex justify-center pt-2">
                <Link 
                  href={viewAllLink}
                  className="inline-flex h-11 px-8 rounded-full border-2 border-slate-200 hover:border-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 text-slate-600 text-[10px] font-black uppercase tracking-widest transition-all items-center gap-2 shadow-sm"
                >
                  View All Brands
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>

            </div>
          );
        })}
      </div>
    </section>
  );
}
