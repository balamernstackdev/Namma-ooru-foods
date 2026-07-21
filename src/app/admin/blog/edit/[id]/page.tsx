import React from 'react';
import EditBlogClient from './EditBlogClient';

export const dynamicParams = true;

export function generateStaticParams() {
  return [];
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <EditBlogClient id={id} />;
}
