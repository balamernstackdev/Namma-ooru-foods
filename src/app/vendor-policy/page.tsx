import React from 'react';
import Link from 'next/link';
import { ArrowLeft, UserCheck, PackageOpen, BadgeDollarSign, Truck, Sparkles, CreditCard, RefreshCcw, AlertTriangle, FileKey, History } from 'lucide-react';

const policies = [
  {
    id: 1,
    title: 'Vendor Eligibility',
    icon: UserCheck,
    items: [
      'Valid business information required',
      'Accurate contact details required',
      'One vendor account per business',
      'Verification required before approval'
    ]
  },
  {
    id: 2,
    title: 'Product Requirements',
    icon: PackageOpen,
    items: [
      'Products must be authentic and legal',
      'No counterfeit or prohibited products',
      'Product images must match actual products',
      'Accurate product descriptions required'
    ]
  },
  {
    id: 3,
    title: 'Pricing Policy',
    icon: BadgeDollarSign,
    items: [
      'Fair and transparent pricing',
      'No misleading discounts',
      'Vendors are responsible for pricing accuracy'
    ]
  },
  {
    id: 4,
    title: 'Order Fulfillment',
    icon: Truck,
    items: [
      'Orders must be processed on time',
      'Inventory must remain accurate',
      'Delayed fulfillment may affect account status'
    ]
  },
  {
    id: 5,
    title: 'Quality Standards',
    icon: Sparkles,
    items: [
      'Fresh and quality products only',
      'Proper packaging required',
      'Damaged or expired products prohibited'
    ]
  },
  {
    id: 6,
    title: 'Payments & Payouts',
    icon: CreditCard,
    items: [
      'Payouts processed according to marketplace schedule',
      'Valid bank account required',
      'Platform commissions apply where configured'
    ]
  },
  {
    id: 7,
    title: 'Returns & Refunds',
    icon: RefreshCcw,
    items: [
      'Vendors must cooperate with customer support',
      'Refund disputes reviewed by marketplace administration'
    ]
  },
  {
    id: 8,
    title: 'Account Suspension',
    icon: AlertTriangle,
    intro: 'Marketplace may:',
    items: [
      'Suspend vendor accounts',
      'Remove products',
      'Reject applications',
      'Permanently terminate accounts for policy violations'
    ]
  },
  {
    id: 9,
    title: 'Privacy & Data Protection',
    icon: FileKey,
    items: [
      'Customer information must remain confidential',
      'No unauthorized usage of customer data',
      'Compliance with applicable privacy regulations'
    ]
  },
  {
    id: 10,
    title: 'Policy Updates',
    icon: History,
    items: [
      'Marketplace policies may change periodically',
      'Continued usage indicates acceptance of updated policies'
    ]
  }
];

export default function VendorPolicyPage() {
  return (
    <div className="min-h-screen bg-[#fdfbf7] font-sans selection:bg-amber-100 selection:text-amber-900">
      {/* STICKY HEADER */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-emerald-900/10 shadow-sm">
        <div className="max-w-[1000px] mx-auto px-4 md:px-8 h-20 flex items-center">
          <Link
            href="/seller-hub"
            className="group flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-emerald-900/60 hover:text-emerald-950 transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center group-hover:bg-amber-100 transition-colors">
              <ArrowLeft size={18} className="text-emerald-600 group-hover:text-amber-600 transition-colors" />
            </div>
            <span className="hidden sm:inline">Back to Registration</span>
          </Link>
        </div>
      </header>

      {/* PAGE HEADER */}
      <section className="pt-16 pb-12 px-4">
        <div className="max-w-[1000px] mx-auto text-center">
          <span className="px-4 py-2 rounded-full bg-amber-100 text-amber-700 font-bold text-xs uppercase tracking-widest mb-6 inline-block">Official Guidelines</span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-emerald-950 tracking-tight mb-6">
            Vendor Marketplace Policies
          </h1>
          <p className="text-lg md:text-xl text-emerald-900/70 font-medium max-w-2xl mx-auto">
            Please review these guidelines before submitting your vendor application.
          </p>
        </div>
      </section>

      {/* POLICIES GRID */}
      <section className="pb-24 px-4">
        <div className="max-w-[1000px] mx-auto grid md:grid-cols-2 gap-6 lg:gap-8">
          {policies.map((policy) => (
            <div key={policy.id} className="bg-white rounded-3xl p-8 border border-emerald-900/10 shadow-sm hover:shadow-lg transition-shadow duration-300">
              <div className="flex items-start gap-5 mb-6">
                <div className="w-14 h-14 shrink-0 rounded-2xl bg-emerald-100 flex items-center justify-center">
                  <policy.icon size={28} className="text-emerald-600" />
                </div>
                <div className="pt-2">
                  <h2 className="text-xl font-bold text-emerald-950">{policy.title}</h2>
                </div>
              </div>
              
              {policy.intro && (
                <p className="text-sm font-bold text-emerald-900/80 mb-3">{policy.intro}</p>
              )}
              
              <ul className="space-y-3">
                {policy.items.map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="mt-1.5 w-1.5 h-1.5 shrink-0 rounded-full bg-amber-500" />
                    <span className="text-emerald-900/70 font-medium leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
      
      {/* BOTTOM CTA */}
      <section className="pb-24 px-4 text-center">
         <p className="text-emerald-900/60 font-medium mb-6">Ready to join our marketplace?</p>
         <Link href="/seller-hub">
            <button className="bg-emerald-950 text-white px-10 py-5 rounded-2xl font-bold uppercase tracking-widest hover:bg-amber-600 transition-colors shadow-xl hover:shadow-2xl">
               Return to Registration
            </button>
         </Link>
      </section>
    </div>
  );
}
