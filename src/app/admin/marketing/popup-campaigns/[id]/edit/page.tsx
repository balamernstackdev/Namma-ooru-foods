export const dynamicParams = true;
import React from 'react';
import EditPopupCampaignClient from './EditPopupCampaignClient';

export function generateStaticParams() {
  return [];
}

export default async function EditPopupCampaignPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <EditPopupCampaignClient id={id} />;
}
