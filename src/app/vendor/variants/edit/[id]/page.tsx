import React from 'react';
import EditVariantClient from './EditVariantClient';
import { PRODUCTS } from '@/lib/staticData';

export async function generateStaticParams() {
  return PRODUCTS.flatMap(p => p.variants || []).map(v => ({
    id: v.id.toString()
  }));
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <EditVariantClient id={id} />;
}
