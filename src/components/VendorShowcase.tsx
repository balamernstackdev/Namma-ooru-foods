'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, BadgeCheck } from 'lucide-react';
import useSWR from 'swr';

import { API_URL } from '@/lib/api';

import OptimizedImage from './ui/OptimizedImage';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function VendorShowcase() {
  const { data: brands, error } = useSWR(`${API_URL}/api/brands`, fetcher);

  if (error) return null;
  if (!brands) return <div className="h-40 animate-pulse bg-slate-50 rounded-[3rem]" />;

  return (
    <section className="py-12 md:py-20 bg-slate-50/50 flex justify-center w-full">
      <div className="standard-container">
        <div className="flex flex-col gap-8 md:gap-14">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="max-w-2xl">
              <span className="text-[11px] font-black uppercase tracking-[0.4em] text-emerald-800/60 mb-6 inline-block">Official Partner Registry</span>
              <h2 className="text-emerald-950 font-black tracking-tight text-3xl md:text-5xl lg:text-7xl leading-tight">
                Shop by your <br />
                <span className="text-amber-500 italic">Favorite Brands</span>
              </h2>
            </div>
            <Link href="/brands" className="group flex items-center gap-4 text-emerald-900 font-black text-[11px] uppercase tracking-[0.3em] hover:text-amber-600 transition-colors">
              View All Partners <ArrowRight className="group-hover:translate-x-2 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 md:gap-10">
            {brands.slice(0, 5).map((brand: any, idx: number) => (
              <Link
                key={brand.id}
                href={`/brands/${brand.id}`}
                className="group relative flex flex-col items-center bg-white p-4 md:p-10 rounded-2xl md:rounded-[3.5rem] border border-slate-100/80 shadow-md hover:shadow-premium transition-all duration-700 hover:-translate-y-2 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/0 to-amber-50/0 group-hover:from-emerald-50/20 group-hover:to-amber-50/20 transition-colors duration-700" />

                <div className="relative h-20 w-20 sm:h-28 sm:w-28 md:h-44 md:w-44 rounded-full overflow-hidden border-4 md:border-8 border-white shadow-xl mb-4 md:mb-8 group-hover:scale-110 transition-transform duration-1000">
                  <OptimizedImage
                    src={brand.logo}
                    alt={brand.name}
                    fill
                    className="object-cover"
                  />
                </div>

                <div className="text-center relative z-10 w-full px-2">
                  <div className="hidden md:flex items-center justify-center gap-2 text-emerald-600 mb-2 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-500">
                    <BadgeCheck size={14} fill="currentColor" className="text-emerald-500/20" />
                    <span className="text-[9px] font-black uppercase tracking-[0.2em]">Verified</span>
                  </div>
                  <h3 className="text-[12px] md:text-2xl font-bold md:font-black text-emerald-950 tracking-tight leading-tight md:leading-none group-hover:text-emerald-700 transition-colors uppercase break-words">
                    {brand.name}
                  </h3>
                  <div className="mt-2 md:mt-4 h-0.5 md:h-1 w-8 md:w-12 bg-amber-400 mx-auto rounded-full scale-x-0 group-hover:scale-x-100 transition-transform duration-700" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
