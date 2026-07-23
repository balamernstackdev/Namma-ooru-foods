import React from 'react';
import CategoryDetailLoader from '../CategoryDetailLoader';
import { API_URL, fetchWithTimeout } from '@/lib/api';
import { Metadata } from 'next';

export const dynamicParams = true;

export async function generateStaticParams(): Promise<{ id: string; subSlug: string }[]> {
  return [];
}

export async function generateMetadata({ params }: { params: Promise<{ id: string; subSlug: string }> }): Promise<Metadata> {
  const { id, subSlug } = await params;
  try {
    const res = await fetchWithTimeout(`${API_URL}/api/categories/${id}`);
    if (!res.ok) return { title: 'Category' };
    const category = await res.json();

    const sub = (category?.subcategories || []).find((s: any) => s.slug === subSlug || s.id.toString() === subSlug);

    const subTitle = sub ? `${sub.name} - ${category.name}` : category?.name || 'Category';

    return {
      title: `${subTitle} | Organic Collection`,
      description: `Explore premium ${subTitle}. Authentic, organic, and farm-fresh.`,
      openGraph: {
        title: `${subTitle} | namma ooru Foods`,
      }
    };
  } catch {
    return { title: 'Category' };
  }
}

export default async function SubcategoryPage({ params }: { params: Promise<{ id: string; subSlug: string }> }) {
  const { id, subSlug } = await params;

  return (
    <CategoryDetailLoader id={id} initialSubSlug={subSlug} />
  );
}
