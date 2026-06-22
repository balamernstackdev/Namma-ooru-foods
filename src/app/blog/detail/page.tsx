import React, { Suspense } from 'react';
import BlogDetailLoader from './BlogDetailLoader';
import PremiumLoader from '@/components/ui/PremiumLoader';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Blog | namma ooru Foods',
  description: 'Read the latest stories, recipes, and insights from namma ooru Foods.',
};

export default function BlogDetailPage() {
  return (
    <Suspense fallback={<PremiumLoader fullScreen={true} />}>
      <BlogDetailLoader />
    </Suspense>
  );
}
