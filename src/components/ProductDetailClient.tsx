'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
   ShoppingCart,
   Heart,
   ShieldCheck,
   Truck,
   Star,
   Leaf,
   Zap,
   ChevronRight,
   ChevronLeft,
   Minus,
   Plus,
   CheckCircle2,
   Timer,
   TrendingUp,
   Tag,
   MapPin,
   RotateCcw,
   Info,
   Award,
   Play,
   Share2,
   BellRing,
   Check,
   Sparkles,
   Store,
   Package,
   ArrowRight,
   ClipboardList
} from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';
import { useToast } from '@/context/ToastContext';
import ProductCard from '@/components/ProductCard';
import ProductBadges from '@/components/ProductBadges';
import ProductReviews from '@/components/ProductReviews';
import RecommendedProductsSection from '@/components/RecommendedProductsSection';
import ComboBuilder from '@/components/ComboBuilder';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';
import useSWR from 'swr';
import { API_URL } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useWishlistStore } from '@/store/useWishlistStore';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const fetcher = (url: string) => fetch(url).then(res => res.json());

/** Strip trailing empty <p><br></p> blocks and decode &nbsp; */
const renderHtml = (html: string | null | undefined) => {
   if (!html) return '';
   return html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/(<p><br\s*\/?><\/p>\s*)+$/gi, '')
      .replace(/(<p>\s*<\/p>\s*)+$/gi, '')
      .trim();
};

interface ProductDetailClientProps {
   product: any;
   allProducts: any[];
}

