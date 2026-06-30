import React from 'react';
import ProductDetailLoader from './ProductDetailLoader';
import { API_URL } from '@/lib/api';
import { Metadata } from 'next';

export const dynamicParams = false;

export async function generateStaticParams(): Promise<{ id: string }[]> {
  try {
    const res = await fetch(`${API_URL}/api/products?limit=1000`, { next: { revalidate: 3600 } });
    if (!res.ok) throw new Error(`API fetch failed with status ${res.status}`);
    const data = await res.json();
    const productsList = Array.isArray(data) ? data : (data && Array.isArray(data.products) ? data.products : []);

    if (productsList.length > 0) {
      const params: { id: string }[] = [];
      productsList.forEach((product: any) => {
        params.push({ id: product.id.toString() });
        if (product.slug) {
          params.push({ id: product.slug });
        }
      });
      console.log(`[Build] Generated ${params.length} static paths for products.`);
      return params;
    }
    throw new Error('Empty products list');
  } catch (error) {
    console.error('[Build ERROR] Failed to fetch products in generateStaticParams:', error);
    throw error; // Fail the build as requested
  }
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  try {
    const res = await fetch(`${API_URL}/api/products/${id}`);
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
