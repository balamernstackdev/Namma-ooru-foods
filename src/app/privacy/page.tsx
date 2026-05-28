import React from 'react';
import Link from 'next/link';
import { ChevronLeft, ShieldCheck } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | Namma Ooru Foods',
  description: 'Read how Namma Ooru Foods collects, uses, protects, and manages customer information for online orders, payments, delivery, and support.',
};

const sections = [
  { id: 'intro',       label: 'Introduction' },
  { id: 's1',         label: '1. Information We Collect' },
  { id: 's2',         label: '2. How We Use It' },
  { id: 's3',         label: '3. Cookies' },
  { id: 's4',         label: '4. Sharing of Information' },
  { id: 's5',         label: '5. Marketing' },
  { id: 's6',         label: '6. Data Security' },
  { id: 's7',         label: '7. Data Retention' },
  { id: 's8',         label: '8. Your Rights' },
  { id: 's9',         label: '9. Children\'s Privacy' },
  { id: 's10',        label: '10. Third-Party Links' },
  { id: 's11',        label: '11. Policy Updates' },
  { id: 's12',        label: '12. Contact Us' },
];

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#f8fafc] pt-8 md:pt-14 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Back link */}
        <Link href="/" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 hover:text-emerald-800 transition-colors mb-10 group">
          <ChevronLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          Back to Home
        </Link>

        <div className="flex flex-col lg:flex-row gap-10 items-start">

          {/* ── Sticky ToC sidebar ── */}
          <aside className="hidden lg:block w-64 shrink-0 sticky top-24 self-start">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
              <p className="text-[9px] font-black uppercase tracking-[0.35em] text-slate-400 mb-4">Contents</p>
              <nav className="flex flex-col gap-1">
                {sections.map(s => (
                  <a key={s.id} href={`#${s.id}`}
                    className="text-[11px] font-semibold text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 px-3 py-1.5 rounded-lg transition-colors">
                    {s.label}
                  </a>
                ))}
              </nav>
            </div>
          </aside>

          {/* ── Main content ── */}
          <div className="flex-1 min-w-0">
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8 md:p-14">

              {/* Header */}
              <div className="flex items-center gap-5 mb-10">
                <div className="h-14 w-14 rounded-2xl bg-emerald-50 flex items-center justify-center shrink-0">
                  <ShieldCheck className="h-7 w-7 text-emerald-700" />
                </div>
                <div>
                  <h1 className="text-3xl md:text-4xl font-black text-[#022c22] tracking-tighter leading-tight">Privacy Policy</h1>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-300 mt-1">Last Updated: May 2026</p>
                </div>
              </div>

              {/* Intro */}
              <div id="intro" className="scroll-mt-24 mb-10 p-6 bg-emerald-50/60 rounded-2xl border border-emerald-100">
                <p className="text-sm text-emerald-900 font-medium leading-relaxed">
                  At <strong>Namma Ooru Foods Pvt Ltd</strong> ("Namma Ooru Foods", "we", "our", or "us"), we respect your privacy and are committed to protecting the personal information you share with us. This Privacy Policy explains how we collect, use, store, disclose, and protect your information when you visit our website, create an account, place an order, contact us, or use any of our ecommerce services.
                </p>
                <p className="text-sm text-emerald-900 font-medium leading-relaxed mt-3">
                  By using our website, you agree to the practices described in this Privacy Policy.
                </p>
              </div>

              <div className="prose prose-slate max-w-none text-slate-600 text-sm leading-relaxed space-y-10">

                {/* S1 */}
                <section id="s1" className="scroll-mt-24">
                  <SectionTitle number="1" title="Information We Collect" />
                  <SubTitle>Personal Information</SubTitle>
                  <p>When you register, place an order, submit an enquiry, request support, or subscribe to updates, we may collect:</p>
                  <BulletList items={['Full name','Mobile number','Email address','Billing address','Delivery address','Order details','Customer support communication','Refund or return request details']} />

                  <SubTitle>Account Information</SubTitle>
                  <p>If you create an account, we may collect login-related information required to manage your account securely. Passwords, where applicable, are stored in encrypted or protected formats and are not visible to our team.</p>

                  <SubTitle>Order and Delivery Information</SubTitle>
                  <p>To process and deliver your orders, we collect details such as:</p>
                  <BulletList items={['Products ordered','Quantity','Delivery location','Payment status','Order status','Delivery instructions','Return/refund request information']} />

                  <SubTitle>Payment Information</SubTitle>
                  <p>We do not store your complete card, UPI, net banking, or payment credentials on our servers. Payments are processed through secure third-party payment gateway providers. We may receive limited payment confirmation details such as transaction ID, payment status, order amount, and payment method.</p>

                  <SubTitle>Device and Usage Information</SubTitle>
                  <p>When you visit our website, we may automatically collect technical information such as:</p>
                  <BulletList items={['IP address','Browser type','Device type','Operating system','Pages visited','Time spent on the website','Referring source','Cookies and similar tracking data']} />
                  <p>This helps us improve website performance, security, customer experience, and analytics.</p>

                  <SubTitle>Location Information</SubTitle>
                  <p>We may collect approximate or delivery-related location information to check service availability, calculate delivery feasibility, and complete order delivery.</p>
                </section>

                {/* S2 */}
                <section id="s2" className="scroll-mt-24">
                  <SectionTitle number="2" title="How We Use Your Information" />
                  <p>We use your information for the following purposes:</p>
                  <BulletList items={[
                    'To create and manage your account',
                    'To process, confirm, pack, ship, and deliver orders',
                    'To send order updates, invoices, delivery notifications, and support messages',
                    'To verify payments and prevent fraudulent transactions',
                    'To handle cancellation, return, replacement, and refund requests',
                    'To improve our products, website, service quality, and customer experience',
                    'To send promotional offers, newsletters, and updates, where permitted',
                    'To respond to customer enquiries and complaints',
                    'To comply with applicable legal, tax, regulatory, and ecommerce obligations',
                    'To protect our website, customers, sellers, vendors, and business from misuse or fraud',
                  ]} />
                </section>

                {/* S3 */}
                <section id="s3" className="scroll-mt-24">
                  <SectionTitle number="3" title="Cookies and Tracking Technologies" />
                  <p>Our website may use cookies and similar technologies to improve your browsing experience, remember preferences, analyze website traffic, and support marketing or remarketing activities.</p>
                  <p className="mt-3">You may disable cookies through your browser settings. However, some website features such as login, cart, checkout, and personalized experience may not function properly if cookies are disabled.</p>
                </section>

                {/* S4 */}
                <section id="s4" className="scroll-mt-24">
                  <SectionTitle number="4" title="Sharing of Information" />
                  <p>We do not sell your personal information.</p>
                  <p className="mt-3">We may share necessary information with trusted parties only when required to provide our services, including:</p>
                  <BulletList items={[
                    'Payment gateway providers',
                    'Delivery and logistics partners',
                    'Vendor/seller partners involved in fulfilling your order',
                    'Website hosting and technology service providers',
                    'Analytics and marketing service providers',
                    'Customer support tools',
                    'Government, law enforcement, legal, tax, or regulatory authorities when required by law',
                  ]} />
                  <p className="mt-3">Such sharing is limited to what is necessary for order fulfilment, service delivery, compliance, fraud prevention, and business operations.</p>
                </section>

                {/* S5 */}
                <section id="s5" className="scroll-mt-24">
                  <SectionTitle number="5" title="Marketing Communications" />
                  <p>If you subscribe to our newsletter, offers, harvest alerts, or promotional messages, we may contact you through email, SMS, WhatsApp, phone, or similar communication channels.</p>
                  <p className="mt-3">You may opt out of marketing communication at any time by following the unsubscribe option where available or by contacting us directly.</p>
                  <p className="mt-3">Transactional messages related to orders, delivery, payments, refunds, and account activity may still be sent even if you opt out of promotional communication.</p>
                </section>

                {/* S6 */}
                <section id="s6" className="scroll-mt-24">
                  <SectionTitle number="6" title="Data Security" />
                  <p>We take reasonable security measures to protect your personal information from unauthorized access, misuse, loss, alteration, or disclosure. These measures may include secure servers, access controls, encrypted systems, payment gateway security, and internal process safeguards.</p>
                  <p className="mt-3">However, no digital platform can guarantee complete security. Customers are advised to keep their login credentials confidential and avoid sharing OTPs, passwords, or payment details with anyone.</p>
                </section>

                {/* S7 */}
                <section id="s7" className="scroll-mt-24">
                  <SectionTitle number="7" title="Data Retention" />
                  <p>We retain your information only for as long as necessary to fulfil the purposes mentioned in this Privacy Policy, including order processing, customer support, legal compliance, accounting, tax records, fraud prevention, and business recordkeeping.</p>
                  <p className="mt-3">When information is no longer required, we may delete, anonymize, or securely archive it as permitted by applicable law.</p>
                </section>

                {/* S8 */}
                <section id="s8" className="scroll-mt-24">
                  <SectionTitle number="8" title="Your Rights" />
                  <p>Subject to applicable law, you may request to:</p>
                  <BulletList items={[
                    'Access the personal information we hold about you',
                    'Correct inaccurate or incomplete information',
                    'Update your account or delivery details',
                    'Withdraw consent for optional communications',
                    'Request deletion of certain personal information',
                    'Raise a complaint regarding privacy or data handling',
                  ]} />
                  <p className="mt-3">To make a request, please contact us using the details provided below.</p>
                </section>

                {/* S9 */}
                <section id="s9" className="scroll-mt-24">
                  <SectionTitle number="9" title="Children's Privacy" />
                  <p>Our website is intended for use by individuals who are legally capable of entering into transactions. If a minor uses the website, it should be under the supervision of a parent or legal guardian. We do not knowingly collect personal information from children without appropriate consent.</p>
                </section>

                {/* S10 */}
                <section id="s10" className="scroll-mt-24">
                  <SectionTitle number="10" title="Third-Party Links" />
                  <p>Our website may contain links to third-party websites, payment gateways, logistics partners, or external services. We are not responsible for the privacy practices, content, or security of third-party websites. Please review their privacy policies before sharing information with them.</p>
                </section>

                {/* S11 */}
                <section id="s11" className="scroll-mt-24">
                  <SectionTitle number="11" title="Updates to This Privacy Policy" />
                  <p>We may update this Privacy Policy from time to time to reflect changes in our business, website, legal requirements, or operational practices. The updated version will be posted on this page with a revised "Last Updated" date.</p>
                </section>

                {/* S12 */}
                <section id="s12" className="scroll-mt-24">
                  <SectionTitle number="12" title="Contact Us" />
                  <p>For privacy-related questions, corrections, complaints, or requests, please contact:</p>
                  <ContactBox />
                </section>

              </div>
            </div>

            {/* Policy links footer */}
            <PolicyNav active="privacy" />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Shared sub-components ── */

function SectionTitle({ number, title }: { number: string; title: string }) {
  return (
    <div className="flex items-baseline gap-3 mb-4 pb-3 border-b border-slate-100">
      <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-full w-6 h-6 flex items-center justify-center shrink-0 text-center leading-none">{number}</span>
      <h2 className="text-lg font-black text-[#022c22] tracking-tight">{title}</h2>
    </div>
  );
}

function SubTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="text-[13px] font-black text-slate-700 uppercase tracking-wider mt-5 mb-2">{children}</h3>;
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="mt-2 space-y-1.5 pl-1">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2.5">
          <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
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
