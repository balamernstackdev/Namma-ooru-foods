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
import PremiumLoader from '@/components/ui/PremiumLoader';

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
// HERO CAMPAIGNS DATA
// ---------------------------------------------------------
const HERO_CAMPAIGNS = [
   {
      id: 'camp_1',
      title: 'Summer Organic Fest 2026',
      subtitle: 'Upto 40% off on Premium Harvests',
      description: 'Experience 100% authentic, cold-pressed traditional oils & stone-ground spices delivered direct to your kitchen.',
      tag: 'BESTSELLING SEASON',
      color: 'from-emerald-900 via-emerald-800 to-amber-800',
      image: '/ai_images/organic_grains_1776231059575.png',
      action: 'Shop The Festival',
      link: '/best-selling'
   },
   {
      id: 'camp_2',
      title: 'The Golden Combo Blast',
      subtitle: 'Buy 2 Get 1 Free Nationwide',
      description: 'Mix & Match select traditional pickles, authentic organic snacks, and raw wild honey jars.',
      tag: 'MEMBER EXCLUSIVE',
      color: 'from-amber-700 via-amber-800 to-emerald-950',
      image: '/ai_images/pickles_1776231059575.png', // will fallback if broken
      action: 'Claim B2G1 Deals',
      link: '/best-selling'
   }
];

// ---------------------------------------------------------
// STATIC CAMPAIGN PILLS & STRIPS
// ---------------------------------------------------------
const QUICK_COUPONS = [
   { code: 'FIRST50', label: 'Flat ₹50 OFF', sub: 'On Your First Order', color: 'border-amber-200 bg-amber-50 text-amber-900' },
   { code: 'FREEDEL', label: 'FREE Delivery', sub: 'On Orders Above ₹299', color: 'border-emerald-200 bg-emerald-50 text-emerald-900' },
   { code: 'GPAY10', label: '10% UPI Cashback', sub: 'Secure GPay Checkout', color: 'border-blue-200 bg-blue-50 text-blue-900' },
   { code: 'HEALTHY', label: 'Extra 15% Off', sub: 'Organic Millets Fest', color: 'border-orange-200 bg-orange-50 text-orange-900' },
];

const WALLET_OFFERS = [
   { provider: 'Google Pay', disc: 'Flat ₹75 Cashback', min: 'Min Order: ₹499', code: 'GPAYNATURE', bg: 'bg-[#1e3a8a]/5 hover:border-[#2563eb]', icon: <Smartphone size={20} className="text-[#2563eb]" /> },
   { provider: 'PhonePe', disc: 'Win Upto ₹200 Scratch Card', min: 'Min Order: ₹600', code: 'PHPNATURE', bg: 'bg-[#4c1d95]/5 hover:border-[#7c3aed]', icon: <Wallet size={20} className="text-[#7c3aed]" /> },
   { provider: 'ICICI NetBanking', disc: 'Instant 10% Discount', min: 'Min Order: ₹1000', code: 'ICICINATURAL', bg: 'bg-[#7c2d12]/5 hover:border-[#ea580c]', icon: <ShieldCheck size={20} className="text-[#ea580c]" /> }
];

const COMBO_DEALS = [
   { id: 'cmb1', title: 'Healthy Breakfast Starter Pack', description: 'Pure Ghee + Multi Millet Flakes + Raw Honey', price: '₹599', oldPrice: '₹850', save: '30% Off', tag: 'HOT COMBO', image: '/ai_images/breakfast_combo.png' },
   { id: 'cmb2', title: 'Traditional Oil Festival Combo', description: 'Groundnut Oil 1L + Sesame Oil 1L + Coconut Oil 1L', price: '₹749', oldPrice: '₹999', save: '₹250 Saved', tag: 'BEST VALUE', image: '/ai_images/oil_combo.png' }
];

