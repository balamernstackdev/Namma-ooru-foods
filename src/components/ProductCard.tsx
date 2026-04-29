'use client';

import React from 'react';
import Link from 'next/link';
import { Star, ShoppingCart, ArrowUpRight, ShieldCheck } from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';
import { useToast } from '@/context/ToastContext';
import { useRouter } from 'next/navigation';
import OptimizedImage from '@/components/ui/OptimizedImage';

interface ProductCardProps {
  product: {
    id: number;
    slug?: string;
    name: string;
    category?: any;
    brand?: any;
    price: number | string;
    originalPrice?: number | string;
    image?: string;
    images?: any[];
    rating?: number;
    tags?: string[];
  };
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCartStore();
  const { addToast } = useToast();
  const router = useRouter();

  const mainImage = product.image || (product.images && product.images[0]?.url) || '/ai_images/organic_grains_1776231059575.png';
  const displayPrice = Number(product.price);
  const displayOriginalPrice = product.originalPrice ? Number(product.originalPrice) : null;
  const categoryName = typeof product.category === 'object' ? product.category?.name : product.category;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({
      productId: product.id,
      name: product.name,
      price: displayPrice,
      quantity: 1,
      image: mainImage,
      variant: 'Standard'
    });
    addToast('Success', `${product.name} added to Cart`);
  };

  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({
      productId: product.id,
      name: product.name,
      price: displayPrice,
      quantity: 1,
      image: mainImage,
      variant: 'Standard'
    });
    router.push('/checkout');
  };

  return (
    <div className="group relative w-full h-[100%] flex flex-col bg-white rounded-[2rem] border border-slate-100 transition-all duration-700 hover:shadow-[0_30px_60px_-15px_rgba(2,44,34,0.1)] overflow-hidden card">
      {/* Image Container */}
      <div className="relative aspect-[4/5] sm:aspect-square w-full overflow-hidden bg-white flex-shrink-0">
        <Link href={`/products/${product.slug || product.id}`} className="relative block h-full w-full">
          <OptimizedImage
            src={mainImage}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="w-full h-full object-cover transition-transform duration-[1500ms] group-hover:scale-110"
          />
        </Link>

        {/* Subtle Save Badge - Top Right */}
        <div className="absolute top-4 right-4 z-10">
          {displayOriginalPrice && displayOriginalPrice > displayPrice && (
            <div className="bg-white/90 backdrop-blur-md text-emerald-900 text-[9px] font-black px-3 py-1.5 rounded-full shadow-lg border border-emerald-950/5 uppercase tracking-widest animate-in fade-in zoom-in duration-500">
              <span className="text-amber-500">Save</span> ₹{displayOriginalPrice - displayPrice}
            </div>
          )}
        </div>
      </div>

      {/* Content Section */}
      <div className="flex flex-col flex-1 p-3 md:p-6 pb-4 md:pb-6 bg-white z-10 relative">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-3">
            <div className="flex flex-col">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] leading-none">{categoryName || 'Reseller Choice'}</span>
                <div className="h-3 w-px bg-slate-100" />
                <div className="flex items-center gap-1 text-emerald-600">
                  <ShieldCheck size={10} strokeWidth={3} />
                  <span className="text-[8px] font-black uppercase tracking-widest">Verified</span>
                </div>
              </div>
              {product.brand ? (
                <span className="text-[9px] font-black text-amber-500 uppercase tracking-widest">{product.brand.name}</span>
              ) : (
                <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Official Store</span>
              )}
            </div>
            <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1 rounded-full border border-slate-100">
              <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
              <span className="text-[10px] font-black text-emerald-950">{product.rating || '4.5'}</span>
            </div>
          </div>

          <Link href={`/products/${product.slug || product.id}`} className="block">
            <h3 className="text-[15px] md:text-[18px] font-black text-emerald-950 mb-3 group-hover:text-emerald-700 transition-colors leading-[1.2] line-clamp-2 tracking-tight">
              {product.name}
            </h3>
          </Link>
        </div>

        <div className="flex flex-col gap-4 mt-2">
          {/* Price Component */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="text-lg md:text-2xl font-black text-emerald-950 tracking-tighter">
                ₹{displayPrice}
              </span>
              {displayOriginalPrice && (
                <div className="bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-md text-[8px] md:text-[9px] font-black uppercase tracking-widest">
                  {Math.round(((displayOriginalPrice - displayPrice) / displayOriginalPrice) * 100)}% OFF
                </div>
              )}
            </div>
            {displayOriginalPrice && (
              <span className="text-[10px] text-slate-300 line-through font-bold">
                M.R.P: ₹{displayOriginalPrice}
              </span>
            )}
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-1.5 mt-2">
            <button
              onClick={handleAddToCart}
              aria-label={`Add ${product.name} to cart`}
              className="h-10 md:h-12 rounded-xl bg-slate-100 text-emerald-950 text-[9px] md:text-[10px] font-black uppercase tracking-widest hover:bg-emerald-50 transition-all flex items-center justify-center gap-1.5"
            >
              <ShoppingCart size={12} className="md:w-[14px]" aria-hidden="true" />
              <span className="hidden xs:inline">Add</span>
            </button>
            <button
              onClick={handleBuyNow}
              aria-label={`Buy ${product.name} now`}
              className="h-10 md:h-12 rounded-xl bg-emerald-950 text-white text-[9px] md:text-[10px] font-black uppercase tracking-widest hover:bg-emerald-900 transition-all shadow-lg active:scale-95 flex items-center justify-center gap-1.5"
            >
              Buy
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
