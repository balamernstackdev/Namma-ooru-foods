import React, { Suspense } from 'react';
import SellersListingClient from './SellersListingClient';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Our Sellers | namma ooru Foods',
  description: 'Discover independent artisanal sellers and heritage farms bringing you authentic, organic products directly from the source.',
};

export default function SellersPage() {
  return (
    <Suspense fallback={
      <div className="w-full h-screen flex items-center justify-center bg-white">
        <div className="h-16 w-16 border-4 border-emerald-950/5 border-t-emerald-600 rounded-full animate-spin" />
      </div>
    }>
      <SellersListingClient />
    </Suspense>
  );
}
