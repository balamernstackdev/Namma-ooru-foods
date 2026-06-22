'use client';

import React from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import VendorDetailClient from '@/components/VendorDetailClient';
import { API_URL } from '@/lib/api';
import useSWR from 'swr';
import PremiumLoader from '@/components/ui/PremiumLoader';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function HubDetailLoader() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const slug = searchParams.get('slug') || searchParams.get('id');

  const { data: hub, error, isLoading } = useSWR(
    slug ? `${API_URL}/api/head-vendors/${slug}` : null,
    fetcher
  );

  if (!slug) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center py-20 px-8 text-center">
        <h1 className="text-4xl font-black text-slate-800 uppercase tracking-tighter">No Hub Specified</h1>
        <p className="text-slate-400 font-medium mt-4 max-w-sm mx-auto">Please select a hub to view details.</p>
        <button
          onClick={() => router.push('/sellers')}
          className="mt-8 h-12 px-8 rounded-xl bg-emerald-950 text-white font-black text-[11px] uppercase tracking-widest"
        >
          Browse All Hubs
        </button>
      </div>
    );
  }

  if (isLoading || (!hub && !error)) {
    return <PremiumLoader fullScreen={true} />;
  }

  if (error || !hub || hub.error) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center py-20 px-8 text-center bg-white">
        <div className="h-24 w-24 rounded-[2rem] bg-rose-50 flex items-center justify-center mb-8">
          <span className="text-4xl font-black text-rose-400">!</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-slate-800 uppercase tracking-tighter">Hub Not Found</h1>
        <p className="text-slate-400 font-medium mt-4 max-w-sm mx-auto tracking-tight">
          This hub may not exist or has been removed.
        </p>
        <button
          onClick={() => router.push('/sellers')}
          className="mt-8 h-12 px-8 rounded-xl bg-emerald-950 text-white font-black text-[11px] uppercase tracking-widest"
        >
          Browse All Hubs
        </button>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      <VendorDetailClient vendor={hub} />
    </div>
  );
}
