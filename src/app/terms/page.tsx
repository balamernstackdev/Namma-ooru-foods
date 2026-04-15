import React from 'react';
import Link from 'next/link';
import { ChevronLeft, Scale } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#f8fafc] pt-8 md:pt-16 pb-20">
      <div className="standard-container max-w-4xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 hover:text-[#022c22] transition-colors mb-10 group">
          <ChevronLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" /> Back to Home
        </Link>
        
        <div className="bg-white rounded-[2.5rem] p-8 md:p-16 border border-slate-100 shadow-premium">
          <div className="h-16 w-16 rounded-full bg-emerald-50 flex items-center justify-center mb-10">
            <Scale className="h-8 w-8 text-emerald-950" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-[#022c22] tracking-tighter mb-8">Store Terms</h1>
          <p className="text-[11px] font-black uppercase tracking-widest text-slate-300 mb-12">Last Updated: April 2026</p>
          
          <div className="prose prose-emerald max-w-none text-slate-600 font-medium leading-relaxed">
            <h3 className="text-xl font-black text-emerald-950 mt-8 mb-4">Store Wallet & Transactions</h3>
            <p className="mb-4">
              Please read the following terms and conditions (“T&Cs”) carefully before registering for, accessing or using the store Wallet, located at the Rodeo-powered store mobile application on any device and/or before availing any e-wallet services that may be offered by the store using Rodeo technology on the store Platform.
            </p>
            <p className="mb-4">
              The store Wallet is issued by the store and the store Wallet Services powered by Rodeo are provided by Rodeo Digital Pvt. Ltd. The customers using the store Wallet may use the amounts in the store Wallet for making payments towards transactions done by customers on the store App. Customers shall not be permitted to make any cash withdrawals from the store Wallet.
            </p>
            
            <h3 className="text-xl font-black text-emerald-950 mt-8 mb-4">Eligibility</h3>
            <p className="mb-4">
              The store Wallet Services powered by Rodeo are not available to persons under the age of 18 or to anyone previously suspended or removed by store owners with assistance from Rodeo. By accepting the T&Cs, you represent that you are at least 18 years of age. You represent and warrant that you have the right, authority, and capacity to enter into these T&Cs.
            </p>
            
            <h3 className="text-xl font-black text-emerald-950 mt-8 mb-4">General Conditions</h3>
            <ul className="list-disc pl-5 mt-4 space-y-2">
              <li>You will be issued a store Wallet Account immediately after successful registration.</li>
              <li>Amounts in your store Wallet will not be refunded to you under any circumstances. Withdrawals are not allowed.</li>
              <li>Store Wallets are available only to resident Indians who have attained the age of 18 years.</li>
              <li>Store Wallets are strictly non-transferable.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
