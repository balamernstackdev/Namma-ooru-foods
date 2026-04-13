import React from 'react';
import Link from 'next/link';

const Footer = () => {
  return (
    <footer className="w-full bg-[#020617] text-white pt-32 pb-24 md:pb-32 border-t border-white/5 relative z-10 mt-auto min-h-[400px] flex flex-col justify-center">
      <div className="standard-container mx-auto">
        
        {/* TOP SECTION: 4 Columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-16 gap-y-16 w-full mb-32">
          
          {/* COLUMN 1: THE HUB */}
          <div className="flex flex-col space-y-8">
            <h4 className="text-orange-500 font-bold text-xs uppercase tracking-[0.3em]">
              The Hub
            </h4>
            <div className="space-y-6">
              <p className="text-sm leading-relaxed text-gray-400 font-medium max-w-[240px]">
                Namma Orru Foods HQ,<br />
                Sustainable Harvest Square,<br />
                Tamil Nadu, 600001
              </p>
              <div className="pt-4 border-t border-white/5">
                <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-2">Direct Support</p>
                <p className="text-xl font-black text-white tracking-tight">+91 98765 43210</p>
              </div>
            </div>
          </div>
  
          {/* COLUMN 2: HARVESTS */}
          <div className="flex flex-col space-y-8">
            <h4 className="text-orange-500 font-bold text-xs uppercase tracking-[0.3em]">
              Harvests
            </h4>
            <nav className="flex flex-col space-y-4">
              {['Grains & Pulses', 'Organic Oils', 'Authentic Spices', 'Dairy Products', 'Traditional Snacks'].map((item) => (
                <Link 
                  key={item} 
                  href={`/products?category=${encodeURIComponent(item)}`} 
                  className="text-sm text-gray-400 hover:text-white transition-colors font-medium w-fit"
                >
                  {item}
                </Link>
              ))}
            </nav>
          </div>
  
          {/* COLUMN 3: GOVERNANCE */}
          <div className="flex flex-col space-y-8">
            <h4 className="text-orange-500 font-bold text-xs uppercase tracking-[0.3em]">
              Governance
            </h4>
            <nav className="flex flex-col space-y-4">
              {[
                { label: 'Our Story', href: '/about' },
                { label: 'Traceability', href: '#' },
                { label: 'Logistics', href: '#' },
                { label: 'Security', href: '#' },
                { label: 'Terms', href: '#' }
              ].map((item) => (
                <Link 
                  key={item.label} 
                  href={item.href} 
                  className="text-sm text-gray-400 hover:text-white transition-colors font-medium w-fit"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
  
          {/* COLUMN 4: THE CIRCLE */}
          <div className="flex flex-col space-y-8">
            <h4 className="text-orange-500 font-bold text-xs uppercase tracking-[0.3em]">
              The Circle
            </h4>
            <p className="text-gray-400 text-sm leading-relaxed max-w-[280px]">
              Join 8,000+ families receiving exclusive harvest alerts and farm stories.
            </p>
            
            <div className="relative group w-full max-w-[320px]">
              <input
                type="email"
                placeholder="Enter email"
                className="w-full h-14 rounded-full bg-white/5 border border-white/10 text-white placeholder:text-gray-600 text-sm font-medium outline-none px-6 focus:border-orange-500 transition-all"
              />
              <button 
                className="absolute right-1.5 top-1.5 bottom-1.5 px-6 rounded-full bg-orange-500 text-white text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-orange-600 transition-all"
              >
                JOIN
              </button>
            </div>
          </div>
        </div>
  
        {/* BOTTOM BAR: Legal & Social */}
        <div className="pt-20 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-12">
          <p className="text-[10px] font-black tracking-[0.4em] text-gray-600 uppercase">
            © 2026 NAMMA ORRU FOODS LTD.
          </p>
          
          <div className="flex flex-wrap justify-center gap-x-10 gap-y-4">
            {['INSTAGRAM', 'WHATSAPP', 'FACEBOOK', 'LINKEDIN'].map(social => (
              <Link 
                key={social} 
                href="#" 
                className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 hover:text-orange-500 transition-colors"
              >
                {social}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
