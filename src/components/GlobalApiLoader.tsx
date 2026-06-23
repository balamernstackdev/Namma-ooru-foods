'use client';

import React, { useEffect, useState } from 'react';

export default function GlobalApiLoader() {
  const [activeCount, setActiveCount] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleActivity = (e: Event) => {
      const customEvent = e as CustomEvent;
      const count = customEvent.detail.activeRequests;
      setActiveCount(count);
      if (count > 0) {
        setVisible(true);
      } else {
        // Delay hiding slightly for a smooth, natural-feeling transition
        const timer = setTimeout(() => {
          setVisible(false);
        }, 400);
        return () => clearTimeout(timer);
      }
    };

    window.addEventListener('api-activity', handleActivity);
    return () => {
      window.removeEventListener('api-activity', handleActivity);
    };
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed top-0 left-0 right-0 h-[3px] z-[99999] overflow-hidden bg-emerald-50/40">
      <div 
        className="h-full bg-emerald-600 transition-all duration-300"
        style={{
          width: activeCount === 0 ? '100%' : '75%',
          animation: activeCount > 0 ? 'api-progress-shimmer 2.5s infinite ease-out' : 'none',
        }}
      />
      <style>{`
        @keyframes api-progress-shimmer {
          0% { width: 0%; }
          30% { width: 50%; }
          70% { width: 75%; }
          100% { width: 85%; }
        }
      `}</style>
    </div>
  );
}
