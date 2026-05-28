'use client';

import React from 'react';
import useSWR from 'swr';
import { API_URL } from '@/lib/api';
import VendorDetailClient from '@/components/VendorDetailClient';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function VendorDetailLoader({ id }: { id: string }) {
  const { data: vendor, error, isLoading } = useSWR(`${API_URL}/api/head-vendors/${id}`, fetcher, {
    revalidateOnMount: true,
    revalidateOnFocus: false,
    dedupingInterval: 0,
  });

  if (isLoading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-6">
          <div className="h-20 w-20 border-4 border-emerald-950/5 border-t-emerald-600 rounded-full animate-spin" />
          <p className="text-[11px] font-black uppercase tracking-[0.3em] text-emerald-950/40">Loading Vendor Architecture...</p>
        </div>
      </div>
    );
  }

  if (error || !vendor || vendor.error) {
    return (
      <div className="w-full h-screen flex flex-col items-center justify-center bg-white gap-6">
        <div className="h-20 w-20 rounded-full bg-rose-50 flex items-center justify-center text-rose-500">
           <span className="text-4xl font-black">!</span>
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-[900] text-emerald-950 uppercase tracking-tighter">Vendor Not Found</h2>
          <p className="text-slate-400 font-medium max-w-xs mx-auto">The vendor you are looking for does not exist or has been relocated.</p>
        </div>
        <button 
          onClick={() => window.location.href = '/vendors'}
          className="h-12 px-8 rounded-xl bg-emerald-950 text-white text-[11px] font-black uppercase tracking-widest shadow-xl"
        >
          Return to Directory
        </button>
      </div>
    );
  }

  return <VendorDetailClient vendor={vendor} />;
}
