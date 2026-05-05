'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Tag, Sparkles, Clock, ArrowRight } from 'lucide-react';
import useSWR from 'swr';
import { API_URL } from '@/lib/api';

const fetcher = (url: string) => fetch(url).then(res => res.json());
import HeroCarousel from '@/components/HeroCarousel';

const PromoCard = ({ promo, copiedCode, onCopy, upcoming = false }: any) => {
  return (
    <div className={`group relative flex flex-col bg-white rounded-[2.5rem] overflow-hidden transition-all duration-700 h-full border border-slate-100 ${upcoming ? 'opacity-70 grayscale scale-[0.98]' : 'hover:shadow-[0_50px_100px_-20px_rgba(6,95,70,0.12)] hover:-translate-y-3'}`}>
      {/* Visual Header */}
      <div className="relative h-64 md:h-72 w-full overflow-hidden">
        {(promo.image && promo.image.trim() !== '') ? (
          <Image
            src={promo.image}
            alt={promo.title}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover transition-transform duration-[3000ms] group-hover:scale-110"
            unoptimized={promo.image?.startsWith('http')}
          />
        ) : (
          <Image
            src="/ai_images/organic_grains_1776231059575.png"
            alt={promo.title}
            fill
            className="object-cover transition-transform duration-[3000ms] group-hover:scale-110"
          />
        )}
        
        {/* Category Badge */}
        <div className="absolute top-6 left-6 z-10">
          <div className="px-4 py-1.5 rounded-full bg-emerald-950/80 backdrop-blur-md text-[9px] font-black text-emerald-400 uppercase tracking-widest border border-emerald-400/20">
            {promo.category || 'Special Offer'}
          </div>
        </div>

        {/* Discount Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/90 via-emerald-950/20 to-transparent flex flex-col justify-end p-8">
          <span className="text-amber-400 text-[10px] font-black uppercase tracking-[0.3em] mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500">Limited Time Offer</span>
          <h3 className="text-4xl md:text-5xl font-black text-white tracking-tighter leading-none drop-shadow-2xl">
            {promo.discount} <span className="text-lg md:text-xl font-serif italic text-amber-400 lowercase">off</span>
          </h3>
        </div>

        {upcoming && (
          <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px] flex items-center justify-center z-20">
            <div className="px-6 py-3 bg-white rounded-2xl shadow-xl text-[10px] font-black text-emerald-950 uppercase tracking-widest flex items-center gap-3">
              <Clock size={14} className="text-amber-500 animate-pulse" /> Launching Soon
            </div>
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-8 md:p-10 flex flex-col flex-1 bg-gradient-to-b from-white to-slate-50/50">
        <h4 className="text-2xl font-black text-emerald-950 tracking-tight leading-tight mb-4 group-hover:text-emerald-700 transition-colors">
          {promo.title}
        </h4>
        <p className="text-slate-500 text-sm md:text-base font-medium leading-relaxed mb-8 flex-1">
          {promo.description}
        </p>

        {/* Voucher Action */}
        <div className="mt-auto">
          <div className="relative p-1 rounded-[1.8rem] bg-slate-100/50 border border-slate-200/50">
            <button
              disabled={upcoming}
              onClick={() => onCopy(promo.code)}
              className={`w-full h-14 md:h-16 rounded-[1.5rem] flex items-center justify-between px-6 transition-all active:scale-[0.98] ${
                copiedCode === promo.code
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white text-emerald-950 hover:bg-emerald-950 hover:text-white shadow-sm'
              }`}
            >
              <div className="flex flex-col items-start">
                <span className="text-[8px] font-black uppercase tracking-widest opacity-60">Coupon Code</span>
                <span className="text-sm font-black tracking-widest uppercase">{promo.code}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-black uppercase tracking-widest">
                  {copiedCode === promo.code ? 'Copied' : 'Claim'}
                </span>
                {copiedCode === promo.code ? (
                   <Sparkles size={14} className="animate-bounce" />
                ) : (
                  <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                )}
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function PromotionsPage() {
  const { data: promotions, error } = useSWR(`${API_URL}/api/promotions`, fetcher);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 3000);
  };

  const activeDeals = promotions?.filter((p: any) => p.isActive) || [];
  const upcomingDeals = promotions?.filter((p: any) => !p.isActive) || [];

  return (
    <div className="w-full bg-white min-h-screen">
      {/* Header Section */}
      <section className="relative pt-32 pb-20 overflow-hidden bg-emerald-950">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('/ai_images/organic_grains_1776231059575.png')] bg-cover bg-center mix-blend-overlay" />
        </div>
        
        <div className="standard-container relative z-10 text-center">
          <div className="flex flex-col items-center gap-6">
            <div className="flex items-center gap-3 px-6 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 backdrop-blur-md">
              <Sparkles className="h-4 w-4 text-amber-500" />
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-amber-500">Exclusive Harvest Deals</span>
            </div>
            
            <h1 className="text-5xl md:text-8xl font-black text-white tracking-tighter uppercase leading-[0.85]">
              Honest Food.<br />
              <span className="text-amber-500 italic font-serif lowercase">Honest Savings.</span>
            </h1>
            
            <p className="max-w-2xl text-emerald-100/60 text-sm md:text-lg font-medium leading-relaxed">
              We believe pure food should be accessible. Explore our curated seasonal combos 
              and member-exclusive harvesting benefits designed for your family.
            </p>
          </div>
        </div>
      </section>

      {/* Grid Section */}
      <div className="w-full flex justify-center py-24 bg-slate-50/50">
        <div className="standard-container">
          <div className="flex items-center justify-between mb-16">
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-amber-500 uppercase tracking-[0.4em] mb-2">Available Now</span>
              <h2 className="text-3xl md:text-4xl font-black text-emerald-950 tracking-tight uppercase">Current Promotions</h2>
            </div>
            <div className="hidden md:flex h-1 w-24 bg-amber-400 rounded-full" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
            {activeDeals.map((promo: any) => (
              <PromoCard key={promo.id} promo={promo} copiedCode={copiedCode} onCopy={copyCode} />
            ))}
          </div>

          {activeDeals.length === 0 && !error && (
            <div className="w-full py-32 text-center">
              <div className="inline-flex h-20 w-20 rounded-full bg-slate-100 items-center justify-center mb-6">
                <Tag className="h-8 w-8 text-slate-300" />
              </div>
              <h3 className="text-xl font-black text-emerald-950 uppercase tracking-widest">Gathering New Deals...</h3>
              <p className="text-slate-400 mt-2">Check back soon for fresh seasonal offers.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
