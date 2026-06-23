'use client';

import React from 'react';
import useSWR from 'swr';
import ConcernDetailClient from '@/components/ConcernDetailClient';
import { API_URL } from '@/lib/api';
import { PRODUCTS } from '@/lib/staticData';
import PremiumLoader from '@/components/ui/PremiumLoader';

const fetcher = (url: string) => fetch(url).then(res => res.json());

interface ConcernDetailLoaderProps {
  id: string;
}

export default function ConcernDetailLoader({ id }: ConcernDetailLoaderProps) {
  const { data: responseData, error, isLoading } = useSWR(`${API_URL}/api/products`, fetcher);

  if (isLoading || (!responseData && !error)) {
    return <PremiumLoader fullScreen={true} />;
  }

  const productsList = Array.isArray(responseData)
    ? responseData
    : (responseData && Array.isArray((responseData as any).products) ? (responseData as any).products : []);

  const products = productsList.length > 0 ? productsList : PRODUCTS;

  // Exact same filtering logic as original ConcernPage
  const filterFn = (p: any, keywords: string[]) => {
    return keywords.some(k => {
      const nameMatch = p.name?.toLowerCase().includes(k.toLowerCase()) || false;
      const catNameMatch = p.category?.name?.toLowerCase().includes(k.toLowerCase()) || false;
      const catStrMatch = typeof p.category === 'string' ? p.category.toLowerCase().includes(k.toLowerCase()) : false;
      return nameMatch || catNameMatch || catStrMatch;
    });
  };

  let matchedProducts = products;
  const slug = id.toLowerCase();

  if (slug === 'weight-loss') {
    matchedProducts = products.filter((p: any) => filterFn(p, ['Millets', 'Honey', 'Barnyard']));
  } else if (slug === 'immunity') {
    matchedProducts = products.filter((p: any) => filterFn(p, ['Turmeric', 'Honey', 'Pepper', 'Dal']));
  } else if (slug === 'diabetes') {
    matchedProducts = products.filter((p: any) => filterFn(p, ['Millets', 'Barnyard']));
  } else if (slug === 'beauty') {
    matchedProducts = products.filter((p: any) => filterFn(p, ['Oil', 'Turmeric']));
  } else {
    matchedProducts = products.slice(0, 4);
  }

  return (
    <ConcernDetailClient concernId={id} matchedProducts={matchedProducts} />
  );
}
