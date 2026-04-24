'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

import useSWR from 'swr';

import { API_URL } from '@/lib/api';

const fetcher = (url: string) => fetch(url).then(res => res.json());

const CategoriesCircles = () => {
  const { data: apiCategories, error } = useSWR(`${API_URL}/api/categories`, fetcher);

  const displayCategories = apiCategories ? apiCategories.slice(0, 8).map((cat: any) => ({
    name: cat.name,
    image: cat.image || '/ai_images/indian_spices_1776231045209.png',
    href: `/products?category=${cat.name}`
  })) : [];

  if (!apiCategories && !error) return null;

  return (
    <div className="w-full pt-10 md:pt-16 pb-4 bg-white overflow-hidden">
      {/* Title Container */}
      <div className="standard-container mb-8 md:mb-12">
        <div className="text-center">
          <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-emerald-800/60 mb-4 inline-block">Direct From Farmers</span>
          <h2 className="text-emerald-950 font-black tracking-tight text-2xl md:text-4xl lg:text-5xl leading-tight">
            Our Organic <span className="text-amber-500 italic">Range</span>
          </h2>
        </div>
      </div>

      {/* Edge-to-Edge Slider */}
      <div 
        id="categories-slider" 
        className="flex overflow-x-auto gap-3 md:gap-10 pb-10 snap-x no-scrollbar px-6 md:px-12 lg:px-20 scroll-smooth items-start"
      >
        {displayCategories.map((category: any) => (
          <Link 
            key={category.name} 
            href={category.href} 
            className="group flex flex-col items-center justify-start transition-all hover:-translate-y-2 snap-start shrink-0 basis-[35%] sm:basis-[22%] md:basis-[16%] lg:basis-[12%] max-w-[120px] md:max-w-[180px]"
          >
            <div className="relative w-full aspect-square overflow-hidden rounded-full border border-slate-100 md:border-4 border-slate-50 bg-white transition-all group-hover:border-amber-400 group-hover:shadow-premium shadow-sm">
              <Image
                src={category.image}
                alt={category.name}
                fill
                sizes="(max-width: 768px) 30vw, 15vw"
                className="object-cover transition-transform duration-1000 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-emerald-900/0 group-hover:bg-emerald-900/10 transition-colors" />
            </div>
            <span className="text-[8px] md:text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 group-hover:text-emerald-950 transition-colors inline-block mt-4 md:mt-6 text-center px-1 leading-tight group-hover:tracking-[0.3em]">
              {category.name}
            </span>
          </Link>
        ))}
        {displayCategories.length === 0 && !error && (
           <div className="w-full text-center py-10 text-slate-300 text-[10px] font-black uppercase tracking-widest">Awaiting Category Harvest...</div>
        )}
      </div>
    </div>
  );
};

export default CategoriesCircles;
