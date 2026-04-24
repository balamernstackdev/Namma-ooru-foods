import React from 'react';
import ConcernDetailClient from '@/components/ConcernDetailClient';
import { API_URL } from '@/lib/api';

export async function generateStaticParams() {
  const concerns = ['pregnancy', 'kids', 'weight-loss', 'immunity', 'beauty', 'diabetes'];
  return concerns.map((concern) => ({
    id: concern,
  }));
}

async function getProducts() {
  try {
    const res = await fetch(`${API_URL}/api/products`, { cache: 'no-store' });
    if (!res.ok) return [];
    return res.json();
  } catch (e) {
    return [];
  }
}

export default async function ConcernPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const slug = resolvedParams.id.toLowerCase();
  
  const products = await getProducts();
  
  // Map specific concerns to product tags/categories
  let matchedProducts = products;
  
  if (slug === 'weight-loss') {
    matchedProducts = products.filter((p: any) => ['Millets', 'Honey', 'Barnyard'].some(k => p.name.includes(k) || p.category?.name?.includes(k) || p.category?.includes(k)));
  } else if (slug === 'immunity') {
    matchedProducts = products.filter((p: any) => ['Turmeric', 'Honey', 'Pepper', 'Dal'].some(k => p.name.includes(k) || p.category?.name?.includes(k) || p.category?.includes(k)));
  } else if (slug === 'diabetes') {
    matchedProducts = products.filter((p: any) => ['Millets', 'Barnyard'].some(k => p.name.includes(k) || p.category?.name?.includes(k) || p.category?.includes(k)));
  } else if (slug === 'beauty') {
    matchedProducts = products.filter((p: any) => ['Oil', 'Turmeric'].some(k => p.name.includes(k) || p.category?.name?.includes(k) || p.category?.includes(k)));
  } else {
    matchedProducts = products.slice(0, 4);
  }

  return (
    <ConcernDetailClient concernId={resolvedParams.id} matchedProducts={matchedProducts} />
  );
}
