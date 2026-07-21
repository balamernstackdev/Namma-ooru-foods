export const dynamicParams = true;
import React from 'react';
import EditHubWizardClient from './EditHubWizardClient';

export function generateStaticParams() {
  // Pre-generate a reasonable number of hub IDs for static export
  return [];
}

export default function Page() {
  return <EditHubWizardClient />;
}
