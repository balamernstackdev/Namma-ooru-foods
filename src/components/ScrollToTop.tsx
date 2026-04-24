'use client';

import { useState, useEffect } from 'react';
import { ChevronUp } from 'lucide-react';

export default function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);

  // Show button when page is scrolled down
  const toggleVisibility = () => {
    if (window.pageYOffset > 300) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  // Set the top cordinate to 0
  // make scrolling smooth
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  useEffect(() => {
    window.addEventListener('scroll', toggleVisibility);
    // Also force scroll to top on initial page load to fix the refresh issue
    window.scrollTo(0, 0);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  return (
    <div className="fixed bottom-24 right-6 z-[999]">
      {isVisible && (
        <button
          onClick={scrollToTop}
          className="h-14 w-14 rounded-2xl bg-emerald-950 text-amber-400 shadow-2xl flex items-center justify-center transition-all duration-300 hover:bg-emerald-900 hover:scale-110 active:scale-95 border border-white/20 animate-in fade-in slide-in-from-bottom-4"
        >
          <ChevronUp size={24} strokeWidth={3} />
        </button>
      )}
    </div>
  );
}
