import React from 'react';
import Link from 'next/link';
import { ChevronLeft, RefreshCw } from 'lucide-react';

export default function RefundPage() {
  return (
    <div className="min-h-screen bg-[#f8fafc] pt-8 md:pt-16 pb-20">
      <div className="standard-container max-w-4xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 hover:text-[#022c22] transition-colors mb-10 group">
          <ChevronLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" /> Back to Home
        </Link>
        
        <div className="bg-white rounded-[2.5rem] p-8 md:p-16 border border-slate-100 shadow-premium">
          <div className="h-16 w-16 rounded-full bg-emerald-50 flex items-center justify-center mb-10">
            <RefreshCw className="h-8 w-8 text-emerald-950" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-[#022c22] tracking-tighter mb-8">Refund Policy</h1>
          <p className="text-[11px] font-black uppercase tracking-widest text-slate-300 mb-12">Last Updated: April 2026</p>
          
          <div className="prose prose-emerald max-w-none text-slate-600 font-medium leading-relaxed">
            <h3 className="text-xl font-black text-emerald-950 mt-8 mb-4">Cancellation & Order Modification</h3>
            <p className="mb-4">
              You can cancel or modify your order at any time before it has been dispatched from our farms. Once an order is marked as "Out for Delivery", we are unable to accept cancellations due to the perishable nature of our organic goods.
            </p>
            
            <h3 className="text-xl font-black text-emerald-950 mt-8 mb-4">Refund Eligibility</h3>
            <p className="mb-4">
              We take utmost care in quality checking our harvest. However, you are eligible for a full refund or replacement under the following conditions:
            </p>
            <ul className="list-disc pl-5 mt-4 mb-6 space-y-2">
              <li>The delivered products are damaged, completely spoiled, or unfit for consumption.</li>
              <li>The incorrect item is delivered in place of what was ordered.</li>
              <li>You must notify us within 24 hours of delivery with photographic evidence of the issue.</li>
            </ul>

            <h3 className="text-xl font-black text-emerald-950 mt-8 mb-4">Wallet & Payment Refunds</h3>
            <p className="mb-4">
              Refunds to your original payment method via our payment gateway may take 5–7 business days to reflect in your bank account depending on your banking institution. Any funds added directly to the Store Wallet are strictly non-refundable as cash to your bank account, but can be fully utilized for any future purchases on the Namma Orru platform indefinitely.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
