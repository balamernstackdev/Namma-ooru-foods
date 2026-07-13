import React from 'react';
import EditCategoryClient from './EditCategoryClient';
import { CATEGORIES } from '@/lib/staticData';

export const dynamicParams = false;

export async function generateStaticParams() {
  const categoryIds = CATEGORIES.map((c) => ({ id: c.id.toString() }));
  const placeholders = Array.from({ length: 300 }, (_, i) => ({ id: (i + 1).toString() }));
  return [...categoryIds, ...placeholders];
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <EditCategoryClient id={id} />;
}
