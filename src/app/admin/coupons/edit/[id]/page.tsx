import React from 'react';
import EditCouponClient from './EditCouponClient';

export const dynamicParams = true;

export function generateStaticParams() {
  return [];
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <EditCouponClient id={id} />;
}
