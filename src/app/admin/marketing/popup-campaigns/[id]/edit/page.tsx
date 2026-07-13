export const dynamicParams = true;
import React from 'react';
import EditPopupCampaignClient from './EditPopupCampaignClient';

export function generateStaticParams() {
  return Array.from({ length: 50 }, (_, i) => ({ id: (i + 1).toString() }));
}

export default async function EditPopupCampaignPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <EditPopupCampaignClient id={id} />;
}
