export const dynamicParams = true;
import React from 'react';
import AdminEditProductClient from './AdminEditProductClient';

export function generateStaticParams() {
  return [];
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <AdminEditProductClient id={id} />;
}