// ---------------------------------------------------------
// MAIN COMPONENT
// ---------------------------------------------------------
export default function PromotionsPage() {
   const { data: promotions, error } = useSWR(`${API_URL}/api/promotions`, fetcher);
   const [copiedCode, setCopiedCode] = useState<string | null>(null);
   const [activeSlide, setActiveSlide] = useState(0);
   const [showFloatingWidget, setShowFloatingWidget] = useState(true);

   const activeDeals = promotions?.filter((p: any) => p.isActive) || [];

   const copyToClipboard = (code: string) => {
      navigator.clipboard.writeText(code);
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 3000);
   };

   useEffect(() => {
      const interval = setInterval(() => {
         setActiveSlide(prev => (prev + 1) % HERO_CAMPAIGNS.length);
      }, 6000);
      return () => clearInterval(interval);
   }, []);

   return (
      <div className="w-full bg-[#f8fafc] min-h-screen overflow-hidden relative pb-20">
         
         {/* --------------------------------------------------- */}
         {/* 1. HERO CAMPAIGN AUTO CAROUSEL */}
         {/* --------------------------------------------------- */}
         <section className="w-full relative bg-slate-900 text-white overflow-hidden min-h-[460px] md:min-h-[550px] flex items-center">
            <AnimatePresence mode="wait">
               {HERO_CAMPAIGNS.map((camp, idx) => {
                  if (idx !== activeSlide) return null;
                  return (
                     <motion.div
                        key={camp.id}
                        initial={{ opacity: 0, scale: 1.05 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.8 }}
                        className={`absolute inset-0 bg-gradient-to-r ${camp.color} flex items-center`}
                     >
                        {/* Background Texture */}
                        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
                        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-black/30 to-transparent z-0" />
                        
                        <div className="max-w-[1400px] mx-auto px-6 md:px-12 w-full z-10 relative grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
                           
                           {/* Content Left */}
                           <motion.div 
                              initial={{ x: -40, opacity: 0 }}
                              animate={{ x: 0, opacity: 1 }}
                              transition={{ delay: 0.2, duration: 0.6 }}
                              className="flex flex-col gap-4 md:gap-6 text-left"
                           >
                              <div className="flex items-center gap-2.5">
                                 <span className="px-3.5 py-1.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm text-[9px] font-black uppercase tracking-widest text-amber-300 shadow-lg shadow-black/10">
                                    🔥 {camp.tag}
                                 </span>
                                 <span className="text-[10px] font-black text-white/80 tracking-wider flex items-center gap-1">
                                    <Clock size={12} className="text-amber-400 animate-pulse" /> Limited Time
                                 </span>
                              </div>

                              <h1 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tight leading-[0.95] uppercase text-white drop-shadow-lg">
                                 {camp.title.split(' ').slice(0, -1).join(' ')} <br/>
                                 <span className="text-amber-400 italic normal-case font-serif">{camp.title.split(' ').pop()}</span>
                              </h1>

                              <p className="text-lg md:text-2xl font-bold text-emerald-100/90 tracking-wide font-serif">
                                 {camp.subtitle}
                              </p>

                              <p className="text-sm md:text-base text-white/60 font-medium max-w-xl leading-relaxed hidden md:block">
                                 {camp.description}
                              </p>

                              <div className="flex items-center gap-4 mt-4">
                                 <Link href={camp.link} className="h-12 md:h-14 px-8 rounded-xl bg-amber-400 text-emerald-950 text-[12px] font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl shadow-amber-400/20 hover:bg-white hover:text-slate-900 active:scale-95 transition-all group">
                                    {camp.action} 
                                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                                 </Link>
                                 <div className="hidden md:flex flex-col">
                                    <span className="text-[9px] text-white/50 font-black uppercase tracking-widest">Flash Sale Ends</span>
                                    <FlashTimer hours={8} />
                                 </div>
                              </div>
                           </motion.div>

                           {/* Graphics Right */}
                           <motion.div 
                              initial={{ scale: 0.9, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              transition={{ delay: 0.3, duration: 0.6 }}
                              className="hidden lg:flex items-center justify-center relative"
                           >
                              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-amber-500/20 blur-3xl rounded-full z-0" />
                              
                              <div className="relative w-[400px] h-[400px] border-[12px] border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl shadow-black/40 group rotate-3 hover:rotate-0 transition-transform duration-500 z-10 bg-emerald-900">
                                 <Image
                                    src={camp.image || '/ai_images/organic_grains_1776231059575.png'}
                                    alt="Campaign banner"
                                    fill
                                    className="object-cover scale-105 group-hover:scale-100 transition-transform duration-[4000ms]"
                                 />
                                 <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                 <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between">
                                    <div className="flex flex-col">
                                       <span className="text-[10px] font-black uppercase text-amber-400">EXCLUSIVE OFFER</span>
                                       <span className="text-white font-bold text-sm">Guaranteed Purity</span>
                                    </div>
                                    <span className="h-12 w-12 bg-white rounded-full flex items-center justify-center text-emerald-950 font-black tracking-tighter shadow-lg uppercase text-[10px] flex-col">
                                       <span>CERTIFIED</span>
                                       <span className="text-emerald-700 font-extrabold text-[7px]">ORGANIC</span>
                                    </span>
                                 </div>
                              </div>
                           </motion.div>
                        </div>
                     </motion.div>
                  );
               })}
            </AnimatePresence>

            {/* Carousel Dot Navigation */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 z-30">
               {HERO_CAMPAIGNS.map((_, i) => (
                  <button 
                     key={i}
                     onClick={() => setActiveSlide(i)}
                     className={`h-2 rounded-full transition-all duration-300 ${activeSlide === i ? 'w-8 bg-amber-400' : 'w-2 bg-white/30'}`}
                  />
               ))}
            </div>
         </section>

         {/* --------------------------------------------------- */}
         {/* 2. QUICK OFFERS STRIP (Horizontal Scroller) */}
         {/* --------------------------------------------------- */}
         <section className="w-full bg-white border-b border-slate-200 py-4 shadow-sm relative z-20">
            <div className="max-w-[1400px] mx-auto px-6">
               <div className="flex items-center overflow-x-auto gap-4 no-scrollbar pr-4 py-1">
                  <div className="flex items-center gap-2.5 shrink-0 text-[11px] font-black uppercase tracking-wider text-slate-400 border-r border-slate-200 pr-5 mr-1">
                     <Zap size={14} className="text-[#ef4444] animate-bounce" /> Top Offers
                  </div>
                  {QUICK_COUPONS.map(cup => (
                     <button
                        key={cup.code}
                        onClick={() => copyToClipboard(cup.code)}
                        className={`flex items-center gap-3.5 shrink-0 px-5 py-3 border rounded-xl transition-all active:scale-[0.97] hover:shadow-md ${cup.color} group/pill`}
                     >
                        <div className="flex flex-col items-start leading-none gap-1">
                           <span className="text-[12px] font-black tracking-tight uppercase group-hover/pill:underline">{cup.label}</span>
                           <span className="text-[9px] font-semibold opacity-60">{cup.sub}</span>
                        </div>
                        <div className="h-8 border-l border-black/10 mx-1" />
                        <div className="flex items-center gap-1.5 font-mono font-black text-[11px] uppercase tracking-widest">
                           {copiedCode === cup.code ? <Check size={12} className="text-emerald-600" /> : cup.code}
                        </div>
                     </button>
                  ))}
               </div>
            </div>
         </section>

         {/* --------------------------------------------------- */}
         {/* 3. FLASH DEALS GRID */}
         {/* --------------------------------------------------- */}
         <section className="max-w-[1400px] mx-auto px-6 md:px-12 py-12">
            
            <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-8 gap-4">
               <div className="flex flex-col text-left">
                  <div className="flex items-center gap-2 text-[#ef4444] mb-1.5">
                     <Flame size={20} className="fill-[#ef4444]" />
                     <span className="text-[11px] font-black tracking-[0.3em] uppercase">Urgent Savings</span>
                  </div>
                  <h2 className="text-2xl md:text-4xl font-black text-slate-900 uppercase tracking-tight leading-none">
                     Lightning Flash Deals
                  </h2>
               </div>
               
               <div className="flex items-center gap-3 bg-red-50 border border-red-100 rounded-xl px-4 py-2 shadow-sm shadow-red-900/5">
                  <span className="text-xs font-bold text-[#ef4444] tracking-wide uppercase">Ends In:</span>
                  <FlashTimer hours={3} />
               </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
               
               {/* Deal Card 1 */}
               <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm relative group hover:shadow-xl hover:border-[#ef4444]/20 transition-all duration-300">
                  <div className="absolute top-3 left-3 z-10 bg-[#ef4444] text-white text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-md shadow">
                     40% OFF
                  </div>
                  <div className="w-full h-40 bg-slate-100 relative overflow-hidden">
                     <Image src="/ai_images/organic_grains_1776231059575.png" alt="grains" fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <div className="p-4">
                     <h3 className="font-black text-[14px] text-slate-900 tracking-tight line-clamp-2 min-h-[2.4em]">Raw Forest Honey Combo (Pack of 2)</h3>
                     <div className="flex items-baseline gap-2 mt-2">
                        <span className="text-lg font-black text-slate-900">₹499</span>
                        <span className="text-[12px] text-slate-400 line-through">₹850</span>
                     </div>
                     
                     {/* Progress Bar */}
                     <div className="mt-3 space-y-1">
                        <div className="flex items-center justify-between text-[9px] font-bold text-slate-500">
                           <span>78% claimed</span>
                           <span className="text-[#ef4444] uppercase">Only 8 left!</span>
                        </div>
                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                           <div className="h-full bg-gradient-to-r from-amber-500 to-[#ef4444] rounded-full w-[78%]" />
                        </div>
                     </div>

                     <Link href="/best-selling" className="w-full mt-4 py-2 bg-slate-900 hover:bg-emerald-950 text-white text-center text-[10px] font-black uppercase tracking-wider rounded-lg flex items-center justify-center transition-colors">
                        Claim Deal
                     </Link>
                  </div>
               </div>

               {/* Deal Card 2 */}
               <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm relative group hover:shadow-xl hover:border-[#ef4444]/20 transition-all duration-300">
                  <div className="absolute top-3 left-3 z-10 bg-[#ef4444] text-white text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-md shadow">
                     25% OFF
                  </div>
                  <div className="w-full h-40 bg-slate-100 relative overflow-hidden">
                     <Image src="/ai_images/pickles_1776231059575.png" alt="pickles" fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <div className="p-4">
                     <h3 className="font-black text-[14px] text-slate-900 tracking-tight line-clamp-2 min-h-[2.4em]">Grandmother's Special Garlic Pickle</h3>
                     <div className="flex items-baseline gap-2 mt-2">
                        <span className="text-lg font-black text-slate-900">₹180</span>
                        <span className="text-[12px] text-slate-400 line-through">₹240</span>
                     </div>
                     
                     {/* Progress Bar */}
                     <div className="mt-3 space-y-1">
                        <div className="flex items-center justify-between text-[9px] font-bold text-slate-500">
                           <span>42% claimed</span>
                           <span className="text-emerald-600 uppercase">In Stock</span>
                        </div>
                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                           <div className="h-full bg-gradient-to-r from-amber-500 to-[#ef4444] rounded-full w-[42%]" />
                        </div>
                     </div>

                     <Link href="/best-selling" className="w-full mt-4 py-2 bg-slate-900 hover:bg-emerald-950 text-white text-center text-[10px] font-black uppercase tracking-wider rounded-lg flex items-center justify-center transition-colors">
                        Claim Deal
                     </Link>
                  </div>
               </div>

               {/* Deal Card 3 */}
               <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm relative group hover:shadow-xl hover:border-[#ef4444]/20 transition-all duration-300">
                  <div className="absolute top-3 left-3 z-10 bg-[#ef4444] text-white text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-md shadow">
                     SAVE ₹150
                  </div>
                  <div className="w-full h-40 bg-slate-100 relative overflow-hidden">
                     <Image src="/ai_images/breakfast_combo.png" alt="combo" fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <div className="p-4">
                     <h3 className="font-black text-[14px] text-slate-900 tracking-tight line-clamp-2 min-h-[2.4em]">Cold Pressed Groundnut Oil (2L)</h3>
                     <div className="flex items-baseline gap-2 mt-2">
                        <span className="text-lg font-black text-slate-900">₹599</span>
                        <span className="text-[12px] text-slate-400 line-through">₹750</span>
                     </div>
                     
                     {/* Progress Bar */}
                     <div className="mt-3 space-y-1">
                        <div className="flex items-center justify-between text-[9px] font-bold text-slate-500">
                           <span>91% claimed</span>
                           <span className="text-[#ef4444] uppercase">Only 3 Left!</span>
                        </div>
                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                           <div className="h-full bg-gradient-to-r from-amber-500 to-[#ef4444] rounded-full w-[91%]" />
                        </div>
                     </div>

                     <Link href="/best-selling" className="w-full mt-4 py-2 bg-slate-900 hover:bg-emerald-950 text-white text-center text-[10px] font-black uppercase tracking-wider rounded-lg flex items-center justify-center transition-colors">
                        Claim Deal
                     </Link>
                  </div>
               </div>

               {/* Deal Card 4 */}
               <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm relative group hover:shadow-xl hover:border-[#ef4444]/20 transition-all duration-300">
                  <div className="absolute top-3 left-3 z-10 bg-[#ef4444] text-white text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-md shadow">
                     B1G1
                  </div>
                  <div className="w-full h-40 bg-slate-100 relative overflow-hidden">
                     <Image src="/ai_images/oil_combo.png" alt="oil" fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <div className="p-4">
                     <h3 className="font-black text-[14px] text-slate-900 tracking-tight line-clamp-2 min-h-[2.4em]">Homemade Crispy Ragi Sticks</h3>
                     <div className="flex items-baseline gap-2 mt-2">
                        <span className="text-lg font-black text-slate-900">₹120</span>
                        <span className="text-[12px] text-slate-400 line-through">₹240</span>
                     </div>
                     
                     {/* Progress Bar */}
                     <div className="mt-3 space-y-1">
                        <div className="flex items-center justify-between text-[9px] font-bold text-slate-500">
                           <span>64% claimed</span>
                           <span className="text-[#ef4444] uppercase">Only 15 Left!</span>
                        </div>
                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                           <div className="h-full bg-gradient-to-r from-amber-500 to-[#ef4444] rounded-full w-[64%]" />
                        </div>
                     </div>

                     <Link href="/best-selling" className="w-full mt-4 py-2 bg-slate-900 hover:bg-emerald-950 text-white text-center text-[10px] font-black uppercase tracking-wider rounded-lg flex items-center justify-center transition-colors">
                        Claim Deal
                     </Link>
                  </div>
               </div>

            </div>
         </section>

         {/* --------------------------------------------------- */}
         {/* 4. DOUBLE GRID FEATURED BANNER */}
         {/* --------------------------------------------------- */}
         <section className="max-w-[1400px] mx-auto px-6 md:px-12 mb-16">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               
               <div className="relative rounded-3xl overflow-hidden bg-emerald-950 text-white p-8 md:p-12 shadow-xl shadow-emerald-950/10 group flex flex-col justify-between min-h-[280px]">
                  <div className="absolute top-0 right-0 w-[60%] h-full opacity-30 grayscale group-hover:grayscale-0 transition-all duration-700">
                     <Image src="/ai_images/organic_grains_1776231059575.png" fill className="object-cover" alt="spices" />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-950 via-emerald-950/90 to-transparent z-0" />
                  
                  <div className="relative z-10 flex flex-col gap-4 max-w-[70%]">
                     <div className="flex items-center gap-2 text-amber-400 font-black text-[10px] tracking-[0.2em] uppercase">
                        <Award size={14} /> Native Exclusives
                     </div>
                     <h2 className="text-3xl font-black tracking-tight uppercase leading-[0.95]">
                        Traditional Spices & <br/> Masalas
                     </h2>
                     <p className="text-emerald-100/60 text-xs font-medium leading-relaxed">
                        100% chemical-free spices stone-pounded to retain natural essential oils.
                     </p>
                  </div>
                  <div className="relative z-10 mt-6">
                     <Link href="/best-selling" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-slate-900 font-black uppercase tracking-wider text-[10px] active:scale-95 transition-all hover:bg-amber-400 hover:text-slate-950">
                        Browse Spices <ArrowRight size={12} />
                     </Link>
                  </div>
               </div>

               <div className="relative rounded-3xl overflow-hidden bg-amber-800 text-white p-8 md:p-12 shadow-xl shadow-amber-800/10 group flex flex-col justify-between min-h-[280px]">
                  <div className="absolute top-0 right-0 w-[60%] h-full opacity-30 grayscale group-hover:grayscale-0 transition-all duration-700">
                     <Image src="/ai_images/pickles_1776231059575.png" fill className="object-cover" alt="pickles" />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-r from-amber-800 via-amber-800/90 to-transparent z-0" />

                  <div className="relative z-10 flex flex-col gap-4 max-w-[70%]">
                     <div className="flex items-center gap-2 text-emerald-200 font-black text-[10px] tracking-[0.2em] uppercase">
                        <Percent size={14} /> Limited Drop
                     </div>
                     <h2 className="text-3xl font-black tracking-tight uppercase leading-[0.95]">
                        Grandma's Traditional <br/> Pickles
                     </h2>
                     <p className="text-amber-100/70 text-xs font-medium leading-relaxed">
                        Sun-dried, preserved in pure wood-pressed sesame oil. No preservatives.
                     </p>
                  </div>
                  <div className="relative z-10 mt-6">
                     <Link href="/best-selling" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-slate-900 font-black uppercase tracking-wider text-[10px] active:scale-95 transition-all hover:bg-emerald-950 hover:text-white">
                        Shop Pickles <ArrowRight size={12} />
                     </Link>
                  </div>
               </div>

            </div>
         </section>

         {/* --------------------------------------------------- */}
         {/* 5. DYNAMIC PROMOTIONS LIST FROM API (GLASS CARDS) */}
         {/* --------------------------------------------------- */}
         <section className="max-w-[1400px] mx-auto px-6 md:px-12 py-12">
            
            <div className="flex items-center justify-between mb-10">
               <div className="flex flex-col text-left">
                  <span className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.3em] mb-1.5">Available Promo Codes</span>
                  <h2 className="text-2xl md:text-4xl font-black text-slate-900 uppercase tracking-tight">
                     Active Store Vouchers
                  </h2>
               </div>
               <div className="hidden md:block h-[1px] flex-1 bg-slate-200 mx-8" />
            </div>

            {activeDeals.length === 0 ? (
               <div className="bg-white border border-slate-200 rounded-2xl p-16 flex flex-col items-center justify-center text-center text-slate-500 shadow-sm">
                  <Gift size={40} className="text-slate-300 mb-4 animate-pulse" />
                  <h3 className="text-lg font-black text-slate-800 uppercase tracking-wider mb-1">No Extra Promo Codes Available</h3>
                  <p className="text-[13px] font-medium text-slate-400 max-w-xs">We currently don't have active promo-specific codes. Stay tuned!</p>
               </div>
            ) : (
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {activeDeals.map((promo: any) => (
                     <motion.div
                        key={promo.id}
                        whileHover={{ y: -5, boxShadow: '0 20px 40px -10px rgba(0,0,0,0.08)' }}
                        className="bg-white border border-slate-200 rounded-[2rem] overflow-hidden relative flex flex-col h-full transition-all duration-300 shadow-sm hover:border-emerald-500/30 group"
                     >
                        {/* Decorative Left Circle */}
                        <div className="absolute top-1/2 -translate-y-1/2 -left-3.5 w-7 h-7 bg-[#f8fafc] border-r border-slate-200 rounded-full z-10 hidden md:block" />
                        {/* Decorative Right Circle */}
                        <div className="absolute top-1/2 -translate-y-1/2 -right-3.5 w-7 h-7 bg-[#f8fafc] border-l border-slate-200 rounded-full z-10 hidden md:block" />

                        <div className="relative h-48 overflow-hidden shrink-0">
                           <Image
                              src={promo.image || '/ai_images/organic_grains_1776231059575.png'}
                              alt={promo.title}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-[3000ms]"
                           />
                           <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                           <div className="absolute bottom-4 left-6 flex flex-col">
                              <span className="text-[9px] text-amber-400 font-black tracking-widest uppercase">{promo.category || 'Storewide'}</span>
                              <h3 className="text-white font-black text-2xl drop-shadow">{promo.discount || 'Special'} Discount</h3>
                           </div>
                           <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm text-emerald-900 font-black text-[8px] px-2.5 py-1 rounded-md tracking-wider border border-slate-100 shadow-sm">
                              ACTIVE CODE
                           </div>
                        </div>

                        <div className="p-6 flex flex-col flex-1 bg-gradient-to-b from-white to-slate-50/40">
                           <h4 className="font-black text-[17px] text-slate-900 tracking-tight mb-2">{promo.title}</h4>
                           <p className="text-[13px] text-slate-500 leading-relaxed font-medium flex-1 mb-6">{promo.description}</p>
                           
                           <div className="relative bg-emerald-50 border-2 border-dashed border-emerald-200 rounded-2xl p-3.5 flex items-center justify-between hover:bg-emerald-100/50 transition-colors group/btn">
                              <div className="flex flex-col leading-none">
                                 <span className="text-[8px] text-emerald-600 font-black uppercase tracking-widest mb-1">Click to Copy Code</span>
                                 <span className="font-mono font-black text-[15px] text-emerald-950 uppercase tracking-widest">{promo.code}</span>
                              </div>
                              <button
                                 onClick={() => copyToClipboard(promo.code)}
                                 className="h-9 px-4 bg-emerald-950 text-white rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center gap-2 active:scale-95 shadow-md hover:bg-emerald-900 transition-all"
                              >
                                 {copiedCode === promo.code ? (
                                    <>Copied <Check size={12} /></>
                                 ) : (
                                    <>Copy <Copy size={12} /></>
                                 )}
                              </button>
                           </div>
                        </div>
                     </motion.div>
                  ))}
               </div>
            )}
         </section>

         {/* --------------------------------------------------- */}
         {/* 6. COMBO DEALS SECTOR */}
         {/* --------------------------------------------------- */}
         <section className="bg-emerald-950 py-20 mt-12 text-white relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full opacity-10 mix-blend-overlay bg-[url('/ai_images/organic_grains_1776231059575.png')] bg-cover" />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/40" />

            <div className="max-w-[1400px] mx-auto px-6 md:px-12 relative z-10">
               <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-12">
                  <div className="flex flex-col text-left">
                     <div className="flex items-center gap-2 text-amber-400 font-black text-[11px] uppercase tracking-[0.3em] mb-2">
                        <Award size={16} /> Special Bundle Packs
                     </div>
                     <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight leading-none drop-shadow">
                        Unmatched Combo Savings
                     </h2>
                  </div>
                  <Link href="/best-selling" className="text-[11px] font-black text-amber-400 border-b-2 border-amber-400 uppercase pb-1 hover:text-white hover:border-white transition-all">
                     View All 12 Combo Bundles
                  </Link>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {COMBO_DEALS.map(combo => (
                     <div key={combo.id} className="bg-white/10 border border-white/10 backdrop-blur-md rounded-[2.5rem] p-6 md:p-8 flex flex-col lg:flex-row gap-6 items-center hover:bg-white/15 transition-all group shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-16 h-16 bg-amber-400 text-emerald-950 flex items-center justify-center font-black text-[10px] tracking-tighter rotate-[-45deg] translate-x-[-25px] translate-y-[-25px] shadow z-10 uppercase leading-none pt-5 pl-4">
                           Combo
                        </div>

                        <div className="relative w-48 h-48 rounded-3xl overflow-hidden shrink-0 bg-emerald-900 shadow-xl">
                           <Image src={combo.image || '/ai_images/organic_grains_1776231059575.png'} alt={combo.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                        </div>

                        <div className="flex flex-col flex-1 text-left gap-3">
                           <div className="flex items-center gap-2">
                              <span className="bg-amber-400 text-emerald-950 font-black text-[9px] px-2 py-0.5 rounded uppercase tracking-widest">{combo.tag}</span>
                              <span className="text-amber-400 font-bold text-sm">{combo.save}</span>
                           </div>
                           <h3 className="text-xl md:text-2xl font-black text-white tracking-tight leading-tight group-hover:text-amber-300 transition-colors">{combo.title}</h3>
                           <p className="text-emerald-100/60 text-xs font-medium leading-relaxed">{combo.description}</p>
                           
                           <div className="flex items-baseline gap-3 mt-2">
                              <span className="text-2xl font-black text-white">{combo.price}</span>
                              <span className="text-emerald-100/40 text-sm line-through">{combo.oldPrice}</span>
                           </div>

                           <Link href="/best-selling" className="w-fit mt-2 px-6 py-3 bg-white hover:bg-amber-400 text-emerald-950 font-black uppercase tracking-wider text-[10px] rounded-xl transition-all hover:shadow-lg flex items-center gap-2 group/arr">
                              Claim Pack <ArrowRight size={14} className="group-hover/arr:translate-x-1 transition-transform" />
                           </Link>
                        </div>
                     </div>
                  ))}
               </div>
            </div>
         </section>

         {/* --------------------------------------------------- */}
         {/* 7. PAYMENT & WALLET OFFERS */}
         {/* --------------------------------------------------- */}
         <section className="max-w-[1400px] mx-auto px-6 md:px-12 py-20">
            <div className="flex flex-col items-center text-center max-w-2xl mx-auto mb-12">
               <div className="flex items-center gap-1.5 text-blue-600 font-black text-[11px] uppercase tracking-[0.3em] mb-2">
                  <Smartphone size={16} /> Digital Cashbacks
               </div>
               <h2 className="text-3xl md:text-4xl font-black text-slate-900 uppercase tracking-tight">
                  Wallet & Card Partner Offers
               </h2>
               <p className="text-slate-400 text-xs mt-2 font-medium">
                  Complete your order seamlessly with our secure payment partners to trigger stacked bank offers & digital scratch cards.
               </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               {WALLET_OFFERS.map(wall => (
                  <div 
                     key={wall.provider} 
                     className={`p-6 rounded-3xl border border-slate-200 bg-white flex flex-col gap-4 shadow-sm hover:shadow-md transition-all group ${wall.bg}`}
                  >
                     <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                        <div className="flex items-center gap-3">
                           <div className="h-10 w-10 rounded-xl bg-white shadow flex items-center justify-center shrink-0">
                              {wall.icon}
                           </div>
                           <div className="flex flex-col leading-none text-left">
                              <span className="text-[11px] text-slate-400 font-black uppercase tracking-widest">Partner</span>
                              <span className="text-[13px] font-black text-slate-800 uppercase">{wall.provider}</span>
                           </div>
                        </div>
                     </div>

                     <div className="flex flex-col text-left flex-1 gap-1 pt-2">
                        <span className="text-slate-900 font-black text-lg leading-tight">{wall.disc}</span>
                        <span className="text-slate-400 text-[11px] font-semibold">{wall.min}</span>
                     </div>

                     <button
                        onClick={() => copyToClipboard(wall.code)}
                        className="w-full py-3 bg-slate-900 text-white text-[10px] font-black tracking-wider rounded-xl flex items-center justify-center gap-2 uppercase shadow-md hover:bg-slate-800 transition-all active:scale-95"
                     >
                        {copiedCode === wall.code ? <>Applied <Check size={12} /></> : <>Use Code: {wall.code} <Copy size={12} /></>}
                     </button>
                  </div>
               ))}
            </div>
         </section>

         {/* --------------------------------------------------- */}
         {/* 8. REFERRAL & BOTTOM FOOTER CTA */}
         {/* --------------------------------------------------- */}
         <section className="max-w-[1400px] mx-auto px-6 md:px-12 mb-10">
            <div className="bg-gradient-to-br from-amber-500 via-amber-600 to-amber-800 text-slate-950 rounded-[2.5rem] p-8 md:p-16 shadow-2xl shadow-amber-600/10 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
               <div className="absolute inset-0 opacity-20 mix-blend-overlay bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:24px_24px]" />
               
               <div className="flex flex-col text-left relative z-10 max-w-2xl gap-4 text-white">
                  <div className="flex items-center gap-2 text-slate-950 font-black text-[11px] uppercase tracking-[0.3em] bg-white w-fit px-3 py-1.5 rounded-full shadow-sm">
                     <Users size={14} /> Referral Program
                  </div>
                  <h2 className="text-3xl md:text-5xl font-black tracking-tight uppercase leading-[0.95]">
                     Invite Pure Taste. <br/> Earn <span className="text-slate-950 italic lowercase font-serif">₹200 in credit.</span>
                  </h2>
                  <p className="text-white/80 text-sm md:text-base font-semibold leading-relaxed max-w-lg">
                     Share your unique link with family & friends. When they order their first basket, they get ₹100, and you get ₹200 loaded to your wallet!
                  </p>
               </div>

               <div className="flex flex-col gap-3 relative z-10 shrink-0">
                  <Link href="/account" className="h-14 px-10 bg-slate-950 hover:bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-2xl shadow-slate-950/20 active:scale-[0.98] transition-all">
                     Get Your Referral Link <ArrowRight size={16} />
                  </Link>
                  <span className="text-[10px] font-black text-white/60 uppercase tracking-widest text-center">Terms & Conditions Apply</span>
               </div>
            </div>
         </section>

         {/* --------------------------------------------------- */}
         {/* 9. STICKY FLOATING OFFER WIDGET */}
         {/* --------------------------------------------------- */}
         <AnimatePresence>
            {showFloatingWidget && (
               <motion.div
                  initial={{ y: 100, opacity: 0, scale: 0.9 }}
                  animate={{ y: 0, opacity: 1, scale: 1 }}
                  exit={{ y: 100, opacity: 0 }}
                  className="fixed bottom-6 right-6 z-[100] hidden sm:block"
               >
                  <div className="bg-slate-950 text-white px-5 py-4 rounded-2xl shadow-2xl border border-slate-800/60 flex items-center gap-4 shadow-slate-950/50 max-w-[280px] relative">
                     <button 
                        onClick={() => setShowFloatingWidget(false)}
                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center text-[10px] border border-slate-700 font-black shadow"
                     >
                        ✕
                     </button>
                     <div className="h-12 w-12 bg-amber-400 rounded-xl flex items-center justify-center text-slate-950 shrink-0 shadow-lg shadow-amber-400/20 animate-pulse">
                        <Flame size={24} className="fill-slate-950" />
                     </div>
                     <div className="flex flex-col leading-tight text-left">
                        <span className="text-[9px] font-black uppercase tracking-widest text-amber-400">Flash Offers Live</span>
                        <span className="text-[13px] font-black mt-0.5">Save Upto 40% on Fresh Stocks</span>
                        <Link href="#active-deals" onClick={() => window.scrollTo({top: 1000, behavior: 'smooth'})} className="text-[10px] text-white/60 hover:text-white font-bold underline mt-1 flex items-center gap-1">
                           Reveal {activeDeals.length + 8} Offers <ChevronRight size={10} />
                        </Link>
                     </div>
                  </div>
               </motion.div>
            )}
         </AnimatePresence>

      </div>
   );
}
