'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import NewRefundRequestClient from './NewRefundRequestClient';

function RefundRequestParamsWrapper() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  if (!orderId) return <div className="p-10 text-center text-slate-500">Invalid Order ID</div>;
  return <NewRefundRequestClient orderId={orderId} />;
}

export default function NewRefundRequestPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center">Loading...</div>}>
      <RefundRequestParamsWrapper />
    </Suspense>
  );
}
