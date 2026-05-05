import React from 'react';
import CategoryDetailLoader from './CategoryDetailLoader';
import { CATEGORIES } from '@/lib/staticData';
import { BRANDS } from '@/lib/staticData';
import { API_URL } from '@/lib/api';

import { Metadata } from 'next';

export const dynamicParams = false;

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
        title: `${category.name} | Namma Orru Foods`,
        description: `High-quality ${category.name} sourced directly from local farmers.`,
      }
    };
  } catch (e) {
    return { title: 'Category' };
  }
}

export async function generateStaticParams() {
  try {
    const res = await fetch(`${API_URL}/api/categories`);
    const categories = await res.json();
    return Array.isArray(categories) ? categories.map((c: any) => ({ id: c.id.toString() })) : [];
  } catch (error) {
    return CATEGORIES.map((c) => ({
      id: c.id.toString(),
    }));
  }
}

export default async function CategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <CategoryDetailLoader id={id} />
  );
}
