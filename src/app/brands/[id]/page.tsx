// Cache-buster dummy update: trigger next dev route update
import React from 'react';
import BrandDetailLoader from './BrandDetailLoader';
import { API_URL } from '@/lib/api';
import { Metadata } from 'next';
export const dynamicParams = true;


export async function generateStaticParams() {
  try {
    console.log(`[Build] Fetching brands from: ${API_URL}/api/sub-vendors?includeEmpty=true&limit=1000`);
    const res = await fetch(`${API_URL}/api/sub-vendors?includeEmpty=true&limit=1000`, { cache: 'no-store' });
    if (!res.ok) {
      console.warn(`[Build WARNING] Brands API responded with status ${res.status}`);
      return [];
    }
    const data = await res.json();
    const brands = data.subVendors || [];
    const params = [];
    for (const brand of brands) {
      params.push({ id: brand.id.toString() });
      if (brand.slug) params.push({ id: brand.slug });
    }
    console.log(`[Build] Generated ${params.length} static paths for brands.`);
    return params;
  } catch (error: any) {
    console.error('[Build WARNING] Failed to fetch brands in generateStaticParams:', error.message);
    return [];
  }
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const { id } = resolvedParams;
  try {
    const res = await fetch(`${API_URL}/api/sub-vendors/${id}`);
    if (!res.ok) return { title: 'Heritage Brand | namma ooru Foods' };
    const brand = await res.json();

    return {
      title: `${brand.name} | Heritage Brand`,
      description: brand.description || `Explore the ${brand.name} collection, featuring authentic heritage products sourced with integrity.`,
      openGraph: {
        title: `${brand.name} | namma ooru Foods`,
        description: `Directly sourced organic products from ${brand.name}.`,
        images: brand.logo ? [brand.logo] : []
      }
    };
  } catch (e) {
    return { title: 'Heritage Brand | namma ooru Foods' };
  }
}

export default async function BrandDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const { id } = resolvedParams;

  return (
    <BrandDetailLoader id={id} />
  );
}
