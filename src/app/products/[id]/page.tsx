import React from 'react';
import ProductDetailLoader from './ProductDetailLoader';
import { PRODUCTS } from '@/lib/staticData';
import { API_URL } from '@/lib/api';

export async function generateStaticParams() {
  try {
    const res = await fetch(`${API_URL}/api/products`);
    const products = await res.json();
    console.log(`Static Export: Generating params for ${products.length} products`);
    
    const params: { id: string }[] = [];
    products.forEach((p: any) => {
       params.push({ id: p.id.toString() });
       if (p.slug) {
         console.log(`Adding slug: ${p.slug}`);
         params.push({ id: p.slug });
       }
    });

    // Range for safety (1-100)
    for (let i = 1; i <= 100; i++) {
      params.push({ id: i.toString() });
    }

    const finalParams = Array.from(new Set(params.map(p => p.id))).map(id => ({ id }));
    return finalParams;
  } catch (error) {
    console.error("Static Params Fetch Failed:", error);
    // Fallback to static data if API is unreachable during build
    return PRODUCTS.map(p => ({ id: p.id.toString() }));
  }
}

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <ProductDetailLoader id={id} />
  );
}
