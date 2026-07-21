export const dynamicParams = true;
import React from 'react';
import ProductDetailClient from './ProductDetailClient';

export function generateStaticParams() {
  return [];
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ProductDetailClient id={id} />;
}
