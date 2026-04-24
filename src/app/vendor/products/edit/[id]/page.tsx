import React from 'react';
import { PRODUCTS } from '@/lib/staticData';
import EditProductClient from '@/app/vendor/products/edit/[id]/EditProductClient';

// Provide a dynamic static array for static export configuration
export async function generateStaticParams() {
  return PRODUCTS.map((p) => ({
    id: p.id.toString(),
  }));
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <EditProductClient id={id} />;
}
