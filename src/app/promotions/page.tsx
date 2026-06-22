'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
   Tag, Sparkles, Clock, ArrowRight, Timer, Percent, Gift, Zap,
   Smartphone, Wallet, Users, Award, Star, ShieldCheck, ChevronRight, ChevronLeft, Flame, Copy, Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import useSWR from 'swr';
import { API_URL } from '@/lib/api';
import { useBanners } from '@/hooks/useBanners';

const fetcher = (url: string) => fetch(url).then(res => res.json());

// ---------------------------------------------------------
// Reusable Countdown Timer Hook & Component
// ---------------------------------------------------------
function useCountdown(initialHours: number) {
   const [timeLeft, setTimeLeft] = useState({
      hours: initialHours,
      minutes: 45,
      seconds: 12
   });

   useEffect(() => {
      const timer = setInterval(() => {
         setTimeLeft(prev => {
            if (prev.seconds > 0) {
               return { ...prev, seconds: prev.seconds - 1 };
            } else if (prev.minutes > 0) {
               return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
            } else if (prev.hours > 0) {
               return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
            } else {
               clearInterval(timer);
               return { hours: 0, minutes: 0, seconds: 0 };
            }
         });
      }, 1000);
      return () => clearInterval(timer);
   }, []);

   return timeLeft;
}

const FlashTimer = ({ hours = 4 }: { hours?: number }) => {
   const time = useCountdown(hours);
   return (
      <div className="flex items-center gap-1.5 font-black text-sm">
         <span className="bg-[#ef4444] text-white px-2 py-1.5 rounded-md text-xs shadow-sm font-mono min-w-[28px] text-center">
            {String(time.hours).padStart(2, '0')}
         </span>
         <span className="text-[#ef4444] font-bold animate-pulse">:</span>
         <span className="bg-[#ef4444] text-white px-2 py-1.5 rounded-md text-xs shadow-sm font-mono min-w-[28px] text-center">
            {String(time.minutes).padStart(2, '0')}
         </span>
         <span className="text-[#ef4444] font-bold animate-pulse">:</span>
         <span className="bg-[#ef4444] text-white px-2 py-1.5 rounded-md text-xs shadow-sm font-mono min-w-[28px] text-center">
            {String(time.seconds).padStart(2, '0')}
         </span>
      </div>
   );
};

