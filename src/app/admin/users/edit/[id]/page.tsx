import React from 'react';
import EditUserClient from './EditUserClient';

export function generateStaticParams() {
  return [{ id: '1' }];
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <EditUserClient id={id} />;
}
