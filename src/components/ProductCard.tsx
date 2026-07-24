'use client';

import React from 'react';
import Link from 'next/link';
import { Star, Heart, Plus } from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/context/ToastContext';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useWishlistStore } from '@/store/useWishlistStore';
import OptimizedImage from '@/components/ui/OptimizedImage';
import ProductDetailSuccessAnimation from '@/components/ProductDetailSuccessAnimation';
import ProductBadges from '@/components/ProductBadges';

interface ProductCardProps {
  product: {
    unit: any;
    weight: any;
    id: number;
    slug?: string;
    name: string;
    category?: any;
    brand?: any;
    subVendor?: any;
    price: number | string;
    originalPrice?: number | string;
    image?: string;
    images?: any[];
    rating?: number;
    tags?: string[];
    variants?: any[];
    gstRate?: number | null;
    productIdStr?: string | null;
    skuCode?: string | null;
    reviewCount?: number;
    isFastDelivery?: boolean;
    deliveryTime?: string | null;
  };
  index?: number;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, index }) => {
  const { addToCart, cart } = useCartStore();
  const { addToast } = useToast();
  const router = useRouter();
  const { user } = useAuth();
  const { toggleWishlist, isInWishlist } = useWishlistStore();

  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  const isFav = isMounted ? isInWishlist(product.id) : false;

  const mainImage = product.image || (product.images && product.images[0]?.url) || '';
  const displayPrice = Number(product.price);
  const displayOriginalPrice = product.originalPrice ? Number(product.originalPrice) : 0;

  const variants = product.variants || [];
  const defaultVariantName = (product.weight && product.unit) ? `${product.weight} ${product.unit}` : 'Standard Pack';
  const [selectedVariant] = React.useState(variants[0] || { name: defaultVariantName, price: displayPrice });

  const cartItem = isMounted ? cart.find(i => i.productId === product.id && i.variant === selectedVariant.name) : undefined;
  const quantity = cartItem ? cartItem.quantity : 0;

  const categoryName = typeof product.category === 'object' ? product.category?.name : (product.category || '');
  const subVendor = product.subVendor || product.brand;
  const fullBrand = subVendor?.name || '';
  const brandName = fullBrand.split('•')[0].split('-')[0].trim();
  const skuBadge = index !== undefined
    ? `SKU-${String(index + 1).padStart(2, '0')}`
    : (product.productIdStr || product.skuCode || `SKU-${product.id}`);

  const discountPercent = displayOriginalPrice > displayPrice ? Math.round(((displayOriginalPrice - displayPrice) / displayOriginalPrice) * 100) : 0;

  const reviewCount = product.reviewCount || 0;
  const averageRating = product.rating || 0;

  const [justAdded, setJustAdded] = React.useState(false);
  const [showSuccessAnimation, setShowSuccessAnimation] = React.useState(false);
  const timerRef = React.useRef<NodeJS.Timeout | null>(null);
  const containerBtnRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    addToCart({
      productId: product.id,
      name: product.name,
      price: selectedVariant.price || displayPrice,
      quantity: 1,
      image: mainImage,
      variant: selectedVariant.name,
      gstRate: product.gstRate
    });

    addToast('Success', 'Added to Cart Successfully');
    setShowSuccessAnimation(true);

    setJustAdded(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setJustAdded(false);
    }, 4000);
  };

  const handleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      addToast('Info', 'Please sign in to save items to your wishlist');
      router.push('/account');
      return;
    }

    const added = await toggleWishlist(Number(user.id), product.id);
    addToast('Success', added ? 'Added to wishlist' : 'Removed from wishlist');
  };

  return (
    <div className="group relative flex flex-col bg-white rounded-2xl border border-slate-200/90 transition-all duration-300 hover:border-emerald-500/40 hover:shadow-md overflow-hidden w-full h-full">

      {/* 1. PRODUCT IMAGE CONTAINER (50-55% Card Height on Mobile, object-contain, centered) */}
      <div className="relative w-full aspect-[4/3.2] xs:aspect-[4/3.4] sm:aspect-square md:aspect-[4/3.5] lg:aspect-square shrink-0 bg-slate-50/60 p-2 sm:p-3 flex items-center justify-center overflow-hidden">
        <Link href={`/products/${product.slug || product.id}`} prefetch={false} className="relative block h-full w-full overflow-hidden rounded-xl">
          <OptimizedImage
            src={mainImage}
            alt={product.name}
            fill
            sizes="(max-width: 639px) 50vw, (max-width: 1023px) 33vw, 20vw"
            className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
          />
        </Link>

        {/* WISHLIST BUTTON (Floating Circular Icon Top-Right) */}
        <button
          onClick={handleWishlist}
          type="button"
          aria-label="Add to wishlist"
          className={`absolute top-2 right-2 w-8 h-8 rounded-full bg-white/90 backdrop-blur-md border border-slate-100 flex items-center justify-center shadow-sm transition-all z-10 hover:scale-110 active:scale-95 cursor-pointer ${isFav ? 'text-rose-500' : 'text-slate-400 hover:text-rose-500'}`}
        >
          <Heart size={14} strokeWidth={2.5} className={isFav ? 'fill-rose-500' : ''} />
        </button>
      </div>

      {/* 2. PRODUCT INFO & TYPOGRAPHY SECTION */}
      <div className="flex flex-col flex-1 p-2.5 xs:p-3 md:p-3.5 min-h-0 justify-between">

        <div className="flex flex-col">
          {/* Brand, Hidden Mobile Category, SKU Badge */}
          <div className="flex items-center justify-between gap-1 mb-1 min-w-0">
            <div className="flex items-center gap-1 min-w-0 overflow-hidden">
              {brandName && (
                <span className="text-[12px] font-bold tracking-wider uppercase text-emerald-800 truncate">
                  {brandName}
                </span>
              )}
              {categoryName && (
                <>
                  <span className="hidden sm:inline text-slate-300 shrink-0">•</span>
                  <span className="hidden sm:inline text-xs font-semibold text-slate-400 uppercase truncate">
                    {categoryName}
                  </span>
                </>
              )}
            </div>
            <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded border border-slate-200 shrink-0 leading-none">
              {skuBadge}
            </span>
          </div>

          {/* Product Name (Mobile 16px, Bold, Line Clamp 2) */}
          <Link href={`/products/${product.slug || product.id}`} prefetch={false} className="block group/link h-[44px] mb-1">
            <h3 className="text-[16px] md:text-[17px] font-bold text-slate-900 leading-snug line-clamp-2 tracking-tight group-hover/link:text-emerald-900 transition-colors">
              {product.name}
            </h3>
          </Link>

          {/* Rating Section (Hide Empty Stars if No Rating) */}
          <div className="flex items-center gap-1 my-1">
            {averageRating > 0 ? (
              <>
                <div className="flex items-center gap-0.5 shrink-0">
                  {[...Array(5)].map((_, i) => {
                    const isFilled = i < Math.round(averageRating);
                    return (
                      <Star
                        key={i}
                        className={`h-3 w-3 ${isFilled ? 'fill-amber-400 text-amber-400' : 'text-slate-200 fill-slate-100'}`}
                      />
                    );
                  })}
                </div>
                <span className="text-[11px] font-bold text-slate-800 ml-0.5 shrink-0">
                  {averageRating.toFixed(1)}
                </span>
                {reviewCount > 0 && (
                  <span className="text-[10px] font-medium text-slate-400 shrink-0">
                    ({reviewCount})
                  </span>
                )}
              </>
            ) : (
              <span className="text-[11px] font-medium text-slate-400">
                No Reviews
              </span>
            )}
          </div>

          {/* Badges Section (Max 2 Badges + Overflow) */}
          <div className="my-1 overflow-hidden w-full">
            <ProductBadges product={product} variant="inline" />
          </div>
        </div>

        {/* 3. PRICE HIERARCHY & CTA BUTTON */}
        <div className="mt-2 pt-1 border-t border-slate-100">
          {/* Price Hierarchy (Selling Price 22px, MRP 12px strikethrough, Discount 13px green) */}
          <div className="flex items-baseline flex-nowrap gap-x-2 overflow-hidden leading-none my-1.5">
            <span className="text-[22px] md:text-[24px] font-black text-slate-950 tracking-tight shrink-0">
              ₹{displayPrice}
            </span>
            {displayOriginalPrice > displayPrice && (
              <span className="text-[12px] text-slate-400 line-through font-medium opacity-80 shrink-0">
                ₹{displayOriginalPrice}
              </span>
            )}
            {discountPercent > 0 && (
              <span className="text-[13px] text-emerald-600 font-bold tracking-wide shrink-0">
                {discountPercent}% OFF
              </span>
            )}
          </div>

          {/* Add To Cart CTA Button (Min Height 44px, Mobile Font 14px) */}
          <div className="mt-2 w-full relative min-h-[44px]" ref={containerBtnRef}>
            <AnimatePresence>
              {showSuccessAnimation && (
                <ProductDetailSuccessAnimation
                  key="card-success-anim"
                  buttonRef={containerBtnRef}
                  onComplete={() => setShowSuccessAnimation(false)}
                />
              )}
            </AnimatePresence>
            <AnimatePresence mode="wait">
              {quantity > 0 || justAdded ? (
                <motion.button
                  key="view-cart-btn"
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.15 }}
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    router.push('/cart');
                  }}
                  className="w-full min-h-[44px] bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-[14px] font-bold uppercase tracking-wider transition-all active:scale-[0.98] flex items-center justify-center gap-1.5 shadow-sm border border-emerald-800 cursor-pointer whitespace-nowrap"
                >
                  <span>GO TO CART →</span>
                </motion.button>
              ) : (
                <motion.button
                  key="add-btn"
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1 }}
                  transition={{ duration: 0.15 }}
                  type="button"
                  onClick={handleAddToCart}
                  className="w-full min-h-[44px] bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-[14px] font-bold uppercase tracking-wider transition-all active:scale-[0.98] flex items-center justify-center gap-1.5 shadow-sm border border-emerald-700 group/btn whitespace-nowrap cursor-pointer"
                >
                  <Plus size={14} className="transition-transform group-hover/btn:rotate-90 shrink-0" strokeWidth={3} />
                  <span>ADD TO CART</span>
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </div>

      </div>
    </div>
  );
};

export default React.memo(ProductCard);
