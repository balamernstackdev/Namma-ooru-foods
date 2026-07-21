export const dynamicParams = true;
import React from 'react';
import PayoutDetailClient from './PayoutDetailClient';

export function generateStaticParams() {
  // Pre-generate routes for payout IDs from 1 to 500 to support static exporting
  return [];
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <PayoutDetailClient id={id} />;
}
