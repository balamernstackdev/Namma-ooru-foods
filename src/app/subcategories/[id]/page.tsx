import React from 'react';
import SubcategoryDetailLoader from './SubcategoryDetailLoader';
import { API_URL } from '@/lib/api';
import { Metadata } from 'next';

export const dynamicParams = false;


export async function generateStaticParams(): Promise<{ id: string }[]> {
  try {
    console.log(`[Build] Fetching subcategories from: ${API_URL}/api/subcategories?limit=1000`);
    const res = await fetch(`${API_URL}/api/subcategories?limit=1000`, { next: { revalidate: 3600 } });
    if (!res.ok) {
      console.warn(`[Build WARNING] Subcategories API responded with status ${res.status}`);
      return [];
    }
    const data = await res.json();
    const subcategoriesList = data.subcategories || [];

    const params: { id: string }[] = [];
    subcategoriesList.forEach((sub: any) => {
      params.push({ id: sub.id.toString() });
      if (sub.slug) {
        params.push({ id: sub.slug });
      }
    });
    console.log(`[Build] Generated ${params.length} static paths for subcategories.`);
    return params;
  } catch (error: any) {
    console.error('[Build WARNING] Failed to fetch subcategories in generateStaticParams:', error.message);
    return [];
  }
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  try {
    const res = await fetch(`${API_URL}/api/subcategories/${id}`);
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
