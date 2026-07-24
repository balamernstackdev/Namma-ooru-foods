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
        className="group relative flex flex-col w-full h-full"
      >
        {/* Background Image Container */}
        <div className="relative w-full aspect-[3/4] sm:aspect-[4/5] rounded-2xl overflow-hidden bg-white border border-slate-200/60 shadow-sm transition-all duration-500 group-hover:shadow-md group-hover:border-emerald-200">
          {(() => {
            const cacheBuster = category.updatedAt ? new Date(category.updatedAt).getTime() : Date.now();
            const rawImageUrl = (category.image && category.image.trim() !== '') 
              ? category.image 
              : `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" fill="%23ffffff"><rect width="400" height="400" /><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="24" fill="%2394a3b8">No Image</text></svg>`;
            const finalImageUrl = rawImageUrl.startsWith('http') ? `${rawImageUrl}?t=${cacheBuster}` : rawImageUrl;
            
            return (
              <Image
                src={finalImageUrl}
                alt={category.name}
                fill
                className="object-contain p-1 transition-transform duration-700 ease-out group-hover:scale-105"
                unoptimized={finalImageUrl.startsWith('http')}
              />
            );
          })()}

          {/* Promotional / Featured Badge */}
          {(category.isFeatured || category.promotionalTag) && (
            <div className="absolute top-2 left-2 z-20 flex flex-col gap-1">
              {category.isFeatured && (
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-400 text-emerald-950 text-[9px] font-black uppercase tracking-wider shadow-sm">
                  <Sparkles size={10} />
                  Featured
                </span>
              )}
              {category.promotionalTag && (
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-600 text-white text-[9px] font-black uppercase tracking-wider shadow-sm">
                  <TrendingUp size={10} />
                  {category.promotionalTag}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Text Area Below Image */}
        <div className="mt-2.5 flex flex-col px-1">
          <h3 className="text-[13px] sm:text-[15px] font-bold tracking-tight text-slate-900 group-hover:text-emerald-700 uppercase leading-snug line-clamp-2 transition-colors">
            {category.name}
          </h3>
        </div>
      </Link>
    </motion.div>
  );
};

export default MarketplaceCategoryGrid;
