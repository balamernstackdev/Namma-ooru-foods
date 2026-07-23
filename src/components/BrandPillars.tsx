'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, GraduationCap, Users, Heart } from 'lucide-react';

const PILLARS = [
  {
    id: 'women',
    title: 'Rural Entrepreneurship',
    subtitle: 'Empowering Local Leaders',
    description: 'Supporting a network of 500+ rural artisans and self-help groups in their journey toward financial independence and heritage preservation.',
    image: '/ai_images/banner_farm_fresh.png',
    link: '/sellers',
    icon: Users,
    accent: 'bg-rose-500'
  },
  {
    id: 'academy',
    title: 'Farmer Empowerment',
    subtitle: 'Ancestral Knowledge',
    description: 'Providing comprehensive support for local farmers on organic practices, traditional processing, and sustainable agriculture.',
    image: '/ai_images/banner_heritage_spices.png',
    link: '/about',
    icon: GraduationCap,
    accent: 'bg-emerald-500'
  },
  {
    id: 'wellness',
    title: 'Natural Wellness',
    subtitle: 'Pure Botanical Wisdom',
    description: 'Sourcing the finest herbal ingredients and traditional wellness products directly from pristine natural clusters.',
    image: '/ai_images/banner_natural_products.png',
    link: '/products',
    icon: Heart,
    accent: 'bg-amber-500'
  }
];

export default function BrandPillars() {
  return (
    <section className="py-12 md:py-16 bg-slate-50 relative overflow-hidden">
      <div className="standard-container">
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <span className="text-[10px] md:text-xs font-black text-amber-500 uppercase tracking-[0.4em] mb-4 block">Our Core Values</span>
          <h2 className="text-4xl md:text-6xl font-black text-emerald-950 tracking-tighter leading-[0.9] mb-6 uppercase">
            Beyond <span className="text-amber-500 italic lowercase font-serif font-normal">Just Food</span>
          </h2>
          <p className="text-slate-500 text-sm md:text-lg font-medium leading-relaxed">
            We are building a sustainable ecosystem that empowers women, educates farmers, and preserves the natural wisdom of our heritage.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-10">
          {PILLARS.map((pillar) => (
            <div
              key={pillar.id}
              className="group relative bg-white rounded-[3rem] p-6 shadow-xl shadow-slate-200/50 border border-white transition-all duration-500 hover:-translate-y-4 hover:shadow-2xl overflow-hidden"
            >
              {/* Background Accent Gradient */}
              <div className={`absolute top-0 right-0 w-32 h-32 opacity-5 rounded-full -translate-y-1/2 translate-x-1/2 transition-transform duration-700 group-hover:scale-[10] ${pillar.accent}`} />

              <div className="relative z-10">
                <div className="relative h-64 md:h-72 w-full rounded-[2.5rem] overflow-hidden mb-8 shadow-inner">
                  <Image
                    src={pillar.image}
                    alt={pillar.title}
                    fill
                    className="object-cover transition-transform duration-[2000ms] group-hover:scale-110"
                    unoptimized={pillar.image.startsWith('http')}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>

                <div className="px-2">
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center text-white shadow-lg ${pillar.accent}`}>
                      <pillar.icon size={20} />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-slate-600 transition-colors">
                      {pillar.subtitle}
                    </span>
                  </div>

                  <h3 className="text-2xl md:text-3xl font-black text-emerald-950 tracking-tight mb-4 leading-tight group-hover:text-emerald-700 transition-colors">
                    {pillar.title}
                  </h3>

                  <p className="text-slate-500 text-xs md:text-sm font-medium leading-relaxed mb-8 line-clamp-3">
                    {pillar.description}
                  </p>

                  <Link
                    href={pillar.link}
                    className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-emerald-950 hover:text-emerald-600 transition-colors group/btn"
                  >
                    Learn More <ArrowRight size={14} className="transition-transform group-hover/btn:translate-x-1" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
