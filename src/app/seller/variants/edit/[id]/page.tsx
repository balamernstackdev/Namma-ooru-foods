import React from 'react';
import EditVariantClient from './EditVariantClient';
import { PRODUCTS } from '@/lib/staticData';

export const dynamicParams = true;

export async function generateStaticParams() {
  const variantIds = PRODUCTS.flatMap(p => p.variants || []).map(v => ({ id: v.id.toString() }));
  const placeholders = Array.from({ length: 300 }, (_, i) => ({ id: (i + 1).toString() }));
  return [...variantIds, ...placeholders];
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <EditVariantClient id={id} />;
}
