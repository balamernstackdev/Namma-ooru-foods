import React from 'react';
import EditVariantClient from './EditVariantClient';

export function generateStaticParams() {
  return [{ id: '1' }];
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <EditVariantClient id={id} />;
}
