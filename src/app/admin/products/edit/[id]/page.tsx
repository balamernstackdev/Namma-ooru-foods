import React from 'react';
import AdminEditProductClient from './AdminEditProductClient';

// export const dynamicParams = true;

export function generateStaticParams() {
  return Array.from({ length: 300 }, (_, i) => ({ id: (i + 1).toString() }));
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <AdminEditProductClient id={id} />;
}
