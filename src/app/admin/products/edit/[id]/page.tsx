export const dynamicParams = false;
import React from 'react';
import AdminEditProductClient from './AdminEditProductClient';

export function generateStaticParams() {
  return Array.from({ length: 2000 }, (_, i) => ({ id: (i + 1).toString() }));
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <AdminEditProductClient id={id} />;
}
