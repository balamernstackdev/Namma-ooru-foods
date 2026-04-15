'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Star, ShoppingCart, ArrowUpRight } from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';
import { useToast } from '@/context/ToastContext';

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
  const { addToast } = useToast();

  return (
    <div className="group relative w-full h-[100%] flex flex-col bg-white rounded-[2rem] border border-slate-100 transition-all duration-700 hover:shadow-[0_30px_60px_-15px_rgba(2,44,34,0.1)] hover:-translate-y-2 overflow-hidden card">
      {/* Image Container */}
      <div className="relative aspect-[4/5] sm:aspect-square w-full overflow-hidden bg-slate-50/50 flex-shrink-0">
        <Link href={`/products/${product.id}`} className="relative block h-full w-full">
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="w-full h-full object-cover transition-transform duration-[1500ms] group-hover:scale-110"
          />
        </Link>

        {/* Badges */}
        <div className="absolute top-5 left-5 flex flex-col gap-2 z-10">
          {product.originalPrice && product.originalPrice > product.price && (
            <div className="bg-amber-400 text-[#06241c] text-[8px] md:text-[11px] font-black px-4 py-2 rounded-lg shadow-sm uppercase tracking-widest overlay">
              {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
            </div>
          )}
        </div>

        {/* Quick Add Overlay */}
        <div className="absolute inset-x-5 bottom-5 translate-y-8 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 z-20">
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
              addToast('Successfully added to basket', product.name);
            }}
            className="w-full h-12 rounded-xl bg-[#06241c] text-white text-[10px] md:text-[11px] font-black uppercase tracking-widest hover:bg-amber-500 hover:text-[#06241c] transition-all shadow-xl flex items-center justify-center gap-2 active:scale-95"
          >
            <ShoppingCart className="h-4 w-4" /> Add To Cart
          </button>
        </div>
      </div>

      {/* Content Section */}
      <div className="flex flex-col flex-1 p-4 md:p-6 pb-4 md:pb-6 bg-white z-10 relative">

        <div className="flex-1">
          <div className="flex items-center justify-between mb-4">

            <span className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">{product.category}</span>
            <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
              <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
              <span className="text-[10px] md:text-[11px] font-bold text-emerald-900">{product.rating}</span>
            </div>
          </div>

          <Link href={`/products/${product.id}`} className="block">
            <h3 className="text-[20px] md:text-[24px] font-bold text-emerald-950 mb-4 group-hover:text-emerald-700 transition-colors leading-[1.2] line-clamp-2 tracking-tight">
              {product.name}
            </h3>
          </Link>
        </div>

        <div className="flex items-center justify-between gap-4 pt-3 border-t border-slate-50 mt-auto">

          <div className="flex flex-col">
            <span className="text-[8px] md:text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Our Price</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl md:text-3xl font-bold text-emerald-900 tracking-tight">
                <span className="text-[12px] md:text-[14px] font-medium text-slate-300 mr-1">₹</span>
                {product.price}
              </span>
              {product.originalPrice && (
                <span className="text-[10px] md:text-[12px] text-slate-300 line-through font-medium">
                  ₹{product.originalPrice}
                </span>
              )}
            </div>
          </div>

          <Link href={`/products/${product.id}`} className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-emerald-50/80 text-emerald-900 hidden lg:flex flex-shrink-0 items-center justify-center transition-all hover:bg-emerald-900 hover:text-white shadow-sm group/btn border border-emerald-100/50">
            <ArrowUpRight className="h-4 w-4 group-hover:rotate-45 transition-transform" strokeWidth={2.5} />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
