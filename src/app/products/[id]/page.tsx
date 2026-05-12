import React from 'react';
import { Metadata } from 'next';
import ProductDetailLoader from './ProductDetailLoader';
import { API_URL } from '@/lib/api';

export const dynamicParams = true;

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
  try {
    const res = await fetch(`${API_URL}/api/products`, { next: { revalidate: 3600 } });
    if (!res.ok) throw new Error('API fetch failed');
    const data = await res.json();
    const productsList = Array.isArray(data) ? data : (data && Array.isArray(data.products) ? data.products : []);
    
    if (productsList.length > 0) {
      return productsList.map((product: any) => ({
        id: product.id.toString(),
      }));
    }
    return [];
  } catch (error) {
    console.warn('Fetch failed for generateStaticParams:', error);
    return [];
  }
}

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <ProductDetailLoader id={id} />
  );
}
