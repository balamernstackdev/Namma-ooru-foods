import React from 'react';
import { PRODUCTS } from '@/lib/staticData';
import ConcernDetailClient from '@/components/ConcernDetailClient';

export async function generateStaticParams() {
  const concerns = ['pregnancy', 'kids', 'weight-loss', 'immunity', 'beauty', 'diabetes'];
  return concerns.map((concern) => ({
    id: concern,
  }));
}

export default async function ConcernPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const slug = resolvedParams.id.toLowerCase();
  
  // Map specific concerns to product tags/categories
  let matchedProducts = PRODUCTS;
  
  if (slug === 'weight-loss') {
    matchedProducts = PRODUCTS.filter(p => ['Millets', 'Honey', 'Barnyard'].some(k => p.name.includes(k) || p.category.includes(k)));
  } else if (slug === 'immunity') {
    matchedProducts = PRODUCTS.filter(p => ['Turmeric', 'Honey', 'Pepper', 'Dal'].some(k => p.name.includes(k) || p.category.includes(k)));
  } else if (slug === 'diabetes') {
    matchedProducts = PRODUCTS.filter(p => ['Millets', 'Barnyard'].some(k => p.name.includes(k) || p.category.includes(k)));
  } else if (slug === 'beauty') {
    matchedProducts = PRODUCTS.filter(p => ['Oil', 'Turmeric'].some(k => p.name.includes(k) || p.category.includes(k)));
  } else {
    matchedProducts = PRODUCTS.slice(0, 4);
  }

  return (
    <ConcernDetailClient concernId={resolvedParams.id} matchedProducts={matchedProducts} />
  );
}
