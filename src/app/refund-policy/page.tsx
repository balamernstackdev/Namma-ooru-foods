import React from 'react';
import Link from 'next/link';
import { ChevronLeft, RotateCcw } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Refund Policy | Namma Ooru Foods',
  description: 'Learn about Namma Ooru Foods refund, return, replacement, cancellation, and damaged product claim process for online orders.',
};

const sections = [
  { id: 'intro', label: 'Introduction' },
  { id: 's1',   label: '1. Refund Eligibility' },
  { id: 's2',   label: '2. Reporting Timeline' },
  { id: 's3',   label: '3. Non-Refundable Cases' },
  { id: 's4',   label: '4. Proof Required' },
  { id: 's5',   label: '5. Refund Process' },
  { id: 's6',   label: '6. Refund Timeline' },
  { id: 's7',   label: '7. Refund Method' },
  { id: 's8',   label: '8. Replacement Policy' },
  { id: 's9',   label: '9. Partial Refunds' },
  { id: 's10',  label: '10. Cancellation Refunds' },
  { id: 's11',  label: '11. Delivery Charges' },
  { id: 's12',  label: '12. Damaged/Missing Items' },
  { id: 's13',  label: '13. Quality Concerns' },
  { id: 's14',  label: '14. Contact Us' },
];

