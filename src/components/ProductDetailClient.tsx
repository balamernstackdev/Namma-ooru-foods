'use client';

import React, { useState, useEffect } from 'react';
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
   TrendingUp
} from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';
import { useToast } from '@/context/ToastContext';
import ProductCard from '@/components/ProductCard';
import { motion, AnimatePresence } from 'framer-motion';
import useSWR from 'swr';
import { API_URL } from '@/lib/api';
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
   const [quantity, setQuantity] = useState(1);
   const [currentImageIndex, setCurrentImageIndex] = useState(0);
   const { addToCart } = useCartStore();
   const { addToast } = useToast();

   const currentPrice = Number(selectedVariant?.price || product.price || 0);
   const originalPrice = currentPrice + (product.originalPrice ? Number(product.originalPrice) - Number(product.price || 0) : 99);
   const savings = originalPrice - currentPrice;

   // Sync selected variant if live data changes
   useEffect(() => {
      if (product.variants && product.variants.length > 0) {
         const exists = product.variants.find((v: any) => v.name === selectedVariant.name);
         if (!exists) setSelectedVariant(product.variants[0]);
      }
   }, [product, selectedVariant.name]);

   // Always include main product.image first, then append gallery images (deduplicated)
   const mainImage = product.image || null;
   const additionalImages = (product.images && product.images.length > 0)
      ? product.images.map((img: any) => img.url)
      : [];
   const galleryImages = [mainImage, ...additionalImages]
      .filter((url): url is string => Boolean(url))
      .filter((url, idx, arr) => arr.indexOf(url) === idx); // deduplicate

   // Mock data for Trust Signals & Features
   const trustSignals = [
      { icon: Leaf, label: '100% Natural' },
      { icon: Zap, label: 'No Chemicals' },
      { icon: ShieldCheck, label: 'Trusted Brand' },
      { icon: CheckCircle2, label: 'Verified Harvest' }
   ];

   const highlights = [
      'Chemical-free processing',
      'Traditional heritage recipe',
      'Farm-sourced ingredients',
      'Small batch pure extraction',
      'Sustainable agrarian cluster'
   ];

   const handleAddToCartAction = () => {
      addToCart({
         productId: product.id,
         name: product.name,
         price: Number(selectedVariant.price),
         quantity: quantity,
         image: product.image,
         variant: selectedVariant.name
      });
      addToast('Added to cart ✔', product.name);
   };

   return (
      <div className="w-full min-h-screen bg-slate-50 selection:bg-amber-100">
         {/* BREADCRUMB */}
         <div className="bg-white border-b border-slate-100 hidden md:block">
            <div className="standard-container py-4 flex items-center gap-3 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
               <Link href="/" className="hover:text-emerald-900 transition-colors">Home</Link>
               <ChevronRight size={12} />
               <Link href="/products" className="hover:text-emerald-900 transition-colors">Collections</Link>
               <ChevronRight size={12} />
               <span className="text-emerald-950 font-black">{product.name}</span>
            </div>
         </div>

         {/* MAIN PRODUCT SECTION */}
         <section className="bg-white md:bg-transparent pb-12 md:py-16">
            <div className="standard-container grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-start">
               
               {/* LEFT: MEDIA GALLERY (6 Cols) */}
               <div className="lg:col-span-6 flex flex-col gap-4 md:gap-6 lg:max-w-[600px] mx-auto w-full">
                  <div className="bg-white md:rounded-[2.5rem] md:border border-slate-100 md:shadow-md overflow-hidden relative group aspect-square md:aspect-[4/3] max-h-[400px] md:max-h-[600px] w-full max-w-[400px] md:max-w-none mx-auto rounded-[2rem]">
                     <AnimatePresence mode="wait">
                        <motion.img
                           key={currentImageIndex}
                           src={galleryImages[currentImageIndex]}
                           initial={{ opacity: 0 }}
                           animate={{ opacity: 1 }}
                           exit={{ opacity: 0 }}
                           transition={{ duration: 0.3 }}
                           className="w-full h-full object-cover cursor-zoom-in"
                           alt={product.name}
                        />
                     </AnimatePresence>

                     {/* BADGES */}
                     <div className="absolute top-6 left-6 flex flex-col gap-3">
                        <div className="bg-emerald-950/90 backdrop-blur-md text-white text-[9px] font-black px-4 py-2 rounded-full uppercase tracking-[0.2em] flex items-center gap-2">
                           <TrendingUp size={12} className="text-amber-400" /> Selling Fast
                        </div>
                     </div>
                  </div>

                  {/* THUMBNAILS */}
                  <div className="flex gap-4 px-4 md:px-0 overflow-x-auto pb-4 scrollbar-hide">
                     {galleryImages.map((img: string, idx: number) => (
                        <button
                           key={idx}
                           onClick={() => setCurrentImageIndex(idx)}
                           className={`h-24 w-24 rounded-2xl overflow-hidden border-2 flex-shrink-0 transition-all ${
                              currentImageIndex === idx ? 'border-emerald-950 scale-95 shadow-lg' : 'border-slate-100 opacity-60 hover:opacity-100'
                           }`}
                        >
                           <img src={img} className="h-full w-full object-cover" alt="" />
                        </button>
                     ))}
                  </div>
               </div>

               {/* RIGHT: DESCRIPTOR & CTAS (6 Cols) */}
               <div className="lg:col-span-6 flex flex-col gap-8 px-5 md:px-0">
                  <div className="space-y-4">
                     <div className="flex items-center gap-4">
                        <Link href="/brands" className="text-[12px] font-black text-amber-500 uppercase tracking-[0.3em] hover:opacity-80 transition-opacity">
                           {product.brand?.name || 'Heritage Collection'}
                        </Link>
                        <div className="h-4 w-[1px] bg-slate-200" />
                        <div className="flex items-center gap-1">
                           <Star size={14} className="fill-amber-400 text-amber-400" />
                           <span className="text-[12px] font-black text-emerald-950">4.9/5</span>
                        </div>
                     </div>
                     <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-emerald-950 tracking-tighter leading-[1.05]">
                        {product.name}
                     </h1>
                     <p className="text-base md:text-lg text-slate-500 font-medium leading-relaxed">
                        {product.description || 'Authentic Hand-Picked Organic Harvest'}
                     </p>
                  </div>

                  {/* PRICING BLOCK */}
                  <div className="bg-slate-50/50 rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-8 space-y-6 md:space-y-8 border border-slate-100">
                     <div className="flex items-center gap-4">
                        <div className="flex flex-col">
                           <div className="flex items-baseline gap-2 md:gap-3">
                              <span className="text-3xl md:text-4xl font-black text-emerald-950 tracking-tighter">₹{currentPrice}</span>
                              <span className="text-base md:text-lg text-slate-300 line-through font-bold opacity-60">₹{originalPrice}</span>
                           </div>
                           <span className="text-[9px] md:text-[10px] font-black text-emerald-600 uppercase tracking-widest mt-1">Inclusive of all taxes</span>
                        </div>
                        {savings > 0 && (
                           <div className="bg-emerald-50 text-emerald-600 px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest shadow-sm">
                              Save ₹{savings}
                           </div>
                        )}
                     </div>

                     {/* VARIANT BUTTONS */}
                     <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Select Size</label>
                        <div className="flex flex-wrap gap-3">
                           {(product.variants?.length ? product.variants : [{name: 'Standard', price: product.price}]).map((v: any) => (
                              <button
                                 key={v.name}
                                 onClick={() => setSelectedVariant(v)}
                                 className={`px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.5em] transition-all border-2 ${
                                    selectedVariant.name === v.name
                                       ? 'bg-emerald-950 border-emerald-950 text-white shadow-xl scale-105'
                                       : 'bg-white border-slate-100 text-slate-400 hover:border-emerald-200'
                                 }`}
                              >
                                 {v.name}
                              </button>
                           ))}
                        </div>
                     </div>

                     {/* QUANTITY & PRIMARY CTA */}
                     <div className="flex flex-col gap-4">
                        <div className="flex flex-col sm:flex-row items-center gap-4">
                           <div className="flex items-center bg-white border border-slate-100 rounded-2xl p-1.5 h-16 w-full sm:w-36">
                              <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="h-full w-full flex items-center justify-center text-slate-400 hover:text-emerald-950 transition-colors">
                                 <Minus size={18} strokeWidth={3} />
                              </button>
                              <span className="w-12 text-center font-black text-lg text-emerald-950">{quantity}</span>
                              <button onClick={() => setQuantity(quantity + 1)} className="h-full w-full flex items-center justify-center text-slate-400 hover:text-emerald-950 transition-colors">
                                 <Plus size={18} strokeWidth={3} />
                              </button>
                           </div>
                           <button 
                              onClick={handleAddToCartAction}
                              className="w-full sm:flex-1 h-16 rounded-2xl bg-emerald-950 text-white flex items-center justify-center gap-4 text-[11px] font-black uppercase tracking-[0.3em] shadow-premium hover:shadow-emerald-900/20 active:scale-95 transition-all group"
                           >
                              <ShoppingCart size={20} className="text-amber-400 group-hover:rotate-12 transition-transform" />
                              Add to Cart
                           </button>
                        </div>
                        <button className="w-full h-16 rounded-2xl bg-white border-2 border-slate-100 text-emerald-950 text-[11px] font-black uppercase tracking-[0.3em] hover:bg-slate-50 transition-all active:scale-95">
                           Buy it Now
                        </button>
                     </div>
                  </div>

                  {/* TRUST SIGNALS */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                     {trustSignals.map((item, i) => (
                        <div key={i} className="flex flex-col items-center gap-2 text-center p-4 bg-white rounded-2xl border border-slate-50 shadow-sm">
                           <item.icon size={20} className="text-emerald-600" />
                           <span className="text-[9px] font-black uppercase tracking-tight text-slate-400">{item.label}</span>
                        </div>
                     ))}
                  </div>

                  {/* WHY YOU LOVE IT */}
                  <div className="space-y-6">
                     <h3 className="text-[12px] font-black uppercase tracking-[0.5em] text-emerald-950 flex items-center gap-3">
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                        Why You'll Love It
                     </h3>
                     <div className="grid grid-cols-1 gap-4">
                        {highlights.map((text, i) => (
                           <div key={i} className="flex items-center gap-3 text-slate-600">
                              <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                              <span className="text-[13px] font-bold">{text}</span>
                           </div>
                        ))}
                     </div>
                  </div>
               </div>
            </div>
         </section>

         {/* NARRATIVE SECTION: HERITAGE PROMISE */}
         <section className="py-24 bg-emerald-950 text-white overflow-hidden relative flex justify-center">
            <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-900 rounded-full blur-[120px] opacity-40" />
            <div className="standard-container grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
               <div className="space-y-10">
                  <div className="flex flex-col gap-4">
                     <span className="text-amber-400 text-[10px] font-black uppercase tracking-[0.5em]">Our Promise</span>
                     <h2 className="text-4xl md:text-6xl font-black tracking-tighter leading-none italic">
                        "Traditional recipe, <span className="text-amber-400">Pure extraction.</span>"
                     </h2>
                  </div>
                  <p className="text-xl text-emerald-100/60 leading-relaxed font-medium">
                     Hand-crafted in heritage clusters, our products represent the intersection of ancient wisdom and modern quality standards. 
                     No synthetic additives, no compromise.
                  </p>
                  <div className="flex items-center gap-4 pt-6 border-t border-white/10">
                    <div className="h-14 w-14 rounded-full bg-amber-400 flex items-center justify-center text-emerald-950">
                       <Timer size={24} />
                    </div>
                    <div className="flex flex-col">
                       <span className="text-[10px] font-black uppercase tracking-widest text-amber-400">Harvest Cycle</span>
                       <span className="text-xl font-black uppercase italic">Small Batch Integrity</span>
                    </div>
                  </div>
               </div>
               <div className="relative aspect-video rounded-[3rem] overflow-hidden group shadow-2xl">
                  <img 
                     src="/ai_images/cinematic_farm_1776230966841.png" 
                     className="w-full h-full object-cover grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-1000 scale-110 group-hover:scale-100" 
                     alt="" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/80 to-transparent" />
                  <div className="absolute bottom-10 left-10 text-white">
                     <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-60">Verified Source</p>
                     <p className="text-2xl font-black italic">Heritage Agrarian Cluster</p>
                  </div>
               </div>
            </div>
         </section>

         {/* RECOMMENDED PRODUCTS */}
         <section className="py-24">
            <div className="standard-container">
               <div className="flex items-end justify-between mb-16 px-4 md:px-0">
                  <div className="space-y-3">
                     <span className="text-[11px] font-black uppercase tracking-[0.4em] text-emerald-600 block">Curated Selection</span>
                     <h2 className="text-4xl font-black text-emerald-950 tracking-tighter">Recommended for You</h2>
                  </div>
                  <Link href="/products" className="hidden md:flex h-12 px-6 rounded-2xl border border-slate-100 bg-white items-center gap-3 text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all underline decoration-amber-400 decoration-4 underline-offset-8">
                     Explore All <ChevronRight size={14} />
                  </Link>
               </div>
               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                  {allProducts.filter((p: any) => p.id !== product.id).slice(0, 4).map((p: any) => (
                     <ProductCard key={p.id} product={p} />
                  ))}
               </div>
            </div>
         </section>

         {/* MOBILE STICKY CTA */}
         <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-2xl border-t border-slate-100 p-4 pb-10 shadow-[0_-20px_50px_rgba(0,0,0,0.08)] flex items-center gap-4">
            <div className="flex flex-col">
               <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total</span>
               <span className="text-2xl font-black text-emerald-950">₹{currentPrice * quantity}</span>
            </div>
            <button 
               onClick={handleAddToCartAction}
               className="flex-1 h-14 bg-emerald-950 text-white rounded-2xl flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] shadow-xl"
            >
               <ShoppingCart size={18} /> Add to Cart
            </button>
         </div>
      </div>
   );
}
