import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

const Footer = () => {
  const socialLinks = [
    {
      label: 'Instagram',
      href: '#',
      svg: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
          <rect x="2" y="2" width="20" height="20" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
        </svg>
      ),
    },
    {
      label: 'WhatsApp',
      href: '#',
      svg: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
          <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
        </svg>
      ),
    },
    {
      label: 'Facebook',
      href: '#',
      svg: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
          <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
        </svg>
      ),
    },
    {
      label: 'LinkedIn',
      href: '#',
      svg: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
          <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" /><rect x="2" y="9" width="4" height="12" /><circle cx="4" cy="4" r="2" />
        </svg>
      ),
    },
  ];

  return (
    <footer className="w-full bg-[#fdfbf7] text-emerald-950 pt-24 pb-20 border-t border-emerald-900/5 relative z-10 mt-auto flex flex-col justify-center font-sans">
      <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] pointer-events-none mix-blend-multiply" />
      <div className="standard-container mx-auto relative z-10">

        {/* TOP SECTION: 4 Columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-16 w-full mb-24">

          {/* COLUMN 1: BRAND IDENTITY */}
          <div className="flex flex-col items-center sm:items-start text-center sm:text-left space-y-8">
            <div className="mb-2">
              <Link href="/" className="inline-block transition-transform hover:scale-105 duration-300">
                <Image
                  src="/logo.webp"
                  alt="Namma Orru Foods"
                  width={180}
                  height={54}
                  className="h-12 w-auto object-contain"
                />
              </Link>
            </div>
            <div className="space-y-6">
              <p className="text-[15px] leading-8 text-emerald-900 font-medium max-w-[280px]">
                Namma Orru Foods HQ,<br />
                Sustainable Harvest Square,<br />
                Tamil Nadu, 600001
              </p>
              <div className="pt-6 border-t border-emerald-900/10">
                <p className="text-[11px] font-black text-emerald-800 uppercase tracking-widest mb-3">Direct Support</p>
                <Link href="tel:+919876543210" className="text-2xl font-black text-emerald-950 tracking-tight hover:text-amber-600 transition-colors">
                  +91 98765 43210
                </Link>
              </div>
            </div>
          </div>

          {/* COLUMN 2: COLLECTIONS */}
          <div className="flex flex-col items-center sm:items-start text-center sm:text-left space-y-8">
            <h4 className="text-emerald-950 font-black text-[14px] uppercase tracking-widest">
              Collections
            </h4>
            <nav className="flex flex-col items-center sm:items-start space-y-5">
              {['Grains & Pulses', 'Organic Oils', 'Authentic Spices', 'Dairy Products', 'Traditional Snacks', 'Local Sweets'].map((item) => (
                <Link
                  key={item}
                  href={`/products?category=${encodeURIComponent(item)}`}
                  className="text-[15px] text-emerald-900 hover:text-amber-600 hover:translate-x-1 transition-all font-medium"
                >
                  {item}
                </Link>
              ))}
            </nav>
          </div>

          {/* COLUMN 3: EXPLORE */}
          <div className="flex flex-col items-center sm:items-start text-center sm:text-left space-y-8">
            <h4 className="text-emerald-950 font-black text-[14px] uppercase tracking-widest">
              Explore
            </h4>
            <nav className="flex flex-col items-center sm:items-start space-y-5">
              {[
                { label: 'Our Heritage', href: '/about' },
                { label: 'Traceability', href: '#' },
                { label: 'Supply Chain', href: '#' },
                { label: 'Security & Privacy', href: '#' },
                { label: 'Terms of Service', href: '#' }
              ].map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="text-[15px] text-emerald-900 hover:text-emerald-950 transition-colors font-medium hover:translate-x-1"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* COLUMN 4: NEWSLETTER */}
          <div className="flex flex-col items-center sm:items-start text-center sm:text-left space-y-8">
            <h4 className="text-emerald-950 font-black text-[14px] uppercase tracking-widest">
              Newsletter
            </h4>
            <p className="text-emerald-900 text-[15px] leading-7 max-w-[320px] font-medium">
              Join over 8,000+ families receiving exclusive harvest alerts and farm stories.
            </p>

            <div className="relative group w-full max-w-[340px]">
              <input
                type="email"
                placeholder="Your email address"
                className="w-full h-16 rounded-2xl bg-white border-2 border-emerald-900/10 text-emerald-950 placeholder:text-emerald-900/50 text-[15px] font-bold outline-none px-6 pr-32 focus:border-amber-500 shadow-sm transition-all text-center sm:text-left"
              />
              <button
                className="absolute right-2 top-2 bottom-2 px-8 rounded-xl bg-emerald-950 text-white text-[12px] font-black uppercase tracking-widest transition-colors shadow-md hover:bg-amber-600 hover:text-white"
                style={{ backgroundColor: '#022c22', color: 'white' }}
              >
                Join
              </button>
            </div>
          </div>
        </div>

        {/* BOTTOM BAR: Legal & Social Icons */}
        <div className="pt-12 border-t border-emerald-900/10 flex flex-col lg:flex-row justify-between items-center gap-10">
          <div className="flex flex-col items-center lg:items-start gap-2">
            <p className="text-[11px] font-black tracking-widest text-emerald-900/50 uppercase">
              © 2026 Namma Orru Foods Ltd.
            </p>
            <p className="text-[10px] text-emerald-900/40 font-black tracking-[0.2em] uppercase">
              Directly sourced. Consciously delivered.
            </p>
          </div>

          <div className="flex items-center gap-4">
            {socialLinks.map((social) => (
              <Link
                key={social.label}
                href={social.href}
                className="h-12 w-12 rounded-full border border-emerald-900/10 flex items-center justify-center text-emerald-950 hover:bg-emerald-950 hover:text-white hover:-translate-y-1 transition-all duration-300"
                aria-label={social.label}
              >
                {social.svg}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
