'use client';

import React from 'react';
import { 
  TrendingUp, 
  Sparkles, 
  Leaf, 
  Tractor, 
  Star, 
  Zap,
  CheckCircle2,
  Award
} from 'lucide-react';

interface ProductBadgesProps {
  product: {
    isBestSeller?: boolean;
    isFeatured?: boolean;
    isOrganic?: boolean;
    isFarmerCollection?: boolean;
    isNewArrival?: boolean;
    isFastDelivery?: boolean;
    [key: string]: any;
  };
  variant?: 'floating' | 'inline';
}

export default function ProductBadges({ product, variant = 'inline' }: ProductBadgesProps) {


  if (!product) return null;

  const allPossibleBadges = [];

  // Priority mapping logic:
  // 1. Best Seller
  if (product.isBestSeller) {
    allPossibleBadges.push({
      id: 'bestseller',
      label: 'Best Seller',
      floatingBg: 'bg-[#052e16]',
      floatingText: 'text-white',
      floatingIcon: <TrendingUp size={10} className="text-amber-400" />,
      inlineBg: 'bg-amber-50',
      inlineText: 'text-amber-800',
      inlineBorder: 'border-amber-100',
      inlineIcon: <Award size={10} className="text-amber-700" />
    });
  }

  // 2. Featured
  if (product.isFeatured) {
    allPossibleBadges.push({
      id: 'featured',
      label: 'Featured',
      floatingBg: 'bg-blue-900',
      floatingText: 'text-white',
      floatingIcon: <Sparkles size={10} className="text-blue-300" />,
      inlineBg: 'bg-blue-50',
      inlineText: 'text-blue-800',
      inlineBorder: 'border-blue-100',
      inlineIcon: <Sparkles size={10} className="text-blue-700" />
    });
  }

  // 3. Organic
  if (product.isOrganic) {
    allPossibleBadges.push({
      id: 'organic',
      label: 'Organic',
      floatingBg: 'bg-emerald-700',
      floatingText: 'text-white',
      floatingIcon: <Leaf size={10} className="text-emerald-200" />,
      inlineBg: 'bg-emerald-50',
      inlineText: 'text-emerald-800',
      inlineBorder: 'border-emerald-100',
      inlineIcon: <CheckCircle2 size={10} className="text-emerald-700" />
    });
  }

  // 4. Farmer Collection
  if (product.isFarmerCollection) {
    allPossibleBadges.push({
      id: 'farmer',
      label: 'Farmer Collection',
      floatingBg: 'bg-orange-700',
      floatingText: 'text-white',
      floatingIcon: <Tractor size={10} className="text-orange-200" />,
      inlineBg: 'bg-orange-50',
      inlineText: 'text-orange-800',
      inlineBorder: 'border-orange-100',
      inlineIcon: <Tractor size={10} className="text-orange-700" />
    });
  }

  // 5. Fast Delivery
  if (product.isFastDelivery) {
    allPossibleBadges.push({
      id: 'fast',
      label: 'Fast Delivery',
      floatingBg: 'bg-rose-700',
      floatingText: 'text-white',
      floatingIcon: <Zap size={10} className="text-rose-200 fill-rose-200" />,
      inlineBg: 'bg-rose-50',
      inlineText: 'text-rose-800',
      inlineBorder: 'border-rose-100',
      inlineIcon: <Zap size={10} className="text-rose-700" />
    });
  }

  // 6. New Arrival
  if (product.isNewArrival) {
    allPossibleBadges.push({
      id: 'new',
      label: 'New Arrival',
      floatingBg: 'bg-purple-800',
      floatingText: 'text-white',
      floatingIcon: <Star size={10} className="text-purple-300 fill-purple-300" />,
      inlineBg: 'bg-purple-50',
      inlineText: 'text-purple-800',
      inlineBorder: 'border-purple-100',
      inlineIcon: <Star size={10} className="text-purple-700" />
    });
  }

  if (allPossibleBadges.length === 0) return null;

  if (variant === 'floating') {
    return (
      <div className="absolute top-2 left-2 pointer-events-none flex flex-col gap-1.5 z-10">
        {allPossibleBadges.slice(0, 2).map((badge) => (
          <div 
            key={badge.id}
            className={`${badge.floatingBg} backdrop-blur-md ${badge.floatingText} text-[9px] font-black px-2 py-1 rounded shadow-md uppercase tracking-wider flex items-center gap-1.5`}
          >
            {badge.floatingIcon}
            {badge.label}
          </div>
        ))}
      </div>
    );
  }

  const visibleBadges = allPossibleBadges.slice(0, 2);
  const remainingCount = allPossibleBadges.length - 2;

  return (
    <div className="flex flex-nowrap whitespace-nowrap gap-1 items-center w-full overflow-hidden text-[10px] md:text-xs h-full">
      {visibleBadges.map((badge, index) => (
        <span 
          key={badge.id}
          className={`${badge.inlineBg} ${badge.inlineText} text-[9px] md:text-[10px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded border ${badge.inlineBorder} ${index > 0 ? 'hidden md:flex' : 'flex'} items-center gap-1 leading-none shrink-0`}
        >
          {badge.inlineIcon}
          <span>{badge.label}</span>
        </span>
      ))}
      {remainingCount > 0 && (
        <span className="hidden md:flex bg-slate-100 text-slate-650 text-[9px] md:text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border border-slate-200 items-center leading-none shrink-0">
          +{remainingCount} More
        </span>
      )}
    </div>
  );
}
