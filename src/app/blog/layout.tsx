import { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
  title: 'namma ooru Foods — Blog | Organic Farming & Nutrition Insights',
  description: 'Discover stories from our farms, nutrition tips, and the journey of traditional food — straight from the Producers at namma ooru Foods.',
};

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
