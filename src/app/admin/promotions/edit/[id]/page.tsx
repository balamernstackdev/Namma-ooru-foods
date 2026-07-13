import React from 'react';
import PromotionEditClient from './PromotionEditClient';
import { PROMOTIONS } from '@/lib/staticData';

export const dynamicParams = true;

export function generateStaticParams() {
  const promoIds = PROMOTIONS.map((p) => ({ id: p.id.toString() }));
  const placeholders = Array.from({ length: 300 }, (_, i) => ({ id: (i + 1).toString() }));
  return [...promoIds, ...placeholders];
}

export default async function EditPromotionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <PromotionEditClient id={id} />;
}
