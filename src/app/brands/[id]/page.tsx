import React from 'react';
import BrandDetailLoader from './BrandDetailLoader';
import { BRANDS } from '@/lib/staticData';
import { API_URL } from '@/lib/api';

export const dynamicParams = false;

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
