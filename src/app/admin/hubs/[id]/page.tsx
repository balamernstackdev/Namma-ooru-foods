export const dynamicParams = true;
import React from 'react';
import HubDetailClient from './HubDetailClient';

export function generateStaticParams() {
  return Array.from({ length: 200 }, (_, i) => ({ id: (i + 1).toString() }));
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <HubDetailClient id={id} />;
}
