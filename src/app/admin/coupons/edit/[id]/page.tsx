import React from 'react';
import EditCouponClient from './EditCouponClient';

export function generateStaticParams() {
  return [{ id: '1' }];
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <EditCouponClient id={id} />;
}
