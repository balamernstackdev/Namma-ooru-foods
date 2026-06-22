import React from 'react';
import VendorDetailClient from './VendorDetailClient';

export function generateStaticParams() {
  return Array.from({ length: 300 }, (_, i) => ({ id: (i + 1).toString() }));
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <VendorDetailClient id={id} />;
}
