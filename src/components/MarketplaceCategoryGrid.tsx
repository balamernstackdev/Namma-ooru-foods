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
        className="group relative flex flex-col h-full rounded-2xl overflow-hidden bg-white border border-slate-200/80 hover:border-emerald-500/40 transition-all duration-300 shadow-sm hover:shadow-xl hover:shadow-emerald-950/5"
      >
        {/* Promotional / Featured Badge */}
        {(category.isFeatured || category.promotionalTag) && (
          <div className="absolute top-2 left-2 z-20 flex flex-col gap-1">
            {category.isFeatured && (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-400 text-emerald-950 text-[9px] font-black uppercase tracking-wider shadow-sm">
                <Sparkles size={10} />
                Featured
              </span>
            )}
            {category.promotionalTag && (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-700 text-white text-[9px] font-black uppercase tracking-wider shadow-sm">
                <TrendingUp size={10} />
                {category.promotionalTag}
              </span>
            )}
          </div>
        )}

        {/* Top Image Section (Clean aspect-ratio) */}
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-50 border-b border-slate-100 flex items-center justify-center p-2">
          {(() => {
            const cacheBuster = category.updatedAt ? new Date(category.updatedAt).getTime() : Date.now();
            const rawImageUrl = (category.image && category.image.trim() !== '') 
              ? category.image 
              : `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" fill="%23f1f5f9"><rect width="400" height="400" /><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="24" fill="%2394a3b8">No Image</text></svg>`;
            const finalImageUrl = rawImageUrl.startsWith('http') ? `${rawImageUrl}?t=${cacheBuster}` : rawImageUrl;
            
            return (
              <Image
                src={finalImageUrl}
                alt={category.name}
                fill
                className="object-contain p-2 transition-transform duration-500 group-hover:scale-105"
                unoptimized={finalImageUrl.startsWith('http')}
              />
            );
          })()}

          {/* Counts Badges Overlay at Top Right */}
          <div className="absolute top-2 right-2 z-20 flex flex-col items-end gap-1">
            <span className="px-2 py-0.5 rounded-md bg-white/95 backdrop-blur-md text-emerald-950 text-[9px] font-mono font-bold shadow-xs border border-slate-100 flex items-center gap-1">
              <Package size={10} className="text-emerald-700" />
              {productCount} Items
            </span>
            {subcategoryCount > 0 && (
              <span className="px-2 py-0.5 rounded-md bg-emerald-950 text-white text-[9px] font-mono font-bold shadow-xs flex items-center gap-1">
                <Layers size={10} className="text-amber-400" />
                {subcategoryCount} Subs
              </span>
            )}
          </div>
        </div>

        {/* Content Section */}
        <div className="flex flex-col flex-1 p-3 xs:p-4 justify-between bg-white">
          <div>
            <h3 className="text-slate-900 text-xs sm:text-sm font-bold tracking-tight group-hover:text-emerald-800 transition-colors uppercase leading-tight line-clamp-2 mb-1.5 min-h-[2.25rem] flex items-center">
              {category.name}
            </h3>

            <p className="text-slate-500 text-[11px] font-medium leading-tight line-clamp-2 mb-3">
              {description}
            </p>
          </div>

          {/* Action Link Footer */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between mt-auto">
            <span className="text-[10px] xs:text-[11px] font-bold text-emerald-800 uppercase tracking-wider group-hover:text-emerald-900 transition-colors flex items-center gap-1">
              Explore Category <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default MarketplaceCategoryGrid;
