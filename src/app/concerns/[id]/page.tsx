import React from 'react';
import ConcernDetailLoader from './ConcernDetailLoader';

export async function generateStaticParams() {
  const concerns = ['pregnancy', 'kids', 'weight-loss', 'immunity', 'beauty', 'diabetes'];
  return concerns.map((concern) => ({
    id: concern,
  }));
}

export default async function ConcernPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const { id } = resolvedParams;
  
  return (
    <ConcernDetailLoader id={id} />
  );
}
