'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShoppingBag, Trash2, ArrowRight, ShieldCheck, Truck, RefreshCw, ChevronLeft, Heart, Sparkles, Tag, Check, X, Loader2 } from 'lucide-react';
import useSWR from 'swr';
import { useCartStore } from '@/store/useCartStore';
import ProductCard from '@/components/ProductCard';
import { API_URL } from '@/lib/api';
import OptimizedImage from '@/components/ui/OptimizedImage';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';

const BundleItemCard = ({ item, removeFromCart, updateQuantity }: { item: any, removeFromCart: any, updateQuantity: any }) => {
   const [isExpanded, setIsExpanded] = useState(false);
   const savings = (item.originalPrice || 0) - item.price;
   const numItems = item.bundleItems?.length || 0;

   return (
      <div className="bg-emerald-50/30 rounded-[20px] p-4 md:p-5 border border-emerald-100 flex flex-col relative group transition-all mb-4">
         <div className="flex flex-row gap-4">
            {/* IMAGE */}
            <div className="h-24 w-24 md:h-28 md:w-28 relative rounded-2xl overflow-hidden bg-white shrink-0 border border-emerald-100 p-1 flex items-center justify-center">
               <OptimizedImage
                  src={item.image}
                  alt={item.name}
                  fill
                  className="object-contain transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 768px) 96px, 112px"
               />
            </div>

            {/* INFO CONTAINER */}
            <div className="flex-1 flex flex-col justify-between">
               <div className="flex justify-between items-start gap-2">
                  <div className="flex flex-col gap-0.5">
                     <h3 className="text-[15px] md:text-[17px] font-black text-emerald-900 leading-tight pr-4">
                        {item.name}
                     </h3>
                     <p className="text-[12px] font-bold text-emerald-600 mt-0.5 flex items-center gap-1 cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
                        {numItems} Products Included
                        <span className="text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded">{isExpanded ? 'Hide' : 'View'}</span>
                     </p>
                     <div className="flex items-center gap-1.5 mt-2 text-[9px] md:text-[10px] font-black uppercase tracking-wider text-emerald-600 bg-emerald-50 w-fit px-2.5 py-0.5 rounded border border-emerald-200/60">
                        Bundle Savings: ₹{savings}
                     </div>
                  </div>
                  <div className="text-right shrink-0">
                     <span className="text-[16px] md:text-[18px] font-black text-slate-800 block">
                        ₹{item.price * item.quantity}
                     </span>
                     {item.quantity > 1 && (
                        <span className="text-[11px] font-medium text-slate-400 mt-1 block">
                           (₹{item.price} each)
                        </span>
                     )}
                  </div>
               </div>

               {/* CONTROLS */}
               <div className="flex flex-wrap items-center justify-between mt-4 border-t border-emerald-100/50 pt-3 gap-y-3">
                  <div className="flex items-center gap-2.5">
                     <button
                        onClick={() => removeFromCart(item.id)}
                        className="h-10 px-4 rounded-xl border border-slate-200 hover:border-red-200 text-slate-600 hover:text-red-600 hover:bg-red-50/50 transition-all text-[11px] font-black uppercase tracking-wider flex items-center gap-1.5 active:scale-95 bg-white"
                     >
                        <Trash2 size={13} /> Remove Bundle
                     </button>
                  </div>

                  {/* MODERN QTY PILL */}
                  <div className="flex items-center bg-white rounded-full p-0.5 border border-slate-200 shadow-sm h-[34px]">
                     <button onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))} className="w-9 h-full flex items-center justify-center text-slate-600 hover:bg-slate-50 hover:text-emerald-600 rounded-l-full transition-colors font-black text-[15px]">-</button>
                     <span className="w-8 text-center font-black text-slate-800 text-[13px]">{item.quantity}</span>
                     <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-9 h-full flex items-center justify-center text-slate-600 hover:bg-slate-50 hover:text-emerald-600 rounded-r-full transition-colors font-black text-[15px]">+</button>
                  </div>
               </div>
            </div>
         </div>

         {/* EXPANDABLE BUNDLE ITEMS */}
         {isExpanded && item.bundleItems && (
            <div className="mt-4 pt-4 border-t border-emerald-100 flex flex-col gap-2">
               {item.bundleItems.map((bi: any, idx: number) => (
                  <div key={idx} className="flex items-center gap-3 bg-white/50 p-2 rounded-lg">
                     <div className="h-10 w-10 relative rounded-md overflow-hidden bg-white shrink-0 border border-slate-100 p-0.5 flex items-center justify-center">
                        <OptimizedImage
                           src={bi.image}
                           alt={bi.name}
                           fill
                           className="object-contain"
                           sizes="40px"
                        />
                     </div>
                     <div className="flex flex-col flex-1">
                        <span className="text-[12px] font-bold text-slate-700 leading-tight">{bi.name}</span>
                     </div>
                     <span className="text-[11px] font-bold text-slate-500">₹{bi.price}</span>
                  </div>
               ))}
            </div>
         )}
      </div>
   );
};

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const CartPage = () => {
   const router = useRouter();
   const { cart, removeFromCart, updateQuantity, getTotal } = useCartStore();
   const { user } = useAuth();
   const total = getTotal();

   // Dynamic settings fetch
   const { data: settingsData } = useSWR(`${API_URL}/api/settings`, fetcher);

   const getSettingVal = (key: string, fallback: string) => {
      if (!settingsData || !Array.isArray(settingsData)) return fallback;
      const found = settingsData.find((s: any) => s.key === key);
      return found ? found.value : fallback;
   };

   const freeShippingThreshold = parseFloat(getSettingVal('free_shipping_threshold', '499'));
   const flatDeliveryFee = parseFloat(getSettingVal('delivery_fee', '49'));
   const progress = Math.min(100, (total / freeShippingThreshold) * 100);

   // Coupon state
   const [couponCode, setCouponCode] = useState('');
   const [couponDiscount, setCouponDiscount] = useState(0);
   const [couponMessage, setCouponMessage] = useState('');
   const [couponApplied, setCouponApplied] = useState(false);
   const [couponLoading, setCouponLoading] = useState(false);
   const [couponError, setCouponError] = useState('');

   const handleApplyCoupon = async () => {
      const code = couponCode.trim().toUpperCase();
      if (!code) { toast.error('Please enter a coupon code'); return; }

      setCouponLoading(true);
      setCouponError('');
      setCouponMessage('');

      try {
         const cartItems = cart
            .filter(i => !i.isBundle)
            .map(i => ({ productId: i.productId, price: i.price, quantity: i.quantity }));

         console.log('[COUPON] Validating:', code, 'for', cartItems.length, 'items, total:', total);

         const res = await fetch(`${API_URL}/api/coupons/validate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
               code,
               userId: user?.id || null,
               orderTotal: total,
               items: cartItems
            })
         });

         const data = await res.json();
         console.log('[COUPON] Response:', data);

         if (!res.ok) {
            const msg = data.error || 'Coupon could not be applied';
            setCouponError(msg);
            setCouponApplied(false);
            setCouponDiscount(0);
            toast.error(msg);
         } else {
            setCouponDiscount(data.discount || 0);
            setCouponApplied(true);
            setCouponError('');
            const successMsg = data.message || `Coupon applied! You save ₹${data.discount}`;
            setCouponMessage(successMsg);
            toast.success(successMsg);
         }
      } catch (err) {
         console.error('[COUPON] Network error:', err);
         const msg = 'Failed to connect to server. Please try again.';
         setCouponError(msg);
         toast.error(msg);
      } finally {
         setCouponLoading(false);
      }
   };

   const handleRemoveCoupon = () => {
      setCouponCode('');
      setCouponDiscount(0);
      setCouponApplied(false);
      setCouponMessage('');
      setCouponError('');
      toast.info('Coupon removed');
   };

   const gstEnabled = getSettingVal('gst_enabled', 'true') === 'true';
   const defaultGstRate = parseFloat(getSettingVal('gst_default_rate', '18'));
   const gstTaxType = getSettingVal('gst_tax_type', 'exclusive');
   const gstRoundingEnabled = getSettingVal('gst_rounding_enabled', 'true') === 'true';
   const gstTaxLabel = getSettingVal('gst_tax_label', 'GST');

   // Calculate GST dynamically
   let computedGst = 0;
   if (gstEnabled && cart.length > 0) {
      cart.forEach((item) => {
         const itemRate = item.gstRate !== undefined && item.gstRate !== null ? item.gstRate : defaultGstRate;
         const totalPrice = item.price * item.quantity;
         let itemTax = 0;
         if (gstTaxType === 'inclusive') {
            itemTax = totalPrice - (totalPrice / (1 + itemRate / 100));
         } else {
            itemTax = totalPrice * (itemRate / 100);
         }
         if (gstRoundingEnabled) {
            computedGst += Math.round(itemTax);
         } else {
            computedGst += parseFloat(itemTax.toFixed(2));
         }
      });
   }
   if (gstRoundingEnabled) {
      computedGst = Math.round(computedGst);
   } else {
      computedGst = parseFloat(computedGst.toFixed(2));
   }

   const shipping = total >= freeShippingThreshold || total === 0 ? 0 : flatDeliveryFee;
   let finalTotal = 0;
   if (gstTaxType === 'exclusive') {
      finalTotal = total + computedGst - couponDiscount + shipping;
   } else {
      finalTotal = total - couponDiscount + shipping;
   }
   if (finalTotal < 0) finalTotal = 0;
   if (gstRoundingEnabled) {
      finalTotal = Math.round(finalTotal);
   } else {
      finalTotal = parseFloat(finalTotal.toFixed(2));
   }

   // Dynamic Recommendations Fetch
   const { data: prodData } = useSWR(`${API_URL}/api/products?limit=4`, fetcher);
   const recommendedProducts = prodData?.products ? prodData.products.slice(0, 4) : [];

   return (
      <div className="min-h-screen bg-[#f8f8f5] text-[#111827]">
         <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-6 md:py-12">
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
                     Cart <span className="text-[#0f5132]/30 font-bold text-2xl md:text-3xl ml-2">({cart.reduce((acc, i) => acc + i.quantity, 0)})</span>
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
                  <div className="lg:col-span-8 flex flex-col gap-6">
                     <div className="bg-gradient-to-r from-emerald-50 to-teal-50/30 rounded-[20px] p-5 md:p-6 border border-emerald-100 shadow-[0_8px_30px_rgba(4,120,87,0.04)] relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                           <Truck size={80} className="text-emerald-900" />
                        </div>
                        <div className="flex flex-col gap-4 relative z-10">
                           <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                 <div className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-white shadow-sm flex items-center justify-center shrink-0">
                                    <Truck className="h-5 w-5 md:h-6 md:w-6 text-emerald-600" />
                                 </div>
                                 <div>
                                    <h4 className="text-[14px] md:text-[16px] font-bold text-slate-800">
                                       {total >= freeShippingThreshold ? 'Free Shipping Unlocked 🎉' : 'Almost there!'}
                                    </h4>
                                    <p className="text-[12px] md:text-[13px] font-medium text-slate-500">
                                       {total >= freeShippingThreshold ? `You are saving ₹${flatDeliveryFee} on delivery` : `Add ₹${(freeShippingThreshold - total).toFixed(2)} more for free delivery`}
                                    </p>
                                 </div>
                              </div>
                              <span className="text-[13px] md:text-[14px] font-black text-emerald-600 bg-white px-3 md:px-4 py-1.5 rounded-full shadow-sm border border-emerald-50">
                                 {progress.toFixed(0)}%
                              </span>
                           </div>
                           <div className="h-2.5 md:h-3 w-full bg-white rounded-full overflow-hidden shadow-inner border border-emerald-100">
                              <div
                                 className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full transition-all duration-1000 relative overflow-hidden"
                                 style={{ width: `${progress}%` }}
                              >
                                 <div className="absolute inset-0 bg-white/20 animate-[shimmer_2s_infinite] -skew-x-12 translate-x-[-150%]" />
                              </div>
                           </div>
                        </div>
                     </div>

                     {/* PRODUCTS LIST */}
                     <div className="flex flex-col gap-4">
                        {cart.map((item) => (
                           item.isBundle ? (
                              <BundleItemCard key={item.id} item={item} removeFromCart={removeFromCart} updateQuantity={updateQuantity} />
                           ) : (
                              <div
                                 key={`${item.productId}-${item.variant}`}
                                 className="bg-white rounded-[20px] p-4 md:p-5 border border-[#e5e7eb] flex flex-row gap-4 relative group hover:border-emerald-200 hover:shadow-[0_8px_30px_rgba(0,0,0,0.03)] transition-all mb-4"
                              >
                                 {/* IMAGE */}
                                 <div className="h-24 w-24 md:h-28 md:w-28 relative rounded-2xl overflow-hidden bg-slate-50 shrink-0 border border-slate-100">
                                    <OptimizedImage
                                       src={item.image}
                                       alt={item.name}
                                       fill
                                       className="object-cover transition-transform duration-500 group-hover:scale-105"
                                       sizes="(max-width: 768px) 96px, 112px"
                                    />
                                 </div>

                                 {/* INFO CONTAINER */}
                                 <div className="flex-1 flex flex-col justify-between">
                                    <div className="flex justify-between items-start gap-2">
                                       <div className="flex flex-col gap-0.5">
                                          <h3 className="text-[15px] md:text-[17px] font-bold text-slate-800 leading-tight pr-4">
                                             {item.name}
                                          </h3>
                                          <p className="text-[12px] font-medium text-slate-500 mt-0.5">
                                             {item.variant}
                                          </p>
                                          {/* <div className="flex items-center gap-1.5 mt-2 text-[9px] md:text-[10px] font-black uppercase tracking-wider text-slate-500 bg-slate-50 w-fit px-2.5 py-0.5 rounded border border-slate-200/60">
                                <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                                Delivery calculated at checkout
                             </div> */}
                                       </div>
                                       <div className="text-right shrink-0">
                                          <span className="text-[16px] md:text-[18px] font-black text-slate-800 block">
                                             ₹{item.price * item.quantity}
                                          </span>
                                          {item.quantity > 1 && (
                                             <span className="text-[11px] font-medium text-slate-400 mt-1 block">
                                                (₹{item.price} each)
                                             </span>
                                          )}
                                       </div>
                                    </div>

                                    {/* CONTROLS */}
                                    <div className="flex flex-wrap items-center justify-between mt-4 border-t border-slate-100 pt-3 gap-y-3">
                                       <div className="flex items-center gap-2.5">
                                          <button
                                             onClick={() => removeFromCart(item.id)}
                                             className="h-10 px-4 rounded-xl border border-slate-200 hover:border-red-200 text-slate-600 hover:text-red-600 hover:bg-red-50/50 transition-all text-[11px] font-black uppercase tracking-wider flex items-center gap-1.5 active:scale-95"
                                          >
                                             <Trash2 size={13} /> Remove
                                          </button>
                                          <button
                                             className="h-10 px-4 rounded-xl border border-slate-200 hover:border-emerald-200 text-slate-600 hover:text-emerald-600 hover:bg-emerald-50/50 transition-all text-[11px] font-black uppercase tracking-wider flex items-center gap-1.5 active:scale-95"
                                          >
                                             <Heart size={13} /> Save
                                          </button>
                                       </div>

                                       {/* MODERN QTY PILL */}
                                       <div className="flex items-center bg-white rounded-full p-0.5 border border-slate-200 shadow-sm h-[34px]">
                                          <button onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))} className="w-9 h-full flex items-center justify-center text-slate-600 hover:bg-slate-50 hover:text-emerald-600 rounded-l-full transition-colors font-black text-[15px]">-</button>
                                          <span className="w-8 text-center font-black text-slate-800 text-[13px]">{item.quantity}</span>
                                          <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-9 h-full flex items-center justify-center text-slate-600 hover:bg-slate-50 hover:text-emerald-600 rounded-r-full transition-colors font-black text-[15px]">+</button>
                                       </div>
                                    </div>
                                 </div>
                              </div>
                           )
                        ))}
                     </div>

                  </div>

                  {/* RIGHT SIDE: ORDER SUMMARY (30% / col-span-4) */}
                  <div className="lg:col-span-4 lg:sticky lg:top-24 flex flex-col gap-6">

                     <div className="bg-white rounded-[24px] border border-slate-200 shadow-[0_12px_40px_rgba(0,0,0,0.03)] overflow-hidden">
                        <div className="p-6 bg-slate-50/50 border-b border-slate-100 flex items-center gap-2">
                           <ShieldCheck className="h-5 w-5 text-emerald-600" />
                           <h3 className="text-[13px] font-black uppercase tracking-widest text-slate-800">Secure Checkout</h3>
                        </div>

                        <div className="p-6 flex flex-col gap-5">

                           {/* Coupon Input */}
                           {couponApplied ? (
                              <div className="flex items-center gap-3 p-3 pl-4 rounded-xl border border-emerald-200 bg-emerald-50">
                                 <Check size={16} className="text-emerald-600 shrink-0" />
                                 <div className="flex-1 min-w-0">
                                    <p className="text-[13px] font-black text-emerald-800 truncate">{couponCode.toUpperCase()}</p>
                                    <p className="text-[11px] text-emerald-600 font-medium">-₹{couponDiscount} off applied</p>
                                 </div>
                                 <button onClick={handleRemoveCoupon} className="h-7 w-7 rounded-lg bg-emerald-100 hover:bg-red-100 hover:text-red-600 text-emerald-700 flex items-center justify-center transition-colors shrink-0">
                                    <X size={14} />
                                 </button>
                              </div>
                           ) : (
                              <div className="flex flex-col gap-1.5">
                                 <div className="flex items-center gap-3 p-1 pl-4 rounded-xl border border-slate-200 bg-white focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500/20 transition-all">
                                    <Tag size={16} className="text-slate-400" />
                                    <input
                                       type="text"
                                       placeholder="Enter coupon code"
                                       value={couponCode}
                                       onChange={e => { setCouponCode(e.target.value.toUpperCase()); setCouponError(''); }}
                                       onKeyDown={e => e.key === 'Enter' && handleApplyCoupon()}
                                       className="flex-1 bg-transparent border-none outline-none text-[13px] font-bold text-slate-800 placeholder:text-slate-400 placeholder:font-medium uppercase"
                                    />
                                    <button
                                       onClick={handleApplyCoupon}
                                       disabled={couponLoading || !couponCode.trim()}
                                       className="h-[34px] px-4 bg-slate-900 text-white font-bold text-[12px] uppercase tracking-wider rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                                    >
                                       {couponLoading ? <Loader2 size={13} className="animate-spin" /> : null}
                                       Apply
                                    </button>
                                 </div>
                                 {couponError && (
                                    <p className="text-[11px] font-bold text-red-500 flex items-center gap-1 pl-1">
                                       <X size={11} /> {couponError}
                                    </p>
                                 )}
                              </div>
                           )}

                           <div className="h-px w-full bg-slate-100" />

                           <div className="flex flex-col gap-3 text-[13px] font-medium text-slate-500">
                              <div className="flex justify-between items-center">
                                 <span>Subtotal</span>
                                 <span className="font-bold text-slate-800">₹{total}</span>
                              </div>
                              {gstEnabled && computedGst > 0 && (
                                 <div className="flex justify-between items-center">
                                    <span>{gstTaxLabel} ({gstTaxType === 'inclusive' ? 'Inclusive' : 'Exclusive'})</span>
                                    <span className="font-bold text-slate-800">₹{computedGst}</span>
                                 </div>
                              )}
                              {couponApplied && couponDiscount > 0 && (
                                 <div className="flex justify-between items-center text-emerald-700 font-bold">
                                    <span className="flex items-center gap-1.5"><Tag size={13} /> Coupon ({couponCode})</span>
                                    <span>-₹{couponDiscount}</span>
                                 </div>
                              )}
                              <div className="flex justify-between items-center">
                                 <span>Delivery Fee</span>
                                 <span className={shipping === 0 ? 'text-emerald-600 font-bold uppercase text-[11px] tracking-widest bg-emerald-50 px-2 py-0.5 rounded' : 'font-bold text-slate-800'}>
                                    {shipping === 0 ? 'FREE' : `₹${shipping}`}
                                 </span>
                              </div>
                           </div>

                           {shipping === 0 && (
                              <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-100/50 flex items-center justify-center mt-2">
                                 <span className="text-[12px] font-black text-emerald-700">
                                    You unlocked Free Delivery! 🎉
                                 </span>
                              </div>
                           )}

                           <div className="h-px w-full bg-slate-100" />

                           <div className="flex justify-between items-end">
                              <div className="flex flex-col">
                                 <span className="text-[15px] font-black text-slate-800">To Pay</span>
                                 <span className="text-[10px] text-slate-400 font-medium">
                                    {gstEnabled ? `Incl. ${gstTaxLabel}` : 'Incl. all taxes'}
                                 </span>
                              </div>
                              <span className="text-[28px] md:text-[32px] font-black tracking-tight text-slate-800 leading-none">
                                 ₹{finalTotal}
                              </span>
                           </div>

                           <button
                              onClick={() => router.push('/checkout')}
                              className="h-[56px] w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl shadow-lg shadow-emerald-600/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2 group mt-2 relative overflow-hidden"
                           >
                              <div className="absolute inset-0 bg-white/20 animate-[shimmer_2s_infinite] -skew-x-12 translate-x-[-150%]" />
                              <span className="text-[14px] font-black uppercase tracking-widest relative z-10">Proceed to Checkout</span>
                              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform relative z-10" />
                           </button>
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
            <div className="lg:hidden fixed bottom-20 left-0 w-full bg-white/95 backdrop-blur-lg border-t border-[#eef2f7] z-50 p-4 flex items-center justify-between shadow-[0_-10px_30px_rgba(0,0,0,0.05)]">
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
         <div className="h-36 lg:hidden" />

      </div>
   );
};

// Inline small component
const ClockIcon = ({ className }: { className?: string }) => (
   <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
   </svg>
);

export default CartPage;
