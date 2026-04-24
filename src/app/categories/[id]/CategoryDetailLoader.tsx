'use client';

import React from 'react';
import CategoryDetailClient from '@/components/CategoryDetailClient';
import { API_URL } from '@/lib/api';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function CategoryDetailLoader({ id }: { id: string }) {
  const { data: products, error } = useSWR(`${API_URL}/api/products`, fetcher);

  const categoryProducts = products ? products.filter((p: any) =>
    p.category?.name.toLowerCase().replace(/\s+/g, '-') === id ||
    p.category?.id.toString() === id
  ) : [];

  if (!products && !error) {
    return (
      <div className="w-full h-[60vh] flex flex-col items-center justify-center bg-white gap-6">
        <div className="h-14 w-14 border-4 border-emerald-950 border-t-amber-400 rounded-full animate-spin" />
        <p className="text-[10px] font-black uppercase tracking-widest text-emerald-950">Sorting Harvest...</p>
      </div>
    );
  }

  return (
    <CategoryDetailClient categoryId={id} categoryProducts={categoryProducts} />
  );
}