export default function RefundPolicyPage() {
  return (
    <div className="min-h-screen bg-[#f8fafc] pt-8 md:pt-14 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <Link href="/" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 hover:text-emerald-800 transition-colors mb-10 group">
          <ChevronLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          Back to Home
        </Link>

        <div className="flex flex-col lg:flex-row gap-10 items-start">

          {/* Sidebar ToC */}
          <aside className="hidden lg:block w-64 shrink-0 sticky top-24 self-start">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 max-h-[80vh] overflow-y-auto">
              <p className="text-[9px] font-black uppercase tracking-[0.35em] text-slate-400 mb-4">Contents</p>
              <nav className="flex flex-col gap-1">
                {sections.map(s => (
                  <a key={s.id} href={`#${s.id}`}
                    className="text-[11px] font-semibold text-slate-500 hover:text-rose-700 hover:bg-rose-50 px-3 py-1.5 rounded-lg transition-colors">
                    {s.label}
                  </a>
                ))}
              </nav>
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8 md:p-14">

              {/* Header */}
              <div className="flex items-center gap-5 mb-10">
                <div className="h-14 w-14 rounded-2xl bg-rose-50 flex items-center justify-center shrink-0">
                  <RotateCcw className="h-7 w-7 text-rose-650 text-rose-500" />
                </div>
                <div>
                  <h1 className="text-3xl md:text-4xl font-black text-[#022c22] tracking-tighter leading-tight">Refund Policy</h1>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-300 mt-1">Last Updated: May 2026</p>
                </div>
              </div>

              {/* Intro */}
              <div id="intro" className="scroll-mt-24 mb-10 p-6 bg-rose-50/60 rounded-2xl border border-rose-100">
                <p className="text-sm text-rose-900 font-medium leading-relaxed">
                  At <strong>Namma Ooru Foods</strong>, customer satisfaction and product quality are important to us. This Refund Policy explains when a product may be eligible for refund, replacement, or store credit.
                </p>
                <p className="text-sm text-rose-900 font-medium leading-relaxed mt-3">
                  Because we sell food, organic, traditional, perishable, and personal care products, refund eligibility depends on the product type, condition, delivery status, and reporting timeline.
                </p>
              </div>

              <div className="prose prose-slate max-w-none text-slate-600 text-sm leading-relaxed space-y-10">

                {/* S1 */}
                <section id="s1" className="scroll-mt-24">
                  <SectionTitle number="1" title="Refund Eligibility" color="rose" />
                  <p>You may be eligible for a refund, replacement, or store credit if:</p>
                  <BulletList items={[
                    'You received a damaged product',
                    'You received a leaking, broken, or tampered package',
                    'You received the wrong product',
                    'One or more items were missing from your order',
                    'The product was expired at the time of delivery',
                    'The product was spoiled or unusable at the time of delivery',
                    'The delivered quantity was different from the order',
                    'The order was cancelled by us after successful payment',
                    'Payment was deducted but the order was not confirmed',
                  ]} color="rose" />
                </section>

                {/* S2 */}
                <section id="s2" className="scroll-mt-24">
                  <SectionTitle number="2" title="Reporting Timeline" color="rose" />
                  <p>To help us verify and resolve issues quickly, customers must report concerns within the following timelines:</p>
                  
                  <div className="mt-4 space-y-4">
                    <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl">
                      <h4 className="text-xs font-black text-rose-700 uppercase tracking-widest mb-1">Perishable, Fresh, Dairy, Sweets, and Ready-to-Use Food Products</h4>
                      <p className="text-slate-650">Issues must be reported within <strong>24 hours of delivery</strong> with photo or video evidence.</p>
                    </div>
                    <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl">
                      <h4 className="text-xs font-black text-rose-700 uppercase tracking-widest mb-1">Packaged Grocery, Millets, Mixes, Oils, Spices, Dry Fruits, and Non-Perishable Food</h4>
                      <p className="text-slate-650">Issues must be reported within <strong>7 days of delivery</strong>, provided the product is unused, unopened, and in its original packaging.</p>
                    </div>
                    <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl">
                      <h4 className="text-xs font-black text-rose-700 uppercase tracking-widest mb-1">Natural Care, Herbal, Personal Care, and Non-Food Products</h4>
                      <p className="text-slate-650">Issues must be reported within <strong>7 days of delivery</strong>, provided the product is unused, unopened, and in its original packaging.</p>
                    </div>
                  </div>
                </section>

                {/* S3 */}
                <section id="s3" className="scroll-mt-24">
                  <SectionTitle number="3" title="Non-Refundable Cases" color="rose" />
                  <p>Refunds, returns, or replacements may not be accepted in the following cases:</p>
                  <BulletList items={[
                    'Product has been opened, used, consumed, or damaged after delivery',
                    'Issue is reported after the eligible timeline',
                    'Product was stored incorrectly after delivery',
                    'Customer does not provide required proof such as photos, videos, or order details',
                    'Product taste, smell, color, size, or texture varies naturally and is not a quality defect',
                    'Customer ordered the wrong product by mistake',
                    'Delivery failed due to incorrect address, unavailable customer, or unreachable phone number',
                    'Product was purchased under a clearance, final sale, or non-returnable offer, if clearly mentioned',
                    'Packaging is damaged after delivery due to customer handling',
                    'Product is returned without approval from our support team',
                  ]} color="rose" />
                </section>

                {/* S4 */}
                <section id="s4" className="scroll-mt-24">
                  <SectionTitle number="4" title="Proof Required for Refund Requests" color="rose" />
                  <p>To process a refund, replacement, or store credit request, we may ask for:</p>
                  <BulletList items={[
                    'Order ID',
                    'Registered mobile number or email',
                    'Product name',
                    'Clear photo or video of the product issue',
                    'Photo of packaging, invoice, batch number, expiry date, or label where applicable',
                    'Description of the issue',
                    'Unboxing video, where available, for missing or damaged item claims',
                  ]} color="rose" />
                  <p className="mt-3 text-red-500 font-semibold">Refund requests may be rejected if sufficient evidence is not provided.</p>
                </section>

                {/* S5 */}
                <section id="s5" className="scroll-mt-24">
                  <SectionTitle number="5" title="Refund Process" color="rose" />
                  <p>To request a refund:</p>
                  <BulletList items={[
                    'Log in to your account and submit a refund request, where available.',
                    'Or contact our support team through phone, WhatsApp, or email.',
                    'Share the order details and required proof.',
                    'Our team will review the request.',
                    'If approved, we may offer a replacement, store credit, partial refund, or full refund depending on the issue.',
                  ]} color="rose" />
                  <p className="mt-3">We may request the product to be returned or inspected before approving certain refund claims.</p>
                </section>

                {/* S6 */}
                <section id="s6" className="scroll-mt-24">
                  <SectionTitle number="6" title="Refund Timeline" color="rose" />
                  <p>Once approved, refunds are generally processed within <strong>5–7 business days</strong>.</p>
                  <p className="mt-3">The actual time for the amount to reflect in your account may depend on your bank, payment gateway, UPI provider, card issuer, or wallet provider.</p>
                </section>

                {/* S7 */}
                <section id="s7" className="scroll-mt-24">
                  <SectionTitle number="7" title="Refund Method" color="rose" />
                  <p>Approved refunds may be issued through:</p>
                  <BulletList items={[
                    'Original payment method',
                    'Store wallet or store credit',
                    'Replacement product',
                    'Coupon or credit note',
                    'Other method approved by our support team',
                  ]} color="rose" />
                  <p className="mt-3">For cash on delivery orders, refunds may be processed through bank transfer, UPI, store credit, or another available method after verification.</p>
                </section>

                {/* S8 */}
                <section id="s8" className="scroll-mt-24">
                  <SectionTitle number="8" title="Replacement Policy" color="rose" />
                  <p>In many cases, we may offer a replacement instead of a refund, especially when:</p>
                  <BulletList items={[
                    'The product was damaged in transit',
                    'The wrong item was delivered',
                    'An item was missing',
                    'The product was defective or unusable at delivery',
                  ]} color="rose" />
                  <p className="mt-3">Replacement is subject to product availability and serviceable delivery location.</p>
                </section>

                {/* S9 */}
                <section id="s9" className="scroll-mt-24">
                  <SectionTitle number="9" title="Partial Refunds" color="rose" />
                  <p>Partial refunds may be provided when:</p>
                  <BulletList items={[
                    'Only part of the order has an issue',
                    'A combo pack has one affected item',
                    'Quantity mismatch is verified',
                    'A replacement is not available for one item',
                  ]} color="rose" />
                  <p className="mt-3">Delivery charges, coupon discounts, or promotional credits affect the final refund calculation.</p>
                </section>

                {/* S10 */}
                <section id="s10" className="scroll-mt-24">
                  <SectionTitle number="10" title="Cancellation Refunds" color="rose" />
                  <p>If you cancel an order before it is packed or dispatched, and cancellation is approved, the eligible amount will be refunded as per the original payment method or store credit policy.</p>
                  <p className="mt-2">Orders cannot usually be cancelled once packed, dispatched, or out for delivery.</p>
                  <p className="mt-2">If we cancel an order due to product unavailability, serviceability issues, payment confirmation issues, or operational reasons, the eligible prepaid amount will be refunded.</p>
                </section>

                {/* S11 */}
                <section id="s11" className="scroll-mt-24">
                  <SectionTitle number="11" title="Delivery Charges and Convenience Fees" color="rose" />
                  <p>Delivery charges, handling fees, convenience fees, COD charges, or payment gateway charges may not always be refundable unless the issue was caused by us.</p>
                  <p className="mt-3">If the entire order is cancelled by us or the complete order is defective, we may refund applicable delivery charges at our discretion.</p>
                </section>

                {/* S12 */}
                <section id="s12" className="scroll-mt-24">
                  <SectionTitle number="12" title="Damaged or Missing Items" color="rose" />
                  <p>If you receive a damaged package or missing item:</p>
                  <BulletList items={[
                    'Take photos before opening, where possible',
                    'Record an unboxing video if the package appears damaged',
                    'Report the issue within the eligible timeline',
                    'Do not discard the product or packaging until the issue is resolved',
                  ]} color="rose" />
                  <p className="mt-3">This helps us verify the issue with our packing, delivery, or vendor teams.</p>
                </section>

                {/* S13 */}
                <section id="s13" className="scroll-mt-24">
                  <SectionTitle number="13" title="Quality Concerns" color="rose" />
                  <p>For quality-related concerns, our team may review product photos, packaging details, batch information, storage condition, delivery timeline, and product category before approving a refund or replacement.</p>
                  <p className="mt-3">Natural and traditional food products may have natural variations in color, aroma, texture, size, or appearance. Such variations alone may not qualify as a defect.</p>
                </section>

                {/* S14 */}
                <section id="s14" className="scroll-mt-24">
                  <SectionTitle number="14" title="How to Contact Us" color="rose" />
                  <p>For refund, replacement, return, cancellation, or order-related support, contact:</p>
                  <ContactBox />
                </section>

              </div>
            </div>

            <PolicyNav active="refund-policy" />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Shared sub-components ── */

function SectionTitle({ number, title, color = 'emerald' }: { number: string; title: string; color?: string }) {
  const colorMap: Record<string, string> = {
    emerald: 'text-emerald-600 bg-emerald-50 border-emerald-100',
    blue: 'text-blue-600 bg-blue-50 border-blue-100',
    rose: 'text-rose-600 bg-rose-50 border-rose-100',
  };
  return (
    <div className="flex items-baseline gap-3 mb-4 pb-3 border-b border-slate-100">
      <span className={`text-[10px] font-black rounded-full w-6 h-6 flex items-center justify-center shrink-0 text-center leading-none border ${colorMap[color]}`}>{number}</span>
      <h2 className="text-lg font-black text-[#022c22] tracking-tight">{title}</h2>
    </div>
  );
}

function BulletList({ items, color = 'emerald' }: { items: string[]; color?: string }) {
  const dotColor: Record<string, string> = {
    emerald: 'bg-emerald-500',
    blue: 'bg-blue-500',
    rose: 'bg-rose-500',
  };
  return (
    <ul className="mt-2 space-y-1.5 pl-1">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2.5 text-sm text-slate-600">
          <span className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${dotColor[color]}`} />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function ContactBox() {
  return (
    <div className="mt-4 bg-slate-50 rounded-2xl border border-slate-100 p-6 text-sm text-slate-700 space-y-1 font-medium">
      <p className="font-black text-[#022c22]">Namma Ooru Foods Pvt Ltd</p>
      <p>9, First Floor, Opp. Jayam Hospital,</p>
      <p>Chokkikulam, Madurai, Tamil Nadu – 625002</p>
      <p className="pt-2">✉️ <a href="mailto:support@nammaoorufoods.com" className="text-emerald-700 hover:underline">support@nammaoorufoods.com</a></p>
    </div>
  );
}

function PolicyNav({ active }: { active: 'privacy' | 'terms' | 'refund-policy' }) {
  const links = [
    { href: '/privacy',       label: 'Privacy Policy' },
    { href: '/terms',         label: 'Terms & Conditions' },
    { href: '/refund-policy', label: 'Refund Policy' },
  ];
  return (
    <div className="mt-6 flex flex-wrap gap-3">
      {links.map(l => (
        <Link key={l.href} href={l.href}
          className={`px-5 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all no-underline border ${
            active === l.href.replace('/', '')
              ? 'bg-emerald-700 text-white border-emerald-700'
              : 'bg-white border-slate-200 text-slate-500 hover:border-emerald-300 hover:text-emerald-700'
          }`}>
          {l.label}
        </Link>
      ))}
    </div>
  );
}
