'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, TrendingUp, ShoppingBag } from 'lucide-react';

interface Category {
  id: number;
  name: string;
  slug: string;
  image: string | null;
  subtitle: string | null;
  icon: string | null;
  isFeatured: boolean;
  promotionalTag: string | null;
  _count?: {
    products: number;
  };
}

interface Props {
  categories: Category[];
}

const MarketplaceCategoryGrid: React.FC<Props> = ({ categories }) => {
  return (
    <div className="w-full">
      {/* Mobile Horizontal Slider */}
      <div className="flex md:hidden overflow-x-auto pb-6 gap-4 no-scrollbar -mx-4 px-4">
        {categories.map((category, idx) => (
          <div key={category.id} className="min-w-[280px]">
            <CategoryCard category={category} index={idx} />
          </div>
        ))}
      </div>

      {/* Desktop/Tablet Responsive Grid */}
      <div className="hidden md:grid grid-cols-3 lg:grid-cols-5 gap-5 lg:gap-6">
        {categories.map((category, idx) => (
          <CategoryCard key={category.id} category={category} index={idx} />
        ))}
      </div>
    </div>
  );
};

const CategoryCard = ({ category, index }: { category: Category; index: number }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
    >
      <Link
        href={`/categories/${category.slug || category.id}`}
        className="group relative flex flex-col h-[320px] rounded-2xl overflow-hidden bg-slate-50 border border-slate-100/50 hover:border-emerald-500/20 transition-all duration-500 shadow-sm hover:shadow-2xl hover:shadow-emerald-950/5"
      >
        {/* Promotional Tag / Featured Badge */}
        {(category.isFeatured || category.promotionalTag) && (
          <div className="absolute top-3 left-3 z-20 flex flex-col gap-2">
            {category.isFeatured && (
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400 text-emerald-950 text-[10px] font-black uppercase tracking-widest shadow-lg shadow-amber-400/20 backdrop-blur-sm">
                <Sparkles className="h-3 w-3" />
                Featured
              </div>
            )}
            {category.promotionalTag && (
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-600/20 backdrop-blur-sm">
                <TrendingUp className="h-3 w-3" />
                {category.promotionalTag}
              </div>
            )}
          </div>
        )}

        {/* Product Count Badge */}
        <div className="absolute top-3 right-3 z-20 px-3 py-1 rounded-full bg-white/90 backdrop-blur-md text-emerald-950 text-[9px] font-black uppercase tracking-widest shadow-sm">
          {category._count?.products || 0} Products
        </div>

        {/* Image Section */}
        <div className="relative h-[200px] w-full overflow-hidden">
          <Image
            src={category.image || '/ai_images/organic_grains_1776231059575.png'}
            alt={category.name}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-110"
          />
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </div>

        {/* Content Section */}
        <div className="flex-1 p-5 flex flex-col bg-white">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="text-emerald-950 text-sm lg:text-base font-black tracking-tight group-hover:text-emerald-700 transition-colors uppercase leading-none truncate">
              {category.name}
            </h3>
            {category.icon && (
               <span className="text-emerald-950/20 group-hover:text-amber-500 transition-colors">
                  {/* Icon rendering logic can be expanded based on what icon strings are stored */}
                  <ShoppingBag className="h-4 w-4" />
               </span>
            )}
          </div>
          
          <p className="text-slate-400 text-[10px] lg:text-[11px] font-medium leading-tight line-clamp-2 mb-4">
            {category.subtitle || 'Discover premium handpicked collections directly from our artisans.'}
          </p>

          {/* Action Footer */}
          <div className="mt-auto flex items-center justify-between">
            <span className="text-[9px] lg:text-[10px] font-black uppercase tracking-widest text-emerald-950/40 group-hover:text-emerald-700 transition-all flex items-center gap-2">
              Explore Collection <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
            </span>
          </div>
        </div>

        {/* Hover Elevation Indicator */}
        <div className="absolute bottom-0 left-0 w-full h-1 bg-emerald-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
      </Link>
    </motion.div>
  );
};

export default MarketplaceCategoryGrid;
