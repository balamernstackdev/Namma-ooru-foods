'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useBanners } from '@/hooks/useBanners';

export default function CategoryBanner() {
  const { categoryBanners: banners } = useBanners();
  if (banners.length === 0) return null;

  return (
    <section className="w-full py-6 flex justify-center bg-white animate-in fade-in duration-700">
      <div className="standard-container px-4 md:px-0 space-y-6">
        {banners.map((banner: any) => {
          const hasOverlay = !!(banner.tagline || banner.subtitle);
          return (
            <div 
              key={banner.id} 
              className="relative w-full aspect-[2.8/1] md:aspect-[1400/250] rounded-3xl overflow-hidden group cursor-pointer shadow-lg bg-slate-50 border border-slate-100"
            >
              {banner.link && !hasOverlay ? (
                <Link href={banner.link} className="absolute inset-0 z-30" aria-label={banner.title || 'Promo Banner'} />
              ) : null}

              {banner.banner_image && (
                <Image
                  src={banner.banner_image}
                  alt={banner.title || 'Category Promotion'}
                  fill
                  className="w-full h-full object-cover transition-transform duration-[1500ms] group-hover:scale-105"
                  unoptimized={true}
                />
              )}

              {hasOverlay && (
                <>
                  {/* Elegant dark overlay for text legibility */}
                  <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/40 to-transparent flex flex-col justify-center px-8 md:px-16 z-10" />
                  
                  <div className="absolute inset-0 flex flex-col justify-center px-8 md:px-16 z-20 max-w-lg md:max-w-2xl text-left">
                    {banner.tagline && (
                      <span className="text-amber-400 text-[10px] md:text-xs font-black uppercase tracking-[0.3em] mb-2 drop-shadow-md">
                        {banner.tagline}
                      </span>
                    )}
                    {banner.title && (
                      <h3 className="text-white text-xl md:text-3xl font-black mb-3 leading-tight tracking-tight uppercase drop-shadow-lg">
                        {banner.title}
                      </h3>
                    )}
                    {banner.subtitle && (
                      <p className="text-white/80 text-[11px] md:text-sm font-medium mb-4 max-w-md drop-shadow">
                        {banner.subtitle}
                      </p>
                    )}
                    <div>
                      <Link 
                        href={banner.link || '/products'} 
                        className="inline-flex h-9 md:h-11 px-6 md:px-8 rounded-full bg-amber-500 text-slate-900 font-black uppercase tracking-widest text-[9px] md:text-[10px] hover:bg-white hover:scale-105 transition-all items-center shadow-md active:scale-95"
                      >
                        {banner.buttonText || 'Shop Now'}
                      </Link>
                    </div>
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
