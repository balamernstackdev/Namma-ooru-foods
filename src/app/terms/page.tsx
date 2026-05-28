import React from 'react';
import Link from 'next/link';
import { ChevronLeft, Scale } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms and Conditions | Namma Ooru Foods',
  description: 'Review the terms for using Namma Ooru Foods, including orders, payments, delivery, cancellations, returns, refunds, and customer responsibilities.',
};

const sections = [
  { id: 'intro', label: 'Introduction' },
  { id: 's1',   label: '1. Business Information' },
  { id: 's2',   label: '2. Use of Website' },
  { id: 's3',   label: '3. Eligibility' },
  { id: 's4',   label: '4. Account Registration' },
  { id: 's5',   label: '5. Product Information' },
  { id: 's6',   label: '6. Pricing and Offers' },
  { id: 's7',   label: '7. Orders and Acceptance' },
  { id: 's8',   label: '8. Payments' },
  { id: 's9',   label: '9. Delivery and Shipping' },
  { id: 's10',  label: '10. Cancellations' },
  { id: 's11',  label: '11. Returns & Refunds' },
  { id: 's12',  label: '12. Store Wallet & Credits' },
  { id: 's13',  label: '13. Vendor Products' },
  { id: 's14',  label: '14. Customer Responsibilities' },
  { id: 's15',  label: '15. Food Safety' },
  { id: 's16',  label: '16. Intellectual Property' },
  { id: 's17',  label: '17. Limitation of Liability' },
  { id: 's18',  label: '18. Force Majeure' },
  { id: 's19',  label: '19. Grievance Redressal' },
  { id: 's20',  label: '20. Changes to Terms' },
  { id: 's21',  label: '21. Governing Law' },
];

