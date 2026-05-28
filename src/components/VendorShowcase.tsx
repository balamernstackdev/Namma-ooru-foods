'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import { Sparkles, ArrowRight } from 'lucide-react';
import useSWR from 'swr';
import { motion } from 'framer-motion';

import { API_URL } from '@/lib/api';
import OptimizedImage from './ui/OptimizedImage';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function VendorShowcase() {
  const { data: responseData, error } = useSWR(`${API_URL}/api/head-vendors`, fetcher);
  const scrollRef = useRef<HTMLDivElement>(null);

  const vendorsList = responseData?.headVendors || [];

  const scrollRight = () => {
    const el = scrollRef.current;
    if (!el) return;
    const SCROLL_STEP = el.clientWidth < 640 ? 164 : 220; // card width + gap depending on viewport
    if (el.scrollLeft + el.clientWidth >= el.scrollWidth - 20) {
      el.scrollTo({ left: 0, behavior: 'smooth' });
    } else {
      el.scrollBy({ left: SCROLL_STEP, behavior: 'smooth' });
    }
  };

  React.useEffect(() => {
    if (vendorsList.length === 0) return;
    const interval = setInterval(scrollRight, 3000);
    return () => clearInterval(interval);
  }, [vendorsList.length]);

  if (error || vendorsList.length === 0) return null;

  return (
    <section className="w-full pt-2 md:pt-4 pb-4 md:pb-6 bg-white relative overflow-hidden">
      
      {/* Decorative luxurious ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-radial from-amber-50/40 to-transparent rounded-full pointer-events-none opacity-70" />

      <div className="standard-container relative z-10">
        
        {/* --- Header matching premium brand style --- */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 md:mb-8 gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-slate-400">
              <Sparkles size={12} className="text-amber-500 fill-amber-500" />
              <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.35em] text-slate-400">Trusted Partners</span>
            </div>
            <h2 className="text-xl md:text-[32px] lg:text-[36px] font-[900] text-emerald-950 tracking-tighter leading-none uppercase">
              Featured <span className="text-amber-500 italic lowercase font-serif font-normal ml-1">Vendors</span>
            </h2>
          </div>

          <Link href="/vendors" className="flex items-center gap-1 text-[11px] font-black text-slate-400 hover:text-emerald-950 uppercase tracking-[0.2em] transition-colors group">
            <span>View All Vendors</span>
            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform text-slate-400 group-hover:text-emerald-950" />
          </Link>
        </div>

        {/* --- The Premium Squircle Deck matching Categories --- */}
        <div className="relative -mx-6 md:-mx-8 px-6 md:px-8">
          <div 
            ref={scrollRef}
            className="flex overflow-x-auto no-scrollbar gap-6 md:gap-10 pb-4 snap-x snap-mandatory scroll-smooth items-start"
          >
            {vendorsList.map((vendor: any, idx: number) => (
              <motion.div 
                key={vendor.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-20px" }}
                transition={{ duration: 0.6, delay: idx * 0.05 }}
                className="snap-start shrink-0 w-[140px] md:w-[180px]"
              >
                <Link
                  href={`/vendors/${vendor.slug || vendor.id}`}
                  prefetch={false}
                  className="group flex flex-col items-center text-center"
                >
                  {/* Premium Squircle Image Box */}
                  <div className="relative w-full aspect-square rounded-full overflow-hidden bg-[#fafaf9] border border-slate-200 shadow-[0_8px_30px_rgba(0,0,0,0.02)] transition-all duration-700 group-hover:shadow-[0_24px_48px_-12px_rgba(6,78,59,0.12)] group-hover:-translate-y-2 group-hover:border-emerald-100 relative flex items-center justify-center">

                    <div className="absolute inset-0 m-2 rounded-full overflow-hidden bg-white shadow-inner">
                      <OptimizedImage
                        src={vendor.logo || '/logo.webp'}
                        alt={vendor.name}
                        fill
                        className="object-cover scale-100 group-hover:scale-110 transition-transform duration-[1000ms] ease-[0.25,1,0.5,1]"
                      />
                      {/* Dark overlay on hover for luxury depth */}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500" />

                    </div>


                  </div>

                  {/* Text Block placed BELOW the card */}
                  <div className="mt-5 w-full flex flex-col items-center gap-1">
                    <p className="text-emerald-950 text-[10px] md:text-[12px] font-[900] uppercase tracking-[0.08em] group-hover:text-amber-600 transition-colors duration-300 leading-[1.3] text-center px-1 line-clamp-1 w-full">
                      {vendor.name}
                    </p>
                    <span className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                      {vendor._count?.subVendors || 0} {vendor._count?.subVendors === 1 ? 'Brand' : 'Brands'}
                    </span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
