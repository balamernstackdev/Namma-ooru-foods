import React from 'react';
import { PRODUCTS } from '@/lib/staticData';
import AdminEditProductClient from './AdminEditProductClient';

// Provide a dynamic static array for static export configuration
export async function generateStaticParams() {
  const params: { id: string }[] = [];
  
  // High range for dynamic admin access
  for (let i = 1; i <= 200; i++) {
    params.push({ id: i.toString() });
  }
  
  return params;
}

export default function Page() {
  return <AdminEditProductClient />;
}
