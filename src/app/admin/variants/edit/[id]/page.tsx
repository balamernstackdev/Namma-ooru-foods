import React from 'react';
import EditVariantClient from './EditVariantClient';

export const dynamicParams = true;

export function generateStaticParams() {
  return [];
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <EditVariantClient id={id} />;
}
