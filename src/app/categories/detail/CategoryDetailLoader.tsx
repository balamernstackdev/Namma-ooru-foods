'use client';

import React from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import CategoryDetailClient from '@/components/CategoryDetailClient';
import { API_URL } from '@/lib/api';
import useSWR from 'swr';
import PremiumLoader from '@/components/ui/PremiumLoader';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function CategoryDetailLoader() {
  const searchParams = useSearchParams();
  const router = useRouter();
  // Accept ?slug= or ?id= for backwards compatibility
  const slug = searchParams.get('slug') || searchParams.get('id');

  const { data: categoryData, error, isLoading } = useSWR(
    slug ? `${API_URL}/api/categories/${slug}` : null,
    fetcher
  );

  if (!slug) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center py-20 px-8 text-center">
        <h1 className="text-4xl font-black text-slate-800 uppercase tracking-tighter">No Category Specified</h1>
        <p className="text-slate-400 font-medium mt-4 max-w-sm mx-auto">Please select a category to browse.</p>
        <button
          onClick={() => router.push('/categories')}
          className="mt-8 h-12 px-8 rounded-xl bg-emerald-950 text-white font-black text-[11px] uppercase tracking-widest"
        >
          Browse All Categories
        </button>
      </div>
    );
  }

  if (isLoading || (!categoryData && !error)) {
    return <PremiumLoader fullScreen={true} />;
  }

  if (error || !categoryData || categoryData.error) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center py-20 px-8 text-center bg-white">
        <div className="h-24 w-24 rounded-[2rem] bg-rose-50 flex items-center justify-center mb-8">
          <span className="text-4xl font-black text-rose-400">!</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-slate-800 uppercase tracking-tighter">Category Not Found</h1>
        <p className="text-slate-400 font-medium mt-4 max-w-sm mx-auto tracking-tight">
          This category may have been removed or does not exist.
        </p>
        <button
          onClick={() => router.push('/categories')}
          className="mt-8 h-12 px-8 rounded-xl bg-emerald-950 text-white font-black text-[11px] uppercase tracking-widest"
        >
          Browse All Categories
        </button>
      </div>
    );
  }

  const categoryProducts = categoryData?.products || [];

  return (
    <CategoryDetailClient
      categoryId={slug}
      category={categoryData}
      categoryProducts={categoryProducts}
    />
  );
}
