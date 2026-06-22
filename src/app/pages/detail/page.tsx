import React, { Suspense } from 'react';
import PageDetailLoader from './PageDetailLoader';
import PremiumLoader from '@/components/ui/PremiumLoader';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Page | namma ooru Foods',
  description: 'View content from namma ooru Foods.',
};

export default function PageDetailPage() {
  return (
    <Suspense fallback={<PremiumLoader fullScreen={true} />}>
      <PageDetailLoader />
    </Suspense>
  );
}
