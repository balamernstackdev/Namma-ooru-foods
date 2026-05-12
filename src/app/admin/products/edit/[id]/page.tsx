import React from 'react';
import { PRODUCTS } from '@/lib/staticData';
import AdminEditProductClient from './AdminEditProductClient';

// Admin routes are protected and load data dynamically at runtime.
// We only need one placeholder path to satisfy Next.js prerender requirements.
export function generateStaticParams() {
  return [{ id: '0' }];
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <AdminEditProductClient id={id} />;
}
