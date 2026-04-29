import React from 'react';
import CategoryDetailLoader from './CategoryDetailLoader';
import { CATEGORIES } from '@/lib/staticData';
import { BRANDS } from '@/lib/staticData';
import { API_URL } from '@/lib/api';

export const dynamicParams = false;

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
