import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import NewsletterWidget from './NewsletterWidget';

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
    <footer className="w-full bg-[#fdfbf7] text-emerald-950 pt-16 pb-28 lg:pb-12 border-t border-emerald-900/5 relative z-10 mt-auto flex flex-col justify-center font-sans">

      <div className="absolute inset-0 bg-emerald-950/5 opacity-[0.03] pointer-events-none mix-blend-multiply" />
      <div className="standard-container mx-auto relative z-10">

        {/* MAIN GRID: col-span-2 brand on mobile, 4 cols on desktop */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12 w-full mb-10 md:mb-14">


          {/* COL 1: BRAND — full width on mobile */}
          <div className="col-span-2 lg:col-span-1 flex flex-col items-center lg:items-start text-center lg:text-left space-y-6 pb-8 lg:pb-0 border-b lg:border-b-0 border-emerald-900/10">
            <Link href="/" prefetch={false} className="inline-block transition-transform hover:scale-105 duration-300">
              <Image
                src="/logo.webp"
                alt="namma ooru Foods"
                width={200}
                height={60}
                style={{ height: '56px', width: 'auto', objectFit: 'contain' }}
              />
            </Link>
            <p className="text-[13px] leading-7 text-emerald-900 font-medium">
              9, First Floor, Opp. Jayam Hospital,<br />
              Chokkikulam, Madurai,<br />
              Tamil Nadu - 625002
            </p>
            <div className="pt-2 border-t border-emerald-900/10 w-full">
              <p className="text-[10px] font-bold text-emerald-800 uppercase tracking-widest mb-2">Direct Support</p>
              <Link href="tel:+919840012345" className="text-lg font-bold text-emerald-950 tracking-tight hover:text-amber-600 transition-colors">
                +91 9000 896 898
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
                  prefetch={false}
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
                { label: 'Refund Policy', href: '/refund-policy' },
                { label: 'Become a Seller', href: '/seller-hub' }
              ].map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  prefetch={false}
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
              Join 8,000+ families receiving exclusive Product alerts.
            </p>
            <NewsletterWidget />
          </div>
        </div>


        {/* APP DOWNLOAD BANNER */}
        <div className="my-10 rounded-[2rem] bg-gradient-to-r from-emerald-50 via-[#f0fdf4] to-amber-50/40 border border-emerald-900/8 px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-600 mb-1">Coming Soon</p>
            <h3 className="text-xl font-black text-emerald-950 tracking-tight">Download our App</h3>
            <p className="text-[13px] text-emerald-900/60 font-medium mt-1">Order pure organic food from your pocket</p>
          </div>

          <div className="flex items-center gap-3 flex-wrap justify-center">
            {/* Google Play Badge */}
            <a
              href="#"
              aria-label="Get it on Google Play"
              className="flex items-center gap-3 bg-emerald-950 text-white px-5 py-3 rounded-2xl border border-white/10 hover:bg-emerald-800 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 duration-300"
            >
              {/* Google Play triangle icon */}
              <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none">
                <path d="M3.18 23.88A2 2 0 0 1 2 22V2A2 2 0 0 1 3.18.12L13.56 11 3.18 23.88Z" fill="#EA4335" />
                <path d="M17.6 7.4 4.78.54 13.56 11 17.6 7.4Z" fill="#FBBC05" />
                <path d="M22 12.01c0-.69-.41-1.29-1.01-1.59l-3.39-1.01L13.56 11l4.04 3.6 3.39-1.01c.6-.3 1.01-.9 1.01-1.58Z" fill="#4285F4" />
                <path d="M4.78 23.46 17.6 16.6l-4.04-5.6-9.78 12.46Z" fill="#34A853" />
              </svg>
              <div>
                <p className="text-[9px] font-semibold text-white/80 uppercase tracking-widest leading-none mb-0.5">Get it on</p>
                <p className="text-[16px] font-black leading-none tracking-tight text-white">Google Play</p>
              </div>
            </a>

            {/* App Store Badge */}
            <a
              href="#"
              aria-label="Download on the App Store"
              className="flex items-center gap-3 bg-emerald-950 text-white px-5 py-3 rounded-2xl border border-white/10 hover:bg-emerald-800 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 duration-300"
            >
              {/* Apple logo SVG */}
              <svg viewBox="0 0 24 24" className="h-7 w-7 fill-white">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98l-.09.06c-.22.15-2.19 1.28-2.17 3.8.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.36 2.78M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11Z" />
              </svg>
              <div>
                <p className="text-[9px] font-semibold text-white/80 uppercase tracking-widest leading-none mb-0.5">Download on the</p>
                <p className="text-[16px] font-black leading-none tracking-tight text-white">App Store</p>
              </div>
            </a>
          </div>
        </div>

        {/* BOTTOM BAR: Legal & Social Icons */}
        <div className="pt-8 border-t border-emerald-900/10 flex flex-col lg:flex-row justify-between items-center gap-10">

          <div className="flex flex-col items-center lg:items-start gap-2">
            <p className="text-[11px] font-bold tracking-widest text-emerald-900/50 uppercase">
              © 2026 namma ooru Foods PVt Ltd
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
                target="_blank"
                rel="noopener noreferrer"
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
