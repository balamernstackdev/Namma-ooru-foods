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
      <div className="w-full bg-[#f9fafb] border-b border-slate-100 py-6">
        <div className="standard-container">
          <Link href="/categories" className="inline-flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-emerald-600 mb-4 transition-colors">
            <ArrowLeft size={12} /> Back to Catalog
          </Link>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div />
            <button className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-white px-8 py-4 text-[10px] font-black uppercase tracking-widest text-emerald-950 hover:border-emerald-600 hover:text-emerald-600 transition-all shadow-sm">
              <Filter className="h-4 w-4" /> Filter Selection
            </button>
          </div>
        </div>
      </div>

      <div className="w-full py-8 md:py-12">
        <div className="standard-container">
          {categoryProducts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-10">
              {categoryProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center py-32 px-4">
              <div className="h-32 w-32 rounded-[3rem] bg-slate-50 border border-slate-100 flex items-center justify-center mb-10 text-6xl grayscale opacity-50">
                🌾
              </div>
              <h2 className="text-4xl font-black text-emerald-950 tracking-tighter mb-4">Awaiting Fresh Harvest</h2>
              <p className="text-slate-400 font-medium max-w-sm mx-auto mb-12">
                Our agrarian cluster is currently preparing the next batch of {categoryName.toLowerCase()}. 
              </p>
              <Link href="/products" className="h-16 px-12 rounded-2xl bg-emerald-950 text-white flex items-center justify-center text-[11px] font-black uppercase tracking-widest hover:bg-emerald-800 transition-all shadow-2xl shadow-emerald-900/20">
                Explore All Offerings
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
