'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Tag, Sparkles, Clock, Gift } from 'lucide-react';
import { PROMOTIONS } from '@/lib/staticData';
import HeroCarousel from '@/components/HeroCarousel';

const PromoCard = ({ promo, copiedCode, onCopy, upcoming = false }: any) => {
  return (
    <div className={`group relative flex flex-col bg-white rounded-[3rem] overflow-hidden transition-all duration-700 ${upcoming ? 'opacity-70 grayscale' : 'hover:shadow-[0_40px_100px_rgba(0,0,0,0.1)] hover:-translate-y-3 shadow-sm border border-gray-100'}`}>
      <div className="relative h-64 md:h-80 w-full overflow-hidden">
        <Image 
          src={promo.image} 
          alt={promo.title} 
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-transform duration-1000 group-hover:scale-110" 
        />
        <div className={`absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-10 md:p-12`}>
          <div className="flex items-center gap-3 mb-4">
             <div className="px-5 py-2 rounded-full bg-white/20 backdrop-blur-md text-[10px] font-black text-white uppercase tracking-widest border border-white/20">
               {promo.category}
             </div>
          </div>
          <h3 className="text-3xl md:text-5xl font-black text-white tracking-tighter leading-none">{promo.discount}</h3>
        </div>
      </div>
      
      <div className="p-10 md:p-12 flex flex-col flex-1">
        <div className="flex items-center justify-between mb-6">
          <h4 className="text-xl md:text-2xl font-black text-emerald-950 tracking-tight">{promo.title}</h4>
        </div>
        <p className="text-gray-400 text-sm font-medium leading-relaxed mb-10 flex-1">{promo.description}</p>
        
        <div className="mt-auto pt-8 border-t border-gray-50 flex flex-col gap-6">
          <button 
            disabled={upcoming}
            onClick={() => onCopy(promo.code)}
            className={`w-full h-16 rounded-[1.5rem] flex items-center justify-between px-8 transition-all active:scale-95 ${
              copiedCode === promo.code 
              ? 'bg-emerald-600 text-white shadow-xl shadow-emerald-500/20' 
              : 'bg-gray-50 text-emerald-950 hover:bg-emerald-950 hover:text-white'
            }`}
          >
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">{copiedCode === promo.code ? 'Code Copied' : `Use: ${promo.code}`}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default function PromotionsPage() {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 3000);
  };

  const activeDeals = PROMOTIONS.filter(p => p.active);
  const upcomingDeals = PROMOTIONS.filter(p => !p.active);

  return (
    <div className="w-full bg-[#fafafa] min-h-screen">
      <HeroCarousel 
        images={['banners/promo_1.png', 'banners/promo_2.png']}
        title={<>Honest Food.<br /><span className="text-amber-400 italic">Honest Savings.</span></>}
        subtitle="We believe pure food should be accessible. Explore our curated seasonal combos and member-exclusive harvesting benefits."
        badges={
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-amber-500/20 backdrop-blur-md flex items-center justify-center border border-amber-500/30">
              <Tag className="h-5 w-5 text-amber-400" />
            </div>
            <span className="text-[11px] font-black uppercase tracking-[0.4em] text-amber-500">Special Promo Offers</span>
          </div>
        }
      />

      <div className="w-full flex justify-center py-16 md:py-24">
        <div className="standard-container">
          
          <div className="flex items-center justify-between mb-12 md:mb-16 border-b border-gray-100 pb-8">
            <h2 className="text-2xl md:text-3xl font-black text-emerald-950 tracking-tight">Current Promotions</h2>
            <div className="h-1.5 w-16 bg-amber-400 rounded-full" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8">
            {activeDeals.map((promo) => (
              <PromoCard key={promo.id} promo={promo} copiedCode={copiedCode} onCopy={copyCode} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
