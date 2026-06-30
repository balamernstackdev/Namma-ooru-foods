'use client';

import React from 'react';
import SubcategoryDetailClient from '@/components/SubcategoryDetailClient';
import { API_URL } from '@/lib/api';
import useSWR from 'swr';
import PremiumLoader from '@/components/ui/PremiumLoader';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function SubcategoryDetailLoader({ id }: { id: string }) {
  const { data: subcategoryData, error, isLoading } = useSWR(`${API_URL}/api/subcategories/${id}`, fetcher);

  if (isLoading || (!subcategoryData && !error)) {
    return <PremiumLoader fullScreen={false} />;
  }

  if (error || !subcategoryData || subcategoryData.error) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center py-20 px-8 text-center bg-white">
        <h1 className="text-4xl md:text-5xl font-black text-slate-200 uppercase tracking-tighter">Sub-Category Not Found</h1>
        <p className="text-slate-400 font-medium mt-4 max-w-sm mx-auto tracking-tight">The requested sub-category does not exist or has been removed.</p>
        <a href="/categories" className="mt-8 h-12 px-8 rounded-xl bg-emerald-950 text-white font-black text-[11px] uppercase tracking-widest flex items-center justify-center">Back to Catalog</a>
      </div>
    );
  }

  const subcategoryProducts = subcategoryData?.products || [];

  return (
    <SubcategoryDetailClient 
      subcategoryId={id} 
      subcategory={subcategoryData} 
      subcategoryProducts={subcategoryProducts} 
    />
  );
}
