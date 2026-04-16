'use client';

import React, { useState, useEffect } from 'react';
import { ChevronUp, MessageCircle } from 'lucide-react';

const StickyAssistant = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <>
      <div className="fixed bottom-6 right-6 md:bottom-10 md:right-10 z-[500] flex flex-col gap-3 md:gap-4">
        {isVisible && (
          <button
            onClick={scrollToTop}
            className="h-12 w-12 md:h-14 md:w-14 rounded-full bg-emerald-950 text-white flex items-center justify-center shadow-premium hover:bg-amber-500 transition-all hover:-translate-y-2 animate-in fade-in slide-in-from-bottom-4 active:scale-90"
          >
            <ChevronUp size={24} strokeWidth={3} />
          </button>
        )}
        
        {/* WhatsApp button — hidden for now, re-enable when ready
        <a
          href="https://wa.me/919876543210"
          target="_blank"
          rel="noopener noreferrer"
          className="h-12 w-12 md:h-14 md:w-14 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-premium hover:bg-emerald-600 transition-all hover:scale-110 active:scale-95 relative"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="h-7 w-7">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.414 0 .01 5.403.007 12.04c0 2.12.552 4.189 1.597 6.048L0 24l6.135-1.61a11.786 11.786 0 005.91 1.586h.005c6.637 0 12.041-5.403 12.044-12.04.002-3.218-1.248-6.242-3.517-8.511z" />
          </svg>
          <div className="absolute -top-1 -right-1 h-3.5 w-3.5 bg-red-500 border-2 border-white rounded-full animate-ping" />
        </a>
        */}
      </div>
    </>
  );
};

export default StickyAssistant;
