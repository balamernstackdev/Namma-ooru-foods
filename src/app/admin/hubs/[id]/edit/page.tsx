export const dynamicParams = false;
import React from 'react';
import EditHubWizardClient from './EditHubWizardClient';

export function generateStaticParams() {
  // Pre-generate a reasonable number of hub IDs for static export
  return Array.from({ length: 50 }, (_, i) => ({ id: (i + 1).toString() }));
}

export default function Page() {
  return <EditHubWizardClient />;
}
