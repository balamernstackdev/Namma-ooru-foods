export const dynamicParams = true;
import React from 'react';
import VendorDetailClient from './VendorDetailClient';

export function generateStaticParams() {
  return [];
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <VendorDetailClient id={id} />;
}
