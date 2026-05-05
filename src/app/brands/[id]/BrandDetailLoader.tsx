'use client';

import React from 'react';
import { ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import BrandDetailClient from '@/components/BrandDetailClient';
import { API_URL } from '@/lib/api';
import useSWR from 'swr';

import PremiumLoader from '@/components/ui/PremiumLoader';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function BrandDetailLoader({ id }: { id: string }) {
   const { data: brand, error } = useSWR(`${API_URL}/api/brands/${id}`, fetcher);

   if (!brand && !error) {
      return <PremiumLoader fullScreen={false} />;
   }

   if (!brand) {
      return (
         <div className="min-h-[70vh] flex flex-col items-center justify-center py-20 px-8 text-center">
            <div className="h-24 w-24 rounded-[2rem] bg-slate-50 flex items-center justify-center mb-10">
               <ShieldCheck size={48} className="text-slate-100" />
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-slate-200 uppercase tracking-tighter">Brand Not Found</h1>
            <p className="text-slate-400 font-medium mt-4 max-w-sm mx-auto tracking-tight">The artisan cluster or manufacturer you're looking for might have moved or been updated.</p>
            <Link href="/brands" className="mt-12 h-14 px-10 rounded-2xl bg-emerald-950 text-white font-black text-[11px] uppercase tracking-widest flex items-center justify-center transition-all hover:bg-emerald-800 shadow-xl shadow-emerald-900/10">
               Discover Other Farmers
            </Link>
         </div>
      );
   }

   return (
      <div className="animate-in fade-in duration-1000">
         <BrandDetailClient brand={brand} />
      </div>
   );
}