// ---------------------------------------------------------
// MAIN COMPONENT
// ---------------------------------------------------------
export default function PromotionsPage() {
   const { data: promotions, error } = useSWR(`${API_URL}/api/promotions`, fetcher);
   const { allBanners, heroBanners } = useBanners();
   const { data: sections } = useSWR(`${API_URL}/api/promotion-sections`, fetcher);
   const [copiedCode, setCopiedCode] = useState<string | null>(null);
   const [activeSlide, setActiveSlide] = useState(0);
   const [showFloatingWidget, setShowFloatingWidget] = useState(true);

   const copyToClipboard = (code: string) => {
      if (!code) return;
      navigator.clipboard.writeText(code);
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 3000);
   };

   // --- 1. DATA NORMALIZATION & FILTERING FROM BACKEND PRISMA API ---
   const activePromos = promotions?.filter((p: any) => p.isActive) || [];

   // A. HERO CAMPAIGNS — combined from DB promotions and active banners
   const heroPromoCampaigns = activePromos
      .filter((p: any) => p.type === 'HERO_CAROUSEL')
      .map((p: any) => ({
         id: p.id,
         title: p.title,
         subtitle: p.subtitle || p.discount || 'Exclusive Season Deals',
         description: p.description || '',
         tag: p.tag || 'LIMITED',
         color: p.color || '#064e3b',
         image: p.image || (p.products?.[0]?.image) || null,
         action: p.actionText || 'Shop Now',
         link: p.actionLink || (p.products?.[0] ? `/products/detail?id=${p.products[0].id}` : '/best-selling')
      }));

    const heroBannerCampaigns = heroBanners.map((b: any) => ({
       id: `banner_${b.id}`,
       title: b.title || 'Special Promotion',
       subtitle: b.tagline || b.subtitle || 'Exclusive Offer',
       description: b.subtitle || '',
       tag: 'HOMEPAGE',
       color: '#064e3b',
       image: b.banner_image,
       action: b.buttonText || 'Shop Now',
       link: b.link || '/products'
    }));

   const heroCampaigns = [...heroPromoCampaigns, ...heroBannerCampaigns];

   // B. QUICK STRIPS — only from DB, no fallback
   const quickStrips = activePromos
      .filter((p: any) => p.type === 'QUICK_STRIP')
      .map((p: any) => ({
         id: p.id,
         code: p.code || 'SAVE',
         label: p.title || p.discount || 'Discount Active',
         sub: p.description || 'Storewide Offer',
         color: p.color || '#f1f5f9'
      }));

   // C. FLASH DEALS — only from DB, no fallback
   const flashDeals = activePromos
      .filter((p: any) => p.type === 'FLASH_DEAL')
      .map((p: any) => ({
         id: p.id,
         title: p.title,
         discount: p.discount || 'DEAL',
         price: p.salePrice || (p.products?.[0]?.price ? `₹${p.products[0].price}` : '₹199'),
         oldPrice: p.originalPrice || (p.products?.[0]?.originalPrice ? `₹${p.products[0].originalPrice}` : '₹399'),
         claimed: p.claimedPercent ?? 50,
         image: p.image || (p.products?.[0]?.image) || null,
         link: p.actionLink || (p.products?.[0] ? `/products/detail?id=${p.products[0].id}` : '/best-selling')
      }));

   // D. COMBO DEALS — only from DB, no fallback
   const comboDeals = activePromos
      .filter((p: any) => p.type === 'COMBO_DEAL')
      .map((p: any) => ({
         id: p.id,
         title: p.title,
         description: p.description || '',
         price: p.salePrice || '₹999',
         oldPrice: p.originalPrice || '₹1299',
         save: p.discount || 'Save Large',
         tag: p.tag || 'HOT COMBO',
         image: p.image || (p.products?.[0]?.image) || null,
         link: p.actionLink || (p.products?.[0] ? `/products/detail?id=${p.products[0].id}` : '/best-selling')
      }));

   // E. WALLET OFFERS — only from DB, no fallback
   const walletOffers = activePromos
      .filter((p: any) => p.type === 'WALLET_OFFER')
      .map((p: any) => ({
         id: p.id,
         provider: p.provider || p.title || 'Secure Bank',
         disc: p.discount || 'Cashback Offer',
         min: p.description || 'Valid during checkout',
         code: p.code || 'PAYSECURE',
         color: p.color || '#334155',
         icon: <Smartphone size={20} />
      }));

   // F. STANDARD VOUCHER TICKETS
   const standardVouchers = activePromos.filter((p: any) => !p.type || p.type === 'STANDARD');

   // Interval trigger for rotating Heros
   useEffect(() => {
      if (heroCampaigns.length <= 1) return;
      const interval = setInterval(() => {
         setActiveSlide(prev => (prev + 1) % heroCampaigns.length);
      }, 7000);
      return () => clearInterval(interval);
   }, [heroCampaigns.length]);

   // Dynamic Campaign Analytics Trackers
   useEffect(() => {
      if (promotions && promotions.length > 0) {
         const livePromos = promotions.filter((p: any) => p.isActive);
         livePromos.forEach((promo: any) => {
            fetch(`${API_URL}/api/promotions/${promo.id}/track`, {
               method: 'POST',
               headers: { 'Content-Type': 'application/json' },
               body: JSON.stringify({ type: 'view' })
            }).catch(() => { });
         });
      }
   }, [promotions]);

   const handlePromoAction = (id: number, code?: string, isClaim = false) => {
      // Track analytic event natively to analytics db table
      fetch(`${API_URL}/api/promotions/${id}/track`, {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ type: isClaim ? 'claim' : 'click' })
      }).catch(() => { });

      if (code) {
         copyToClipboard(code);
      }
   };

   // --- SECTION RENDERERS ---
   const renderHeroCarousel = () => (
      <section className="w-full relative bg-slate-950 text-white overflow-hidden min-h-[460px] md:min-h-[560px] flex items-center">
         <AnimatePresence mode="wait">
            {heroCampaigns.map((camp: any, idx: number) => {
               if (idx !== activeSlide) return null;
               const primaryColor = camp.color || '#064e3b';
               return (
                  <motion.div
                     key={camp.id}
                     initial={{ opacity: 0, scale: 1.04 }}
                     animate={{ opacity: 1, scale: 1 }}
                     exit={{ opacity: 0 }}
                     transition={{ duration: 0.8 }}
                     className="absolute inset-0 flex items-center"
                     style={{
                        background: `linear-gradient(135deg, ${primaryColor} 0%, #091e15 70%, #000000 100%)`
                     }}
                  >
                     <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:20px_20px]" />
                     <div className="absolute bottom-0 right-0 w-2/3 h-full bg-gradient-to-tl from-black/50 to-transparent z-0" />

                     <div className="max-w-[1400px] mx-auto px-6 md:px-12 w-full z-10 relative grid grid-cols-1 lg:grid-cols-2 gap-12 items-center py-12">
                        <motion.div
                           initial={{ x: -30, opacity: 0 }}
                           animate={{ x: 0, opacity: 1 }}
                           transition={{ delay: 0.2, duration: 0.6 }}
                           className="flex flex-col gap-5 md:gap-7 text-left"
                        >
                           <div className="flex flex-wrap items-center gap-3">
                              <span className="px-4 py-1.5 rounded-full bg-white/15 border border-white/25 backdrop-blur-md text-[9px] font-black uppercase tracking-widest text-amber-300 shadow-lg shadow-black/20 flex items-center gap-1.5">
                                 🔥 {camp.tag}
                              </span>
                              <span className="text-[10px] font-black text-white/75 tracking-wider flex items-center gap-1">
                                 <Clock size={12} className="text-amber-400 animate-pulse" /> Campaign Live
                              </span>
                           </div>

                           <h1 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tight leading-[0.95] uppercase text-white drop-shadow-2xl">
                              {camp.title.split(' ').slice(0, -1).join(' ')} <br />
                              <span className="text-amber-400 italic normal-case font-serif drop-shadow-lg">{camp.title.split(' ').pop()}</span>
                           </h1>

                           <p className="text-xl md:text-2xl lg:text-3xl font-extrabold text-emerald-50/90 tracking-wide font-serif max-w-lg">
                              {camp.subtitle}
                           </p>

                           {camp.description && (
                              <p className="text-sm md:text-base text-white/65 font-semibold max-w-xl leading-relaxed hidden md:block">
                                 {camp.description}
                              </p>
                           )}

                           <div className="flex items-center gap-6 mt-4">
                              <Link
                                 href={camp.link}
                                 onClick={() => camp.id && !String(camp.id).startsWith('fall') && handlePromoAction(Number(camp.id))}
                                 className="h-14 px-10 rounded-2xl bg-amber-400 !text-emerald-950 text-[12px] font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-2xl shadow-amber-400/30 hover:bg-white hover:!text-slate-950 active:scale-95 transition-all group"
                              >
                                 {camp.action}
                                 <ArrowRight size={16} className="group-hover:translate-x-1.5 transition-transform" />
                              </Link>
                              <div className="hidden md:flex flex-col">
                                 <span className="text-[9px] text-white/50 font-black uppercase tracking-widest mb-1">Time Remaining</span>
                                 <FlashTimer hours={8} />
                              </div>
                           </div>
                        </motion.div>

                        <motion.div
                           initial={{ scale: 0.92, opacity: 0 }}
                           animate={{ scale: 1, opacity: 1 }}
                           transition={{ delay: 0.3, duration: 0.6 }}
                           className="hidden lg:flex items-center justify-center relative"
                        >
                           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-400/15 blur-[100px] rounded-full z-0" />

                           <div className="relative w-[440px] h-[440px] border-[14px] border-white/10 rounded-[3rem] overflow-hidden shadow-[0_50px_100px_rgba(0,0,0,0.6)] group rotate-2 hover:rotate-0 transition-transform duration-700 z-10 bg-emerald-900/80">
                              <Image
                                 src={camp.image}
                                 alt="Campaign Showcase"
                                 fill
                                 className="object-cover scale-105 group-hover:scale-100 transition-transform duration-[5000ms]"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                              <div className="absolute bottom-6 left-8 right-8 flex items-end justify-between">
                                 <div className="flex flex-col">
                                    <span className="text-[9px] font-black uppercase text-amber-400 tracking-widest">GUARANTEED NATIVE</span>
                                    <span className="text-white font-extrabold text-base drop-shadow-sm">100% Authenticity</span>
                                 </div>
                                 <span className="h-14 w-14 bg-white/95 backdrop-blur rounded-full flex flex-col items-center justify-center text-emerald-950 font-black tracking-tighter shadow-2xl uppercase text-[9px] leading-tight border border-slate-200">
                                    <span>Product</span>
                                    <span className="text-emerald-700 font-black text-[6.5px] tracking-[0.2em]">PURE</span>
                                 </span>
                              </div>
                           </div>
                        </motion.div>
                     </div>
                  </motion.div>
               );
            })}
         </AnimatePresence>

         {heroCampaigns.length > 1 && (
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3 z-30">
               {heroCampaigns.map((_: any, i: number) => (
                  <button
                     key={i}
                     onClick={() => setActiveSlide(i)}
                     className={`h-2.5 rounded-full transition-all duration-300 ${activeSlide === i ? 'w-10 bg-amber-400 shadow-lg' : 'w-2.5 bg-white/30 hover:bg-white/50'}`}
                  />
               ))}
            </div>
         )}
      </section>
   );

   const renderQuickStrips = () => (
      <section className="w-full bg-white border-b border-slate-200 py-4.5 shadow-sm relative z-20 overflow-hidden">
         <div className="max-w-[1400px] mx-auto px-6">
            <div className="flex items-center overflow-x-auto gap-5 no-scrollbar pr-6 py-1.5">
               <div className="flex items-center gap-2.5 shrink-0 text-[11px] font-black uppercase tracking-widest text-slate-400 border-r border-slate-200 pr-6 mr-1">
                  <Zap size={15} className="text-[#ef4444] animate-bounce" /> Active Promos
               </div>
               {quickStrips.map((cup: any, i: number) => {
                  const isHex = cup.color?.startsWith('#');
                  return (
                     <button
                        key={`${cup.code}-${i}`}
                        onClick={() => {
                           if (cup.id && !String(cup.id).startsWith('fall')) {
                              handlePromoAction(Number(cup.id), cup.code, true);
                           } else {
                              copyToClipboard(cup.code);
                           }
                        }}
                        className="flex items-center gap-4 shrink-0 px-6 py-3.5 border border-slate-200 rounded-2xl transition-all hover:border-emerald-500/30 hover:shadow-lg active:scale-[0.97] group/pill relative overflow-hidden bg-white"
                     >
                        <div
                           className="absolute inset-y-0 left-0 w-1.5"
                           style={{ backgroundColor: isHex ? cup.color : '#10b981' }}
                        />
                        <div className="flex flex-col items-start leading-none gap-1 pl-2">
                           <span className="text-[13px] font-black tracking-tight uppercase text-slate-950 group-hover/pill:text-emerald-600 transition-colors">{cup.label}</span>
                           <span className="text-[10px] font-bold text-slate-400">{cup.sub}</span>
                        </div>
                        <div className="h-8 border-l border-slate-100 mx-1" />
                        <div className="flex items-center gap-1.5 font-mono font-black text-[11px] uppercase tracking-widest text-slate-700">
                           {copiedCode === cup.code ? <Check size={12} className="text-emerald-600" /> : cup.code}
                        </div>
                     </button>
                  );
               })}
            </div>
         </div>
      </section>
   );

   const renderFlashDeals = () => (
      <section className="max-w-[1400px] mx-auto px-6 md:px-12 py-16">
         <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-10 gap-4">
            <div className="flex flex-col text-left">
               <div className="flex items-center gap-2.5 text-[#ef4444] mb-2">
                  <Flame size={22} className="fill-[#ef4444]" />
                  <span className="text-[11px] font-black tracking-[0.35em] uppercase">Urgent Savings</span>
               </div>
               <h2 className="text-3xl md:text-4xl font-black text-slate-950 uppercase tracking-tight leading-none">
                  Lightning Flash Deals
               </h2>
            </div>
            <div className="flex items-center gap-3.5 bg-red-50 border border-red-100 rounded-xl px-5 py-2.5 shadow-sm">
               <span className="text-xs font-bold text-[#ef4444] tracking-wider uppercase">Ends In:</span>
               <FlashTimer hours={3} />
            </div>
         </div>

         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {flashDeals.map((deal: any, index: number) => {
               const isHighlyClaimed = deal.claimed >= 80;
               return (
                  <div key={`${deal.id}-${index}`} className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm relative group hover:shadow-2xl hover:border-[#ef4444]/30 transition-all duration-500">
                     <div className="absolute top-4 left-4 z-10 bg-[#ef4444] text-white text-[9px] font-black uppercase tracking-widest px-2.5 py-1.5 rounded-lg shadow-lg">
                        {deal.discount}
                     </div>
                     <div className="w-full h-44 bg-slate-50 relative overflow-hidden border-b border-slate-100">
                        <Image src={deal.image} alt={deal.title} fill className="object-cover group-hover:scale-105 transition-transform duration-[1500ms]" />
                     </div>
                     <div className="p-5 flex flex-col">
                        <h3 className="font-black text-[15px] text-slate-950 tracking-tight line-clamp-2 min-h-[2.5em] leading-snug">{deal.title}</h3>

                        <div className="flex items-baseline gap-2 mt-3 mb-4">
                           <span className="text-xl font-black text-slate-950">{deal.price}</span>
                           <span className="text-[13px] text-slate-400 font-bold line-through">{deal.oldPrice}</span>
                        </div>

                        <div className="space-y-1.5">
                           <div className="flex items-center justify-between text-[10px] font-bold">
                              <span className="text-slate-500">{deal.claimed}% claimed</span>
                              <span className={`${isHighlyClaimed ? 'text-[#ef4444] animate-pulse font-black' : 'text-emerald-600'} uppercase`}>
                                 {isHighlyClaimed ? 'Almost Gone!' : 'In Stock'}
                              </span>
                           </div>
                           <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                              <div
                                 className="h-full bg-gradient-to-r from-amber-500 to-[#ef4444] rounded-full transition-all duration-1000"
                                 style={{ width: `${deal.claimed}%` }}
                              />
                           </div>
                        </div>

                        <Link
                           href={deal.link}
                           onClick={() => deal.id && !String(deal.id).startsWith('f_') && handlePromoAction(Number(deal.id), undefined, true)}
                           className="w-full mt-6 py-3 bg-slate-950 hover:bg-[#064e3b] !text-white text-center text-[10px] font-black uppercase tracking-widest rounded-xl flex items-center justify-center transition-colors shadow-md"
                        >
                           Claim Flash Deal
                        </Link>
                     </div>
                  </div>
               );
            })}
         </div>
      </section>
   );

   const renderBannerGrids = () => {
      const displayBanners = allBanners.slice(0, 4);

      if (displayBanners.length === 0) {
         return null;
      }

      return (
         <section className="max-w-[1400px] mx-auto px-6 md:px-12 mb-20">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
               {displayBanners.map((banner: any, idx: number) => (
                  <div 
                     key={banner.id}
                     className="relative rounded-[2.5rem] overflow-hidden bg-slate-900 text-white p-10 md:p-14 shadow-xl shadow-slate-900/10 group flex flex-col justify-between min-h-[300px]"
                     style={{ backgroundColor: idx % 2 === 0 ? '#064e3b' : '#78350f' }}
                  >
                     <div className="absolute top-0 right-0 w-[55%] h-full opacity-20 grayscale group-hover:opacity-45 group-hover:grayscale-0 transition-all duration-1000">
                        <img src={banner.banner_image || banner.image} className="w-full h-full object-cover scale-105 group-hover:scale-100 transition-transform duration-700" alt={banner.title || 'Banner'} />
                     </div>
                     <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/30 to-transparent z-0" />

                     <div className="relative z-10 flex flex-col gap-4 max-w-[75%] text-left">
                        <div className="flex items-center gap-2.5 text-amber-400 font-black text-[10px] tracking-[0.25em] uppercase bg-white/5 w-fit px-3 py-1.5 rounded-full border border-white/10">
                           <Award size={14} /> {banner.tagline || 'Special Campaign'}
                        </div>
                        <h2 className="text-3xl md:text-4xl font-black tracking-tight uppercase leading-[0.95] text-white drop-shadow">
                           {banner.title}
                        </h2>
                        {banner.subtitle && (
                           <p className="text-slate-200/80 text-xs font-semibold leading-relaxed mt-1.5 max-w-md">
                              {banner.subtitle}
                           </p>
                        )}
                     </div>
                     <div className="relative z-10 mt-8 text-left">
                        <Link href={banner.link || '/best-selling'} className="inline-flex items-center gap-2.5 px-8 py-4 rounded-xl bg-white !text-slate-950 font-black uppercase tracking-wider text-[10px] active:scale-95 transition-all hover:bg-amber-400 hover:!text-slate-950 shadow-2xl">
                           {banner.buttonText || 'Explore Offer'} <ArrowRight size={14} />
                        </Link>
                     </div>
                  </div>
               ))}
            </div>
         </section>
      );
   };

   const renderVoucherList = () => (
      <section id="active-deals" className="max-w-[1400px] mx-auto px-6 md:px-12 py-16 border-t border-slate-200/50">
         <div className="flex items-center justify-between mb-12">
            <div className="flex flex-col text-left">
               <span className="text-[11px] font-black text-emerald-600 uppercase tracking-[0.35em] mb-2">Active Checkout Vouchers</span>
               <h2 className="text-3xl md:text-4xl font-black text-slate-950 uppercase tracking-tight">
                  Available Promo Codes
               </h2>
            </div>
            <div className="hidden lg:block h-[1px] flex-1 bg-slate-200 mx-10" />
         </div>
         {standardVouchers.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-3xl p-20 flex flex-col items-center justify-center text-center shadow-sm">
               <div className="h-20 w-20 bg-emerald-50 rounded-full flex items-center justify-center mb-5 text-emerald-600">
                  <Gift size={36} />
               </div>
               <h3 className="text-xl font-black text-slate-950 uppercase tracking-wide mb-1.5">Collecting Checkout Deals...</h3>
               <p className="text-[13px] font-semibold text-slate-400 max-w-md">We are preparing fresh stackable checkout vouchers for your next Producting haul. Stay tuned!</p>
            </div>
         ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
               {standardVouchers.map((promo: any) => (
                  <motion.div
                     key={promo.id}
                     whileHover={{ y: -6, boxShadow: '0 30px 50px -10px rgba(0,0,0,0.09)' }}
                     className="bg-white border border-slate-200 rounded-[2.2rem] overflow-hidden relative flex flex-col h-full transition-all duration-300 shadow-sm group hover:border-emerald-500/30"
                  >
                     <div className="absolute top-1/2 -translate-y-1/2 -left-4 w-8 h-8 bg-[#f8fafc] border-r border-slate-200 rounded-full z-10 hidden sm:block" />
                     <div className="absolute top-1/2 -translate-y-1/2 -right-4 w-8 h-8 bg-[#f8fafc] border-l border-slate-200 rounded-full z-10 hidden sm:block" />

                     <div className="relative h-52 overflow-hidden shrink-0 bg-slate-50">
                        <Image
                           src={promo.image || '/ai_images/organic_grains_1776231059575.png'}
                           alt={promo.title}
                           fill
                           className="object-cover group-hover:scale-105 transition-transform duration-[4000ms]"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                        <div className="absolute top-5 right-5 bg-white/90 backdrop-blur-md text-emerald-950 font-black text-[8px] px-3 py-1.5 rounded-lg tracking-widest border border-slate-200/50 shadow-md uppercase">
                           STOREFRONT VALID
                        </div>
                        <div className="absolute bottom-5 left-8 flex flex-col text-left">
                           <span className="text-[9px] text-amber-300 font-black tracking-widest uppercase mb-1 drop-shadow">{promo.category || 'All Products'}</span>
                           <h3 className="text-white font-black text-3xl drop-shadow-lg leading-none">{promo.discount || 'SPECIAL'}</h3>
                        </div>
                     </div>

                     <div className="p-8 flex flex-col flex-1 bg-gradient-to-b from-white to-slate-50/40 text-left">
                        <h4 className="font-black text-lg text-slate-950 tracking-tight mb-3 leading-snug group-hover:text-emerald-700 transition-colors">{promo.title}</h4>
                        {promo.description && (
                           <p className="text-[13px] text-slate-500 leading-relaxed font-bold flex-1 mb-8">{promo.description}</p>
                        )}

                        <div className="relative mt-auto bg-emerald-50/50 border-2 border-dashed border-emerald-200 rounded-2xl p-4 flex items-center justify-between hover:bg-emerald-100/40 transition-colors">
                           <div className="flex flex-col leading-none">
                              <span className="text-[8.5px] text-emerald-600 font-black uppercase tracking-[0.15em] mb-1.5">One-Tap Checkout</span>
                              <span className="font-mono font-black text-base text-emerald-950 uppercase tracking-widest">{promo.code || 'AUTO-APPLY'}</span>
                           </div>
                           {promo.code && (
                              <button
                                 onClick={() => handlePromoAction(promo.id, promo.code, true)}
                                 className="h-10 px-5 bg-emerald-950 hover:bg-emerald-800 text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 active:scale-95 shadow-xl shadow-emerald-950/15 transition-all"
                              >
                                 {copiedCode === promo.code ? (
                                    <>Copied <Check size={12} /></>
                                 ) : (
                                    <>Apply <Copy size={12} /></>
                                 )}
                              </button>
                           )}
                        </div>
                     </div>
                  </motion.div>
               ))}
            </div>
         )}
      </section>
   );

   const renderCombos = () => (
      <section className="bg-slate-950 py-24 mt-16 text-white relative overflow-hidden">
         <div className="absolute top-0 left-0 w-full h-full opacity-[0.08] mix-blend-luminosity bg-[url('/ai_images/organic_grains_1776231059575.png')] bg-cover bg-center" />
         <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black z-0" />

         <div className="max-w-[1400px] mx-auto px-6 md:px-12 relative z-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-5 mb-14">
               <div className="flex flex-col text-left">
                  <div className="flex items-center gap-2.5 text-amber-400 font-black text-[11px] uppercase tracking-[0.3em] mb-3.5 bg-white/5 px-3 py-1.5 border border-white/10 rounded-lg w-fit">
                     <Award size={17} /> Master Combo Bundles
                  </div>
                  <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight leading-none drop-shadow-2xl">
                     Unmatched Bundle Savings
                  </h2>
               </div>
               <Link href="/best-selling" className="text-[11px] font-black text-amber-400 border-b-2 border-amber-400 uppercase pb-1 hover:text-white hover:border-white transition-all tracking-wider">
                  Explore All Bundles
               </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
               {comboDeals.map((combo: any, index: number) => (
                  <div key={`${combo.id}-${index}`} className="bg-white/5 border border-white/10 backdrop-blur-lg rounded-[2.5rem] p-6 md:p-8 lg:p-10 flex flex-col md:flex-row gap-8 items-center hover:bg-white/10 transition-all group shadow-[0_30px_60px_rgba(0,0,0,0.3)] relative overflow-hidden">
                     <div className="absolute top-0 left-0 w-20 h-20 bg-amber-400 text-slate-950 flex items-center justify-center font-black text-[10px] tracking-tighter rotate-[-45deg] translate-x-[-30px] translate-y-[-30px] shadow-xl z-10 uppercase pt-8 pl-7">
                        Combo
                     </div>
                     <div className="relative w-48 h-48 sm:w-52 sm:h-52 rounded-[2rem] overflow-hidden shrink-0 bg-emerald-950/60 shadow-2xl">
                        <Image src={combo.image} alt={combo.title} fill className="object-cover scale-105 group-hover:scale-100 transition-transform duration-700" />
                     </div>
                     <div className="flex flex-col flex-1 text-left gap-4">
                        <div className="flex flex-wrap items-center gap-2.5">
                           <span className="bg-amber-400 text-slate-950 font-black text-[9px] px-3 py-1 rounded-md uppercase tracking-widest shadow">{combo.tag}</span>
                           <span className="text-amber-400 font-black text-sm drop-shadow">{combo.save}</span>
                        </div>
                        <h3 className="text-2xl md:text-3xl font-black text-white tracking-tight leading-tight group-hover:text-amber-300 transition-colors">{combo.title}</h3>
                        {combo.description && (
                           <p className="text-white/60 text-[13px] font-bold leading-relaxed line-clamp-2">{combo.description}</p>
                        )}
                        <div className="flex items-baseline gap-3.5 mt-1">
                           <span className="text-3xl font-black text-white drop-shadow">{combo.price}</span>
                           <span className="text-white/30 text-base line-through font-extrabold">{combo.oldPrice}</span>
                        </div>
                        <Link
                           href={combo.link}
                           onClick={() => combo.id && !String(combo.id).startsWith('f_') && handlePromoAction(Number(combo.id), undefined, true)}
                           className="w-fit mt-2 px-8 py-4 bg-white hover:bg-amber-400 !text-slate-950 font-black uppercase tracking-widest text-[10px] rounded-xl transition-all hover:shadow-2xl flex items-center gap-2.5 group/arr active:scale-95 shadow-lg"
                        >
                           Claim Pack <ArrowRight size={15} className="group-hover/arr:translate-x-1.5 transition-transform" />
                        </Link>
                     </div>
                  </div>
               ))}
            </div>
         </div>
      </section>
   );

   const renderWalletOffers = () => (
      <section className="max-w-[1400px] mx-auto px-6 md:px-12 py-24">
         <div className="flex flex-col items-center text-center max-w-2xl mx-auto mb-14">
            <div className="flex items-center gap-2 text-[#2563eb] font-black text-[11px] uppercase tracking-[0.35em] mb-3 bg-blue-50 px-4 py-1.5 rounded-full border border-blue-100 shadow-sm">
               <Smartphone size={15} /> Secured Gateways
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-slate-950 uppercase tracking-tight">
               Partner Payment Offers
            </h2>
            <p className="text-slate-400 text-sm font-bold mt-2.5 max-w-md">
               Complete your fresh organic baskets using partner wallets to stack rewards & instant cashbacks.
            </p>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {walletOffers.map((wall: any, index: number) => {
               const accentHex = wall.color || '#1e293b';
               return (
                  <div
                     key={`${wall.provider}-${index}`}
                     className="p-8 rounded-3xl border border-slate-200 bg-white flex flex-col gap-6 shadow-sm hover:shadow-xl hover:border-slate-300 transition-all duration-300 group relative overflow-hidden"
                  >
                     <div className="absolute top-0 inset-x-0 h-1.5" style={{ backgroundColor: accentHex }} />
                     <div className="flex items-center justify-between border-b border-slate-100 pb-5 text-left">
                        <div className="flex items-center gap-4">
                           <div className="h-12 w-12 rounded-2xl bg-slate-50 shadow-inner border border-slate-100 flex items-center justify-center text-slate-500 group-hover:text-slate-950 transition-colors shrink-0">
                              {wall.icon}
                           </div>
                           <div className="flex flex-col leading-tight">
                              <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">PAYMENT PARTNER</span>
                              <span className="text-base font-black text-slate-950 uppercase">{wall.provider}</span>
                           </div>
                        </div>
                     </div>
                     <div className="flex flex-col text-left flex-1 gap-1.5 pt-2">
                        <span className="text-slate-950 font-black text-xl leading-tight tracking-tight">{wall.disc}</span>
                        <span className="text-slate-400 text-[11px] font-bold uppercase">{wall.min}</span>
                     </div>
                     <button
                        onClick={() => {
                           if (wall.id && !String(wall.id).startsWith('fall')) {
                              handlePromoAction(Number(wall.id), wall.code, true);
                           } else {
                              copyToClipboard(wall.code);
                           }
                        }}
                        className="w-full py-3.5 bg-slate-950 hover:bg-[#064e3b] text-white text-[10px] font-black tracking-widest rounded-xl flex items-center justify-center gap-2.5 uppercase shadow-lg transition-all active:scale-95"
                     >
                        {copiedCode === wall.code ? <>Coupon Applied <Check size={13} /></> : <>Code: {wall.code} <Copy size={13} /></>}
                     </button>
                  </div>
               );
            })}
         </div>
      </section>
   );

   const renderReferral = () => (
      <section className="max-w-[1400px] mx-auto px-6 md:px-12 mb-12">
         <div className="bg-gradient-to-br from-amber-500 via-amber-600 to-amber-800 text-slate-950 rounded-[3rem] p-10 md:p-20 shadow-[0_40px_80px_rgba(217,119,6,0.15)] relative overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-10">
            <div className="absolute inset-0 opacity-25 mix-blend-overlay bg-[radial-gradient(#000_1.5px,transparent_1.5px)] [background-size:32px_32px]" />

            <div className="flex flex-col text-left relative z-10 max-w-2xl gap-5 text-white">
               <div className="flex items-center gap-2 text-slate-950 font-black text-[11px] uppercase tracking-[0.35em] bg-white w-fit px-4 py-2 rounded-full shadow-lg">
                  <Users size={14} /> Community Rewards
               </div>
               <h2 className="text-4xl md:text-6xl font-black tracking-tight uppercase leading-[0.95] text-slate-950">
                  Invite Taste. <br /> Earn <span className="text-white italic lowercase font-serif">₹200 Native Credit.</span>
               </h2>
               <p className="text-slate-950/80 text-base md:text-lg font-bold leading-relaxed max-w-xl">
                  Introduce pure, chemical-free traditional living to your neighbors. When they receive their first native basket, they save ₹100, and we instantly credit ₹200 into your grocery wallet!
               </p>
            </div>

            <div className="flex flex-col gap-4 relative z-10 shrink-0 w-full lg:w-auto">
               <Link href="/account" className="h-16 px-12 bg-slate-950 hover:bg-slate-900 text-white rounded-[1.2rem] font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 shadow-2xl shadow-slate-950/40 active:scale-[0.98] transition-all">
                  Activate Invite Link <ArrowRight size={18} />
               </Link>
               <span className="text-[10px] font-black text-slate-950/60 uppercase tracking-widest text-center lg:text-left lg:pl-2">Subject to active delivery zones.</span>
            </div>
         </div>
      </section>
   );

   const renderSection = (type: string) => {
      switch (type) {
         case 'HERO_CAROUSEL':
         case 'HERO_SLIDER':
            return renderHeroCarousel();
         case 'QUICK_STRIPS': return renderQuickStrips();
         case 'FLASH_DEALS': return renderFlashDeals();
         case 'BANNER_GRIDS': return renderBannerGrids();
         case 'VOUCHER_LIST':
         case 'VOUCHERS':
            return renderVoucherList();
         case 'COMBOS':
         case 'COMBO_OFFERS':
            return renderCombos();
         case 'WALLET_OFFERS': return renderWalletOffers();
         case 'REFERRAL': return renderReferral();
         default: return null;
      }
   };

   return (
      <div className="w-full bg-[#f8fafc] min-h-screen overflow-hidden relative pb-20 animate-in fade-in duration-700">

         {/* DYNAMIC CAMPAIGN ENGINE — renders only real DB data */}
         {sections && sections.length > 0 ? (
            sections
               .filter((s: any) => s.isActive)
               .map((sec: any) => (
                  <React.Fragment key={sec.id}>
                     {renderSection(sec.sectionType)}
                  </React.Fragment>
               ))
         ) : (
            /* No section config — render all sections that have real data */
            <>
               {heroCampaigns.length > 0 && renderHeroCarousel()}
               {quickStrips.length > 0 && renderQuickStrips()}
               {flashDeals.length > 0 && renderFlashDeals()}
               {renderBannerGrids()}
               {renderVoucherList()}
               {comboDeals.length > 0 && renderCombos()}
               {walletOffers.length > 0 && renderWalletOffers()}
               {renderReferral()}
            </>
         )}

         {/* 9. STICKY FLOATING OFFER INDICATOR */}
         <AnimatePresence>
            {showFloatingWidget && (
               <motion.div
                  initial={{ y: 100, opacity: 0, scale: 0.9 }}
                  animate={{ y: 0, opacity: 1, scale: 1 }}
                  exit={{ y: 100, opacity: 0 }}
                  className="fixed bottom-8 right-8 z-[100] hidden md:block"
               >
                  <div className="bg-slate-950 text-white px-6 py-5 rounded-2xl shadow-[0_30px_60px_rgba(0,0,0,0.4)] border border-slate-800 flex items-center gap-5 max-w-[300px] relative">
                     <button
                        onClick={() => setShowFloatingWidget(false)}
                        className="absolute -top-2.5 -right-2.5 h-7 w-7 rounded-full bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 flex items-center justify-center text-[10px] border border-slate-700 font-black shadow-2xl cursor-pointer"
                     >
                        ✕
                     </button>
                     <div className="h-12 w-12 bg-amber-400 rounded-xl flex items-center justify-center text-slate-950 shrink-0 shadow-2xl shadow-amber-400/20 animate-bounce mt-1">
                        <Flame size={24} className="fill-slate-950" />
                     </div>
                     <div className="flex flex-col leading-tight text-left flex-1">
                        <span className="text-[9px] font-black uppercase tracking-[0.15em] text-amber-400">Active Savings Vault</span>
                        <span className="text-sm font-black mt-1 tracking-tight">Stackable Offers Live</span>
                        <a href="#active-deals" className="text-[10px] text-emerald-400 hover:text-emerald-300 font-black underline mt-1.5 flex items-center gap-1 tracking-wide">
                           View {activePromos.length} Savings Vouchers <ChevronRight size={12} />
                        </a>
                     </div>
                  </div>
               </motion.div>
            )}
         </AnimatePresence>

      </div>
   );
}
