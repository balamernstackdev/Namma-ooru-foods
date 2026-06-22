import React from 'react';
import CategoryDetailLoader from './CategoryDetailLoader';
import { CATEGORIES } from '@/lib/staticData';
import { API_URL } from '@/lib/api';
import { Metadata } from 'next';

// export const dynamicParams = true;

export async function generateStaticParams(): Promise<{ id: string }[]> {
  try {
    const res = await fetch(`${API_URL}/api/categories?limit=1000&all=true`, { next: { revalidate: 3600 } });
    if (!res.ok) throw new Error('API fetch failed');
    const data = await res.json();
    const categoriesList = Array.isArray(data) ? data : (data && Array.isArray(data.categories) ? data.categories : []);

    if (categoriesList.length > 0) {
      const params: { id: string }[] = [];
      categoriesList.forEach((category: any) => {
        params.push({ id: category.id.toString() });
        if (category.slug) {
          params.push({ id: category.slug });
        }
      });
      return params;
    }
    throw new Error('Empty categories list');
  } catch (error) {
    console.warn('Falling back to static CATEGORIES for generateStaticParams:', error);
    if (CATEGORIES && CATEGORIES.length > 0) {
      const params: { id: string }[] = [];
      CATEGORIES.forEach((category) => {
        params.push({ id: category.id.toString() });
        if (category.slug) {
          params.push({ id: category.slug });
        }
      });
      return params;
    }
    return [{ id: '1' }];
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
