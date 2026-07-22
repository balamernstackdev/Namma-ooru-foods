import React from 'react';
import CategoryDetailLoader from './CategoryDetailLoader';
import { CATEGORIES } from '@/lib/staticData';
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
    const res = await fetchWithTimeout(`${API_URL}/api/categories`);
    if (!res.ok) return { title: 'Category' };
    const categories = await res.json();
    const category = Array.isArray(categories) ? categories.find((c: any) => c.id.toString() === id) : null;

    if (!category) return { title: 'Category' };

    return {
      title: `${category.name} | Organic Collection`,
      description: `Explore our premium collection of ${category.name}. Authentic, organic, and farm-fresh essentials.`,
      openGraph: {
        title: `${category.name} | namma ooru Foods`,
        description: `High-quality ${category.name} sourced directly from local farmers.`,
      }
    };
  } catch (e) {
    return { title: 'Category' };
  }
}

export default async function CategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <CategoryDetailLoader id={id} />
  );
}
