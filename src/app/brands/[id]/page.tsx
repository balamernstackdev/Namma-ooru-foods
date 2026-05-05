import React from 'react';
import BrandDetailLoader from './BrandDetailLoader';
import { BRANDS } from '@/lib/staticData';
import { API_URL } from '@/lib/api';

import { Metadata } from 'next';

export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  try {
    const res = await fetch(`${API_URL}/api/brands`);
    const brands = await res.json();
    const brand = Array.isArray(brands) ? brands.find((b: any) => b.id.toString() === id) : null;
    
    if (!brand) return { title: 'Our Farmers' };

    return {
      title: `${brand.name} | Verified Producer`,
      description: `Learn more about ${brand.name}, one of our trusted local producers bringing you the finest organic harvests.`,
      openGraph: {
        title: `${brand.name} | Namma Orru Foods`,
        description: `Directly sourced organic products from ${brand.name}.`,
      }
    };
  } catch (e) {
    return { title: 'Our Farmers' };
  }
}

export async function generateStaticParams() {
  try {
    const res = await fetch(`${API_URL}/api/brands`);
    const brands = await res.json();
    return Array.isArray(brands) ? brands.map((b: any) => ({ id: b.id.toString() })) : [];
  } catch (error) {
    return BRANDS.map((b) => ({
      id: b.id.toString(),
    }));
  }
}

export default async function BrandDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <BrandDetailLoader id={id} />
  );
}
