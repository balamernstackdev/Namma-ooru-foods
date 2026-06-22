'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { RefreshCw, HeadphonesIcon, Clock } from 'lucide-react';
import { Suspense, useEffect, useState } from 'react';

function PaymentPendingContent() {
   const searchParams = useSearchParams();
   const orderId = searchParams.get('order') || searchParams.get('orderId');
   const [countdown, setCountdown] = useState(15);

   useEffect(() => {
      const timer = setInterval(() => {
         setCountdown((prev) => {
            if (prev <= 1) {
               window.location.reload();
               return 15;
            }
            return prev - 1;
         });
      }, 1000);
      return () => clearInterval(timer);
   }, []);

   const handleRefresh = () => {
      window.location.reload();
   };

   return (
      <div className="min-h-screen bg-[#f8f8f5] pt-[80px] pb-24">
         <div className="max-w-[600px] mx-auto px-4 sm:px-6">

            <motion.div
               initial={{ scale: 0.95, opacity: 0, y: 20 }}
               animate={{ scale: 1, opacity: 1, y: 0 }}
               transition={{ duration: 0.5, ease: "easeOut" }}
               className="bg-white rounded-[32px] p-8 md:p-12 shadow-[0_8px_40px_rgba(0,0,0,0.04)] border border-slate-100 text-center relative overflow-hidden"
            >
               <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-amber-400 to-amber-500" />
               
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-tr from-amber-500/10 to-amber-100/10 rounded-full blur-3xl -z-10 animate-pulse" />

               <div className="w-24 h-24 rounded-[2rem] bg-gradient-to-br from-amber-100 to-amber-50 flex items-center justify-center mx-auto mb-6 shadow-sm border border-amber-100 relative">
                  <div className="absolute inset-0 rounded-[2rem] border-2 border-white opacity-50 animate-[spin_3s_linear_infinite]" />
                  <Clock className="h-10 w-10 text-amber-500" />
               </div>

               <h1 className="text-[32px] md:text-[40px] font-black text-[#111827] tracking-tighter leading-none mb-4">Verification In Progress</h1>
               <p className="text-[15px] text-[#6b7280] font-medium max-w-sm mx-auto mb-8 leading-relaxed">
                  We are currently verifying the payment status for order <strong className="text-[#111827]">#{orderId || 'N/A'}</strong> with your bank. Please do not close this window.
               </p>

               <div className="bg-[#fefce8] rounded-2xl p-6 text-center mb-10 border border-amber-100 flex flex-col items-center justify-center">
                  <div className="text-[13px] font-black text-amber-800 uppercase tracking-widest mb-2">Auto-refreshing in</div>
                  <div className="text-[32px] font-black text-amber-600 tracking-tight">{countdown}s</div>
               </div>

               <div className="flex flex-col gap-4">
                  <button onClick={handleRefresh} className="h-[56px] w-full rounded-2xl bg-amber-500 text-white font-bold text-[15px] flex items-center justify-center gap-2 shadow-[0_8px_24px_rgba(245,158,11,0.3)] hover:-translate-y-0.5 transition-all">
                     <RefreshCw size={18} className="animate-spin-slow" /> Refresh Status Manually
                  </button>
                  <Link href="/contact" className="h-[56px] w-full rounded-2xl bg-white text-[#111827] font-bold text-[15px] flex items-center justify-center gap-2 border border-[#e5e7eb] hover:bg-[#f9fafb] transition-all">
                     <HeadphonesIcon size={18} /> Contact Support
                  </Link>
               </div>
            </motion.div>

         </div>
      </div>
   );
}

export default function PaymentPendingPage() {
   return (
      <Suspense fallback={
         <div className="min-h-screen bg-[#f8f8f5] flex items-center justify-center p-4">
            <div className="h-12 w-12 border-4 border-slate-100 border-t-amber-500 rounded-full animate-spin" />
         </div>
      }>
         <PaymentPendingContent />
      </Suspense>
   );
}
