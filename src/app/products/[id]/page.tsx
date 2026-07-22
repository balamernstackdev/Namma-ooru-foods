import React from 'react';
import ProductDetailLoader from './ProductDetailLoader';
import { API_URL, fetchWithTimeout } from '@/lib/api';
import { Metadata } from 'next';

export const dynamicParams = true; // Note: In output: export, dynamicParams must be false


export async function generateStaticParams(): Promise<{ id: string }[]> {
  // Return empty array to generate pages on-demand and avoid hitting Hostinger WAF/CDN rate limits during build
  return [];
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  try {
    const res = await fetchWithTimeout(`${API_URL}/api/products/${id}`);
    if (!res.ok) return { title: 'Product Details' };
    const product = await res.json();

    if (!product || product.error || !product.name) return { title: 'Product Details' };

    return {
      title: `${product.name} | namma ooru Foods`,
      description: product.metaDescription || product.description || `Buy premium organic ${product.name} online from namma ooru Foods. Sourced directly from local farmers.`,
      openGraph: {
        title: `${product.name} | namma ooru Foods`,
        description: product.description || `Organic, chemical-free ${product.name}.`,
        images: product.image ? [product.image] : []
      }
    };
  } catch (e) {
    return { title: 'Product Details' };
  }
}

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <ProductDetailLoader id={id} />
  );
}
