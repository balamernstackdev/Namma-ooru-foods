'use client';

import React, { Suspense } from 'react';
import PromotionEditClient from './PromotionEditClient';
import { useSearchParams } from 'next/navigation';

function PromotionEditWrapper() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  
  if (!id) return <div>Invalid ID</div>;
  
  return <PromotionEditClient id={id} />;
}

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PromotionEditWrapper />
    </Suspense>
  );
}
