import React from 'react';
import { PRODUCTS } from '@/lib/staticData';
import EditProductClient from '@/app/seller/products/edit/[id]/EditProductClient';

export const dynamicParams = true;

// Provide a dynamic static array for static export configuration
export async function generateStaticParams() {
  const productIds = PRODUCTS.map((p) => ({ id: p.id.toString() }));
  const placeholders = Array.from({ length: 300 }, (_, i) => ({ id: (i + 1).toString() }));
  return [...productIds, ...placeholders];
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <EditProductClient id={id} />;
}
