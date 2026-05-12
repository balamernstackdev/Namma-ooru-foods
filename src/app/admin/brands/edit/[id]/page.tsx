import React from 'react';
import EditBrandClient from './EditBrandClient';

// This satisfies the 'output: export' requirement for dynamic routes
export function generateStaticParams() {
  return [{ id: '1' }]; 
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <EditBrandClient id={id} />;
}
