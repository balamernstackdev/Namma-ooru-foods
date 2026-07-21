export const dynamicParams = true;
import React from 'react';
import OrderDetailClient from './OrderDetailClient';

export function generateStaticParams() {
  return [];
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <OrderDetailClient id={id} />;
}
