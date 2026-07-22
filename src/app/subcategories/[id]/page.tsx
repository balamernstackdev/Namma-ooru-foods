import React from 'react';
import SubcategoryDetailLoader from './SubcategoryDetailLoader';
import { API_URL, fetchWithTimeout } from '@/lib/api';
import { Metadata } from 'next';

export const dynamicParams = true;


export async function generateStaticParams(): Promise<{ id: string }[]> {
  // Return empty array to generate pages on-demand and avoid hitting Hostinger WAF/CDN rate limits during build
  return [];
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  try {
    const res = await fetchWithTimeout(`${API_URL}/api/subcategories/${id}`);
    if (!res.ok) return { title: 'Subcategory' };
    const subcategory = await res.json();

    if (!subcategory || subcategory.error) return { title: 'Subcategory' };

    return {
      title: `${subcategory.name} | Organic Collection`,
      description: subcategory.metaDescription || `Explore our premium collection of ${subcategory.name}. Authentic, organic, and farm-fresh essentials.`,
      openGraph: {
        title: `${subcategory.name} | namma ooru Foods`,
        description: `High-quality ${subcategory.name} sourced directly from local farmers.`,
      }
    };
  } catch (e) {
    return { title: 'Subcategory' };
  }
}

export default async function SubcategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <SubcategoryDetailLoader id={id} />
  );
}
