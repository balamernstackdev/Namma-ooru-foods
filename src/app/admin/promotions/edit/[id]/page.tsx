import React from 'react';
import PromotionEditClient from './PromotionEditClient';
import { PROMOTIONS } from '@/lib/staticData';

export async function generateStaticParams() {
   return PROMOTIONS.map((p) => ({
      id: p.id.toString(),
   }));
}

export default async function EditPromotionPage({ params }: { params: Promise<{ id: string }> }) {
   const { id } = await params;
   
   return <PromotionEditClient id={id} />;
}
