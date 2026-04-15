'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

const categories = [
  { name: 'Rice', image: '/ai_images/indian_spices_1776231045209.png', href: '/products?category=Grains & Pulses' },
  { name: 'Millets', image: '/ai_images/organic_grains_1776231059575.png', href: '/products?category=Grains & Pulses' },
  { name: 'Honey', image: '/ai_images/honey_gold_1776231080758.png', href: '/products?category=Dairy Products' },
  { name: 'Snacks', image: '/ai_images/murukku_premium.png', href: '/products?category=Indian Snacks' },
  { name: 'Sweets', image: '/ai_images/mysore_pak_brass.png', href: '/products?category=Local Sweets' },
  { name: 'Natural', image: '/ai_images/cinematic_farm_1776230966841.png', href: '/products' },
];

const CategoriesCircles = () => {
  return (
    <div className="w-full pt-10 md:pt-16 pb-4 bg-white">
      <div className="standard-container flex flex-col gap-8 md:gap-10 lg:gap-12">
        <div className="text-center">
          <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-emerald-800/60 mb-4 inline-block">Direct From Farmers</span>
          <h2 className="text-emerald-950 font-black tracking-tight text-2xl md:text-4xl lg:text-5xl leading-tight">
            Our Organic <span className="text-amber-500 italic">Range</span>
          </h2>
        </div>

        <div 
          id="categories-slider" 
          className="flex overflow-x-auto gap-4 md:gap-8 pb-10 snap-x no-scrollbar px-6 md:px-12 lg:px-20"
        >
          {categories.map((category) => (
            <Link 
              key={category.name} 
              href={category.href} 
              className="group flex flex-col items-center justify-start transition-all hover:-translate-y-4 snap-start shrink-0 basis-[28%] md:basis-[22%]"
            >
              <div className="relative w-full aspect-square overflow-hidden rounded-full border-2 md:border-8 border-slate-50 bg-white transition-all group-hover:border-amber-400 group-hover:shadow-premium shadow-md">
                <Image
                  src={category.image}
                  alt={category.name}
                  fill
                  sizes="(max-width: 768px) 33vw, 25vw"
                  className="object-cover transition-transform duration-1000 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-emerald-900/0 group-hover:bg-emerald-900/10 transition-colors" />
              </div>
              <span className="text-[9px] md:text-[14px] font-black uppercase tracking-[0.2em] md:tracking-[0.3em] text-slate-500 group-hover:text-emerald-950 transition-colors inline-block mt-4 md:mt-8 text-center px-1">
                {category.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CategoriesCircles;
