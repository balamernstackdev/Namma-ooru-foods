'use client';

import React, { use } from 'react';
import Link from 'next/link';
import { ArrowLeft, Filter, Heart } from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import { PRODUCTS } from '@/lib/staticData';

export default function ConcernPage({ params }: { params: Promise<{ id: string }> }) {
  // Extract id from promise
  const resolvedParams = use(params);
  
  // Format the concern name from URL slug
  const concernName = resolvedParams.id
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
  
  // Map specific concerns to product tags/categories
  let matchedProducts = PRODUCTS;
  const slug = resolvedParams.id.toLowerCase();
  
  if (slug === 'weight-loss') {
    matchedProducts = PRODUCTS.filter(p => ['Millets', 'Honey', 'Barnyard'].some(k => p.name.includes(k) || p.category.includes(k)));
  } else if (slug === 'immunity') {
    matchedProducts = PRODUCTS.filter(p => ['Turmeric', 'Honey', 'Pepper', 'Dal'].some(k => p.name.includes(k) || p.category.includes(k)));
  } else if (slug === 'diabetes') {
    matchedProducts = PRODUCTS.filter(p => ['Millets', 'Barnyard'].some(k => p.name.includes(k) || p.category.includes(k)));
  } else if (slug === 'beauty') {
    matchedProducts = PRODUCTS.filter(p => ['Oil', 'Turmeric'].some(k => p.name.includes(k) || p.category.includes(k)));
  } else {
    // Arbitrary fallback logic for demo
    matchedProducts = PRODUCTS.slice(0, 4);
  }

  return (
    <div className="flex flex-col bg-white w-full min-h-screen">
      <div className="w-full bg-rose-50 border-b border-rose-100" style={{ paddingTop: '80px', paddingBottom: '70px' }}>
        <div className="mx-auto w-full text-center" style={{ maxWidth: '1400px', paddingLeft: '5%', paddingRight: '5%' }}>
          <Link href="/#concerns" className="inline-flex items-center gap-2 text-sm font-bold text-rose-400 hover:text-rose-600 mb-6 transition-colors mx-auto">
            <ArrowLeft className="h-4 w-4" /> Back to Home
          </Link>
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="h-12 w-12 rounded-full bg-white flex items-center justify-center shadow-sm">
              <Heart className="h-6 w-6 text-rose-500 fill-rose-100" />
            </div>
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-[#1a1a1a] tracking-tight">{concernName} Care</h1>
          <p className="mt-4 text-rose-950/60 font-medium max-w-2xl mx-auto">
            Handpicked organic products tailored to support your {concernName.toLowerCase()} goals naturally.
          </p>
        </div>
      </div>

      <div className="w-full" style={{ paddingTop: '80px', paddingBottom: '120px' }}>
        <div className="mx-auto w-full" style={{ maxWidth: '1400px', paddingLeft: '5%', paddingRight: '5%' }}>
          <div className="flex items-center justify-between mb-10">
            <span className="text-sm font-bold text-gray-400">
              {matchedProducts.length} Recommended Products
            </span>
            <button className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-5 py-3 text-xs font-black uppercase tracking-widest text-[#1a1a1a] hover:border-rose-500 hover:text-rose-500 transition-all">
              <Filter className="h-4 w-4" /> Filter
            </button>
          </div>

          {matchedProducts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4" style={{ gap: '1.5rem' }}>
              {matchedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <h2 className="text-2xl font-black text-[#1a1a1a] mb-3">No specific products found</h2>
              <p className="text-gray-500">We are curating the best items for this concern.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
