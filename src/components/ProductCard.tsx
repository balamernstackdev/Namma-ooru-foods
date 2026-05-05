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

  // @ts-ignore
  const variants = product.variants || [];
  const [selectedVariant, setSelectedVariant] = React.useState(variants[0] || { name: 'Standard', price: displayPrice });

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
    addToast('Success', `${product.name} (${selectedVariant.name}) added to Cart`);
  };

  const handleBuyNow = (e: React.MouseEvent) => {
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
    router.push('/checkout');
  };

  return (
    <div className="group relative w-full flex flex-col bg-white rounded-[1.5rem] border border-slate-100 transition-all duration-700 hover:shadow-[0_20px_50px_rgba(6,95,70,0.1)] overflow-hidden">
      {/* Image Container */}
      <div className="relative aspect-square w-full overflow-hidden bg-[#fdfdfd]">
        <Link href={`/products/${product.slug || product.id}`} className="relative block h-full w-full">
          <OptimizedImage
            src={mainImage}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="w-full h-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-105"
          />
          {/* Subtle Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </Link>

        {/* Badges */}
        <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
          {product.tags?.includes('best-selling') && (
            <span className="bg-amber-400 text-slate-950 text-[7px] md:text-[8px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest shadow-lg backdrop-blur-md">Bestseller</span>
          )}
          {product.tags?.includes('new') && (
            <span className="bg-emerald-600 text-white text-[7px] md:text-[8px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest shadow-lg">New Product</span>
          )}
        </div>
      </div>

      {/* Content Section */}
      <div className="flex flex-col flex-1 p-4 md:p-5 bg-white relative">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[9px] font-black text-emerald-600 uppercase tracking-[0.2em]">{categoryName}</span>
            <div className="flex items-center gap-1 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100">
              <ShieldCheck size={10} className="text-emerald-500" />
              <span className="text-[7px] font-black uppercase text-slate-400 tracking-tighter">Certified</span>
            </div>
          </div>

          <Link href={`/products/${product.slug || product.id}`} className="block mb-4">
            <h3 className="text-sm md:text-xl font-black text-[#022c22] group-hover:text-amber-600 transition-colors line-clamp-2 leading-tight tracking-tight">
              {product.name}
            </h3>
          </Link>
        </div>

        <div className="mt-auto pt-3 border-t border-slate-50">
          {/* Price Component */}
          <div className="flex items-end justify-between mb-3">
            <div className="flex flex-col">
              <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">Price</span>
              <div className="flex items-center gap-2">
                <span className="text-xl font-black text-[#022c22] tracking-tighter">
                  ₹{selectedVariant.price || displayPrice}
                </span>
                {displayOriginalPrice && (
                  <span className="text-[10px] text-slate-300 line-through font-medium">
                    ₹{displayOriginalPrice}
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-lg">
              <Star className="h-2.5 w-2.5 fill-amber-500 text-amber-500" />
              <span className="text-[10px] font-black text-amber-700">{product.rating || '4.8'}</span>
            </div>
          </div>

          {/* Action Button */}
          <button
            onClick={handleAddToCart}
            className="w-full h-11 md:h-12 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg active:scale-95 flex items-center justify-center gap-3 overflow-hidden relative group/btn"
            style={{ backgroundColor: '#065f46', color: '#ffffff' }}
          >
            <div className="absolute inset-0 bg-white/10 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300" />
            <ShoppingCart size={14} className="group-hover/btn:scale-110 transition-transform" />
            <span className="relative z-10">Add to Cart</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
