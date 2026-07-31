import React from 'react';
import EditProductClient from './EditProductClient';

export const dynamicParams = true;

// Provide a dynamic static array for static export configuration
export function generateStaticParams() {
  return [];
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <EditProductClient id={id} />;
}
