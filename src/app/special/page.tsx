'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Leaf, ShieldCheck, Award, Sparkles, Filter } from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import useSWR from 'swr';
import { API_URL } from '@/lib/api';
import HeroCarousel from '@/components/HeroCarousel';

const categories = ['All', 'Grains & Pulses', 'Organic Oils', 'Authentic Spices', 'Dairy Products', 'Local Sweets'];

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function OrganicSpecialPage() {
  const { data: products, error } = useSWR(`${API_URL}/api/products`, fetcher);
  const [activeCategory, setActiveCategory] = useState('All');

  const organicProducts = products?.filter((p: any) => p.tags?.includes('organic-special')) || [];

  const filteredProducts = activeCategory === 'All'
    ? organicProducts
    : organicProducts.filter((p: any) => (p.category?.name === activeCategory) || (p.category === activeCategory));

  return (
    <div className="flex flex-col bg-white w-full min-h-screen">

      <HeroCarousel
        images={['banners/special_1.png', 'banners/special_2.png']}
        title={<>Organic <span className="text-emerald-300 italic">Special</span> Collection</>}
        subtitle="Handpicked organic products from certified farms — grown without pesticides, chemicals, or GMOs."
        badges={
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-emerald-400/20 backdrop-blur-md flex items-center justify-center border border-emerald-400/30">
              <Leaf className="h-5 w-5 text-emerald-300" />
            </div>
            <span className="text-[11px] font-black uppercase tracking-[0.4em] text-emerald-300">100% Certified Organic</span>
          </div>
        }
      />

      {/* Sticky Filter Bar */}
      <div className="w-full bg-white sticky top-[80px] z-20 border-b border-gray-100 py-6 flex justify-center">
        <div className="standard-container">
          <div className="flex items-center gap-6 overflow-x-auto pb-2 no-scrollbar">
            <div className="flex items-center gap-2 mr-4 text-gray-400 flex-shrink-0">
              <Filter className="h-4 w-4 text-emerald-500" />
              <span className="text-[10px] font-black uppercase tracking-widest">Genre:</span>
            </div>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`flex-shrink-0 px-8 py-3.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${activeCategory === cat
                    ? 'bg-emerald-950 text-white shadow-xl shadow-emerald-500/20'
                    : 'bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-gray-800'
                  }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="w-full bg-[#fafafa] py-16 md:py-24 flex justify-center">
        <div className="standard-container">
          <div className="flex flex-col md:flex-row items-center md:justify-between mb-12 md:mb-16 border-b border-gray-100 pb-8 gap-6 text-center md:text-left">
            <h2 className="text-2xl md:text-3xl font-black text-emerald-950 tracking-tight">Pure Organic Products</h2>
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">{filteredProducts.length} Results Found</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-8">
            {filteredProducts.map((product: any) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
