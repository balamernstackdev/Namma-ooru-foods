'use client';

import React from 'react';
import Link from 'next/link';
import { Star, ShoppingCart, Heart, Truck, CheckCircle2, RefreshCcw, Plus, Minus } from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';
import { useToast } from '@/context/ToastContext';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useWishlistStore } from '@/store/useWishlistStore';
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
    variants?: any[];
  };
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCartStore();
  const { addToast } = useToast();
  const router = useRouter();
  const { user } = useAuth();
  const { toggleWishlist, isInWishlist } = useWishlistStore();

  const isFav = isInWishlist(product.id);

  const mainImage = product.image || (product.images && product.images[0]?.url) || '/ai_images/organic_grains_1776231059575.png';
  const displayPrice = Number(product.price);
  const displayOriginalPrice = product.originalPrice ? Number(product.originalPrice) : displayPrice + 120; // Mock original price if missing
  const categoryName = typeof product.category === 'object' ? product.category?.name : product.category;
  const brandName = product.brand?.name || 'Native Foods';
  
  const discountPercent = Math.round(((displayOriginalPrice - displayPrice) / displayOriginalPrice) * 100);

  const variants = product.variants || [];
  const [selectedVariant, setSelectedVariant] = React.useState(variants[0] || { name: 'Standard', price: displayPrice });
  
  // Simulated review count based on ID for consistency
  const reviewCount = (product.id * 17) % 150 + 42;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({
      productId: product.id,
      name: product.name,
      price: selectedVariant.price || displayPrice,
      quantity: 1,
      image: mainImage,
      variant: selectedVariant.name
    });
    addToast('Added to cart', `${product.name}`);
  };

  const handleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      addToast('Info', 'Please sign in to save items to your wishlist');
      router.push('/account');
      return;
    }

    const added = await toggleWishlist(user.id, product.id);
    addToast('Success', added ? 'Added to wishlist' : 'Removed from wishlist');
  };

  return (
    <div className="group relative flex flex-col bg-white rounded-2xl border border-slate-150 transition-all duration-300 hover:shadow-[0_15px_30px_-10px_rgba(0,0,0,0.08)] overflow-hidden w-full h-[380px] md:h-[450px]">
      
      {/* 1. IMAGE SECTION (Compact & High Density) */}
      <div className="relative w-full h-[160px] md:h-[210px] shrink-0 p-2">
        <Link href={`/products/${product.id}`} className="relative block h-full w-full overflow-hidden rounded-xl bg-slate-50">
          <OptimizedImage
            src={mainImage}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 50vw, 33vw"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-black/[0.02] group-hover:bg-transparent transition-colors pointer-events-none" />
        </Link>

        {/* BADGES */}
        <div className="absolute top-4 left-4 flex flex-col gap-1.5 z-10 pointer-events-none">
          {product.tags?.includes('best-selling') || product.id % 3 === 0 ? (
            <div className="bg-[#052e16] text-white text-[8px] md:text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md shadow-sm backdrop-blur-md">
              BESTSELLER
            </div>
          ) : (
            <div className="bg-amber-400 text-[#052e16] text-[8px] md:text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md shadow-sm">
              ORGANIC
            </div>
          )}
        </div>

        {/* WISHLIST BUTTON */}
        <button 
          onClick={handleWishlist}
          className={`absolute top-4 right-4 w-[34px] h-[34px] rounded-full bg-white/90 backdrop-blur-sm border border-slate-100 flex items-center justify-center shadow-sm transition-all z-10 hover:scale-110 active:scale-90 ${isFav ? 'text-rose-500' : 'text-slate-600 hover:text-rose-500'}`}
        >
          <Heart size={16} strokeWidth={2.5} className={isFav ? 'fill-rose-500' : ''} />
        </button>
      </div>

      {/* 2. PRODUCT INFO (Tight spacing for fast scanning) */}
      <div className="flex flex-col flex-1 p-3 md:p-4 pt-0 min-h-0 justify-between">
        
        <div className="space-y-1">
          {/* CATEGORY METADATA */}
          <div className="text-[9px] md:text-[10px] font-black tracking-wider uppercase text-slate-400 truncate">
            {categoryName || 'Organic'} • {brandName}
          </div>

          {/* PRODUCT TITLE (Max 2 lines, 18px weight 700) */}
          <Link href={`/products/${product.id}`} className="block">
            <h3 className="text-[15px] md:text-[17px] font-bold text-[#1e293b] leading-snug line-clamp-2 tracking-tight group-hover:text-[#052e16] transition-colors min-h-[2.6em]">
              {product.name}
            </h3>
          </Link>

          {/* RATING & REVIEWS */}
          <div className="flex items-center gap-1.5">
            <div className="flex items-center bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">
              <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
              <span className="ml-1 text-[11px] font-black text-slate-700">{product.rating || '4.8'}</span>
            </div>
            <span className="text-[10px] font-medium text-slate-400">({reviewCount})</span>
          </div>
        </div>

        <div className="space-y-2 mt-auto">
          {/* PRICE HIERARCHY (Consolidated row) */}
          <div className="flex items-baseline flex-wrap gap-x-1.5">
            <span className="text-[20px] md:text-[24px] font-[900] text-[#0f172a] tracking-tight leading-none">
              ₹{displayPrice}
            </span>
            {displayOriginalPrice > displayPrice && (
              <span className="text-[12px] md:text-[13px] text-slate-400 line-through font-semibold opacity-80 leading-none">
                ₹{displayOriginalPrice}
              </span>
            )}
            {discountPercent > 0 && (
              <span className="text-[11px] md:text-[12px] text-emerald-600 font-black uppercase tracking-wide leading-none">
                {discountPercent}% OFF
              </span>
            )}
          </div>

          {/* COMPACT TRUST / DELIVERY INFO */}
          <div className="flex flex-col gap-0.5 border-t border-slate-100 pt-2">
            <div className="flex items-center gap-1.5 text-[#052e16] opacity-90">
              <Truck size={12} strokeWidth={2.5} />
              <span className="text-[10px] font-black tracking-wide uppercase">Free Tomorrow</span>
            </div>
          </div>

          {/* DIRECT CTA QUICK ADD */}
          <button
            onClick={handleAddToCart}
            className="w-full h-[38px] md:h-[42px] bg-[#052e16] text-white rounded-lg text-[11px] md:text-[12px] font-bold uppercase tracking-wider transition-all active:scale-[0.97] flex items-center justify-center gap-2 hover:bg-[#064e3b] border border-[#052e16] shadow-sm group/btn"
          >
            <Plus size={16} className="transition-transform group-hover/btn:rotate-90" />
            <span>ADD</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
