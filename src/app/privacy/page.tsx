import React from 'react';
import Link from 'next/link';
import { ChevronLeft, ShieldCheck } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#f8fafc] pt-8 md:pt-16 pb-20">
      <div className="standard-container max-w-4xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 hover:text-[#022c22] transition-colors mb-10 group">
          <ChevronLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" /> Back to Home
        </Link>
        
        <div className="bg-white rounded-[2.5rem] p-8 md:p-16 border border-slate-100 shadow-premium">
          <div className="h-16 w-16 rounded-full bg-emerald-50 flex items-center justify-center mb-10">
            <ShieldCheck className="h-8 w-8 text-emerald-950" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-[#022c22] tracking-tighter mb-8">Privacy Policy</h1>
          <p className="text-[11px] font-black uppercase tracking-widest text-slate-300 mb-12">Last Updated: April 2026</p>
          
          <div className="prose prose-emerald max-w-none text-slate-600 font-medium leading-relaxed">
            <h3 className="text-xl font-black text-emerald-950 mt-8 mb-4">1. What Information Do We Collect?</h3>
            <p className="mb-4">
              <strong>Personal information you disclose to us:</strong> We collect personal information that you voluntarily provide to us when registering, expressing an interest in obtaining information about us or our products, or otherwise contacting us.
            </p>
            <ul className="list-disc pl-5 mb-6 space-y-2">
              <li><strong>Name and Contact Data:</strong> We collect your first and last name, email address, postal address, phone number, and other similar contact data.</li>
              <li><strong>Credentials:</strong> We DO NOT collect passwords, password hints, and similar security information used for authentication securely.</li>
              <li><strong>Payment Data:</strong> We collect only such data as is necessary to process your payment for purchases. All payment data is stored directly by our secure payment gateway providers.</li>
            </ul>
            
            <h3 className="text-xl font-black text-emerald-950 mt-8 mb-4">2. Automatically Collected Information</h3>
            <p className="mb-4">
              Some information — such as your IP address and/or browser and device characteristics — is collected automatically when you visit our Platform for security purposes. This information is primarily needed to maintain the security and operation of our Sites, and for our internal analytics and reporting purposes.
            </p>
            
            <h3 className="text-xl font-black text-emerald-950 mt-8 mb-4">3. Device & Location Access</h3>
            <p className="mb-4">
               If you use our Apps, we may request access to and track location-based information from your mobile device to provide location-based delivery services. We may also send you push notifications regarding your account or order status. You may turn these off in your device's settings at any time.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
