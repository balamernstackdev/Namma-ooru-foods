'use client';

import { ErrorState } from '@/components/ErrorStates';
import { Suspense } from 'react';

function UnauthorizedContent() {
  return <ErrorState type="unauthorized" />;
}

export default function UnauthorizedPage() {
  return (
    <Suspense fallback={<div className="min-h-[70vh] bg-[#f8f8f5]" />}>
      <UnauthorizedContent />
    </Suspense>
  );
}
