import React from 'react';
import PromotionEditClient from './PromotionEditClient';
import { PROMOTIONS } from '@/lib/staticData';

export const dynamicParams = true;

export function generateStaticParams() {
  return [];
}

export default async function EditPromotionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <PromotionEditClient id={id} />;
}