export default function ProductDetailClient({ product: initialProduct, allProducts }: ProductDetailClientProps) {
   const { data: liveProduct } = useSWR(`${API_URL}/api/products/${initialProduct.id}`, fetcher, {
      fallbackData: initialProduct,
      revalidateOnFocus: true
   });
   const product = liveProduct || initialProduct;


   // Fetch Related Products
   const { data: relatedProducts, error: relatedError } = useSWR(product?.id ? `${API_URL}/api/products/${product.id}/related` : null, fetcher);

   // Fetch Product-Specific Combo Data
   const { data: comboData, error: comboError } = useSWR(
      product?.id ? `${API_URL}/api/products/${product.id}/combo` : null,
      fetcher
   );

   const getSectionTitles = () => {
      if (!relatedProducts || relatedProducts.length === 0) {
         return { subtitle: "Frequently Bought With", title: "Recommended Essentials" };
      }

      const sameVendor = relatedProducts.every((p: any) => p.subVendorId === product.subVendorId);
      if (sameVendor && product.subVendor) {
         return { subtitle: `Handcrafted by ${product.subVendor.name}`, title: "More From This Vendor" };
      }

      const sameCategory = relatedProducts.every((p: any) => p.categoryId === product.categoryId);
      if (sameCategory) {
         return { subtitle: "Related  products", title: "Similar  Products" };
      }

      return { subtitle: "Frequently Bought With", title: "Recommended Essentials" };
   };

   const { subtitle: relatedSubtitle, title: relatedTitle } = getSectionTitles();

   const [selectedVariant, setSelectedVariant] = useState(
      product.variants && product.variants.length > 0
         ? product.variants[0]
         : { name: 'Standard', price: product.price }
   );
   const [quantity, setQuantity] = useState(1);
   const [currentImageIndex, setCurrentImageIndex] = useState(0);
   const [pincode, setPincode] = useState('');
   const [isPincodeChecking, setIsPincodeChecking] = useState(false);
   const [pincodeMessage, setPincodeMessage] = useState('');

   const { addToCart } = useCartStore();
   const { addToast } = useToast();
   const router = useRouter();
   const { user } = useAuth();
   const { toggleWishlist, isInWishlist } = useWishlistStore();

   const [isMounted, setIsMounted] = useState(false);
   useEffect(() => {
      setIsMounted(true);
   }, []);

   const isFav = isMounted ? isInWishlist(product.id) : false;

   const currentPrice = Number(selectedVariant?.price || product.price || 0);
   const originalPrice = currentPrice + (product.originalPrice ? Number(product.originalPrice) - Number(product.price || 0) : 60);
   const savings = originalPrice - currentPrice;
   const discountPercent = Math.round((savings / originalPrice) * 100);

   // Ref logic for zoom
   const mainImageRef = useRef<HTMLDivElement>(null);
   const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
   const [isZoomed, setIsZoomed] = useState(false);

   const handleMouseMove = (e: React.MouseEvent) => {
      if (!mainImageRef.current) return;
      // Use requestAnimationFrame to throttle zoom calculations
      requestAnimationFrame(() => {
         if (!mainImageRef.current) return;
         const { left, top, width, height } = mainImageRef.current.getBoundingClientRect();
         const x = ((e.clientX - left) / width) * 100;
         const y = ((e.clientY - top) / height) * 100;
         setZoomPos({ x, y });
      });
   };

   useEffect(() => {
      if (product.variants && product.variants.length > 0) {
         const exists = product.variants.find((v: any) => v.name === selectedVariant.name);
         if (!exists) setSelectedVariant(product.variants[0]);
      }
   }, [product, selectedVariant.name]);

   useEffect(() => {
      window.scrollTo(0, 0);
   }, [product.id]);

   const [imageError, setImageError] = useState(false);
   const fallbackImage = '/ai_images/organic_grains_1776231059575.png';

   const galleryImages = React.useMemo(() => {
      const mainImage = product.image || null;
      const additionalImages = (product.images && product.images.length > 0)
         ? product.images.map((img: any) => img.url)
         : [];
      return [mainImage, ...additionalImages]
         .filter((url): url is string => Boolean(url))
         .filter((url, idx, arr) => arr.indexOf(url) === idx);
   }, [product.image, product.images]);

   // Dynamic placeholders for Urgency
   const stockCount = selectedVariant?.stock ?? (product.variants?.[0]?.stock || (product.id % 8) + 4);
   const isOutOfStock = stockCount === 0;

   const handleAddToCartAction = () => {
      addToCart({
         productId: product.id,
         name: product.name,
         price: Number(selectedVariant.price),
         quantity: quantity,
         image: galleryImages[0] || product.image,
         variant: selectedVariant.name,
         gstRate: product.gstRate
      });

      // Micro-animation for premium feel
      confetti({
         particleCount: 50,
         spread: 60,
         origin: { y: 0.8 },
         colors: ['#16A34A', '#f59e0b', '#065f46'],
         zIndex: 9999
      });

      // Modern Floating Toast
      toast.custom((t) => (
         <div className="flex items-center gap-4 bg-white rounded-2xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.15)] border border-slate-100 px-4 py-3 w-[360px] animate-in slide-in-from-bottom-5">
            {/* Product Image */}
            <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-slate-50 border border-slate-100 shrink-0">
               <img src={galleryImages[0] || product.image || fallbackImage} alt={product.name} className="w-full h-full object-cover" />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
               <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
                  <p className="text-sm font-semibold text-slate-900 truncate">Added to cart</p>
               </div>
               <p className="text-[11px] text-slate-500 mt-1 truncate">{product.name}</p>
            </div>

            {/* CTA */}
            <button
               onClick={() => {
                  toast.dismiss(t);
                  document.querySelector('[data-cart-drawer-trigger]')?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
               }}
               className="bg-green-600 hover:bg-green-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-colors shadow-sm shrink-0"
            >
               View Cart
            </button>
         </div>
      ), { duration: 3000 });
   };

   const handleBuyNow = () => {
      handleAddToCartAction();
      router.push('/checkout');
   };

   const handleWishlist = async () => {
      if (!user) {
         addToast('Info', 'Please sign in to update wishlist');
         router.push('/account');
         return;
      }
      const added = await toggleWishlist(Number(user.id), Number(product.id));
      addToast('Success', added ? 'Added to wishlist' : 'Removed from wishlist');
   };

   const jsonLd = {
      "@context": "https://schema.org",
      "@type": "Product",
      "name": product.name,
      "image": galleryImages[0] || fallbackImage,
      "description": product.description || product.whatIsProduct || "Premium organic product",
      "sku": `ID-VND-20${product.id}`,
      "offers": {
         "@type": "Offer",
         "priceCurrency": "INR",
         "price": currentPrice,
         "availability": isOutOfStock ? "https://schema.org/OutOfStock" : "https://schema.org/InStock"
      }
   };

   return (
      <div className="w-full min-h-screen bg-slate-50 selection:bg-amber-100 pb-20">
         <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

         {/* COMPACT BREADCRUMB */}
         <div className="bg-white hidden md:block sticky top-0 z-30">
            <div className="standard-container py-2 flex items-center gap-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
               <Link href="/" className="hover:text-emerald-900 transition-colors">Home</Link>
               <ChevronRight size={10} />
               <Link href="/products" className="hover:text-emerald-900 transition-colors">Collections</Link>
               <ChevronRight size={10} />
               <span className="text-emerald-950 font-black truncate">{product.name}</span>
            </div>
         </div>

         {/* HERO SECTION: IMAGE + BUY BOX */}
         <section className="pb-6 md:pb-8 lg:pb-8 bg-white">
            <div className="standard-container grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-start pt-2">

               {/* LEFT: DYNAMIC IMAGE GALLERY - SPAN 6 */}
               <div className="lg:col-span-6 flex flex-col md:flex-row gap-4 lg:sticky lg:top-[44px]">

                  {/* VERTICAL THUMBNAILS (Desktop) */}
                  <div className="hidden md:flex flex-col gap-2 w-[64px] shrink-0 overflow-y-auto no-scrollbar max-h-[450px]">
                     {galleryImages.map((img: string, idx: number) => (
                        <button
                           key={idx}
                           onMouseEnter={() => setCurrentImageIndex(idx)}
                           onClick={() => setCurrentImageIndex(idx)}
                           className={`w-[64px] h-[64px] rounded-xl border-2 transition-all overflow-hidden bg-white flex items-center justify-center p-1 ${currentImageIndex === idx ? 'border-emerald-900 shadow-sm ring-1 ring-emerald-900/10' : 'border-slate-100 hover:border-slate-300'
                              }`}
                        >
                           <img
                              src={img}
                              className="w-full h-full object-contain mix-blend-multiply"
                              alt=""
                              onError={(e) => { (e.target as HTMLImageElement).src = fallbackImage; }}
                           />
                        </button>
                     ))}
                  </div>

                  {/* MAIN IMAGE BOX WITH ZOOM */}
                  <div className="flex-1 relative">
                     <div
                        ref={mainImageRef}
                        onMouseEnter={() => setIsZoomed(true)}
                        onMouseLeave={() => setIsZoomed(false)}
                        onMouseMove={handleMouseMove}
                        className="relative aspect-square bg-white rounded-2xl overflow-hidden border border-slate-100 group cursor-crosshair flex items-center justify-center p-2 md:p-3"
                     >
                        <img
                           src={imageError || !galleryImages[currentImageIndex] ? fallbackImage : galleryImages[currentImageIndex]}
                           onError={() => setImageError(true)}
                           className={`w-full h-full object-contain drop-shadow-2xl transition-transform duration-200 origin-center ease-out`}
                           style={isZoomed ? {
                              transform: 'scale(2)',
                              transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`
                           } : {}}
                           alt={product.name}
                        />

                        {/* FLOATING BADGES — hidden on detail page */}
                        {/* <ProductBadges product={product} variant="floating" /> */}

                        {/* WISHLIST FLOATING */}
                        <button
                           onClick={handleWishlist}
                           className={`absolute top-4 right-4 w-9 h-9 rounded-full bg-white/90 backdrop-blur-md shadow-sm border border-slate-100 flex items-center justify-center transition-all active:scale-90 ${isFav ? 'text-rose-500' : 'text-slate-400 hover:text-rose-500'}`}
                        >
                           <Heart size={18} className={isFav ? 'fill-rose-500' : ''} />
                        </button>
                     </div>

                     {/* MOBILE DOTS / THUMBNAILS (Flex Row on Mobile) */}
                     <div className="md:hidden flex gap-2 overflow-x-auto py-3 no-scrollbar">
                        {galleryImages.map((img: string, idx: number) => (
                           <button
                              key={idx}
                              onClick={() => setCurrentImageIndex(idx)}
                              className={`w-14 h-14 shrink-0 rounded-lg border-2 transition-all overflow-hidden p-1 bg-white ${currentImageIndex === idx ? 'border-emerald-900' : 'border-slate-100'}`}
                           >
                              <img src={img} className="w-full h-full object-contain mix-blend-multiply" alt="" />
                           </button>
                        ))}
                     </div>
                  </div>
               </div>

               {/* RIGHT: HIGH-CONVERSION BUY BOX - SPAN 6 */}
               <div className="lg:col-span-6 flex flex-col gap-4 lg:pl-6">

                  {/* Combined Details & Compact Pricing Card */}
                  <div className="border border-slate-100 rounded-3xl p-5 md:p-6 bg-white shadow-sm flex flex-col gap-4">

                     {/* Brand, Share Icon, and Title */}
                     <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1">
                           <div className="flex flex-wrap items-center gap-x-2 text-[11px] md:text-[12px] font-black tracking-[0.25em] text-emerald-750 uppercase">
                              <Link href={`/artisans/${encodeURIComponent(product.subVendor?.slug || product.subVendor?.id || product.brand?.slug || product.brand?.id || '')}`} className="hover:text-emerald-950 transition-colors">
                                 {product.subVendor?.name || product.brand?.name || 'Namma Ooru Store'}
                              </Link>
                           </div>
                           <h1 className="text-[15px] sm:text-[18px] md:text-[20px] lg:text-[22px] font-black text-slate-900 tracking-tight leading-tight mt-1 flex flex-wrap items-center gap-3">
                              {product.name}
                              <span className="text-[11px] bg-white text-slate-500 px-2 py-0.5 rounded font-mono border border-slate-200 shrink-0 font-bold tracking-normal mt-1 md:mt-0 shadow-2xs">
                                 {product.productIdStr || `Prod-${product.id.toString().padStart(2, '0')}`}
                              </span>
                           </h1>
                        </div>

                        {/* COMPACT SHARE ICON BUTTON */}
                        <button
                           onClick={() => {
                              if (navigator.share) {
                                 navigator.share({
                                    title: product.name,
                                    text: product.description || product.whatIsProduct || '',
                                    url: window.location.href
                                 }).catch(err => console.log(err));
                              } else {
                                 navigator.clipboard.writeText(window.location.href);
                                 toast.success('Link copied to clipboard!');
                              }
                           }}
                           className="w-9 h-9 rounded-full bg-white hover:bg-slate-50 border border-slate-200/60 flex items-center justify-center text-slate-500 hover:text-emerald-900 transition-all hover:scale-105 active:scale-95 shadow-sm shrink-0"
                           title="Share Product"
                        >
                           <Share2 size={15} />
                        </button>
                     </div>

                     {/* Stars and Verification Badges */}
                     <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                        {Number(product.reviewCount || 0) > 0 && (
                           <div className="flex items-center gap-1 bg-amber-50 text-amber-800 text-xs font-black px-2 py-0.5 rounded-lg border border-amber-100/50">
                              <Star size={13} className="fill-amber-600 text-amber-600" />
                              <span>{product.avgRating || '0.0'}</span>
                           </div>
                        )}
                        {Number(product.reviewCount || 0) > 0 && (
                           <a href="#reviews" onClick={(e) => { e.preventDefault(); document.getElementById('reviews')?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }} className="text-slate-500 hover:text-[#0f5132] font-bold text-[12px] transition-colors">
                              {product.reviewCount} Reviews
                           </a>
                        )}
                        {Number(product.reviewCount || 0) > 0 && <span className="text-slate-300">•</span>}
                        {/* Badges hidden on detail page */}
                        <ProductBadges product={product} variant="inline" />
                     </div>

                     {/* COMPACT INTEGRATED PRICING ROW */}
                     <div className="flex items-center justify-between gap-4 flex-wrap bg-white border border-slate-100/80 rounded-2xl px-4 py-3 shadow-sm mt-1">
                        <div className="flex items-baseline gap-2.5">
                           <span className="text-2xl md:text-3xl font-[900] text-slate-900 tracking-tight leading-none">
                              ₹{currentPrice}
                           </span>
                           {originalPrice > currentPrice && (
                              <span className="text-sm text-slate-400 line-through font-semibold leading-none">
                                 ₹{originalPrice}
                              </span>
                           )}
                           {discountPercent > 0 && (
                              <span className="text-[9px] bg-[#0f5132] text-white font-black px-2 py-0.75 rounded-md uppercase tracking-wider">
                                 {discountPercent}% OFF
                              </span>
                           )}
                        </div>

                        {savings > 0 && (
                           <span className="text-[10px] text-emerald-800 font-extrabold bg-emerald-50 border border-emerald-100/50 px-2.5 py-1 rounded-lg">
                              Save ₹{savings}
                           </span>
                        )}
                     </div>
                  </div>

                  {/* 2. SHORT DESCRIPTION */}
                  {(product.description || product.whatIsProduct) && (
                     <div className="pt-0.5">
                        <p className="text-[13px] text-slate-500 leading-relaxed font-medium line-clamp-3">
                           {product.description || product.whatIsProduct}
                        </p>
                     </div>
                  )}

                  {/* 4. MODERN VARIANT SELECTOR */}
                  <div className="space-y-2 pt-0.5">
                     <div className="flex items-center justify-between">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Select Variant</label>
                     </div>
                     <div className="flex flex-wrap gap-2">
                        {(product.variants?.length ? product.variants : [{ name: 'Standard Pack', price: product.price }]).map((v: any) => {
                           const isActive = selectedVariant.name === v.name;
                           return (
                              <button
                                 key={v.name}
                                 onClick={() => setSelectedVariant(v)}
                                 className={`px-5 py-3 rounded-2xl text-[11px] font-black uppercase tracking-wider transition-all duration-300 min-w-[110px] relative overflow-hidden flex items-center justify-center border ${isActive
                                    ? 'bg-gradient-to-br from-[#0f5132] to-[#14532d] border-[#0f5132] text-white shadow-md shadow-emerald-950/20 scale-[1.03] -translate-y-0.5'
                                    : 'bg-white border-slate-200 text-slate-500 hover:border-emerald-650 hover:text-emerald-950 hover:-translate-y-0.5 hover:shadow-sm'
                                    }`}
                              >
                                 <span>{v.name}</span>
                              </button>
                           );
                        })}
                     </div>
                  </div>

                  {/* 5. TACTILE QUANTITY SELECTOR & CTA BUTTONS */}
                  <div className="flex items-center gap-3 w-full pt-2">

                     {/* Modern Rounded Glass Quantity Controller */}
                     <div className="flex items-center justify-between bg-white border border-slate-200 rounded-full p-1.5 w-[120px] shrink-0 h-[48px] shadow-sm hover:shadow-md transition-all">
                        <button
                           onClick={() => setQuantity(Math.max(1, quantity - 1))}
                           className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-[#0f5132] hover:bg-slate-100 rounded-full transition-all active:scale-95"
                           disabled={isOutOfStock}
                        >
                           <Minus size={14} strokeWidth={3} />
                        </button>
                        <span className="font-black text-[14px] text-slate-800 select-none w-6 text-center">{quantity}</span>
                        <button
                           onClick={() => setQuantity(Math.min(stockCount, quantity + 1))}
                           className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-[#0f5132] hover:bg-slate-100 rounded-full transition-all active:scale-95"
                           disabled={isOutOfStock}
                        >
                           <Plus size={14} strokeWidth={3} />
                        </button>
                     </div>

                     {isOutOfStock ? (
                        <button className="flex-1 h-[48px] rounded-full bg-slate-800 text-white flex items-center justify-center gap-2 text-[11px] font-black uppercase tracking-widest shadow-md hover:bg-slate-900 transition-all">
                           <BellRing size={16} strokeWidth={2.5} /> NOTIFY ME
                        </button>
                     ) : (
                        <div className="flex flex-1 items-center gap-2">
                           <button
                              onClick={handleAddToCartAction}
                              className="flex-1 h-[48px] rounded-full bg-gradient-to-br from-[#0f5132] to-[#14532d] text-white flex items-center justify-center gap-2 text-[11px] font-black uppercase tracking-wider transition-all hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] shadow-lg shadow-emerald-950/10 group/btn"
                           >
                              <ShoppingCart size={15} strokeWidth={2.5} className="group-hover/btn:scale-110 transition-transform" />
                              <span>ADD TO CART</span>
                           </button>

                           <button
                              onClick={handleBuyNow}
                              className="flex-1 h-[48px] rounded-full bg-gradient-to-br from-[#f59e0b] to-[#d97706] text-white flex items-center justify-center gap-1.5 text-[11px] font-black uppercase tracking-wider transition-all hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] shadow-lg shadow-amber-500/15"
                           >
                              BUY IT NOW
                           </button>
                        </div>
                     )}
                  </div>
               </div>
            </div>
         </section>

         {/* SECTION: ICON GRID HIGHLIGHTS — dynamic, hides when empty */}
         {product.productHighlights && product.productHighlights.filter((h: any) => h.isActive !== false).length > 0 && (
            <section className="py-10 bg-slate-50">
               <div className="standard-container grid grid-cols-2 md:grid-cols-4 gap-4">
                  {product.productHighlights.filter((h: any) => h.isActive !== false).map((h: any, i: number) => (
                     <div key={h.id || i} className="flex flex-col md:flex-row items-center text-center md:text-left gap-3 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow duration-300">
                        <div className="h-12 w-12 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
                           <CheckCircle2 size={24} className="text-emerald-700" />
                        </div>
                        <div>
                           <h4 className="text-[14px] font-black text-slate-900 leading-tight">{h.title}</h4>
                           <p className="text-[12px] text-slate-500 mt-0.5 font-medium leading-tight">{h.description}</p>
                        </div>
                     </div>
                  ))}
               </div>
            </section>
         )}

         {/* SECTION: COMPACT PRODUCT DETAILS & TABS */}
         <section className="py-12 bg-white">
            <div className="standard-container">
               <div className="flex flex-col lg:flex-row gap-12">
                  {/* MAIN CONTENT AREA - 8 COLUMNS */}
                  <div className="lg:w-2/3 flex flex-col gap-8">

                     {/* DESCRIPTION */}
                     <div className="prose prose-emerald max-w-none">
                        <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-4">About {product.name}</h3>
                        <div
                           className="prose prose-emerald max-w-none text-[15px] text-slate-600 leading-relaxed break-words"
                           dangerouslySetInnerHTML={{ __html: renderHtml(product.description || product.whatIsProduct) || "This product represents the rich heritage of authentic farming. Carefully sourced and packaged to deliver pure nutrition without synthesis." }}
                        />
                     </div>
                     {/* PRODUCT VIDEO (If exists) */}
                     {product.videoUrl && (
                        <div className="w-full">
                           <h3 className="text-xl font-black text-slate-900 tracking-tight mb-4 flex items-center gap-2">
                              <Play size={20} className="text-rose-500 fill-rose-500" />
                              Product Walkthrough
                           </h3>
                           <div className="relative w-full aspect-video rounded-3xl overflow-hidden border border-slate-200 shadow-sm bg-black group">
                              <video
                                 src={product.videoUrl}
                                 controls
                                 className="w-full h-full object-cover"
                                 preload="metadata"
                                 poster={product.image || fallbackImage}
                              />
                           </div>
                        </div>
                     )}



                     {/* PRODUCT SPECIFICATIONS */}
                     {product.whoShouldEat && renderHtml(product.whoShouldEat).length > 0 && (
                        <div>
                           <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-6 flex items-center gap-3">
                              <ClipboardList className="text-emerald-600 w-7 h-7" />
                              Product Specifications
                           </h3>
                           <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 shadow-sm">
                              <div
                                 className="prose prose-emerald max-w-none text-[15px] text-slate-700 leading-relaxed break-words"
                                 dangerouslySetInnerHTML={{ __html: renderHtml(product.whoShouldEat) }}
                              />
                           </div>
                        </div>
                     )}

                     {/* BENEFITS */}
                     <div>
                        <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-6">Key Benefits</h3>
                        {((product.highlights && product.highlights.length > 0) || product.healthBenefits) ? (
                           <>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                 {(product.highlights || []).map((item: string, i: number) => (
                                    <div key={i} className="flex items-start gap-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
                                       <CheckCircle2 size={20} className="text-emerald-600 flex-shrink-0 mt-0.5" />
                                       <span className="text-[14px] font-bold text-slate-700">{item}</span>
                                    </div>
                                 ))}
                              </div>
                              {product.healthBenefits && (
                                 <div
                                    className="prose prose-sm prose-emerald max-w-none text-[14px] text-slate-500 mt-6 leading-relaxed break-words"
                                    dangerouslySetInnerHTML={{ __html: renderHtml(product.healthBenefits) }}
                                 />
                              )}
                           </>
                        ) : (
                           <p className="text-slate-400 italic text-sm">Nutritional and health benefit information is being updated for this batch.</p>
                        )}
                     </div>



                     {/* USAGE & STORAGE */}
                     <div className="grid grid-cols-1 gap-6">
                        <div className="space-y-4">
                           <div className="flex items-center gap-2 font-black text-emerald-900 uppercase text-[12px]">
                              <Zap size={16} /> How to Use
                           </div>
                           <div className="bg-emerald-50/50 p-5 rounded-2xl border border-emerald-100">
                              {product.howToEat ? (
                                 <div
                                    className="prose prose-sm prose-emerald max-w-none text-[14px] text-slate-700 font-medium leading-relaxed break-words"
                                    dangerouslySetInnerHTML={{ __html: renderHtml(product.howToEat) }}
                                 />
                              ) : (
                                 <p className="text-[14px] text-slate-700 font-medium leading-relaxed">Standard consumption guidance applies. Refer to packaging for specific regional instructions.</p>
                              )}
                           </div>
                        </div>
                        <div className="space-y-4">
                           <div className="flex items-center gap-2 font-black text-emerald-900 uppercase text-[12px]">
                              <ShieldCheck size={16} /> Storage Instructions
                           </div>
                           <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                              {product.storageInstructions || product.shelfLife ? (
                                 <div
                                    className="prose prose-sm prose-slate max-w-none text-[14px] text-slate-700 font-medium leading-relaxed break-words"
                                    dangerouslySetInnerHTML={{ __html: renderHtml(product.storageInstructions || product.shelfLife) }}
                                 />
                              ) : (
                                 <p className="text-[14px] text-slate-700 font-medium leading-relaxed">Store in a cool, dry, airtight environment away from excessive heat.</p>
                              )}
                           </div>
                        </div>
                     </div>

                     {/* SECTION: DYNAMIC PRODUCT-SPECIFIC COMBO BUILDER — only shown when combo products exist */}
                     {comboData?.comboProducts && comboData.comboProducts.length > 0 && (
                        <ComboBuilder
                           mainProduct={product}
                           comboData={comboData}
                           isLoading={!comboData && !comboError}
                           currentPrice={currentPrice}
                           mainProductImage={galleryImages[0] || product.image || fallbackImage}
                           fallbackImage={fallbackImage}
                           selectedVariant={selectedVariant}
                        />
                     )}

                     {/* REVIEWS */}
                     <div id="reviews" className="scroll-mt-24 pt-4">
                        <ProductReviews productId={product.id} />
                     </div>
                  </div>

                  {/* SIDEBAR / FAQ ACCORDION */}
                  <div className="lg:w-1/3 space-y-6">
                     <div className="bg-slate-50 p-6 md:p-8 rounded-3xl border border-slate-100 lg:sticky lg:top-24">
                        <h4 className="font-black text-slate-900 text-[20px] tracking-tight mb-6">
                           Frequently Asked Questions
                        </h4>

                        {product.faqs && product.faqs.length > 0 ? (
                           <div className="space-y-3">
                              {product.faqs.map((faq: any, i: number) => (
                                 <details key={i} className="group bg-white border border-slate-200 rounded-2xl overflow-hidden [&_summary::-webkit-details-marker]:hidden shadow-sm">
                                    <summary className="flex items-center justify-between p-4 cursor-pointer font-black text-[13px] text-slate-800 select-none hover:bg-slate-50 transition-colors">
                                       <span>{faq.q || faq.question}</span>
                                       <span className="transition-transform duration-300 group-open:rotate-180 text-emerald-700 shrink-0 ml-4">
                                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                                       </span>
                                    </summary>
                                    <div className="px-4 pb-4 text-[13px] text-slate-600 leading-relaxed border-t border-slate-100 pt-3 bg-white">
                                       {(faq.a || faq.answer) ? (
                                          <div
                                             className="prose prose-sm max-w-none text-[13px] text-slate-600 leading-relaxed"
                                             dangerouslySetInnerHTML={{ __html: renderHtml(faq.a || faq.answer) }}
                                          />
                                       ) : null}
                                    </div>
                                 </details>
                              ))}
                           </div>
                        ) : (
                           <div className="flex flex-col items-center justify-center py-10 px-4 bg-white/50 rounded-2xl border border-dashed border-slate-200 text-center">
                              <span className="text-2xl mb-2">📦</span>
                              <h5 className="text-sm font-black text-slate-700 uppercase tracking-wider mb-1">No FAQs Available</h5>
                              <p className="text-slate-400 font-medium text-xs">There are no questions answered for this product yet.</p>
                           </div>
                        )}
                     </div>
                  </div>
               </div>
            </div>
         </section>

         {/* SECTION: PREMIUM RECOMMENDATION ENGINE */}
         <RecommendedProductsSection
            product={product}
            relatedProducts={relatedProducts}
            isLoading={!relatedProducts && !relatedError}
            sectionTitle={relatedTitle}
            sectionSubtitle={relatedSubtitle}
            fallbackImage={fallbackImage}
         />

         {/* MOBILE FLOATING STICKY BUY BAR - ALWAYS PERSISTENT */}
         <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-2xl border-t border-slate-200 px-4 pt-3 pb-8 shadow-[0_-10px_30px_rgba(0,0,0,0.08)] flex items-center gap-3 transition-transform duration-300">
            <div className="flex flex-col shrink-0 min-w-[80px]">
               <div className="flex items-center gap-1">
                  <span className="text-[22px] font-[900] text-slate-900 tracking-tighter">₹{currentPrice}</span>
               </div>
               <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest truncate max-w-[80px]">{selectedVariant.name}</span>
            </div>
            <button
               onClick={handleAddToCartAction}
               className="flex-1 h-[50px] bg-[#059669] text-slate-50 rounded-xl flex items-center justify-center gap-2 text-[12px] font-black uppercase tracking-widest shadow-lg active:scale-[0.98] border border-[#059669]"
            >
               <ShoppingCart size={18} strokeWidth={2.5} /> ADD TO CART
            </button>
         </div>
      </div>
   );
}
