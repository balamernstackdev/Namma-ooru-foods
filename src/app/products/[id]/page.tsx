import React from 'react';
import { Metadata } from 'next';
import ProductDetailLoader from './ProductDetailLoader';
import { PRODUCTS } from '@/lib/staticData';
import { API_URL } from '@/lib/api';

export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  try {
    const res = await fetch(`${API_URL}/api/products/${id}`);
    if (!res.ok) throw new Error('Not found');
    const product = await res.json();
    return {
      title: product.metaTitle || product.name,
      description: product.metaDescription || product.description,
      keywords: product.metaKeywords || undefined,
      openGraph: {
        title: product.metaTitle || product.name,
        description: product.metaDescription || product.description,
        images: product.image ? [{ url: product.image }] : [],
      }
    };
  } catch (e) {
    return { title: 'Product Details' };
  }
}

export async function generateStaticParams() {
  let products = [];
  try {
    const res = await fetch(`${API_URL}/api/products`);
    if (res.ok) {
      products = await res.json();
    }
  } catch (error) {
    console.error("[Products Static] Fetch Error:", error);
  }

  const params: { id: string }[] = [];
  
  if (Array.isArray(products)) {
    products.forEach((p: any) => {
      if (p.id) params.push({ id: p.id.toString() });
      if (p.slug) params.push({ id: p.slug });
    });
  }

  PRODUCTS.forEach(p => params.push({ id: p.id.toString() }));

  for (let i = 1; i <= 200; i++) {
    params.push({ id: i.toString() });
  }

  // Pre-load common testing slugs
  ['maaza-mango-1-2l', 'classic-coke', 'harvest-journal'].forEach(s => params.push({ id: s }));

  const finalParams = Array.from(new Set(params.map(p => p.id))).map(id => ({ id }));
  console.log(`[INIT] REGISTERING SLUGS:`, finalParams.filter(p => isNaN(Number(p.id))).map(p => p.id).join(', '));
  
  return finalParams;
}

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <ProductDetailLoader id={id} />
  );
}
