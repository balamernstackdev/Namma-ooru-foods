// Cache-buster dummy update: trigger next dev route update
import React from 'react';
import BrandDetailLoader from './BrandDetailLoader';
import { API_URL, fetchWithTimeout } from '@/lib/api';
import { Metadata } from 'next';
export const dynamicParams = true;


export async function generateStaticParams() {
  // Return empty array to generate pages on-demand and avoid hitting Hostinger WAF/CDN rate limits during build
  return [];
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const { id } = resolvedParams;
  try {
    const res = await fetchWithTimeout(`${API_URL}/api/sub-vendors/${id}`);
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
