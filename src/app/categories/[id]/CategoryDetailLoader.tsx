'use client';

import React from 'react';
import CategoryDetailClient from '@/components/CategoryDetailClient';
import { API_URL } from '@/lib/api';
import useSWR from 'swr';

import PremiumLoader from '@/components/ui/PremiumLoader';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function CategoryDetailLoader({ id }: { id: string }) {
  const { data: products, error } = useSWR(`${API_URL}/api/products?limit=100`, fetcher);

  const productsList = Array.isArray(products) 
    ? products 
    : (products && Array.isArray((products as any).products) ? (products as any).products : []);

  const categoryProducts = productsList.filter((p: any) =>
    p.category?.name.toLowerCase().replace(/\s+/g, '-') === id ||
    p.category?.id.toString() === id ||
    p.categoryId?.toString() === id
  );

  if (!products && !error) {
    return <PremiumLoader fullScreen={false} />;
  }

  return (
    <CategoryDetailClient categoryId={id} categoryProducts={categoryProducts} />
  );
}
