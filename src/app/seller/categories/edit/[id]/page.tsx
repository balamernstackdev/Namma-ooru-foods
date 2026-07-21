import React from 'react';
import EditCategoryClient from './EditCategoryClient';
import { CATEGORIES } from '@/lib/staticData';

export const dynamicParams = true;

export async function generateStaticParams() {
  return [];
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <EditCategoryClient id={id} />;
}