export default function TermsPage() {
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
                    className="text-[11px] font-semibold text-slate-500 hover:text-blue-700 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors">
                    {s.label}
                  </a>
                ))}
              </nav>
            </div>
          </aside>

          {/* Main */}
          <div className="flex-1 min-w-0">
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8 md:p-14">

              {/* Header */}
              <div className="flex items-center gap-5 mb-10">
                <div className="h-14 w-14 rounded-2xl bg-blue-50 flex items-center justify-center shrink-0">
                  <Scale className="h-7 w-7 text-blue-700" />
                </div>
                <div>
                  <h1 className="text-3xl md:text-4xl font-black text-[#022c22] tracking-tighter leading-tight">Terms and Conditions</h1>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-300 mt-1">Last Updated: May 2026</p>
                </div>
              </div>

              {/* Intro */}
              <div id="intro" className="scroll-mt-24 mb-10 p-6 bg-blue-50/60 rounded-2xl border border-blue-100">
                <p className="text-sm text-blue-900 font-medium leading-relaxed">
                  Welcome to <strong>Namma Ooru Foods</strong>. These Terms and Conditions ("Terms") govern your access to and use of our website, products, services, account features, order placement, payment, delivery, returns, refunds, and related ecommerce services.
                </p>
                <p className="text-sm text-blue-900 font-medium leading-relaxed mt-3">
                  By accessing our website or placing an order, you agree to be bound by these Terms. Please read them carefully before using our website.
                </p>
              </div>

              <div className="prose prose-slate max-w-none text-slate-600 text-sm leading-relaxed space-y-10">

                {/* S1 */}
                <section id="s1" className="scroll-mt-24">
                  <SectionTitle number="1" title="Business Information" color="blue" />
                  <p>This website is operated by:</p>
                  <ContactBox />
                </section>

                {/* S2 */}
                <section id="s2" className="scroll-mt-24">
                  <SectionTitle number="2" title="Use of Website" color="blue" />
                  <p>You agree to use this website only for lawful purposes. You must not misuse the website, interfere with its operation, attempt unauthorized access, upload harmful code, or use the platform for fraudulent or misleading activity.</p>
                  <p className="mt-3">We reserve the right to restrict, suspend, or terminate access to users who violate these Terms or misuse our services.</p>
                </section>

                {/* S3 */}
                <section id="s3" className="scroll-mt-24">
                  <SectionTitle number="3" title="Eligibility" color="blue" />
                  <p>By using this website or placing an order, you confirm that:</p>
                  <BulletList items={[
                    'You are legally capable of entering into a binding agreement.',
                    'You are using accurate and complete information.',
                    'You are not prohibited from using ecommerce or payment services under applicable law.',
                    'If you are using the website on behalf of another person or business, you have proper authority to do so.',
                  ]} color="blue" />
                </section>

                {/* S4 */}
                <section id="s4" className="scroll-mt-24">
                  <SectionTitle number="4" title="Account Registration" color="blue" />
                  <p>You may browse certain parts of the website without creating an account. However, account registration may be required for order placement, order tracking, wishlist, refund requests, and certain personalized features.</p>
                  <p className="mt-3">You are responsible for maintaining the confidentiality of your account login details. Any activity under your account will be treated as your responsibility unless reported immediately.</p>
                </section>

                {/* S5 */}
                <section id="s5" className="scroll-mt-24">
                  <SectionTitle number="5" title="Product Information" color="blue" />
                  <p>We make reasonable efforts to display product names, prices, descriptions, images, quantities, ingredients, categories, availability, and offers accurately. However:</p>
                  <BulletList items={[
                    'Product images are for representation purposes and may slightly differ from the actual product.',
                    'Natural, handmade, organic, traditional, and local products may have variation in color, size, texture, aroma, or appearance.',
                    'Product availability may change without prior notice.',
                    'Product descriptions may be updated from time to time.',
                  ]} color="blue" />
                  <p className="mt-3">Customers should read product labels, ingredients, usage instructions, expiry dates, allergen information, and storage instructions before use. If you have allergies, dietary restrictions, medical conditions, or ingredient concerns, please check the product details carefully before purchase.</p>
                </section>

                {/* S6 */}
                <section id="s6" className="scroll-mt-24">
                  <SectionTitle number="6" title="Pricing and Offers" color="blue" />
                  <p>All prices displayed on the website are in Indian Rupees unless stated otherwise. Prices may include or exclude taxes depending on the product and billing structure.</p>
                  <p className="mt-3">We reserve the right to change prices, discounts, combo offers, delivery charges, and promotional campaigns at any time without prior notice.</p>
                  <p className="mt-3">If a pricing error occurs due to technical, manual, or system issues, we reserve the right to cancel or revise the order after informing the customer.</p>
                </section>

                {/* S7 */}
                <section id="s7" className="scroll-mt-24">
                  <SectionTitle number="7" title="Orders and Acceptance" color="blue" />
                  <p>Placing an order on the website does not automatically guarantee acceptance. An order is confirmed only after successful payment or confirmation from our system.</p>
                  <p className="mt-3">We may cancel or reject an order due to:</p>
                  <BulletList items={[
                    'Product unavailability',
                    'Payment failure',
                    'Incorrect pricing or product information',
                    'Delivery location not serviceable',
                    'Suspected fraud or misuse',
                    'Bulk order limitations',
                    'Operational or logistics constraints',
                  ]} color="blue" />
                  <p className="mt-3">If we cancel a prepaid order, eligible refunds will be processed as per our Refund Policy.</p>
                </section>

                {/* S8 */}
                <section id="s8" className="scroll-mt-24">
                  <SectionTitle number="8" title="Payments" color="blue" />
                  <p>We may support payment methods such as UPI, debit card, credit card, net banking, wallets, cash on delivery, or other methods depending on availability.</p>
                  <p className="mt-3">All online payments are processed through secure third-party payment gateway providers. We are not responsible for delays or failures caused by banks, payment gateways, UPI systems, card networks, or third-party payment processors.</p>
                </section>

                {/* S9 */}
                <section id="s9" className="scroll-mt-24">
                  <SectionTitle number="9" title="Delivery and Shipping" color="blue" />
                  <p>We aim to deliver orders within the estimated delivery timeline shown on the website or communicated during checkout. Delivery timelines may vary depending on product availability, location, weather, public holidays, courier capacity, local restrictions, and operational factors.</p>
                  <p className="mt-3">Customers must provide accurate delivery information. We are not responsible for failed or delayed delivery caused by incorrect address, unavailable recipient, unreachable phone number, access restrictions, or customer refusal.</p>
                  <p className="mt-3">For food and perishable products, customers are requested to receive the order promptly and store the product as per label instructions.</p>
                </section>

                {/* S10 */}
                <section id="s10" className="scroll-mt-24">
                  <SectionTitle number="10" title="Cancellations" color="blue" />
                  <p>Customers may request order cancellation before the order is packed or dispatched. Once an order is packed, dispatched, or out for delivery, cancellation may not be possible.</p>
                  <p className="mt-3">We reserve the right to cancel orders due to unavoidable operational, payment, product, vendor, or delivery issues.</p>
                  <p className="mt-3">Eligible prepaid cancellations will be refunded as per our Refund Policy.</p>
                </section>

                {/* S11 */}
                <section id="s11" className="scroll-mt-24">
                  <SectionTitle number="11" title="Returns, Replacements, and Refunds" color="blue" />
                  <p>Returns, replacements, and refunds are governed by our <Link href="/refund-policy" className="text-emerald-700 underline font-semibold">Refund Policy</Link>.</p>
                  <p className="mt-3">Due to the nature of food, organic, perishable, and personal care products, not all products are eligible for return. Damaged, incorrect, expired, missing, or defective products must be reported within the timelines mentioned in our Refund Policy.</p>
                </section>

                {/* S12 */}
                <section id="s12" className="scroll-mt-24">
                  <SectionTitle number="12" title="Store Wallet, Credits, and Coupons" color="blue" />
                  <p>If we provide store wallet, store credit, coupons, referral credits, promotional balances, or reward points, they may be subject to separate conditions. Unless specifically stated:</p>
                  <BulletList items={[
                    'Store credits are not redeemable for cash.',
                    'Store wallet balance may be used only for purchases on our platform.',
                    'Promotional credits may have expiry dates.',
                    'Coupons cannot be clubbed unless permitted.',
                    'Misuse of coupons, wallet, or referral benefits may lead to cancellation or account restriction.',
                  ]} color="blue" />
                </section>

                {/* S13 */}
                <section id="s13" className="scroll-mt-24">
                  <SectionTitle number="13" title="Vendor and Seller Products" color="blue" />
                  <p>Some products may be sourced from local farmers, cooperatives, vendors, small businesses, or partner brands. We make reasonable efforts to ensure product quality and seller reliability.</p>
                  <p className="mt-3">Where applicable, product responsibility may also involve the respective manufacturer, vendor, supplier, or brand. Customers should review product labels, manufacturer details, expiry dates, ingredients, and usage instructions before consumption or use.</p>
                </section>

                {/* S14 */}
                <section id="s14" className="scroll-mt-24">
                  <SectionTitle number="14" title="Customer Responsibilities" color="blue" />
                  <p>Customers agree to:</p>
                  <BulletList items={[
                    'Provide accurate account, billing, and delivery information',
                    'Check products at the time of delivery where possible',
                    'Report damaged, wrong, missing, or quality-related issues within the required timeline',
                    'Store food products properly after delivery',
                    'Use products as per instructions',
                    'Avoid sharing false claims, abusive communication, or fraudulent refund requests',
                    'Not misuse offers, coupons, wallet credits, or return policies',
                  ]} color="blue" />
                </section>

                {/* S15 */}
                <section id="s15" className="scroll-mt-24">
                  <SectionTitle number="15" title="Food Safety and Product Usage" color="blue" />
                  <p>Our products may include grains, pulses, oils, spices, dairy products, snacks, sweets, health mixes, honey, natural products, and traditional food items. Customers are responsible for checking:</p>
                  <BulletList items={[
                    'Ingredients',
                    'Allergen warnings',
                    'Expiry or best-before date',
                    'Storage requirements',
                    'Suitability for children, elderly people, pregnant women, or people with medical conditions',
                    'Usage instructions',
                  ]} color="blue" />
                  <p className="mt-3">We do not provide medical, nutritional, or health advice. Any product-related health claim should be verified with a qualified professional where necessary.</p>
                </section>

                {/* S16 */}
                <section id="s16" className="scroll-mt-24">
                  <SectionTitle number="16" title="Intellectual Property" color="blue" />
                  <p>All content on this website, including brand name, logo, images, product descriptions, website design, graphics, text, icons, banners, and other materials, belongs to Namma Ooru Foods or its respective owners.</p>
                  <p className="mt-3">You may not copy, reproduce, modify, distribute, or use our content for commercial purposes without written permission.</p>
                </section>

                {/* S17 */}
                <section id="s17" className="scroll-mt-24">
                  <SectionTitle number="17" title="Limitation of Liability" color="blue" />
                  <p>To the maximum extent permitted by law, Namma Ooru Foods shall not be liable for indirect, incidental, special, consequential, or punitive damages arising from website use, product purchase, delivery delay, third-party services, payment failure, or customer misuse of products.</p>
                  <p className="mt-3">Our total liability for any claim shall not exceed the amount paid by the customer for the specific product or order giving rise to the claim.</p>
                </section>

                {/* S18 */}
                <section id="s18" className="scroll-mt-24">
                  <SectionTitle number="18" title="Force Majeure" color="blue" />
                  <p>We shall not be liable for delay or failure caused by events beyond our reasonable control, including natural disasters, strikes, transport disruption, internet failure, government restrictions, pandemics, supplier issues, payment gateway failure, or other unforeseen events.</p>
                </section>

                {/* S19 */}
                <section id="s19" className="scroll-mt-24">
                  <SectionTitle number="19" title="Grievance Redressal" color="blue" />
                  <p>For complaints related to orders, payments, delivery, returns, refunds, product quality, website use, or privacy, customers may contact us using the details below.</p>
                  <p className="mt-3">We will make reasonable efforts to acknowledge complaints within 48 hours and resolve them within the applicable timeline.</p>
                  <ContactBox />
                </section>

                {/* S20 */}
                <section id="s20" className="scroll-mt-24">
                  <SectionTitle number="20" title="Changes to Terms" color="blue" />
                  <p>We may update these Terms from time to time. The updated Terms will be posted on this page with the revised "Last Updated" date. Continued use of the website after changes means you accept the updated Terms.</p>
                </section>

                {/* S21 */}
                <section id="s21" className="scroll-mt-24">
                  <SectionTitle number="21" title="Governing Law and Jurisdiction" color="blue" />
                  <p>These Terms shall be governed by the laws of India. Any disputes shall be subject to the jurisdiction of the competent courts in <strong>Madurai, Tamil Nadu</strong>, unless otherwise required by applicable law.</p>
                </section>

              </div>
            </div>

            <PolicyNav active="terms" />
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
      <p className="pt-2">📞 <a href="tel:+919000896898" className="text-emerald-700 hover:underline">+91 9000 896 898</a></p>
      <p>✉️ <a href="mailto:support@nammaoorufoods.com" className="text-emerald-700 hover:underline">support@nammaoorufoods.com</a></p>
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
