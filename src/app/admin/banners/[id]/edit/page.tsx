export const dynamicParams = true;
import React from 'react';
import EditBannerClient from './EditBannerClient';

export function generateStaticParams() {
   // Generate placeholder IDs so Next.js can export the dynamic route statically.
   // With output: export, we provide a reasonable number of potential IDs.
   return [];
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
   const { id } = await params;
   return <EditBannerClient />;
}
