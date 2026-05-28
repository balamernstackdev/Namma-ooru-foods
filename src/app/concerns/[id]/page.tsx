import React from 'react';
import ConcernDetailClient from '@/components/ConcernDetailClient';
import { API_URL } from '@/lib/api';

import { PRODUCTS } from '@/lib/staticData';

// export const dynamicParams = true;

export async function generateStaticParams() {
  const concerns = ['pregnancy', 'kids', 'weight-loss', 'immunity', 'beauty', 'diabetes'];
  return concerns.map((concern) => ({
    id: concern,
  }));
}

async function getProducts() {
  try {
    const res = await fetch(`${API_URL}/api/products`, { next: { revalidate: 3600 } });
    if (!res.ok) throw new Error('Fetch failed');
    const data = await res.json();
    const productsList = Array.isArray(data) ? data : (data && Array.isArray(data.products) ? data.products : []);
    if (productsList.length > 0) return productsList;
    return PRODUCTS;
  } catch (e) {
    console.warn('Concerns fetch products error, using fallback:', e);
    return PRODUCTS;
  }
}

export default async function ConcernPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const slug = resolvedParams.id.toLowerCase();
  
  const products = await getProducts();
  
  // Map specific concerns to product tags/categories
  let matchedProducts = products;
  
  const filterFn = (p: any, keywords: string[]) => {
    return keywords.some(k => {
      const nameMatch = p.name?.includes(k) || false;
      const catNameMatch = p.category?.name?.includes(k) || false;
      const catStrMatch = typeof p.category === 'string' ? p.category.includes(k) : false;
      return nameMatch || catNameMatch || catStrMatch;
    });
  };

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
    <ConcernDetailClient concernId={resolvedParams.id} matchedProducts={matchedProducts} />
  );
}
