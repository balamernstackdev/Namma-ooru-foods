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
      label: 'YouTube',
      href: '#',
      svg: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
          <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.42a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.42 8.6.42 8.6.42s6.88 0 8.6-.42a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" />
          <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" />
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
    <footer className="w-full bg-[#fdfbf7] text-emerald-950 pt-16 pb-12 border-t border-emerald-900/5 relative z-10 mt-auto flex flex-col justify-center font-sans">

      <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] pointer-events-none mix-blend-multiply" />
      <div className="standard-container mx-auto relative z-10">

        {/* MAIN GRID: col-span-2 brand on mobile, 4 cols on desktop */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12 w-full mb-10 md:mb-14">


          {/* COL 1: BRAND — full width on mobile */}
          <div className="col-span-2 lg:col-span-1 flex flex-col items-center lg:items-start text-center lg:text-left space-y-6 pb-8 lg:pb-0 border-b lg:border-b-0 border-emerald-900/10">
            <Link href="/" className="inline-block transition-transform hover:scale-105 duration-300">
              <Image
                src="/logo.webp"
                alt="Namma Orru Foods"
                width={160}
                height={48}
                style={{ height: '44px', width: 'auto', objectFit: 'contain' }}
              />
            </Link>
            <p className="text-[13px] leading-7 text-emerald-900 font-medium">
              9, First Floor, Opp. Jayam Hospital,<br />
              Chokkikulam, Madurai,<br />
              Tamil Nadu - 625002
            </p>
            <div className="pt-2 border-t border-emerald-900/10 w-full">
              <p className="text-[10px] font-bold text-emerald-800 uppercase tracking-widest mb-2">Direct Support</p>
              <Link href="tel:+919876543210" className="text-lg font-bold text-emerald-950 tracking-tight hover:text-amber-600 transition-colors">
                +91 98765 43210
              </Link>
            </div>
          </div>

          {/* COL 2: COLLECTIONS */}
          <div className="flex flex-col items-start space-y-5">
            <h4 className="text-emerald-950 font-bold text-[12px] uppercase tracking-widest border-l-2 border-amber-400 pl-3">
              Collections
            </h4>
            <nav className="flex flex-col items-start space-y-3">
              {['Grains & Pulses', 'Organic Oils', 'Authentic Spices', 'Dairy Products', 'Indian Snacks', 'Local Sweets'].map((item) => (
                <Link
                  key={item}
                  href={`/products?category=${encodeURIComponent(item)}`}
                  className="text-[13px] text-emerald-900 hover:text-amber-600 transition-all font-medium"
                >
                  {item}
                </Link>
              ))}
            </nav>
          </div>

          {/* COL 3: EXPLORE */}
          <div className="flex flex-col items-start space-y-5">
            <h4 className="text-emerald-950 font-black text-[12px] uppercase tracking-widest border-l-2 border-amber-400 pl-3">
              Explore
            </h4>
            <nav className="flex flex-col items-start space-y-3">
              {[
                { label: 'Our Story', href: '/about' },
                { label: 'Store Terms', href: '/terms' },
                { label: 'Privacy Policy', href: '/privacy' },
                { label: 'Refund Policy', href: '/refund' }
              ].map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="text-[13px] text-emerald-900 hover:text-emerald-950 transition-colors font-medium"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* COL 4: NEWSLETTER — full width on mobile */}
          <div className="col-span-2 lg:col-span-1 flex flex-col space-y-5">
            <h4 className="text-emerald-950 font-bold text-[12px] uppercase tracking-widest border-l-2 border-amber-400 pl-3">
              Newsletter
            </h4>
            <p className="text-emerald-900 text-[13px] leading-6 font-medium">
              Join 8,000+ families receiving exclusive harvest alerts.
            </p>
            <div className="relative group w-full">
              <input
                type="email"
                placeholder="Your email address"
                className="w-full h-14 rounded-2xl bg-white border-2 border-emerald-900/10 text-emerald-950 placeholder:text-emerald-900/40 text-[13px] font-bold outline-none px-5 pr-24 focus:border-amber-500 shadow-sm transition-all"
              />
              <button
                className="absolute right-2 top-2 bottom-2 px-6 rounded-xl bg-emerald-950 text-white text-[11px] font-bold uppercase tracking-widest shadow-md hover:bg-amber-600 transition-colors"
              >
                Join
              </button>
            </div>
          </div>
        </div>


        {/* BOTTOM BAR: Legal & Social Icons */}
        <div className="pt-8 border-t border-emerald-900/10 flex flex-col lg:flex-row justify-between items-center gap-10">

          <div className="flex flex-col items-center lg:items-start gap-2">
            <p className="text-[11px] font-bold tracking-widest text-emerald-900/50 uppercase">
              © 2026 Namma Orru Foods Ltd.
            </p>
            <p className="text-[10px] text-emerald-900/40 font-bold tracking-[0.2em] uppercase">
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
