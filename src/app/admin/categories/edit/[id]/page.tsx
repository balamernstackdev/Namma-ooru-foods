import React from 'react';
import EditCategoryClient from './EditCategoryClient';

export const dynamicParams = true;

export function generateStaticParams() {
  return [];
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <EditCategoryClient id={id} />;
}
