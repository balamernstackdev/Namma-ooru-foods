import React from 'react';
import EditCategoryClient from './EditCategoryClient';
import { CATEGORIES } from '@/lib/staticData';

export async function generateStaticParams() {
  return CATEGORIES.map((c) => ({
    id: c.id.toString(),
  }));
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <EditCategoryClient id={id} />;
}
