'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import useSWR from 'swr';
import { API_URL } from '@/lib/api';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function OfferBanner() {
  const { data: apiBanners } = useSWR(`${API_URL}/api/banners`, fetcher);
  const { data: apiAnnouncements } = useSWR(
    `${API_URL}/api/offer-announcements?activeOnly=true`,
    fetcher,
    { refreshInterval: 30000 }
  );

  const banners = apiBanners && Array.isArray(apiBanners)
    ? apiBanners.filter((b: any) => b.isActive !== false && b.type?.toLowerCase() === 'offer')
    : [];

  const announcements = Array.isArray(apiAnnouncements)
    ? apiAnnouncements.filter((a: any) => a.publishHomepage === true || a.announcementType === 'HERO_BANNER')
    : [];

  const totalOffers = [...banners, ...announcements];

  if (totalOffers.length === 0) return null;

  return (
    <section className="w-full py-8 flex flex-col items-center bg-slate-50/50 gap-6">
      {banners.map((banner: any) => {
        const hasOverlay = !!(banner.tagline || banner.subtitle);
        return (
          <div key={banner.id} className="standard-container px-4 md:px-0">
            <div className="relative w-full aspect-[3.2/1] md:aspect-[1920/450] rounded-3xl overflow-hidden group cursor-pointer shadow-lg bg-emerald-950 border border-slate-100 flex items-center">
              {banner.link && !hasOverlay ? (
                <Link href={banner.link} className="absolute inset-0 z-30" aria-label={banner.title || 'Special Offer'} />
              ) : null}

              {banner.banner_image && (
                <Image
                  src={banner.banner_image}
                  alt={banner.title || 'Special Offer'}
                  fill
                  className="w-full h-full object-cover transition-transform duration-[1500ms] group-hover:scale-105"
                  unoptimized={true}
                />
              )}
              
              {hasOverlay && (
                <>
                  {/* Smooth linear gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/45 to-transparent z-10" />

                  <div className="absolute inset-0 flex flex-col justify-center px-8 md:px-16 z-20 max-w-xl md:max-w-3xl text-left">
                    {banner.tagline && (
                      <span className="text-amber-400 text-[10px] md:text-xs font-black uppercase tracking-[0.3em] mb-2 drop-shadow-sm">
                        {banner.tagline}
                      </span>
                    )}
                    {banner.title && (
                      <h3 className="text-white text-xl md:text-4xl font-black mb-3 leading-tight tracking-tight uppercase drop-shadow-md">
                        {banner.title}
                      </h3>
                    )}
                    {banner.subtitle && (
                      <p className="text-white/80 text-[11px] md:text-sm font-medium mb-4 md:mb-6 max-w-lg drop-shadow">
                        {banner.subtitle}
                      </p>
                    )}
                    <div>
                      <Link 
                        href={banner.link || '/products'} 
                        className="inline-flex h-9 md:h-12 px-6 md:px-10 rounded-full bg-amber-500 text-slate-900 font-black uppercase tracking-widest text-[9px] md:text-[10px] hover:bg-white hover:scale-105 transition-all items-center shadow-lg active:scale-95"
                      >
                        {banner.buttonText || 'Claim Deal'}
                      </Link>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        );
      })}

      {/* Render announcement strips if they exist */}
      {announcements.map((ann: any) => (
        <div key={ann.id} className="standard-container px-4 md:px-0">
          <div 
            className="relative w-full py-6 md:py-8 rounded-3xl overflow-hidden shadow-lg border border-slate-100/10 flex flex-col md:flex-row items-center justify-between px-8 md:px-16 gap-4"
            style={{
              background: `linear-gradient(135deg, ${ann.bgColor || '#065f46'} 0%, #022c22 100%)`
            }}
          >
            <div className="flex flex-col text-center md:text-left gap-1">
              <span className="text-amber-400 text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em]">
                {ann.offerType || 'Special Offer'}
              </span>
              <h3 className="text-white text-lg md:text-2xl font-black uppercase tracking-tight">
                {ann.title}
              </h3>
              <p className="text-white/85 text-xs md:text-sm font-medium">
                {ann.message}
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              {ann.couponCode && (
                <div className="border-2 border-dashed border-white/30 bg-white/10 rounded-xl px-4 py-2 text-center select-all">
                  <span className="text-[10px] font-bold text-white/60 block uppercase tracking-wider">Use Coupon</span>
                  <span className="text-sm font-black text-white tracking-widest">{ann.couponCode}</span>
                </div>
              )}
              <Link 
                href={ann.redirectUrl || '/products'} 
                className="h-10 md:h-12 px-6 md:px-8 rounded-full bg-amber-500 text-slate-950 font-black uppercase tracking-widest text-[9px] md:text-[10px] hover:bg-white hover:scale-105 transition-all flex items-center shadow-lg active:scale-95"
              >
                Shop Now
              </Link>
            </div>
          </div>
        </div>
      ))}
    </section>
  );
}
