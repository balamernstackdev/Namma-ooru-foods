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
    <div className="w-full py-10 md:py-16 bg-white">
      <div className="standard-container flex flex-col gap-8 md:gap-10 lg:gap-12">
        <div className="text-left">
          <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-emerald-800/60 mb-4 inline-block">Direct From Farmers</span>
          <h2 className="text-emerald-950 font-black tracking-tight text-2xl md:text-4xl lg:text-5xl leading-tight">
            Our Organic <span className="text-amber-500 italic">Range</span>
          </h2>
        </div>

        <div className="relative group">
          <button
            onClick={() => document.getElementById('categories-slider')?.scrollBy({ left: -300, behavior: 'smooth' })}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full bg-white shadow-premium flex items-center justify-center border border-slate-100 text-slate-400 hover:text-emerald-700 opacity-0 group-hover:opacity-100 transition-all disabled:opacity-0 hidden md:flex"
            style={{ transform: 'translate(-50%, -50%)' }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
          </button>

          <div id="categories-slider" className="flex overflow-x-auto gap-10 md:gap-20 justify-start items-start pt-2 pb-6 snap-x relative no-scrollbar px-6 md:px-24">

            {categories.map((category) => (
              <Link key={category.name} href={category.href} className="group flex flex-col items-center justify-start transition-all hover:-translate-y-4 snap-center shrink-0">
                <div className="relative w-28 h-28 md:w-60 md:h-60 flex-shrink-0 overflow-hidden rounded-full border-4 border-slate-50 bg-white transition-all group-hover:border-amber-400 group-hover:shadow-premium shadow-md">
                  <Image
                    src={category.image}
                    alt={category.name}
                    fill
                    sizes="(max-width: 768px) 144px, 240px"
                    className="object-cover transition-transform duration-1000 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-emerald-900/0 group-hover:bg-emerald-900/10 transition-colors" />
                </div>
                <span className="text-[10px] md:text-[12px] font-black uppercase tracking-[0.3em] text-slate-500 group-hover:text-emerald-950 transition-colors inline-block mt-8">
                  {category.name}
                </span>
              </Link>
            ))}
          </div>

          <button
            onClick={() => {
              const slider = document.getElementById('categories-slider');
              if (slider) slider.scrollBy({ left: 400, behavior: 'smooth' });
            }}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full bg-white shadow-premium flex items-center justify-center border border-slate-100 text-slate-400 hover:text-emerald-700 opacity-0 group-hover:opacity-100 transition-all disabled:opacity-0 hidden md:flex"
            style={{ transform: 'translate(50%, -50%)' }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CategoriesCircles;
