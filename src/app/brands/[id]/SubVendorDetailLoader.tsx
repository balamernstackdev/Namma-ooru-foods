'use client';

import React from 'react';
import { ShieldCheck, MapPin } from 'lucide-react';
import Link from 'next/link';
import BrandDetailClient from '@/components/BrandDetailClient';
import { API_URL } from '@/lib/api';
import useSWR from 'swr';

import PremiumLoader from '@/components/ui/PremiumLoader';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function SubVendorDetailLoader({ id }: { id: string }) {
   const { data: subVendor, error } = useSWR(`${API_URL}/api/sub-vendors/${id}`, fetcher);

   if (!subVendor && !error) {
      return <PremiumLoader fullScreen={true} />;
   }

   if (error || !subVendor || subVendor.error) {
      return (
         <div className="min-h-[70vh] flex flex-col items-center justify-center py-20 px-8 text-center bg-white">
            <div className="h-24 w-24 rounded-[2rem] bg-slate-50 flex items-center justify-center mb-10 shadow-inner">
               <ShieldCheck size={48} className="text-slate-200" />
            </div>
            <h1 className="text-4xl md:text-5xl font-[900] text-emerald-950 tracking-tighter uppercase leading-none">Artisan Unit Not Found</h1>
            <p className="text-slate-500 font-medium mt-4 max-w-sm mx-auto tracking-tight opacity-70">The specific artisan unit or production cluster you're looking for might have been updated or relocated.</p>
            <div className="flex flex-col sm:flex-row gap-4 mt-12">
               <Link href="/artisans" className="h-14 px-10 rounded-2xl bg-emerald-950 text-white !text-white font-black text-[11px] uppercase tracking-widest flex items-center justify-center transition-all hover:bg-emerald-800 shadow-xl shadow-emerald-900/10">
                  Browse Directory
               </Link>
               <Link href="/" className="h-14 px-10 rounded-2xl bg-white border border-slate-100 text-emerald-950 font-black text-[11px] uppercase tracking-widest flex items-center justify-center transition-all hover:bg-slate-50">
                  Return Home
               </Link>
            </div>
         </div>
      );
   }

   return (
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-1000">
         <BrandDetailClient brand={subVendor} />
      </div>
   );
}
