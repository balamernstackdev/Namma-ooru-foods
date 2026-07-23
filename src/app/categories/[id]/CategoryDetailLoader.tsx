'use client';

import React from 'react';
import CategoryDetailClient from '@/components/CategoryDetailClient';
import { API_URL } from '@/lib/api';
import useSWR from 'swr';

import PremiumLoader from '@/components/ui/PremiumLoader';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function CategoryDetailLoader({ id, initialSubSlug }: { id: string; initialSubSlug?: string }) {
  const { data: categoryData, error, isLoading } = useSWR(`${API_URL}/api/categories/${id}`, fetcher);

  if (isLoading || (!categoryData && !error)) {
    return <PremiumLoader fullScreen={false} />;
  }

  const categoryProducts = categoryData?.products || [];

  return (
    <CategoryDetailClient 
      categoryId={id} 
      category={categoryData} 
      categoryProducts={categoryProducts} 
      initialSubSlug={initialSubSlug}
    />
  );
}
