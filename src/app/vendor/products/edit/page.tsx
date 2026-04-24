'use client';

import React, { Suspense } from 'react';
import EditProductClient from '@/app/vendor/products/edit/EditProductClient';
import { useSearchParams } from 'next/navigation';

function EditProductWrapper() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  
  return <EditProductClient id={id || undefined} />;
}

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <EditProductWrapper />
    </Suspense>
  );
}
