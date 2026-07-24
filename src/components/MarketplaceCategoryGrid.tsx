'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, TrendingUp, Layers, Package } from 'lucide-react';

interface Category {
  id: number;
  name: string;
  slug: string;
  image: string | null;
  subtitle: string | null;
  description?: string | null;
  icon: string | null;
  isFeatured: boolean;
  promotionalTag: string | null;
  updatedAt?: string;
  children?: any[];
  _count?: {
    products?: number;
    children?: number;
    subcategories?: number;
  };
}

interface Props {
  categories: Category[];
}

const MarketplaceCategoryGrid: React.FC<Props> = ({ categories }) => {
  return (
    <div className="w-full">
      {/* Responsive Category Grid: 2 cols Mobile, 3 cols Tablet, 4-5 cols Desktop */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 md:gap-6">
        {categories.map((category, idx) => (
          <CategoryCard key={category.id} category={category} index={idx} />
        ))}
      </div>
    </div>
  );
};

const CategoryCard = ({ category, index }: { category: Category; index: number }) => {
  const subcategoryCount = category.children?.length ?? category._count?.children ?? category._count?.subcategories ?? 0;
  const productCount = category._count?.products ?? 0;
  const description = category.subtitle || category.description || 'Handpicked organic collection direct from farm.';

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.04 }}
      className="h-full"
    >
      <Link
        href={`/categories/${category.slug || category.id}`}
        className="group relative block aspect-[3/4] w-full rounded-2xl overflow-hidden bg-slate-950 border border-slate-800/10 shadow-sm hover:shadow-2xl hover:shadow-emerald-950/20 transition-all duration-500"
      >
        {/* Background Image */}
        <div className="absolute inset-0 bg-slate-900">
          {(() => {
            const cacheBuster = category.updatedAt ? new Date(category.updatedAt).getTime() : Date.now();
            const rawImageUrl = (category.image && category.image.trim() !== '') 
              ? category.image 
              : `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" fill="%23020617"><rect width="400" height="400" /><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="24" fill="%23334155">No Image</text></svg>`;
            const finalImageUrl = rawImageUrl.startsWith('http') ? `${rawImageUrl}?t=${cacheBuster}` : rawImageUrl;
            
            return (
              <Image
                src={finalImageUrl}
                alt={category.name}
                fill
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-108"
                unoptimized={finalImageUrl.startsWith('http')}
              />
            );
          })()}
        </div>

        {/* Dynamic Dark Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/40 to-transparent opacity-85 group-hover:opacity-95 transition-opacity duration-500 z-10" />

        {/* Promotional / Featured Badge */}
        {(category.isFeatured || category.promotionalTag) && (
          <div className="absolute top-3 left-3 z-20 flex flex-col gap-1">
            {category.isFeatured && (
              <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-400 text-emerald-950 text-[9px] font-black uppercase tracking-wider shadow-sm">
                <Sparkles size={10} />
                Featured
              </span>
            )}
            {category.promotionalTag && (
              <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-700 text-white text-[9px] font-black uppercase tracking-wider shadow-sm">
                <TrendingUp size={10} />
                {category.promotionalTag}
              </span>
            )}
          </div>
        )}

        {/* Immersive Text Overlay Section */}
        <div className="absolute inset-0 p-4 sm:p-5 flex flex-col justify-end text-white z-20">
          <span className="text-[9px] font-black uppercase tracking-[0.25em] text-emerald-400 mb-1 block opacity-90">
            Collection
          </span>
          <h3 className="text-sm sm:text-base font-black tracking-tight uppercase leading-snug line-clamp-2 mb-1 group-hover:text-emerald-300 transition-colors">
            {category.name}
          </h3>
          <p className="text-[10px] sm:text-[11px] text-slate-300 font-medium leading-relaxed line-clamp-2 mb-3 opacity-0 group-hover:opacity-100 group-hover:translate-y-0 translate-y-2 transition-all duration-300">
            {description}
          </p>
          <div className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-emerald-400 group-hover:text-emerald-300 transition-colors">
            Explore Category <ArrowRight size={10} className="group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default MarketplaceCategoryGrid;
