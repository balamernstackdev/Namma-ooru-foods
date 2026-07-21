import React from 'react';
import EditVariantClient from './EditVariantClient';
import { PRODUCTS } from '@/lib/staticData';

export const dynamicParams = true;

export async function generateStaticParams() {
  return [];
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <EditVariantClient id={id} />;
}
