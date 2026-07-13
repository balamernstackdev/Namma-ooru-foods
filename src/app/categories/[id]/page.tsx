import React from 'react';
import CategoryDetailLoader from './CategoryDetailLoader';
import { CATEGORIES } from '@/lib/staticData';
import { API_URL } from '@/lib/api';
import { Metadata } from 'next';

export const dynamicParams = true;


export async function generateStaticParams(): Promise<{ id: string }[]> {
  try {
    console.log(`[Build] Fetching categories from: ${API_URL}/api/categories?limit=1000&all=true`);
    const res = await fetch(`${API_URL}/api/categories?limit=1000&all=true`, { next: { revalidate: 3600 } });
    if (!res.ok) {
      console.warn(`[Build WARNING] Categories API responded with status ${res.status}`);
      return [];
    }
    const data = await res.json();
    const categoriesList = Array.isArray(data) ? data : (data && Array.isArray(data.categories) ? data.categories : []);

    const params: { id: string }[] = [];
    categoriesList.forEach((category: any) => {
      params.push({ id: category.id.toString() });
      if (category.slug) {
        params.push({ id: category.slug });
      }
    });
    console.log(`[Build] Generated ${params.length} static paths for categories.`);
    return params;
  } catch (error: any) {
    console.error('[Build WARNING] Failed to fetch categories in generateStaticParams:', error.message);
    return [];
  }
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  try {
    const res = await fetch(`${API_URL}/api/categories`);
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
