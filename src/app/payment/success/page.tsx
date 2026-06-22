'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
   CheckCircle, MapPin, Download,
   ShoppingBag, Package,
   Clock, CreditCard, Check,
   ArrowRight
} from 'lucide-react';
import { useEffect, Suspense } from 'react';
import { useCartStore } from '@/store/useCartStore';
import useSWR from 'swr';
import { API_URL } from '@/lib/api';
import confetti from 'canvas-confetti';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

function PaymentSuccessContent() {
   const searchParams = useSearchParams();
   const providerRef = searchParams.get('order') || searchParams.get('orderId');
   const { clearCart } = useCartStore();

   const { data: order, error, isLoading } = useSWR(providerRef ? `${API_URL}/api/orders/public/${providerRef}` : null, fetcher);
   const { data: settingsData } = useSWR(`${API_URL}/api/settings`, fetcher);

   const getSettingVal = (key: string, fallback: string) => {
      if (!settingsData || !Array.isArray(settingsData)) return fallback;
      const found = settingsData.find((s: any) => s.key === key);
      return found ? found.value : fallback;
   };
   const gstTaxLabel = getSettingVal('gst_tax_label', 'GST');

   useEffect(() => {
      clearCart();
      // Fire confetti on load
      const duration = 3000;
      const end = Date.now() + duration;

      const frame = () => {
         confetti({
            particleCount: 5,
            angle: 60,
            spread: 55,
            origin: { x: 0 },
            colors: ['#16a34a', '#22c55e', '#bbf7d0']
         });
         confetti({
            particleCount: 5,
            angle: 120,
            spread: 55,
            origin: { x: 1 },
            colors: ['#16a34a', '#22c55e', '#bbf7d0']
         });

         if (Date.now() < end) {
            requestAnimationFrame(frame);
         }
      };
      frame();
   }, [clearCart]);

   if (isLoading) {
      return (
         <div className="min-h-screen bg-[#f8fcf9] flex items-center justify-center p-4">
            <div className="flex flex-col items-center">
               <div className="h-16 w-16 border-4 border-slate-100 border-t-emerald-600 rounded-full animate-spin mb-4" />
               <p className="text-[#6b7280] font-medium animate-pulse text-lg">Loading....</p>
            </div>
         </div>
      );
   }

   const timelineStages = [
      { label: 'Confirmed', status: 'completed', date: new Date().toLocaleDateString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) },
      { label: 'Packed', status: 'current', date: 'Processing' },
      { label: 'Shipped', status: 'pending', date: 'Pending' },
      { label: 'Out For Delivery', status: 'pending', date: 'Pending' },
      { label: 'Delivered', status: 'pending', date: 'Pending' },
   ];

   const getStatusStyle = (status: string) => {
      if (status === 'completed') return 'bg-emerald-500 shadow-[0_0_0_4px_rgba(16,185,129,0.15)] border-white';
      if (status === 'current') return 'bg-blue-500 shadow-[0_0_0_4px_rgba(59,130,246,0.15)] border-white';
      return 'bg-slate-200 border-white';
   };

   return (
      <div className="min-h-screen bg-[#f8fcf9] pb-12 overflow-x-hidden flex flex-col">
         {/* TOP SUCCESS BANNER */}
         <div className="bg-[#16a34a] text-white py-3 w-full shadow-md shrink-0">
            <div className="max-w-[1600px] mx-auto px-[32px] flex flex-col sm:flex-row items-center justify-center sm:justify-between gap-2">
               <div className="flex items-center gap-2 text-sm sm:text-base font-bold tracking-wide">
                  <span className="text-xl">🎉</span> Order Confirmed successfully!
               </div>
               <div className="text-xs sm:text-sm font-medium text-emerald-100 hidden sm:block">
                  Thank you for your purchase. Your products are being prepared.
               </div>
            </div>
         </div>

         <div className="max-w-[1600px] w-full mx-auto px-[32px] mt-8 flex-1">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 items-stretch h-full">

               {/* =======================
                   LEFT COLUMN
               ======================= */}
               <div className="flex flex-col gap-6 w-full h-full">
                  {/* Success Animation & Order Info Card */}
                  <div className="bg-white rounded-3xl p-6 lg:p-8 border border-slate-200 shadow-sm relative overflow-hidden flex flex-col items-center text-center">
                     <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#059669] to-[#22c55e]" />

                     <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: "spring", stiffness: 200, damping: 20 }}
                        className="w-24 h-24 rounded-full bg-gradient-to-br from-[#dcfce7] to-[#bbf7d0] flex items-center justify-center mb-5 shadow-[0_8px_30px_rgba(34,197,94,0.3)] border-[4px] border-white z-10"
                     >
                        <CheckCircle className="h-12 w-12 text-[#16a34a]" />
                     </motion.div>

                     <h1 className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight mb-2">Order Successful</h1>
                     <p className="text-slate-500 font-medium text-sm lg:text-base mb-6">Your order has been securely placed and is being processed.</p>

                     <div className="w-full bg-[#f8fafc] rounded-2xl p-4 lg:p-5 border border-slate-100 flex flex-col gap-3">
                        <div className="flex justify-between items-center border-b border-slate-200 pb-3">
                           <div className="flex items-center gap-2 text-slate-500 font-bold text-xs uppercase tracking-widest">
                              <ShoppingBag size={14} /> Tracking ID
                           </div>
                           <span className="font-black text-slate-900 text-sm">#{providerRef}</span>
                        </div>
                        <div className="flex justify-between items-center border-b border-slate-200 pb-3">
                           <div className="flex items-center gap-2 text-slate-500 font-bold text-xs uppercase tracking-widest">
                              <Clock size={14} /> Order Date
                           </div>
                           <span className="font-bold text-slate-900 text-sm">
                              {order ? new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Today'}
                           </span>
                        </div>
                        <div className="flex justify-between items-center">
                           <div className="flex items-center gap-2 text-slate-500 font-bold text-xs uppercase tracking-widest">
                              <CreditCard size={14} /> Payment
                           </div>
                           <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md text-xs">
                              Online Paid
                           </span>
                        </div>
                     </div>
                  </div>

                  {/* Action Buttons Card */}
                  <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col gap-3 mt-auto">
                     <Link href="/account/tracking" className="w-full h-14 rounded-2xl bg-[#059669] hover:bg-[#047857] text-white font-bold text-[15px] flex items-center justify-center gap-2 transition-all shadow-md">
                        Track Order <ArrowRight size={18} />
                     </Link>
                     <div className="grid grid-cols-2 gap-3">
                        <Link href="/account/orders" className="h-14 rounded-2xl bg-white border-2 border-slate-200 hover:border-slate-300 text-slate-700 font-bold text-[14px] flex items-center justify-center gap-2 transition-all">
                           View Orders
                        </Link>
                        <Link href="/" className="h-14 rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-[#059669] font-bold text-[14px] flex items-center justify-center gap-2 transition-all">
                           Continue Shopping
                        </Link>
                     </div>
                  </div>
               </div>

               {/* =======================
                   CENTER COLUMN
               ======================= */}
               <div className="flex flex-col gap-6 w-full h-full">
                  {/* Tracking Timeline */}
                  <div className="bg-white rounded-3xl p-6 lg:p-8 border border-slate-200 shadow-sm flex-1">
                     <h3 className="text-lg font-black text-slate-900 tracking-tight mb-8 flex items-center gap-2">
                        <Package className="text-[#059669]" /> Live Order Tracking
                     </h3>

                     <div className="relative pl-6 space-y-10 border-l-2 border-slate-100 ml-4">
                        {timelineStages.map((stage, idx) => (
                           <div key={idx} className="relative">
                              <div className={`absolute -left-[35px] w-6 h-6 rounded-full flex items-center justify-center border-4 ${getStatusStyle(stage.status)}`}>
                                 {stage.status === 'completed' && <Check size={10} className="text-white stroke-[4]" />}
                                 {stage.status === 'current' && <div className="w-2 h-2 bg-white rounded-full" />}
                              </div>
                              <div className="flex flex-col -mt-1.5">
                                 <span className={`text-base font-black ${stage.status === 'completed' || stage.status === 'current' ? 'text-slate-900' : 'text-slate-400'}`}>
                                    {stage.label}
                                 </span>
                                 <span className={`text-xs font-bold mt-0.5 ${stage.status === 'completed' ? 'text-emerald-600' : stage.status === 'current' ? 'text-blue-500' : 'text-slate-300'}`}>
                                    {stage.date}
                                 </span>
                                 {idx === 0 && (
                                    <p className="text-sm text-slate-500 font-medium mt-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
                                       We have received your order and payment. Currently verifying items.
                                    </p>
                                 )}
                              </div>
                           </div>
                        ))}
                     </div>
                  </div>
               </div>

               {/* =======================
                   RIGHT COLUMN
               ======================= */}
               <div className="flex flex-col gap-6 w-full h-full">
                  {/* Order Summary */}
                  <div className="bg-white rounded-3xl p-6 lg:p-8 border border-slate-200 shadow-sm">
                     <h3 className="text-lg font-black text-slate-900 tracking-tight mb-6">Order Summary</h3>

                     <div className="space-y-4 mb-6">
                         <div className="flex justify-between items-center text-slate-600 font-medium text-sm">
                            <span>Total Items</span>
                            <span className="font-bold text-slate-900 px-3 py-1 bg-slate-100 rounded-full">{order?.orderItems?.length || order?.items?.length || 1} Items</span>
                         </div>
                         <div className="flex justify-between items-center text-slate-600 font-medium text-sm">
                            <span>Subtotal</span>
                            <span className="font-bold text-slate-900">₹{order ? (order.totalAmount - (order.gstAmount || 0) - (order.deliveryFee || 0) + (order.discountAmount || 0)) : '---'}</span>
                         </div>
                         
                         {Number(order?.gstAmount || 0) > 0 && (
                            <div className="flex justify-between items-center text-slate-600 font-medium text-sm">
                               <span>{gstTaxLabel}</span>
                               <span className="font-bold text-slate-900">₹{order?.gstAmount}</span>
                            </div>
                         )}

                         {Number(order?.deliveryFee || 0) > 0 ? (
                            <div className="flex justify-between items-center text-slate-600 font-medium text-sm">
                               <span>Delivery Fee</span>
                               <span className="font-bold text-slate-900">₹{order?.deliveryFee}</span>
                            </div>
                         ) : (
                            <div className="flex justify-between items-center text-slate-600 font-medium text-sm">
                               <span>Delivery Fee</span>
                               <span className="font-bold text-[#059669]">FREE</span>
                            </div>
                         )}

                         {Number(order?.discountAmount || 0) > 0 && (
                            <div className="flex justify-between items-center text-emerald-600 font-medium text-sm">
                               <span>Discount</span>
                               <span className="font-bold">-₹{order?.discountAmount}</span>
                            </div>
                         )}
                      </div>

                     <div className="border-t border-slate-100 pt-6">
                        <div className="flex justify-between items-end">
                           <span className="font-bold text-slate-400 uppercase tracking-widest text-xs">Total Amount</span>
                           <span className="text-3xl font-black text-slate-900">₹{order?.totalAmount || '---'}</span>
                        </div>
                     </div>
                  </div>

                  {/* Delivery & Contact Details */}
                  {order?.shippingAddress && (
                     <div className="bg-white rounded-3xl p-6 lg:p-8 border border-slate-200 shadow-sm">
                        <h3 className="text-lg font-black text-slate-900 tracking-tight mb-6">Delivery Details</h3>

                        <div className="flex items-start gap-4 mb-6">
                           <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center shrink-0 border border-slate-100">
                              <MapPin size={18} className="text-slate-600" />
                           </div>
                           <div>
                              <p className="font-bold text-slate-900 mb-1">{order.shippingAddress.name || 'Customer'}</p>
                              <p className="text-sm text-slate-500 leading-relaxed font-medium">
                                 {order.shippingAddress.line1}, {order.shippingAddress.city}, <br />
                                 {order.shippingAddress.state} - {order.shippingAddress.pincode}
                              </p>
                           </div>
                        </div>

                        <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 flex justify-between items-center">
                           <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">Contact Phone</div>
                           <div className="text-sm font-black text-slate-900">{order.shippingAddress.phone || '+91 -'}</div>
                        </div>
                     </div>
                  )}

               </div>
            </div>
         </div>
      </div>
   );
}

export default function PaymentSuccessPage() {
   return (
      <Suspense fallback={
         <div className="min-h-screen bg-[#f8fcf9] flex items-center justify-center p-4">
            <div className="flex flex-col items-center">
               <div className="h-16 w-16 border-4 border-slate-100 border-t-emerald-600 rounded-full animate-spin mb-4" />
               <p className="text-[#6b7280] font-medium animate-pulse text-lg">Loading....</p>
            </div>
         </div>
      }>
         <PaymentSuccessContent />
      </Suspense>
   );
}
