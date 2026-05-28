'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
   Plus, Check, Leaf, ShoppingBag, Zap, Tag,
   Star, ChevronRight, Package, X, Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCartStore } from '@/store/useCartStore';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';

// ─── Types ──────────────────────────────────────────────────────────────────
interface ComboProduct {
   id: number;
   name: string;
   price: number | string;
   originalPrice?: number | string | null;
   image?: string;
   images?: { url: string }[];
   avgRating?: number | null;
   reviewCount?: number;
   subVendor?: { name: string };
   category?: { name: string };
}

interface ComboData {
   comboProducts: ComboProduct[];
   comboDiscount: number;
   isManual: boolean;
   label: string;
}

interface ComboBuilderProps {
   mainProduct: any;
   comboData: ComboData | null | undefined;
   isLoading: boolean;
   currentPrice: number;
   mainProductImage: string;
   fallbackImage: string;
   selectedVariant: { name: string };
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function ComboSkeleton() {
   return (
      <div className="mb-10 bg-white border border-slate-100 rounded-3xl p-6 md:p-8 animate-pulse">
         <div className="space-y-2 mb-6">
            <div className="h-3 bg-slate-100 rounded-full w-32" />
            <div className="h-7 bg-slate-100 rounded-full w-64" />
            <div className="h-3 bg-slate-100 rounded-full w-80" />
         </div>
         <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 flex gap-4 bg-slate-50 p-6 rounded-3xl">
               {[1, 2, 3].map(i => (
                  <React.Fragment key={i}>
                     <div className="flex-1 bg-white rounded-2xl p-4 border border-slate-100 flex flex-col items-center gap-2">
                        <div className="w-20 h-20 rounded-xl bg-slate-100" />
                        <div className="h-3 bg-slate-100 rounded-full w-full" />
                        <div className="h-3 bg-slate-100 rounded-full w-2/3" />
                        <div className="h-4 bg-slate-100 rounded-full w-1/2" />
                     </div>
                     {i < 3 && <div className="w-6 h-6 rounded-full bg-slate-100 self-center shrink-0" />}
                  </React.Fragment>
               ))}
            </div>
            <div className="lg:col-span-4 bg-slate-100 rounded-3xl h-48" />
         </div>
      </div>
   );
}

// ─── Product card in combo row ─────────────────────────────────────────────────
function ComboProductCard({
   product,
   isMain,
   isSelected,
   onToggle,
   fallbackImage,
}: {
   product: ComboProduct;
   isMain?: boolean;
   isSelected?: boolean;
   onToggle?: () => void;
   fallbackImage: string;
}) {
   const [imgErr, setImgErr] = useState(false);
   const price = Number(product.price || 0);
   const originalPrice = Number(product.originalPrice || 0);
   const discount = originalPrice > price ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;
   const img = imgErr
      ? fallbackImage
      : (product.image || product.images?.[0]?.url || fallbackImage);

   return (
      <motion.div
         layout
         initial={{ opacity: 0, scale: 0.95 }}
         animate={{ opacity: 1, scale: 1 }}
         className={`flex-1 w-full min-w-[120px] max-w-[180px] flex flex-col items-center relative
            bg-white p-4 rounded-2xl border transition-all duration-300 cursor-pointer select-none
            ${isMain
               ? 'border-emerald-500 ring-2 ring-emerald-500/10 shadow-sm'
               : isSelected
                  ? 'border-emerald-500 ring-2 ring-emerald-500/10 shadow-md'
                  : 'border-slate-200 opacity-60 hover:opacity-90 hover:border-slate-300'
            }`}
         onClick={onToggle}
      >
         {/* Badge */}
         {isMain && (
            <div className="absolute -top-2.5 left-3 bg-emerald-700 text-white text-[7px] font-black uppercase px-2 py-0.5 rounded-full tracking-widest z-10">
               This Item
            </div>
         )}
         {discount > 0 && !isMain && (
            <div className="absolute -top-2.5 right-3 bg-rose-500 text-white text-[7px] font-black uppercase px-2 py-0.5 rounded-full tracking-widest z-10">
               -{discount}%
            </div>
         )}

         {/* Check circle */}
         {!isMain && (
            <div className={`absolute top-3 right-3 w-5 h-5 rounded-full flex items-center justify-center border transition-all
               ${isSelected ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-300 bg-white'}`}
            >
               {isSelected && <Check size={10} strokeWidth={3} />}
            </div>
         )}

         {/* Image */}
         <div className="w-[72px] h-[72px] rounded-xl overflow-hidden bg-slate-50 flex items-center justify-center p-1 mb-3">
            <img
               src={img}
               alt={product.name}
               onError={() => setImgErr(true)}
               className="w-full h-full object-contain mix-blend-multiply"
            />
         </div>

         {/* Name */}
         <h4 className="text-[10px] font-black text-slate-800 text-center line-clamp-2 uppercase tracking-tight leading-tight w-full">
            {product.name}
         </h4>

         {/* Vendor */}
         <span className="text-[8px] text-slate-400 font-bold mt-0.5 truncate w-full text-center">
            {product.subVendor?.name || 'Namma Ooru Store'}
         </span>

         {/* Rating */}
         {(product.avgRating || 0) > 0 && (
            <div className="flex items-center gap-0.5 mt-1">
               <Star size={9} className="fill-amber-400 text-amber-400" />
               <span className="text-[8px] font-black text-amber-600">{product.avgRating}</span>
            </div>
         )}

         {/* Price */}
         <div className="flex items-baseline gap-1 mt-2">
            <span className="text-[13px] font-[900] text-slate-900">₹{price}</span>
            {originalPrice > price && (
               <span className="text-[9px] text-slate-400 line-through font-semibold">₹{originalPrice}</span>
            )}
         </div>
      </motion.div>
   );
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function ComboBuilder({
   mainProduct,
   comboData,
   isLoading,
   currentPrice,
   mainProductImage,
   fallbackImage,
   selectedVariant
}: ComboBuilderProps) {
   const { addToCart } = useCartStore();
   const [selectedComboIds, setSelectedComboIds] = useState<number[]>([]);

   // When comboData arrives, select all by default
   React.useEffect(() => {
      if (comboData?.comboProducts) {
         setSelectedComboIds(comboData.comboProducts.map(p => p.id));
      }
   }, [comboData]);

   const comboProducts = comboData?.comboProducts || [];
   const comboDiscount = comboData?.comboDiscount ?? 10;
   const comboLabel = comboData?.label || 'Frequently Bought Together';

   // Derived totals
   const selectedItems = comboProducts.filter(p => selectedComboIds.includes(p.id));
   const comboSubtotal = currentPrice + selectedItems.reduce((sum, p) => sum + Number(p.price), 0);
   const bundleDiscount = Math.round(comboSubtotal * (comboDiscount / 100));
   const bundlePrice = comboSubtotal - bundleDiscount;
   const totalCount = 1 + selectedItems.length;

   const handleToggle = (id: number) => {
      setSelectedComboIds(prev =>
         prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
      );
   };

   const handleAddBundle = () => {
      // Add main product at discounted price
      addToCart({
         productId: mainProduct.id,
         name: mainProduct.name,
         price: Math.round(currentPrice * (1 - comboDiscount / 100)),
         quantity: 1,
         image: mainProductImage,
         variant: selectedVariant.name
      });
      // Add selected combo products at discounted price
      selectedItems.forEach(p => {
         addToCart({
            productId: p.id,
            name: p.name,
            price: Math.round(Number(p.price) * (1 - comboDiscount / 100)),
            quantity: 1,
            image: p.image || fallbackImage,
            variant: 'Standard Pack'
         });
      });
      confetti({
         particleCount: 90,
         spread: 70,
         origin: { y: 0.8 },
         colors: ['#F59E0B', '#10B981', '#ffffff']
      });
      toast.success(`Bundle (${totalCount} items) added to cart — saving ₹${bundleDiscount}!`);
   };

   if (isLoading) return <ComboSkeleton />;
   if (!comboData || comboProducts.length === 0) return null;

   return (
      <div className="mb-10 bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-sm">
         {/* Header */}
         <div className="flex items-start justify-between mb-6 gap-4">
            <div className="space-y-1.5">
               <span className="text-[10px] font-black uppercase tracking-[3px] text-emerald-700 flex items-center gap-1.5">
                  <Leaf size={11} className="fill-emerald-700/20 text-emerald-700" />
                  {comboData.isManual ? 'Curated Bundle' : 'Organic Pairings'}
               </span>
               <h2 className="text-[22px] md:text-[26px] font-[900] text-slate-900 tracking-tighter leading-none">
                  {comboLabel}
               </h2>
               <p className="text-[11px] text-slate-400 font-medium">
                  Add matching farm-fresh selections and save{' '}
                  <span className="text-emerald-600 font-black">{comboDiscount}%</span> on the bundle.
               </p>
            </div>

            {/* Desktop: discount badge */}
            <div className="hidden md:flex shrink-0 flex-col items-center justify-center bg-emerald-50 border border-emerald-100 rounded-2xl px-4 py-3 text-center">
               <span className="text-[22px] font-[900] text-emerald-700 leading-none">{comboDiscount}%</span>
               <span className="text-[8px] font-black uppercase tracking-widest text-emerald-500 mt-0.5">Bundle Off</span>
            </div>
         </div>

         {/* Builder Grid */}
         <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">

            {/* Left: Product flow */}
            <div className="lg:col-span-8">
               <div className="bg-slate-50/60 p-5 rounded-[1.75rem] border border-slate-100 flex flex-col gap-4">
                  {/* Mobile: vertical stack | Desktop: horizontal row */}
                  <div className="flex flex-col md:flex-row items-center gap-3">
                     {/* Main product */}
                     <ComboProductCard
                        product={{
                           id: mainProduct.id,
                           name: mainProduct.name,
                           price: currentPrice,
                           originalPrice: mainProduct.originalPrice,
                           image: mainProductImage,
                           subVendor: mainProduct.subVendor,
                           avgRating: mainProduct.avgRating || mainProduct.averageRating,
                        }}
                        isMain
                        fallbackImage={fallbackImage}
                     />

                     {comboProducts.map((item, idx) => (
                        <React.Fragment key={item.id}>
                           {/* Plus connector */}
                           <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="w-7 h-7 rounded-full bg-white border border-slate-200 shadow-sm text-slate-400 flex items-center justify-center shrink-0"
                           >
                              <Plus size={13} strokeWidth={2.5} />
                           </motion.div>

                           {/* Combo product */}
                           <ComboProductCard
                              product={item}
                              isSelected={selectedComboIds.includes(item.id)}
                              onToggle={() => handleToggle(item.id)}
                              fallbackImage={fallbackImage}
                           />
                        </React.Fragment>
                     ))}
                  </div>

                  {/* Click-to-toggle hint */}
                  <p className="text-[9px] text-slate-400 font-medium text-center flex items-center justify-center gap-1">
                     <Info size={10} className="text-slate-300" />
                     Tap a product to include or exclude it from the bundle
                  </p>
               </div>
            </div>

            {/* Right: Bundle Summary */}
            <div className="lg:col-span-4 flex">
               <div className="w-full bg-gradient-to-br from-[#0f5132] to-[#14532d] rounded-[1.75rem] p-5 text-white flex flex-col justify-between shadow-xl relative overflow-hidden">
                  {/* Decorative orbs */}
                  <div className="absolute top-0 right-0 -mr-8 -mt-8 w-36 h-36 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />
                  <div className="absolute bottom-0 left-0 -ml-8 -mb-8 w-28 h-28 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

                  <div className="space-y-4 relative z-10">
                     <div className="flex items-center justify-between">
                        <span className="text-[9px] font-black uppercase tracking-[0.25em] text-emerald-300">Bundle Summary</span>
                        {comboData.isManual && (
                           <span className="text-[7px] font-black uppercase tracking-widest bg-emerald-800/50 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-700/30">
                              Curated
                           </span>
                        )}
                     </div>

                     <div className="space-y-2 border-b border-emerald-800/40 pb-4">
                        <div className="flex justify-between text-xs text-emerald-100 font-bold">
                           <span>Items Selected</span>
                           <AnimatePresence mode="wait">
                              <motion.span
                                 key={totalCount}
                                 initial={{ opacity: 0, y: -4 }}
                                 animate={{ opacity: 1, y: 0 }}
                                 exit={{ opacity: 0, y: 4 }}
                              >
                                 {totalCount} Products
                              </motion.span>
                           </AnimatePresence>
                        </div>
                        <div className="flex justify-between text-xs text-emerald-100 font-bold">
                           <span>Original Price</span>
                           <AnimatePresence mode="wait">
                              <motion.span key={comboSubtotal} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                 ₹{Math.round(comboSubtotal)}
                              </motion.span>
                           </AnimatePresence>
                        </div>
                        <div className="flex justify-between text-xs text-emerald-300 font-extrabold">
                           <span>Bundle Savings ({comboDiscount}%)</span>
                           <AnimatePresence mode="wait">
                              <motion.span key={bundleDiscount} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                 -₹{bundleDiscount}
                              </motion.span>
                           </AnimatePresence>
                        </div>
                     </div>

                     {/* Final Price */}
                     <div className="flex items-baseline justify-between">
                        <span className="text-sm font-black uppercase tracking-wider text-emerald-100">Bundle Price</span>
                        <AnimatePresence mode="wait">
                           <motion.span
                              key={bundlePrice}
                              initial={{ scale: 0.9, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              className="text-[26px] font-[900] text-amber-400 leading-none"
                           >
                              ₹{Math.round(bundlePrice)}
                           </motion.span>
                        </AnimatePresence>
                     </div>
                  </div>

                  {/* CTA Buttons */}
                  <div className="space-y-2.5 mt-5 relative z-10">
                     <button
                        disabled={selectedItems.length === 0}
                        onClick={handleAddBundle}
                        className="w-full py-3.5 bg-amber-500 hover:bg-amber-400 active:scale-95 transition-all rounded-xl text-[10px] font-black uppercase tracking-widest text-[#0f5132] shadow-lg shadow-emerald-950/30 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                     >
                        <ShoppingBag size={13} strokeWidth={2.5} />
                        Add Bundle to Cart
                     </button>
                     <Link
                        href="/products"
                        className="w-full py-2.5 bg-emerald-800/40 hover:bg-emerald-800/60 transition-all rounded-xl text-[9px] font-black uppercase tracking-widest text-emerald-200 flex items-center justify-center gap-1"
                     >
                        Browse All Products <ChevronRight size={11} />
                     </Link>
                  </div>
               </div>
            </div>
         </div>
      </div>
   );
}
