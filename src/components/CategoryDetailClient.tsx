'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Filter } from 'lucide-react';
import ProductCard from '@/components/ProductCard';

interface CategoryDetailClientProps {
  categoryId: string;
  categoryProducts: any[];
}

export default function CategoryDetailClient({ categoryId, categoryProducts }: CategoryDetailClientProps) {
  // Format the category name from URL slug
  const categoryName = categoryId
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
  
  return (
    <div className="flex flex-col bg-white w-full min-h-screen">
      <div className="w-full bg-gray-50 border-b border-gray-100" style={{ paddingTop: '50px', paddingBottom: '40px' }}>
        <div className="mx-auto w-full" style={{ maxWidth: '1400px', paddingLeft: '5%', paddingRight: '5%' }}>
          <Link href="/categories" className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-[var(--primary)] mb-6 transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back to Categories
          </Link>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-black text-[#1a1a1a] tracking-tight">{categoryName}</h1>
              <p className="mt-2 text-sm font-bold text-gray-400">
                {categoryProducts.length} {categoryProducts.length === 1 ? 'Product' : 'Products'} found
              </p>
            </div>
            <button className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-5 py-3 text-xs font-black uppercase tracking-widest text-[#1a1a1a] hover:border-[var(--primary)] hover:text-[var(--primary)] transition-all">
              <Filter className="h-4 w-4" /> Filter
            </button>
          </div>
        </div>
      </div>

      <div className="w-full" style={{ paddingTop: '80px', paddingBottom: '120px' }}>
        <div className="mx-auto w-full" style={{ maxWidth: '1400px', paddingLeft: '5%', paddingRight: '5%' }}>
          {categoryProducts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
              {categoryProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center py-20 px-4">
              <div className="h-24 w-24 rounded-full bg-gray-50 flex items-center justify-center mb-6">
                <span className="text-4xl">🌾</span>
              </div>
              <h2 className="text-2xl font-black text-[#1a1a1a] mb-3">No products found</h2>
              <p className="text-gray-500 max-w-md mx-auto mb-8">
                We're currently stocking up on fresh {categoryName.toLowerCase()}. Please check back soon!
              </p>
              <Link href="/products" className="rounded-full bg-[var(--primary)] px-8 py-4 text-sm font-black text-white hover:bg-black transition-all">
                Browse All Products
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
