'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Star, ShoppingCart, ArrowUpRight } from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';

interface ProductCardProps {
  product: {
    id: number;
    name: string;
    category: string;
    brand: string;
    price: number;
    originalPrice: number;
    image: string;
    rating: number;
    tags?: string[];
  };
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCartStore();
 
  return (
    <div className="group relative w-full h-full flex flex-col bg-white rounded-[20px] border border-slate-100 transition-all duration-500 hover:shadow-premium hover:-translate-y-2 overflow-hidden card">
      {/* Image Container - Fixed Aspect Ratio */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-slate-50">
        <Link href={`/products/${product.id}`} className="relative block h-full w-full">
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="w-full h-full object-cover rounded-[20px] transition-transform duration-[1500ms] group-hover:scale-110"
          />
        </Link>
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
          {product.originalPrice && product.originalPrice > product.price && (
            <div className="bg-amber-400 text-emerald-950 text-[8px] font-black px-2 py-1 rounded-md shadow-sm uppercase tracking-widest">
              {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
            </div>
          )}
        </div>
 
        {/* Quick Add Overlay */}
        <div className="absolute inset-x-3 bottom-3 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 z-20">
          <button 
            onClick={(e) => {
              e.preventDefault();
              addToCart({
                productId: product.id,
                name: product.name,
                price: product.price,
                quantity: 1,
                image: product.image,
                variant: 'Standard'
              });
            }}
            className="w-full h-11 rounded-xl bg-emerald-950 text-white text-[9px] font-black uppercase tracking-widest hover:bg-amber-500 hover:text-emerald-950 transition-all shadow-xl flex items-center justify-center gap-2 active:scale-95"
          >
            <ShoppingCart className="h-3.5 w-3.5" /> Add To Cart
          </button>
        </div>
      </div>
  
      {/* Content Section - Consistent Padding */}
      <div className="flex flex-col flex-1 p-5 lg:p-6 pb-8">
        <div>
          <div className="flex items-center justify-between mb-4">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{product.category}</span>
            <div className="flex items-center gap-1 bg-slate-50 px-2.5 py-1 rounded-full border border-slate-100/50">
              <Star className="h-2.5 w-2.5 fill-amber-400 text-amber-400" />
              <span className="text-[9px] font-black text-emerald-950">{product.rating}</span>
            </div>
          </div>
   
          <Link href={`/products/${product.id}`} className="block">
            <div className="text-[12px] md:text-[13px] font-bold text-emerald-950 mb-8 tracking-tight group-hover:text-amber-600 transition-colors uppercase leading-[1.6] line-clamp-2 h-[3.2em] overflow-hidden">
              {product.name}
            </div>
          </Link>
        </div>
  
        <div className="flex items-center justify-between gap-4 border-t border-slate-100 pt-6 mt-auto">
          <div className="flex flex-col">
            <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest mb-1.5">Best Value</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-black text-emerald-950 tracking-tighter">
                <span className="text-[10px] font-bold opacity-30 mr-0.5">₹</span>
                {product.price}
              </span>
              {product.originalPrice && (
                <span className="text-[11px] text-slate-300 line-through font-medium">
                  ₹{product.originalPrice}
                </span>
              )}
            </div>
          </div>
  
          <Link href={`/products/${product.id}`} className="h-10 w-10 rounded-full border border-slate-100 bg-white flex items-center justify-center text-emerald-950 transition-all hover:bg-emerald-950 hover:text-white shadow-sm group/btn">
            <ArrowUpRight className="h-5 w-5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
