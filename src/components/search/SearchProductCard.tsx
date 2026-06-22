'use client';

import Link from 'next/link';
import { usePlatformSettings } from '@/context/PlatformSettingsContext';

interface SearchProductCardProps {
  product: {
    id: number;
    name: string;
    image?: string;
    price: number;
    category?: { name: string };
  };
  isHighlighted?: boolean;
  onClick: () => void;
}

export default function SearchProductCard({ product, isHighlighted, onClick }: SearchProductCardProps) {
  const { settings } = usePlatformSettings();
  return (
    <Link
      href={`/products/detail?id=${product.id}`}
      onClick={onClick}
      data-highlighted={isHighlighted}
      className={`flex items-center gap-4 px-4 py-3 transition-colors ${
        isHighlighted ? 'bg-slate-50' : 'hover:bg-slate-50'
      }`}
    >
      <div className="h-12 w-12 rounded-lg bg-white border border-slate-100 overflow-hidden shrink-0 shadow-sm">
        <img src={product.image || settings.logo || '/logo.webp'} alt={product.name} className="h-full w-full object-cover" />
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm leading-tight truncate ${isHighlighted ? 'font-bold text-emerald-950' : 'text-slate-700 font-semibold'}`}>
          {product.name}
        </p>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs font-black text-emerald-600">₹{product.price}</span>
          <span className="text-[10px] text-slate-300 uppercase font-black tracking-widest">{product.category?.name || 'Food'}</span>
        </div>
      </div>
    </Link>
  );
}
