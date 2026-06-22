'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, ArrowRight, Package } from 'lucide-react';
import { useEffect, Suspense } from 'react';
import { useCartStore } from '@/store/useCartStore';

function CheckoutStatusContent() {
   const searchParams = useSearchParams();
   const orderId = searchParams.get('order');
   const status = searchParams.get('status');
   const { clearCart } = useCartStore();

   const isSuccess = status === 'CHARGED' || status === 'SUCCESS';

   useEffect(() => {
      if (isSuccess) {
         clearCart();
      }
   }, [isSuccess, clearCart]);

   return (
      <div className="min-h-[80vh] bg-[#f8f8f5] flex items-center justify-center p-4">
         <motion.div 
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            className="max-w-md w-full bg-white rounded-[24px] p-8 border border-[#e5e7eb] shadow-xl text-center relative overflow-hidden"
         >
            {isSuccess ? (
               <>
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-tr from-[#16a34a]/10 to-[#dcfce7]/10 rounded-full blur-3xl -z-10" />
                  
                  <div className="w-20 h-20 mx-auto rounded-full bg-[#dcfce7] flex items-center justify-center mb-6">
                     <CheckCircle className="h-10 w-10 text-[#16a34a]" />
                  </div>
                  
                  <h1 className="text-[32px] font-black text-[#111827] tracking-tighter mb-2">Payment Successful!</h1>
                  <p className="text-[#6b7280] font-medium mb-6">Your order <strong className="text-[#111827]">{orderId}</strong> has been successfully placed and is being processed.</p>
                  
                  <div className="flex flex-col gap-3">
                     <Link href="/account/orders" className="w-full h-[52px] rounded-xl bg-[#16a34a] text-white font-bold text-[15px] flex items-center justify-center gap-2 hover:bg-[#15803d] transition-all">
                        <Package size={18} /> View My Order
                     </Link>
                     <Link href="/" className="w-full h-[52px] rounded-xl bg-[#f3f4f6] text-[#4b5563] font-bold text-[15px] flex items-center justify-center gap-2 hover:bg-[#e5e7eb] transition-all">
                        Continue Shopping <ArrowRight size={18} />
                     </Link>
                  </div>
               </>
            ) : (
               <>
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-tr from-red-500/10 to-red-100/10 rounded-full blur-3xl -z-10" />
                  
                  <div className="w-20 h-20 mx-auto rounded-full bg-red-50 flex items-center justify-center mb-6">
                     <XCircle className="h-10 w-10 text-red-500" />
                  </div>
                  
                  <h1 className="text-[32px] font-black text-[#111827] tracking-tighter mb-2">Payment Failed</h1>
                  <p className="text-[#6b7280] font-medium mb-6">Unfortunately, the payment for order <strong className="text-[#111827]">{orderId}</strong> could not be processed. Please try again.</p>
                  
                  <div className="flex flex-col gap-3">
                     <Link href="/checkout" className="w-full h-[52px] rounded-xl bg-[#111827] text-white font-bold text-[15px] flex items-center justify-center gap-2 hover:bg-[#1f2937] transition-all" style={{ color: '#ffffff' }}>
                        <span style={{ color: '#ffffff' }}>Retry Payment</span>
                     </Link>
                     <Link href="/" className="w-full h-[52px] rounded-xl bg-[#f3f4f6] text-[#4b5563] font-bold text-[15px] flex items-center justify-center gap-2 hover:bg-[#e5e7eb] transition-all">
                        Return to Home
                     </Link>
                  </div>
               </>
            )}
         </motion.div>
      </div>
   );
}

export default function CheckoutStatusPage() {
   return (
      <Suspense fallback={
         <div className="min-h-[80vh] bg-[#f8f8f5] flex items-center justify-center p-4">
            <div className="h-12 w-12 border-4 border-slate-100 border-t-emerald-600 rounded-full animate-spin" />
         </div>
      }>
         <CheckoutStatusContent />
      </Suspense>
   );
}
