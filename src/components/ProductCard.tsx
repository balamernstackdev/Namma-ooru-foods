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
  const [selectedVariant] = React.useState(variants[0] || { name: 'Standard', price: displayPrice });

  const cartItem = isMounted ? cart.find(i => i.productId === product.id && i.variant === selectedVariant.name) : undefined;
  const quantity = cartItem ? cartItem.quantity : 0;

  const categoryName = typeof product.category === 'object' ? product.category?.name : (product.category || '');
  const subVendor = product.subVendor || product.brand;
  const brandName = subVendor?.name || '';
  const brandLogo = subVendor?.logo;

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
    <div className="group relative flex flex-col bg-white rounded-2xl border border-slate-200 transition-all duration-300 hover:border-slate-300 overflow-hidden w-full h-full">

      {/* 1. IMAGE SECTION (Compact & Equal Height, Object-Contain) */}
      <div className="relative w-full h-[160px] md:h-[170px] xl:h-[180px] shrink-0 p-2">
        <Link href={`/products/${product.slug || product.id}`} prefetch={false} className="relative block h-full w-full overflow-hidden rounded-xl bg-white">
          <OptimizedImage
            src={mainImage}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 50vw, 33vw"
            className="w-full h-full object-contain p-1 transition-transform duration-500 group-hover:scale-105"
          />
        </Link>

        {/* WISHLIST BUTTON (Capped Top-Right) */}
        <button
          onClick={handleWishlist}
          type="button"
          className={`absolute top-3 right-3 w-[32px] h-[32px] rounded-full bg-white/90 backdrop-blur-sm border border-slate-100 flex items-center justify-center shadow-sm transition-all z-10 hover:scale-110 active:scale-90 ${isFav ? 'text-rose-500' : 'text-slate-600 hover:text-rose-500'}`}
        >
          <Heart size={14} strokeWidth={2.5} className={isFav ? 'fill-rose-500' : ''} />
        </button>
      </div>

      {/* 2. PRODUCT INFO */}
      <div className="flex flex-col flex-1 p-2.5 md:p-3 pt-0 pb-3 md:pb-3.5 min-h-0">

        <div className="flex flex-col">
          <div>
            {/* Vendor Name & Category on Left, SKU badge Right Aligned */}
            <div className="flex items-center justify-between gap-1.5 mb-1 min-w-0">
              <div className="flex items-center gap-1 min-w-0 overflow-hidden text-[9px] md:text-[10px]">
                {brandName && (
                  <span className="font-black tracking-wider uppercase text-emerald-700 truncate max-w-[120px] md:max-w-none shrink-0">
                    {brandName}
                  </span>
                )}
                {brandName && categoryName && <span className="text-slate-300 shrink-0">•</span>}
                {categoryName && (
                  <span className="font-bold tracking-wider uppercase text-slate-400 truncate max-w-[120px] md:max-w-none">
                    {categoryName}
                  </span>
                )}
              </div>
              <span className="text-[8px] md:text-[9px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-mono shrink-0 border border-slate-200 font-bold">
                {index !== undefined
                  ? `Pro-${String(index + 1).padStart(2, '0')}`
                  : (product.productIdStr || product.skuCode || `PROD-${product.id.toString().padStart(3, '0')}`)}
              </span>
            </div>

            {/* Product Name (Fixed Height to prevent Layout Shifts) */}
            <Link href={`/products/${product.slug || product.id}`} prefetch={false} className="block group/link h-[34px] md:h-[38px] overflow-hidden mb-1">
              <p className="text-[13px] md:text-[14px] lg:text-[15px] font-bold text-[#1e293b] leading-snug line-clamp-2 tracking-tight group-hover/link:text-[#052e16] transition-colors">
                {product.name}
              </p>
            </Link>
          </div>

          {/* RATING & REVIEWS (Single Row with stars) */}
          <div className="flex items-center gap-1.5 mt-0.5 mb-1.5">
            <div className="flex items-center gap-0.5 shrink-0">
              {[...Array(5)].map((_, i) => {
                const isFilled = i < Math.round(averageRating);
                return (
                  <Star
                    key={i}
                    className={`h-2.5 w-2.5 ${isFilled ? 'fill-amber-400 text-amber-400' : 'text-slate-200 fill-slate-100'}`}
                  />
                );
              })}
            </div>
            <span className="text-[10px] font-black text-slate-700 ml-0.5 shrink-0">
              {averageRating ? averageRating.toFixed(1) : '0.0'}
            </span>
            <span className="text-[9px] font-medium text-slate-400 shrink-0">
              ({reviewCount})
            </span>
          </div>
        </div>

        <div className="space-y-1.5 mt-2">
          {/* PRICE SECTION (Single Row, Never wrap on mobile) */}
          <div className="flex items-baseline flex-nowrap gap-1.5 overflow-hidden leading-none pt-0.5">
            <span className="text-[14px] md:text-[16px] lg:text-[18px] font-[900] text-[#0f172a] tracking-tight shrink-0">
              ₹{displayPrice}
            </span>
            {displayOriginalPrice > displayPrice && (
              <span className="text-[10px] md:text-[11px] text-slate-400 line-through font-semibold opacity-80 shrink-0">
                ₹{displayOriginalPrice}
              </span>
            )}
            {discountPercent > 0 && (
              <span className="text-[9px] md:text-[10px] text-emerald-600 font-black uppercase tracking-wide shrink-0 whitespace-nowrap">
                {discountPercent}% OFF
              </span>
            )}
          </div>

          {/* BADGES SECTION (Fixed Height to prevent Layout Shifts) */}
          <div className="flex flex-col gap-0.5 border-t border-slate-100 pt-1.5 h-[26px] overflow-hidden justify-center mb-1.5">
            {quantity > 0 || justAdded ? (
              <div className="text-[10px] text-emerald-600 font-bold flex items-center gap-1 animate-in fade-in duration-200 select-none shrink-0">
                <span>✓ Added to Cart</span>
              </div>
            ) : (
              <div className="flex items-center overflow-hidden w-full shrink-0">
                <ProductBadges product={product} variant="inline" />
              </div>
            )}
          </div>

          {/* DIRECT CTA QUICK ADD BUTTON (Fixed Height, Bottom Aligned, Full Width) */}
          <div className="h-[44px] mt-1 relative w-full" ref={containerBtnRef}>
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
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    router.push('/cart');
                  }}
                  className="absolute inset-0 w-full h-full bg-[#059669] text-slate-50 rounded-lg text-[10px] md:text-[11px] font-[900] uppercase tracking-wider transition-all active:scale-[0.97] flex items-center justify-center gap-2 hover:bg-[#047857] border border-[#059669] shadow-sm shadow-emerald-900/5 cursor-pointer whitespace-nowrap"
                >
                  <span>VIEW CART →</span>
                </motion.button>
              ) : (
                <motion.button
                  key="add-btn"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  type="button"
                  onClick={handleAddToCart}
                  className="absolute inset-0 w-full h-full bg-[#059669] text-slate-50 rounded-lg text-[10px] md:text-[11px] font-[900] uppercase tracking-wider transition-all active:scale-[0.97] flex items-center justify-center gap-2 hover:bg-[#047857] border border-[#059669] shadow-sm shadow-emerald-900/5 group/btn whitespace-nowrap cursor-pointer"
                >
                  <Plus size={12} className="transition-transform group-hover/btn:rotate-90" strokeWidth={3} />
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
