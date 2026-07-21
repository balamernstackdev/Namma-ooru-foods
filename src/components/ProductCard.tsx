'use client';

import React from 'react';
import Link from 'next/link';
import { Star, ShoppingCart, Heart, Truck, CheckCircle2, RefreshCcw, Plus, Minus } from 'lucide-react';
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
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart, cart, updateQuantity, removeFromCart } = useCartStore();
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
  const [selectedVariant, setSelectedVariant] = React.useState(variants[0] || { name: 'Standard', price: displayPrice });

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
    <div className="group relative flex flex-col bg-white rounded-2xl border border-slate-200 transition-all duration-300 hover:shadow-[0_15px_30px_-10px_rgba(0,0,0,0.08)] overflow-hidden w-full h-full min-h-[410px] md:min-h-[480px]">

      {/* 1. IMAGE SECTION (Compact & High Density) */}
      <div className="relative w-full h-[160px] md:h-[210px] shrink-0 p-2">
        <Link href={`/products/${product.slug || product.id}`} prefetch={false} className="relative block h-full w-full overflow-hidden rounded-xl bg-slate-50">
          <OptimizedImage
            src={mainImage}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 50vw, 33vw"
            className="w-full h-full object-contain p-1 transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-black/[0.02] group-hover:bg-transparent transition-colors pointer-events-none" />
        </Link>

        {/* WISHLIST BUTTON */}
        <button
          onClick={handleWishlist}
          className={`absolute top-4 right-4 w-[34px] h-[34px] rounded-full bg-white/90 backdrop-blur-sm border border-slate-100 flex items-center justify-center shadow-sm transition-all z-10 hover:scale-110 active:scale-90 ${isFav ? 'text-rose-500' : 'text-slate-600 hover:text-rose-500'}`}
        >
          <Heart size={16} strokeWidth={2.5} className={isFav ? 'fill-rose-500' : ''} />
        </button>
      </div>

      {/* 2. PRODUCT INFO (Tight spacing for fast scanning) */}
      <div className="flex flex-col flex-1 p-3 md:p-4 pt-0 pb-4 md:pb-5 min-h-0 justify-between">
        
        <div className="text-[10px] text-gray-400 font-mono mb-1 font-medium mt-1">
          {product.productIdStr || `PROD-${product.id.toString().padStart(3, '0')}`}
        </div>

        <div className="space-y-1">
          <div className="flex items-center gap-1.5 mb-1 overflow-hidden min-w-0">
            <div className="h-5 w-5 md:h-6 md:w-6 rounded-full overflow-hidden border border-slate-100 flex-shrink-0 bg-slate-50 flex items-center justify-center relative">
              {brandLogo ? (
                <OptimizedImage
                  src={brandLogo}
                  alt={brandName}
                  fill
                  className="object-cover"
                  fallback="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"
                />
              ) : (
                <span className="text-[9px] md:text-[10px] font-black text-emerald-800">{brandName.charAt(0)}</span>
              )}
            </div>
            <div className="flex items-center gap-1 min-w-0 overflow-hidden text-[9px] md:text-[10px]">
              {brandName && (
                <span className="font-black tracking-wider uppercase text-emerald-700 truncate max-w-[110px] md:max-w-[130px]">
                  {brandName}
                </span>
              )}
              {brandName && categoryName && <span className="text-slate-300 shrink-0">•</span>}
              {categoryName && (
                <span className="font-bold tracking-wider uppercase text-slate-400 truncate">
                  {categoryName}
                </span>
              )}
            </div>
          </div>

          {/* Product Name (Fixed height box so 1-line and 2-line titles take equal height) */}
          <Link href={`/products/${product.slug || product.id}`} prefetch={false} className="block group/link h-[42px] md:h-[48px] overflow-hidden">
            <div className="flex justify-between items-start gap-2">
              <p className="text-[14px] md:text-[16px] font-bold text-[#1e293b] leading-snug line-clamp-2 tracking-tight group-hover/link:text-[#052e16] transition-colors">
                {product.name}
              </p>
              <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-mono shrink-0 mt-0.5 border border-slate-200 font-bold">
                {product.skuCode || selectedVariant?.skuCode || `SKU-${product.id.toString().padStart(3, '0')}`}
              </span>
            </div>
          </Link>

          {/* RATING & REVIEWS */}
          <div className="flex items-center gap-1.5">
            <div className="flex items-center bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">
              <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
              <span className="ml-1 text-[11px] font-black text-slate-700">{averageRating ? averageRating.toFixed(1) : '0.0'}</span>
            </div>
            <span className="text-[10px] font-medium text-slate-400">({reviewCount})</span>
          </div>
        </div>

        <div className="space-y-2 mt-auto">
          {/* PRICE HIERARCHY (Consolidated row) */}
          <div className="flex items-baseline flex-wrap gap-x-1">
            <span className="text-[18px] md:text-[22px] font-[900] text-[#0f172a] tracking-tight leading-none">
              ₹{displayPrice}
            </span>
            {displayOriginalPrice > displayPrice && (
              <span className="text-[11px] md:text-[12px] text-slate-400 line-through font-semibold opacity-80 leading-none">
                ₹{displayOriginalPrice}
              </span>
            )}
            {discountPercent > 0 && (
              <span className="text-[10px] md:text-[11px] text-emerald-600 font-black uppercase tracking-wide leading-none whitespace-nowrap">
                {discountPercent}% OFF
              </span>
            )}
          </div>

          {/* COMPACT TRUST / REGULATORY INFO (Fixed height box so all cards line up bottom buttons) */}
          <div className="flex flex-col gap-0.5 border-t border-slate-100 pt-1 h-[32px] overflow-hidden justify-center">
            {quantity > 0 || justAdded ? (
              <div className="text-[10px] text-emerald-600 font-bold flex items-center gap-1 animate-in fade-in duration-200 select-none">
                <span>✓ Added to Cart</span>
              </div>
            ) : (
              <div className="flex items-center overflow-hidden">
                <ProductBadges product={product} variant="inline" />
              </div>
            )}
          </div>

          {/* DIRECT CTA QUICK ADD / STEPPER */}
          <div className="h-11 md:h-[42px] mt-2 relative w-full" ref={containerBtnRef}>
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
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    router.push('/cart');
                  }}
                  className="absolute inset-0 w-full h-full bg-[#059669] text-slate-50 rounded-lg text-[11px] md:text-[12px] font-[900] uppercase tracking-wider transition-all active:scale-[0.97] flex items-center justify-center gap-2 hover:bg-[#047857] border border-[#059669] shadow-sm shadow-emerald-900/5 cursor-pointer whitespace-nowrap"
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
                  onClick={handleAddToCart}
                  className="absolute inset-0 w-full h-full bg-[#059669] text-slate-50 rounded-lg text-[11px] md:text-[12px] font-[900] uppercase tracking-wider transition-all active:scale-[0.97] flex items-center justify-center gap-2 hover:bg-[#047857] border border-[#059669] shadow-sm shadow-emerald-900/5 group/btn whitespace-nowrap"
                >
                  <Plus size={15} className="transition-transform group-hover/btn:rotate-90" strokeWidth={3} />
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

export default ProductCard;
