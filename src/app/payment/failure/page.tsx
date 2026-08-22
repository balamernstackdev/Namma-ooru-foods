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
               initial={{ y: 20, opacity: 0 }}
               animate={{ y: 0, opacity: 1 }}
               transition={{ duration: 0.5, ease: "easeOut" }}
               className="bg-white rounded-3xl p-8 md:p-12 shadow-xl border border-red-100 text-center relative overflow-hidden max-w-2xl mx-auto"
            >
               <div className="absolute top-0 left-0 right-0 h-4 bg-red-500" />
               
               <div className="w-28 h-28 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-8 shadow-inner border-[6px] border-white z-10 relative">
                  <XCircle className="h-14 w-14 text-red-600" />
               </div>

               <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-4">Payment Failed</h1>
               <div className="bg-red-50 text-red-800 text-lg font-semibold py-3 px-6 rounded-xl inline-block mb-8">
                  Your order #{orderId || 'N/A'} was not placed.
               </div>
               
               <p className="text-lg text-slate-600 font-medium mb-10 leading-relaxed max-w-md mx-auto">
                  No money has been charged. If your bank account shows a deduction, it will be automatically refunded within <strong className="text-slate-800">5-7 business days</strong>.
               </p>

               <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Link href={`/checkout?retry=${orderId}`} className="w-full sm:w-auto px-8 h-16 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-bold text-lg flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all">
                     <RefreshCw size={22} /> Try Payment Again
                  </Link>
                  <Link href="/account/orders" className="w-full sm:w-auto px-8 h-16 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-lg flex items-center justify-center gap-2 transition-all">
                     View My Orders
                  </Link>
               </div>

               {/* NEED HELP SECTION */}
               <div className="mt-12 pt-8 border-t border-slate-100">
                  <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Need Help?</p>
                  <div className="flex flex-col sm:flex-row justify-center gap-6">
                     <div className="flex items-center justify-center gap-2 text-slate-700 font-semibold whitespace-nowrap">
                        <Phone size={18} className="text-slate-400 shrink-0" /> {supportPhone}
                     </div>
                     <div className="flex items-center justify-center gap-2 text-slate-700 font-semibold whitespace-nowrap">
                        <Mail size={18} className="text-slate-400 shrink-0" /> {supportEmail}
                     </div>
                  </div>
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
