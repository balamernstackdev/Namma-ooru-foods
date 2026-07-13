import React from 'react';
import EditCategoryClient from './EditCategoryClient';

export const dynamicParams = true;

export function generateStaticParams() {
  return Array.from({ length: 2000 }, (_, i) => ({ id: (i + 1).toString() }));
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <EditCategoryClient id={id} />;
}
