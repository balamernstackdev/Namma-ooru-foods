import React from 'react';
import EditSubcategoryClient from './EditSubcategoryClient';

export const dynamicParams = true;

export function generateStaticParams() {
  return [];
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <EditSubcategoryClient id={id} />;
}
