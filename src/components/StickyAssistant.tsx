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
      {/* Desktop Floating Actions */}
      <div className="fixed bottom-10 right-10 z-[140] hidden md:flex flex-col gap-4">
        {isVisible && (
          <button
            onClick={scrollToTop}
            className="h-14 w-14 rounded-full bg-white border border-slate-100 text-emerald-950 flex items-center justify-center shadow-premium hover:bg-emerald-950 hover:text-white transition-all hover:-translate-y-2 animate-in fade-in slide-in-from-bottom-4"
          >
            <ChevronUp size={24} strokeWidth={3} />
          </button>
        )}
        
        <a
          href="https://wa.me/919876543210"
          target="_blank"
          rel="noopener noreferrer"
          className="h-14 w-14 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-premium hover:bg-emerald-600 transition-all hover:scale-110 active:scale-95"
        >
          <MessageCircle size={28} className="fill-white" />
          <div className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 border-2 border-white rounded-full animate-ping" />
        </a>
      </div>
    </>
  );
};

export default StickyAssistant;
