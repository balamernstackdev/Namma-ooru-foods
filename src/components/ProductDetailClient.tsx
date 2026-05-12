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
   Minus,
   Plus,
   CheckCircle2,
   Timer,
   TrendingUp,
   Tag,
   MapPin,
   RotateCcw,
   Info,
   Award
} from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';
import { useToast } from '@/context/ToastContext';
import ProductCard from '@/components/ProductCard';
import ProductReviews from '@/components/ProductReviews';
import { motion, AnimatePresence } from 'framer-motion';
import useSWR from 'swr';
import { API_URL } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useWishlistStore } from '@/store/useWishlistStore';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const fetcher = (url: string) => fetch(url).then(res => res.json());

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

   const [selectedVariant, setSelectedVariant] = useState(
      product.variants && product.variants.length > 0 
         ? product.variants[0] 
         : { name: 'Standard', price: product.price }
   );
   
   const [activeTab, setActiveTab] = useState<'description' | 'benefits' | 'usage' | 'storage' | 'reviews'>('description');
   const [quantity, setQuantity] = useState(1);
   const [currentImageIndex, setCurrentImageIndex] = useState(0);
   const [pincode, setPincode] = useState('');
   const [pincodeChecked, setPincodeChecked] = useState(false);
   
   const { addToCart } = useCartStore();
   const { addToast } = useToast();
   const router = useRouter();
   const { user } = useAuth();
   const { toggleWishlist, isInWishlist } = useWishlistStore();
   const isFav = isInWishlist(product.id);

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
      const { left, top, width, height } = mainImageRef.current.getBoundingClientRect();
      const x = ((e.clientX - left) / width) * 100;
      const y = ((e.clientY - top) / height) * 100;
      setZoomPos({ x, y });
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

   const mainImage = product.image || null;
   const additionalImages = (product.images && product.images.length > 0)
      ? product.images.map((img: any) => img.url)
      : [];
   const galleryImages = [mainImage, ...additionalImages]
      .filter((url): url is string => Boolean(url))
      .filter((url, idx, arr) => arr.indexOf(url) === idx);

   // Dynamic placeholders for Urgency & Reviews
   const stockCount = (product.id % 8) + 4;
   const ordersSold = 100 + ((product.id * 23) % 500);
   const ratingCount = 120 + ((product.id * 19) % 1200);

   const handleAddToCartAction = () => {
      addToCart({
         productId: product.id,
         name: product.name,
         price: Number(selectedVariant.price),
         quantity: quantity,
         image: galleryImages[0] || product.image,
         variant: selectedVariant.name
      });
      addToast('Success', `${product.name} added to cart`);
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
      const added = await toggleWishlist(user.id, product.id);
      addToast('Success', added ? 'Added to wishlist' : 'Removed from wishlist');
   };

   const checkDelivery = () => {
      if (pincode.length === 6) setPincodeChecked(true);
   };

   return (
      <div className="w-full min-h-screen bg-slate-50 selection:bg-amber-100 pb-20">
         
         {/* COMPACT BREADCRUMB */}
         <div className="bg-white border-b border-slate-100 hidden md:block sticky top-0 z-30 shadow-sm">
            <div className="standard-container py-3 flex items-center gap-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
               <Link href="/" className="hover:text-emerald-900 transition-colors">Home</Link>
               <ChevronRight size={10} />
               <Link href="/products" className="hover:text-emerald-900 transition-colors">Collections</Link>
               <ChevronRight size={10} />
               <span className="text-emerald-950 font-black truncate">{product.name}</span>
            </div>
         </div>

         {/* HERO SECTION: IMAGE + BUY BOX */}
         <section className="py-4 md:py-8 lg:py-10 bg-white">
            <div className="standard-container grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 items-start">
               
               {/* LEFT: DYNAMIC IMAGE GALLERY - SPAN 7 */}
               <div className="lg:col-span-7 flex flex-col md:flex-row gap-4">
                  
                  {/* VERTICAL THUMBNAILS (Desktop) */}
                  <div className="hidden md:flex flex-col gap-3 w-[80px] shrink-0 overflow-y-auto no-scrollbar max-h-[500px]">
                     {galleryImages.map((img: string, idx: number) => (
                        <button
                           key={idx}
                           onMouseEnter={() => setCurrentImageIndex(idx)}
                           onClick={() => setCurrentImageIndex(idx)}
                           className={`w-[80px] aspect-square rounded-xl border-2 transition-all overflow-hidden bg-slate-50 ${
                              currentImageIndex === idx ? 'border-emerald-900 shadow-md ring-2 ring-emerald-900/10' : 'border-slate-100 opacity-70 hover:opacity-100'
                           }`}
                        >
                           <img 
                              src={img} 
                              className="w-full h-full object-cover" 
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
                        className="relative aspect-square bg-slate-50 rounded-2xl md:rounded-3xl overflow-hidden border border-slate-100 shadow-sm group cursor-crosshair"
                     >
                        <img
                           src={imageError || !galleryImages[currentImageIndex] ? fallbackImage : galleryImages[currentImageIndex]}
                           onError={() => setImageError(true)}
                           className={`w-full h-full object-cover transition-transform duration-200 origin-center ease-out`}
                           style={isZoomed ? {
                              transform: 'scale(2)',
                              transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`
                           } : {}}
                           alt={product.name}
                        />
                        
                        {/* FLOATING BADGES */}
                        <div className="absolute top-5 left-5 pointer-events-none">
                           <div className="bg-[#052e16] backdrop-blur-md text-white text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-wider flex items-center gap-2 shadow-lg border border-white/10">
                              <TrendingUp size={12} className="text-amber-400" /> 
                              Best Seller
                           </div>
                        </div>

                        {/* WISHLIST FLOATING */}
                        <button 
                           onClick={handleWishlist}
                           className={`absolute top-5 right-5 w-10 h-10 rounded-full bg-white/90 backdrop-blur-md shadow-md flex items-center justify-center transition-all active:scale-90 ${isFav ? 'text-rose-500' : 'text-slate-500 hover:text-rose-500'}`}
                        >
                           <Heart size={20} className={isFav ? 'fill-rose-500' : ''} />
                        </button>
                     </div>

                     {/* MOBILE DOTS / THUMBNAILS (Flex Row on Mobile) */}
                     <div className="md:hidden flex gap-3 overflow-x-auto py-3 px-1 no-scrollbar">
                        {galleryImages.map((img: string, idx: number) => (
                           <button
                              key={idx}
                              onClick={() => setCurrentImageIndex(idx)}
                              className={`w-16 h-16 shrink-0 rounded-lg border-2 transition-all overflow-hidden ${currentImageIndex === idx ? 'border-emerald-900' : 'border-slate-100'}`}
                           >
                              <img src={img} className="w-full h-full object-cover" alt="" />
                           </button>
                        ))}
                     </div>
                  </div>
               </div>

               {/* RIGHT: HIGH-CONVERSION BUY BOX - SPAN 5 */}
               <div className="lg:col-span-5 flex flex-col gap-6 md:px-2 lg:sticky lg:top-28">
                  
                  {/* TITLE & RATINGS */}
                  <div className="space-y-2">
                     <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] font-bold tracking-wide text-[#052e16] uppercase">
                        <Link href={`/brands/${product.brand?.id}`} className="hover:underline">{product.brand?.name || 'Namma Orru Store'}</Link>
                        <span className="text-slate-300">•</span>
                        <span className="text-amber-600 font-black tracking-[2px] text-[11px]">Premium Quality</span>
                     </div>

                     <h1 className="text-[32px] md:text-[42px] font-[900] text-slate-900 tracking-tight leading-[1.1] drop-shadow-sm">
                        {product.name}
                     </h1>

                     <div className="flex flex-wrap items-center gap-3 pt-1">
                        <div className="flex items-center bg-amber-50 px-2 py-1 rounded-lg border border-amber-100 text-amber-700 font-bold text-[13px]">
                           <Star size={16} className="fill-amber-500 text-amber-500 mr-1.5" />
                           {product.rating || '4.8'}
                        </div>
                        <span className="h-4 w-[1px] bg-slate-200" />
                        <button onClick={() => setActiveTab('reviews')} className="text-slate-500 hover:text-emerald-700 font-medium text-[13px] underline decoration-slate-200 underline-offset-4">
                           {ratingCount} Ratings
                        </button>
                        <span className="h-4 w-[1px] bg-slate-200" />
                        <div className="text-slate-400 font-medium text-[13px]">
                           <span className="text-emerald-600 font-black">{ordersSold}+</span> Sold recently
                        </div>
                     </div>
                  </div>

                  <div className="h-[1px] w-full bg-slate-100" />

                  {/* PRICE BLOCK - DOMINANT */}
                  <div className="space-y-1">
                     <div className="flex items-baseline gap-3 flex-wrap">
                        <span className="text-[44px] font-[900] text-slate-900 tracking-[-2px] leading-none">
                           ₹{currentPrice}
                        </span>
                        <span className="text-[20px] text-slate-400 line-through font-semibold leading-none">
                           ₹{originalPrice}
                        </span>
                        {discountPercent > 0 && (
                           <div className="bg-emerald-100 text-emerald-700 text-[13px] font-extrabold px-2.5 py-1 rounded-lg tracking-wide">
                              {discountPercent}% OFF
                           </div>
                        )}
                     </div>
                     <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider pt-1">Inclusive of all taxes</p>
                  </div>

                  {/* URGENCY BADGE */}
                  <div className="flex items-center gap-2 text-[#d97706] bg-amber-50 border border-amber-100 px-3 py-2 rounded-xl w-fit animate-pulse">
                     <Timer size={16} className="font-bold" />
                     <span className="text-[13px] font-extrabold tracking-tight">Hurry! Only {stockCount} left in stock</span>
                  </div>

                  {/* OFFERS GRID (Amazon Style) */}
                  <div className="bg-slate-50/80 rounded-2xl border border-slate-100 p-4 space-y-3">
                     <div className="flex items-center gap-2 font-bold text-[12px] text-slate-800 uppercase tracking-wider">
                        <Tag size={15} className="text-orange-500" /> Available Offers
                     </div>
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div className="bg-white p-3 rounded-xl border border-slate-200/60 hover:shadow-sm transition-all">
                           <p className="text-[11px] font-black text-slate-900">Combo Offer</p>
                           <p className="text-[11px] text-slate-500 leading-tight mt-0.5">Buy 2 get extra 10% OFF applied at checkout.</p>
                        </div>
                        <div className="bg-white p-3 rounded-xl border border-slate-200/60 hover:shadow-sm transition-all">
                           <p className="text-[11px] font-black text-slate-900">Free Delivery</p>
                           <p className="text-[11px] text-slate-500 leading-tight mt-0.5">Free shipping on orders above ₹499.</p>
                        </div>
                     </div>
                  </div>

                  {/* SIZE SELECTOR - PILLS */}
                  <div className="space-y-3">
                     <div className="flex items-center justify-between">
                        <label className="text-[12px] font-black text-slate-700 uppercase tracking-widest">Select Size</label>
                        <span className="text-[11px] text-emerald-700 font-bold cursor-pointer underline decoration-dotted">Size Guide</span>
                     </div>
                     <div className="flex flex-wrap gap-2">
                        {(product.variants?.length ? product.variants : [{name: 'Standard', price: product.price}]).map((v: any) => (
                           <button
                              key={v.name}
                              onClick={() => setSelectedVariant(v)}
                              className={`px-5 py-3 rounded-2xl text-[12px] font-black uppercase tracking-wider transition-all border-2 flex items-center justify-center min-w-[80px] ${
                                 selectedVariant.name === v.name
                                    ? 'bg-[#052e16] border-[#052e16] text-white shadow-lg shadow-emerald-900/20 ring-2 ring-offset-2 ring-emerald-900 scale-[1.02]'
                                    : 'bg-white border-slate-200 text-slate-500 hover:border-emerald-300 hover:text-emerald-800'
                              }`}
                           >
                              {v.name}
                           </button>
                        ))}
                     </div>
                  </div>

                  {/* QUANTITY & CTAS ROW */}
                  <div className="space-y-3 pt-2">
                     <div className="flex flex-col md:flex-row gap-3 items-stretch">
                        {/* Stepper */}
                        <div className="flex items-center justify-between bg-white border border-slate-200 rounded-xl p-1 w-full md:w-[130px] shrink-0 h-[56px]">
                           <button 
                              onClick={() => setQuantity(Math.max(1, quantity - 1))}
                              className="h-full px-3 flex items-center justify-center text-slate-400 hover:text-emerald-900 hover:bg-slate-50 rounded-lg transition-colors"
                           >
                              <Minus size={18} strokeWidth={3} />
                           </button>
                           <span className="font-black text-lg text-slate-800 select-none">{quantity}</span>
                           <button 
                              onClick={() => setQuantity(quantity + 1)}
                              className="h-full px-3 flex items-center justify-center text-slate-400 hover:text-emerald-900 hover:bg-slate-50 rounded-lg transition-colors"
                           >
                              <Plus size={18} strokeWidth={3} />
                           </button>
                        </div>

                        {/* Add to Cart */}
                        <button 
                           onClick={handleAddToCartAction}
                           className="flex-1 h-[56px] rounded-xl bg-[#052e16] text-white flex items-center justify-center gap-3 text-[14px] font-bold uppercase tracking-widest shadow-xl shadow-emerald-950/10 hover:bg-[#064e3b] active:scale-[0.98] transition-all"
                        >
                           <ShoppingCart size={20} strokeWidth={2.5} />
                           Add to Cart
                        </button>
                     </div>

                     {/* Buy Now */}
                     <button 
                        onClick={handleBuyNow}
                        className="w-full h-[56px] rounded-xl bg-[#f59e0b] text-white flex items-center justify-center gap-2 text-[14px] font-bold uppercase tracking-widest shadow-lg shadow-amber-500/20 hover:bg-amber-600 active:scale-[0.98] transition-all"
                     >
                        Buy It Now
                     </button>
                  </div>

                  {/* DELIVERY CHECKER SECTION */}
                  <div className="border border-slate-200 rounded-2xl p-4 space-y-3 bg-white">
                     <div className="flex items-center gap-2 font-bold text-[13px] text-slate-800">
                        <Truck size={18} className="text-emerald-700" /> Delivery & Services
                     </div>
                     <div className="relative flex items-center group">
                        <MapPin size={16} className="absolute left-3 text-slate-400 pointer-events-none" />
                        <input 
                           type="text" 
                           placeholder="Enter delivery pincode"
                           maxLength={6}
                           value={pincode}
                           onChange={(e) => setPincode(e.target.value.replace(/\D/g,''))}
                           className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-16 text-sm font-bold text-slate-900 focus:outline-none focus:border-emerald-900 focus:bg-white transition-all"
                        />
                        <button 
                           onClick={checkDelivery}
                           className="absolute right-2 text-emerald-800 text-[12px] font-black uppercase tracking-wide px-2 hover:opacity-70"
                        >
                           Check
                        </button>
                     </div>
                     
                     <div className="space-y-2 pt-1">
                        <div className="flex items-start gap-2.5 text-[13px] text-slate-700">
                           <CheckCircle2 size={16} className="text-emerald-600 mt-0.5 flex-shrink-0" />
                           <div>
                              <span className="font-bold">FREE Delivery {pincodeChecked ? 'tomorrow' : 'in 2-3 days'}</span>
                              <p className="text-slate-400 text-[11px]">On orders above ₹499</p>
                           </div>
                        </div>
                        <div className="flex items-start gap-2.5 text-[13px] text-slate-700">
                           <RotateCcw size={16} className="text-emerald-600 mt-0.5 flex-shrink-0" />
                           <div>
                              <span className="font-bold">7 Days Replacement</span>
                              <p className="text-slate-400 text-[11px]">Hassle-free returns</p>
                           </div>
                        </div>
                     </div>
                  </div>

                  {/* COMPACT TRUST LIST INLINE */}
                  <div className="grid grid-cols-3 gap-2 pt-2">
                     {[
                        { icon: ShieldCheck, label: '100% Safe' },
                        { icon: Award, label: 'Authentic' },
                        { icon: Leaf, label: 'Pure' },
                     ].map((t, i) => (
                        <div key={i} className="flex flex-col items-center text-center p-2 bg-slate-50 rounded-xl border border-slate-100">
                           <t.icon size={18} className="text-slate-500 mb-1" />
                           <span className="text-[9px] font-black uppercase tracking-wider text-slate-500">{t.label}</span>
                        </div>
                     ))}
                  </div>
               </div>
            </div>
         </section>

         {/* SECTION: ICON GRID HIGHLIGHTS */}
         <section className="py-10 bg-slate-50">
            <div className="standard-container grid grid-cols-2 md:grid-cols-4 gap-4">
               {[
                  { icon: Leaf, title: '100% Organic', desc: 'Zero chemicals & pesticides' },
                  { icon: ShieldCheck, title: 'Strict Quality', desc: 'Passed rigorous tests' },
                  { icon: Timer, title: 'Fresh Harvest', desc: 'Direct from agrarian clusters' },
                  { icon: CheckCircle2, title: 'Native Breed', desc: 'Traditional heritage lineage' },
               ].map((h, i) => (
                  <div key={i} className="flex flex-col md:flex-row items-center text-center md:text-left gap-3 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow duration-300">
                     <div className="h-12 w-12 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
                        <h.icon size={24} className="text-emerald-700" />
                     </div>
                     <div>
                        <h4 className="text-[14px] font-black text-slate-900 leading-tight">{h.title}</h4>
                        <p className="text-[12px] text-slate-500 mt-0.5 font-medium leading-tight">{h.desc}</p>
                     </div>
                  </div>
               ))}
            </div>
         </section>

         {/* SECTION: COMPACT PRODUCT DETAILS & TABS */}
         <section className="py-12 bg-white">
            <div className="standard-container">
               <div className="flex flex-col lg:flex-row gap-12">
                  {/* MAIN TABS AREA - 8 COLUMNS */}
                  <div className="lg:w-2/3">
                     {/* Tab Handles */}
                     <div className="flex gap-6 md:gap-10 border-b border-slate-100 overflow-x-auto no-scrollbar">
                        {[
                           { id: 'description', label: 'Description' },
                           { id: 'benefits', label: 'Benefits' },
                           { id: 'usage', label: 'Usage & Storage' },
                           { id: 'reviews', label: 'Reviews' },
                        ].map((tab) => (
                           <button
                              key={tab.id}
                              onClick={() => setActiveTab(tab.id as any)}
                              className={`pb-4 text-[13px] md:text-[14px] font-bold uppercase tracking-widest whitespace-nowrap relative transition-all ${
                                 activeTab === tab.id ? 'text-emerald-900' : 'text-slate-400 hover:text-slate-600'
                              }`}
                           >
                              {tab.label}
                              {activeTab === tab.id && (
                                 <motion.div layoutId="activeTabUnderline" className="absolute bottom-[-1px] left-0 right-0 h-[3px] bg-emerald-900 rounded-full" />
                              )}
                           </button>
                        ))}
                     </div>

                     {/* Tab Content */}
                     <div className="py-8 min-h-[250px]">
                        <AnimatePresence mode="wait">
                           <motion.div
                              key={activeTab}
                              initial={{ opacity: 0, y: 5 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -5 }}
                              transition={{ duration: 0.2 }}
                           >
                              {activeTab === 'description' && (
                                 <div className="prose prose-emerald max-w-none">
                                    <h3 className="text-xl font-black text-slate-900 tracking-tight mb-4">About {product.name}</h3>
                                    <p className="text-[15px] text-slate-600 leading-relaxed whitespace-pre-wrap">
                                       {product.description || product.whatIsProduct || "This product represents the rich heritage of authentic farming. Carefully sourced and packaged to deliver pure nutrition without synthesis."}
                                    </p>
                                 </div>
                              )}
                              {activeTab === 'benefits' && (
                                 <div>
                                    <h3 className="text-xl font-black text-slate-900 tracking-tight mb-6">Key Benefits</h3>
                                    {((product.highlights && product.highlights.length > 0) || product.healthBenefits) ? (
                                       <>
                                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                             {(product.highlights || []).map((item: string, i: number) => (
                                                <div key={i} className="flex items-start gap-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
                                                   <CheckCircle2 size={20} className="text-emerald-600 flex-shrink-0 mt-0.5" />
                                                   <span className="text-[14px] font-bold text-slate-700">{item}</span>
                                                </div>
                                             ))}
                                          </div>
                                          {product.healthBenefits && (
                                             <p className="text-[14px] text-slate-500 mt-6 leading-relaxed">
                                                {product.healthBenefits}
                                             </p>
                                          )}
                                       </>
                                    ) : (
                                       <p className="text-slate-400 italic text-sm">Nutritional and health benefit information is being updated for this batch.</p>
                                    )}
                                 </div>
                              )}
                              {activeTab === 'usage' && (
                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-4">
                                       <div className="flex items-center gap-2 font-black text-emerald-900 uppercase text-[12px]">
                                          <Zap size={16} /> How to Use
                                       </div>
                                       <div className="bg-emerald-50/50 p-5 rounded-2xl border border-emerald-100 h-full">
                                          <p className="text-[14px] text-slate-700 font-medium leading-relaxed">{product.howToEat || "Standard consumption guidance applies. Refer to packaging for specific regional instructions."}</p>
                                       </div>
                                    </div>
                                    <div className="space-y-4">
                                       <div className="flex items-center gap-2 font-black text-emerald-900 uppercase text-[12px]">
                                          <ShieldCheck size={16} /> Storage Instructions
                                       </div>
                                       <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 h-full">
                                          <p className="text-[14px] text-slate-700 font-medium leading-relaxed">{product.storageInstructions || product.shelfLife || "Store in a cool, dry, airtight environment away from excessive heat."}</p>
                                       </div>
                                    </div>
                                 </div>
                              )}
                              {activeTab === 'reviews' && (
                                 <div className="!-mt-16">
                                    <ProductReviews productId={product.id} />
                                 </div>
                              )}
                           </motion.div>
                        </AnimatePresence>
                     </div>
                  </div>

                  {/* SIDEBAR: WHY BUY FROM US (High Trust Widget) - 4 COLUMNS */}
                  <div className="lg:w-1/3 space-y-6">
                     <div className="bg-slate-50 rounded-[2rem] p-6 border border-slate-100 shadow-inner">
                        <h4 className="text-[14px] font-black uppercase tracking-[2px] text-slate-900 mb-5 flex items-center gap-2">
                           <Award className="text-amber-500" size={18} /> Product Guide
                        </h4>
                        <div className="space-y-5">
                           {(product.faqs && product.faqs.length > 0) ? (
                              product.faqs.slice(0, 3).map((faq: any, i: number) => (
                                 <div key={i} className="space-y-1">
                                    <p className="text-[13px] font-black text-slate-900 flex gap-2"><span className="text-emerald-600">Q.</span> {faq.question || faq.q}</p>
                                    <p className="text-[12px] text-slate-500 leading-relaxed font-medium ml-5">{faq.answer || faq.a}</p>
                                 </div>
                              ))
                           ) : (
                              <>
                                 <div className="space-y-1">
                                    <p className="text-[13px] font-black text-slate-900 flex gap-2"><span className="text-emerald-600">Q.</span> 100% Organic?</p>
                                    <p className="text-[12px] text-slate-500 leading-relaxed font-medium ml-5">Yes, verified direct harvest.</p>
                                 </div>
                                 {product.whyChoose && (
                                    <div className="space-y-1">
                                       <p className="text-[13px] font-black text-slate-900 flex gap-2"><span className="text-emerald-600">Q.</span> Why choose this?</p>
                                       <p className="text-[12px] text-slate-500 leading-relaxed font-medium ml-5">{product.whyChoose}</p>
                                    </div>
                                 )}
                              </>
                           )}
                        </div>
                     </div>
                     
                     {/* Small Promo banner inside PD container */}
                     <div className="bg-gradient-to-br from-emerald-900 to-[#022c22] text-white rounded-[2rem] p-6 relative overflow-hidden shadow-xl shadow-emerald-950/10">
                        <div className="absolute right-[-20px] top-[-20px] w-32 h-32 bg-emerald-800 rounded-full opacity-50 blur-xl"></div>
                        <div className="relative z-10 flex flex-col gap-2">
                           <span className="text-[9px] font-black uppercase tracking-[3px] text-amber-400">Subscription</span>
                           <h4 className="text-xl font-black tracking-tight leading-none">Subscribe & Save 10%</h4>
                           <p className="text-[11px] opacity-70">Never run out of daily essentials. Available on our forthcoming App.</p>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         </section>

         {/* SECTION: RELATED PRODUCTS */}
         <section className="py-16 bg-slate-50/50 border-t border-slate-100">
            <div className="standard-container">
               <div className="flex items-end justify-between mb-10">
                  <div className="space-y-1">
                     <span className="text-[11px] font-black uppercase tracking-[3px] text-emerald-700">Frequently Bought With</span>
                     <h2 className="text-[28px] md:text-[36px] font-[900] text-slate-900 tracking-tighter">Recommended Essentials</h2>
                  </div>
                  <Link href="/products" className="hidden md:flex h-11 px-5 rounded-xl border border-slate-200 bg-white items-center gap-2 text-[11px] font-black uppercase tracking-widest hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm">
                     View All <ChevronRight size={14} />
                  </Link>
               </div>
               
               <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-[28px]">
                  {(Array.isArray(allProducts) ? allProducts : []).filter((p: any) => p.id !== product.id).slice(0, 4).map((p: any) => (
                     <ProductCard key={p.id} product={p} />
                  ))}
               </div>
            </div>
         </section>

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
               className="flex-1 h-[50px] bg-[#052e16] text-white rounded-xl flex items-center justify-center gap-2 text-[12px] font-bold uppercase tracking-widest shadow-lg active:scale-[0.98]"
            >
               <ShoppingCart size={18} /> Add to Cart
            </button>
         </div>
      </div>
   );
}
