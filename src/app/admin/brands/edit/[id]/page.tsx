import React from 'react';
import EditBrandClient from './EditBrandClient';

// export const dynamicParams = true;

// This satisfies the 'output: export' requirement for dynamic routes
export function generateStaticParams() {
  return Array.from({ length: 300 }, (_, i) => ({ id: (i + 1).toString() }));
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <EditBrandClient id={id} />;
}
