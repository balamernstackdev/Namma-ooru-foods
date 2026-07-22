'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { XCircle, RefreshCw, CreditCard, ArrowRight, AlertTriangle } from 'lucide-react';
import { Suspense } from 'react';

import useSWR from 'swr';
import { Phone, Mail } from 'lucide-react';

import { API_URL } from '@/lib/api';
const fetcher = (url: string) => fetch(url).then(res => res.json());

function PaymentFailureContent() {
   const searchParams = useSearchParams();
   const orderId = searchParams.get('order') || searchParams.get('orderId');

   const { data: order } = useSWR(orderId ? `${API_URL}/api/orders/public/${orderId}` : null, fetcher);
   const { data: settingsData } = useSWR(`${API_URL}/api/settings`, fetcher);

   const getSettingVal = (key: string, fallback: string) => {
      if (!settingsData || !Array.isArray(settingsData)) return fallback;
      const found = settingsData.find((s: any) => s.key === key);
      return found ? found.value : fallback;
   };

   const supportPhone = getSettingVal('support_whatsapp', '+91 99999 99999');
   const supportEmail = getSettingVal('support_email', 'support@nammaoorufoods.com');

   return (
      <div className="min-h-screen bg-[#f8f8f5] pt-[80px] pb-24">
         <div className="max-w-[600px] mx-auto px-4 sm:px-6">

            <motion.div
               initial={{ x: [-10, 10, -10, 10, 0] }}
               transition={{ duration: 0.5, ease: "easeInOut" }}
               className="bg-white rounded-[32px] p-8 md:p-12 shadow-[0_8px_40px_rgba(0,0,0,0.04)] border border-slate-100 text-center relative overflow-hidden"
            >
               <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-red-500 to-red-400" />
               
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-tr from-red-500/10 to-red-100/10 rounded-full blur-3xl -z-10 animate-pulse" />

               <div className="w-24 h-24 rounded-[2rem] bg-gradient-to-br from-red-100 to-red-50 flex items-center justify-center mx-auto mb-6 shadow-sm border border-red-100 relative">
                  <div className="absolute inset-0 rounded-[2rem] border-2 border-white opacity-50 animate-[ping_2s_ease-in-out_infinite]" />
                  <XCircle className="h-10 w-10 text-red-500" />
               </div>

               <h1 className="text-[32px] md:text-[40px] font-black text-[#111827] tracking-tighter leading-none mb-4">Payment Failed</h1>
               <p className="text-[15px] text-[#6b7280] font-medium max-w-sm mx-auto mb-8 leading-relaxed">
                  Unfortunately, the payment for order <strong className="text-[#111827]">#{orderId || 'N/A'}</strong> could not be completed. No amount has been deducted from your account. If the amount was deducted, it will be automatically refunded within 5-7 business days.
               </p>

               {/* ORDER DETAILS SECTION */}
               {order && !order.error && (
                  <div className="bg-[#f9fafb] rounded-2xl p-6 text-left mb-8 border border-slate-200">
                     <h3 className="text-[13px] font-black text-slate-500 uppercase tracking-widest mb-4">
                        Order Details
                     </h3>
                     <div className="space-y-3">
                        <div className="flex justify-between border-b border-slate-100 pb-2">
                           <span className="text-[#6b7280] text-[14px] font-medium">Order ID</span>
                           <span className="text-[#111827] text-[14px] font-bold">#{orderId}</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-100 pb-2">
                           <span className="text-[#6b7280] text-[14px] font-medium">Payment Method</span>
                           <span className="text-[#111827] text-[14px] font-bold">{order.paymentMethod || 'HDFC SmartGateway'}</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-100 pb-2">
                           <span className="text-[#6b7280] text-[14px] font-medium">Amount</span>
                           <span className="text-[#111827] text-[14px] font-bold">₹{order.totalAmount}</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-100 pb-2">
                           <span className="text-[#6b7280] text-[14px] font-medium">Status</span>
                           <span className="text-red-600 text-[14px] font-bold">Failed</span>
                        </div>
                        <div className="flex justify-between">
                           <span className="text-[#6b7280] text-[14px] font-medium">Date & Time</span>
                           <span className="text-[#111827] text-[14px] font-bold">
                              {new Date(order.createdAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                           </span>
                        </div>
                     </div>
                  </div>
               )}

               <div className="bg-[#fff1f2] rounded-2xl p-6 text-left mb-8 border border-red-100">
                  <h3 className="text-[13px] font-black text-red-800 uppercase tracking-widest mb-4 flex items-center gap-2">
                     <AlertTriangle size={16} /> Possible Reasons
                  </h3>
                  <ul className="space-y-3">
                     <li className="flex items-start gap-3 text-[14px] text-red-900/80 font-medium">
                        <div className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 shrink-0" />
                        Insufficient balance or bank authentication failed.
                     </li>
                     <li className="flex items-start gap-3 text-[14px] text-red-900/80 font-medium">
                        <div className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 shrink-0" />
                        Network connection was interrupted during processing.
                     </li>
                     <li className="flex items-start gap-3 text-[14px] text-red-900/80 font-medium">
                        <div className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 shrink-0" />
                        Payment gateway session timed out or cancelled by user.
                     </li>
                  </ul>
               </div>

               {/* NEED HELP SECTION */}
               <div className="bg-white rounded-2xl p-6 text-left mb-10 border border-slate-200">
                  <h3 className="text-[13px] font-black text-slate-800 uppercase tracking-widest mb-2">
                     Need Help?
                  </h3>
                  <p className="text-[13px] text-[#6b7280] font-medium mb-4">
                     If money was deducted but the order was not placed, contact our support team immediately.
                  </p>
                  <div className="flex flex-col gap-2">
                     <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center shrink-0 border border-slate-100">
                           <Phone size={14} className="text-slate-600" />
                        </div>
                        <span className="text-[14px] font-bold text-[#111827]">{supportPhone}</span>
                     </div>
                     <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center shrink-0 border border-slate-100">
                           <Mail size={14} className="text-slate-600" />
                        </div>
                        <span className="text-[14px] font-bold text-[#111827]">{supportEmail}</span>
                     </div>
                  </div>
               </div>

               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Link href={`/checkout?retry=${orderId}`} className="h-[56px] w-full rounded-2xl bg-gradient-to-r from-red-600 to-red-500 text-white font-bold text-[15px] flex items-center justify-center gap-2 shadow-[0_8px_24px_rgba(220,38,38,0.3)] hover:-translate-y-0.5 transition-all">
                     <RefreshCw size={18} /> Try Payment Again
                  </Link>
                  <Link href="/account/orders" className="h-[56px] w-full rounded-2xl bg-white text-[#111827] font-bold text-[15px] flex items-center justify-center gap-2 border border-[#e5e7eb] hover:bg-[#f9fafb] transition-all">
                     <ArrowRight size={18} /> Go to My Orders
                  </Link>
               </div>
            </motion.div>

         </div>
      </div>
   );
}

export default function PaymentFailurePage() {
   return (
      <Suspense fallback={
         <div className="min-h-screen bg-[#f8f8f5] flex items-center justify-center p-4">
            <div className="h-12 w-12 border-4 border-slate-100 border-t-red-600 rounded-full animate-spin" />
         </div>
      }>
         <PaymentFailureContent />
      </Suspense>
   );
}
