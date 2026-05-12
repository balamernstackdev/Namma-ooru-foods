import React from 'react';
import EditBlogClient from './EditBlogClient';

export function generateStaticParams() {
  return [{ id: '1' }];
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <EditBlogClient id={id} />;
}
