'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShoppingBag, Trash2, ArrowRight, ShieldCheck, Truck, RefreshCw, ChevronLeft, Heart, Sparkles, Tag, Check } from 'lucide-react';
import useSWR from 'swr';
import { useCartStore } from '@/store/useCartStore';
import ProductCard from '@/components/ProductCard';
import { API_URL } from '@/lib/api';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const CartPage = () => {
  const router = useRouter();
  const { cart, removeFromCart, updateQuantity, getTotal } = useCartStore();
  const total = getTotal();
  const freeShippingThreshold = 499;
  const progress = Math.min(100, (total / freeShippingThreshold) * 100);
  
  // Hypothetical calculations
  const tax = Math.round(total * 0.05); // 5% Tax
  const shipping = total >= freeShippingThreshold || total === 0 ? 0 : 40;
  const savings = Math.round(total * 0.1); // Display 10% savings mock
  const finalTotal = total + shipping;

  // Dynamic Recommendations Fetch
  const { data: prodData } = useSWR(`${API_URL}/api/products?limit=4`, fetcher);
  const recommendedProducts = prodData?.products ? prodData.products.slice(0, 4) : [];

  return (
    <div className="min-h-screen bg-[#f8f8f5] text-[#111827]">
      {/* Global Header Overlay Fix padding if needed - usually handled by layout navbar */}
      
      <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-6 md:py-12">
        
        {/* HEADER / BREADCRUMB */}
        <div className="flex flex-col gap-2 mb-6 md:mb-10">
           <nav className="flex items-center gap-2 text-[10px] font-black tracking-[0.2em] uppercase text-slate-400">
              <Link href="/" className="hover:text-[#0f5132] transition-colors">Home</Link>
              <span>/</span>
              <Link href="/products" className="hover:text-[#0f5132] transition-colors">Products</Link>
              <span>/</span>
              <span className="text-[#0f5132]">Cart</span>
           </nav>
           
           <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mt-2">
              <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-[#111827]">
                 Cart <span className="text-[#0f5132]/30 font-bold text-2xl md:text-3xl ml-2">({cart.reduce((acc,i)=>acc+i.quantity, 0)})</span>
              </h1>
              <Link href="/products" className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-[#0f5132] hover:opacity-70 transition-opacity">
                 <ChevronLeft size={16} /> Continue Shopping
              </Link>
           </div>
        </div>

        {cart.length === 0 ? (
          <div className="bg-white rounded-[32px] p-12 md:p-24 text-center border border-[#eef2f7] shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col items-center my-8">
            <div className="h-24 w-24 rounded-full bg-[#f8f8f5] flex items-center justify-center mb-8">
              <ShoppingBag className="h-10 w-10 text-slate-300" />
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-[#111827] tracking-tight mb-4">Your cart is currently empty</h2>
            <p className="text-[#6b7280] font-medium max-w-sm mx-auto mb-10 text-sm leading-relaxed">
               Discover our freshest farm picks and premium organic collections to fill up your basket!
            </p>
            <Link
              href="/products"
              className="h-[58px] px-12 rounded-[18px] flex items-center justify-center text-[12px] font-bold uppercase tracking-[0.3em] text-white shadow-lg hover:scale-105 transition-all bg-gradient-to-br from-[#0f5132] to-[#198754]"
            >
              Explore Collections
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 xl:gap-12 items-start pb-20">

            {/* LEFT SIDE: Cart Items (70% / col-span-8) */}
            <div className="lg:col-span-8 flex flex-col gap-6">
              
              {/* FREE DELIVERY MESSAGE - Optimized dense view */}
              <div className="bg-white rounded-[24px] p-5 md:p-6 border border-[#eef2f7] shadow-[0_4px_20px_rgba(0,0,0,0.02)] relative overflow-hidden">
                 <div className="absolute top-0 left-0 h-full w-1 bg-gradient-to-b from-[#0f5132] to-[#198754] opacity-50" />
                 <div className="flex items-center gap-4 mb-3">
                    <div className="h-8 w-8 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
                       <Truck className="h-4 w-4 text-[#0f5132]" />
                    </div>
                    <div className="flex-1">
                       <h4 className="text-[13px] font-bold text-[#111827]">
                          {total >= freeShippingThreshold ? 'Great news! Free Shipping is unlocked 🚀' : `Add ₹${freeShippingThreshold - total} more to qualify for FREE delivery`}
                       </h4>
                    </div>
                    <span className="text-[11px] font-black text-[#0f5132]">{progress.toFixed(0)}%</span>
                 </div>
                 <div className="h-1.5 w-full bg-[#f3f4f6] rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-[#0f5132] to-[#198754] transition-all duration-1000"
                      style={{ width: `${progress}%` }}
                    />
                 </div>
              </div>

              {/* PRODUCTS LIST */}
              <div className="flex flex-col gap-4">
                {cart.map((item) => (
                  <div
                    key={`${item.productId}-${item.variant}`}
                    className="bg-white rounded-[28px] p-5 md:p-6 border border-[#eef2f7] shadow-[0_8px_32px_rgba(0,0,0,0.04)] flex flex-row gap-5 md:gap-8 relative group transition-all hover:shadow-md"
                  >
                    {/* IMAGE */}
                    <div className="h-28 w-28 md:h-40 md:w-40 relative rounded-[22px] overflow-hidden bg-[#f8f8f5] shrink-0 border border-[#f1f5f9]">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    </div>

                    {/* INFO CONTAINER */}
                    <div className="flex-1 flex flex-col justify-between py-1">
                       
                       <div className="flex flex-col md:flex-row justify-between gap-2">
                          <div className="flex flex-col gap-1">
                             <span className="text-[9px] font-black tracking-[0.3em] text-[#d4a373] uppercase flex items-center gap-1.5">
                                <Sparkles size={10} /> Premium Harvest
                             </span>
                             <h3 className="text-lg md:text-[22px] font-black text-[#111827] leading-tight tracking-tight group-hover:text-[#0f5132] transition-colors">
                                {item.name}
                             </h3>
                             <p className="text-[11px] font-bold text-[#6b7280] uppercase tracking-wider">
                                {item.variant}
                             </p>
                             
                             {/* Delivery Status Indicator inside Card */}
                             <p className="text-[10px] font-semibold text-emerald-600 flex items-center gap-1.5 mt-2">
                                <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                                Est. Delivery tomorrow
                             </p>
                          </div>
                          
                          <div className="text-right md:text-right">
                             <span className="text-xl md:text-2xl font-black text-[#111827] tracking-tighter">
                                ₹{item.price * item.quantity}
                             </span>
                          </div>
                       </div>

                       {/* CONTROLS: FOOTER OF CARD */}
                       <div className="flex flex-wrap items-center justify-between gap-4 mt-4 md:mt-0">
                          {/* MODERN QTY CONTROLS */}
                          <div className="flex items-center bg-[#f8f8f5] backdrop-blur-md rounded-full p-1 border border-[#eef2f7] shadow-inner">
                             <button 
                                onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                                className="w-8 h-8 rounded-full flex items-center justify-center text-[#111827] font-bold hover:bg-white hover:shadow-sm transition-all"
                             >-</button>
                             <span className="w-8 text-center font-black text-[#111827] text-sm">{item.quantity}</span>
                             <button 
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                className="w-8 h-8 rounded-full flex items-center justify-center text-[#111827] font-bold hover:bg-white hover:shadow-sm transition-all"
                             >+</button>
                          </div>

                          {/* SECONDARY ACTIONS */}
                          <div className="flex items-center gap-3">
                             <button className="p-2 rounded-full hover:bg-slate-50 text-slate-300 hover:text-[#e91e63] transition-all" title="Save for Later">
                                <Heart size={18} />
                             </button>
                             <button 
                                onClick={() => removeFromCart(item.id)}
                                className="flex items-center gap-1.5 text-[10px] font-bold tracking-widest uppercase text-[#6b7280] hover:text-red-500 transition-colors px-2 py-1"
                             >
                                <Trash2 size={14} /> <span>Remove</span>
                             </button>
                          </div>
                       </div>

                    </div>
                  </div>
                ))}
              </div>

              {/* COUPON INPUT INLINE */}
              <div className="bg-white rounded-[24px] p-5 border border-[#eef2f7] shadow-sm flex items-center gap-4 group mt-2">
                 <Tag size={20} className="text-[#6b7280] group-focus-within:text-[#0f5132] transition-colors" />
                 <input 
                   type="text" 
                   placeholder="Apply Discount Code" 
                   className="flex-1 bg-transparent border-none outline-none font-bold text-sm text-[#111827] placeholder:text-slate-300"
                 />
                 <button className="text-[11px] font-black tracking-widest uppercase text-[#0f5132] bg-[#f0fdf4] px-5 py-2 rounded-full hover:bg-[#0f5132] hover:text-white transition-all">
                    Apply
                 </button>
              </div>

            </div>

            {/* RIGHT SIDE: ORDER SUMMARY (30% / col-span-4) */}
            <div className="lg:col-span-4 lg:sticky lg:top-28 flex flex-col gap-6">
               
               <div className="bg-white rounded-[28px] border border-[#eef2f7] shadow-[0_12px_40px_rgba(0,0,0,0.05)] overflow-hidden">
                  <div className="p-6 md:p-8 bg-[#fcfdfb] border-b border-[#f1f5f9]">
                     <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-[#111827]">Order Summary</h3>
                  </div>

                  <div className="p-6 md:p-8 flex flex-col gap-6">
                     
                     {/* PRICING LIST */}
                     <div className="flex flex-col gap-4 text-[13px] font-medium text-[#6b7280]">
                        <div className="flex justify-between items-center">
                           <span>Subtotal</span>
                           <span className="font-bold text-[#111827]">₹{total}</span>
                        </div>
                        
                        {/* Savings Highight */}
                        <div className="flex justify-between items-center text-[#198754]">
                           <span className="flex items-center gap-1.5"><Sparkles size={12} /> Instant Savings</span>
                           <span className="font-bold">-₹{savings}</span>
                        </div>

                        <div className="flex justify-between items-center">
                           <span>Shipping Estimate</span>
                           <span className={shipping === 0 ? 'text-[#198754] font-bold uppercase text-[10px] tracking-widest' : 'font-bold text-[#111827]'}>
                              {shipping === 0 ? 'Complimentary' : `₹${shipping}`}
                           </span>
                        </div>
                        
                        <div className="flex justify-between items-center">
                           <span>Taxes</span>
                           <span className="font-bold text-[#111827]">₹{tax}</span>
                        </div>
                     </div>

                     {/* SAVINGS NOTICE */}
                     <div className="bg-[#f0fdf4] rounded-xl p-3.5 text-center border border-[#bbf7d0]/50">
                        <span className="text-[11px] font-black text-[#198754] uppercase tracking-widest">
                           You are saving ₹{savings} on this order! 🎉
                        </span>
                     </div>

                     <div className="h-px w-full bg-[#f1f5f9]" />

                     {/* FINAL TOTAL */}
                     <div className="flex justify-between items-end py-1">
                        <div className="flex flex-col">
                           <span className="text-[11px] font-black uppercase tracking-widest text-[#111827]">Estimated Total</span>
                           <span className="text-[10px] text-[#6b7280]">Inc. all applicable fees</span>
                        </div>
                        <span className="text-4xl md:text-[42px] font-black tracking-tighter text-[#111827] leading-none">
                           ₹{finalTotal}
                        </span>
                     </div>

                     {/* CTA BUTTON */}
                     <button
                       onClick={() => router.push('/checkout')}
                       className="h-[58px] w-full bg-gradient-to-r from-[#0f5132] to-[#198754] hover:from-[#0c4128] hover:to-[#146c43] text-white rounded-[18px] shadow-xl shadow-[#0f5132]/10 transition-all active:scale-95 flex items-center justify-center gap-3 group"
                     >
                        <span className="text-[13px] font-black uppercase tracking-[0.3em]">Secure Checkout</span>
                        <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                     </button>

                     {/* DELIVERY ETA & BADGES */}
                     <div className="flex flex-col gap-3 mt-2">
                        <div className="flex items-start gap-3 p-3 rounded-xl bg-[#f8f8f5] border border-[#eef2f7]">
                           <ClockIcon className="h-5 w-5 text-[#d4a373] shrink-0 mt-0.5" />
                           <div className="flex flex-col">
                              <span className="text-[11px] font-bold text-[#111827]">Estimated Dispatch</span>
                              <span className="text-[10px] font-medium text-[#6b7280]">Ships today before 8:00 PM</span>
                           </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2 text-[9px] font-black uppercase tracking-widest text-[#6b7280]">
                           <div className="flex items-center gap-2"><Check size={12} className="text-[#198754]" /> Secure Pay</div>
                           <div className="flex items-center gap-2"><Check size={12} className="text-[#198754]" /> 100% Pure</div>
                           <div className="flex items-center gap-2"><Check size={12} className="text-[#198754]" /> Easy Return</div>
                           <div className="flex items-center gap-2"><Check size={12} className="text-[#198754]" /> Local Agri</div>
                        </div>
                     </div>

                  </div>
               </div>

            </div>

          </div>
        )}

        {/* YOU MAY ALSO LIKE / RECOMMENDATIONS */}
        {recommendedProducts.length > 0 && (
           <div className="mt-12 md:mt-20 pt-12 border-t border-[#eef2f7]">
              <div className="flex items-center justify-between mb-8">
                 <h3 className="text-2xl md:text-3xl font-black tracking-tight text-[#111827]">You May Also Like</h3>
                 <Link href="/products" className="text-[11px] font-bold text-[#0f5132] uppercase tracking-widest hover:underline">View All</Link>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                 {recommendedProducts.map((product: any) => (
                    <ProductCard key={product.id} product={product} />
                 ))}
              </div>
           </div>
        )}

      </div>

      {/* MOBILE STICKY BOTTOM CTA */}
      {cart.length > 0 && (
         <div className="lg:hidden fixed bottom-0 left-0 w-full bg-white/95 backdrop-blur-lg border-t border-[#eef2f7] z-50 p-4 flex items-center justify-between shadow-[0_-10px_30px_rgba(0,0,0,0.05)]">
            <div className="flex flex-col">
               <span className="text-[10px] font-bold text-[#6b7280] uppercase tracking-widest">Total Due</span>
               <span className="text-2xl font-black text-[#111827]">₹{finalTotal}</span>
            </div>
            <button
               onClick={() => router.push('/checkout')}
               className="h-14 px-8 bg-gradient-to-r from-[#0f5132] to-[#198754] text-white rounded-[16px] font-black text-[11px] uppercase tracking-widest shadow-lg flex items-center gap-2"
            >
               Checkout <ArrowRight size={16} />
            </button>
         </div>
      )}
      {/* Extra spacing on bottom for fixed bar overlap prevention */}
      <div className="h-20 lg:hidden" />

    </div>
  );
};

// Inline small component
const ClockIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
);

export default CartPage;
