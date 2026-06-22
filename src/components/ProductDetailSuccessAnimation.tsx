'use client';

import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Check } from 'lucide-react';

interface SuccessAnimationProps {
  onComplete?: () => void;
  buttonRef?: React.RefObject<HTMLButtonElement | HTMLDivElement | null>;
}

export default function ProductDetailSuccessAnimation({ onComplete, buttonRef }: SuccessAnimationProps) {
  useEffect(() => {
    let x = 0.5;
    let y = 0.8;

    if (buttonRef && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      // Calculate viewport percentages for canvas-confetti
      x = (rect.left + rect.width / 2) / window.innerWidth;
      y = (rect.top + rect.height / 2) / window.innerHeight;
    }

    // Trigger canvas-confetti burst
    confetti({
      particleCount: 40,
      spread: 50,
      origin: { x, y },
      colors: ['#10B981', '#34D399', '#059669', '#F59E0B'], // success green hues and accent gold
      zIndex: 99999,
    });

    // Fire onComplete after 1.5s
    const timer = setTimeout(() => {
      if (onComplete) onComplete();
    }, 1500);

    return () => clearTimeout(timer);
  }, [buttonRef, onComplete]);

  // Define radial positions for particles burst
  const particles = Array.from({ length: 8 }).map((_, i) => {
    const angle = (i * Math.PI * 2) / 8;
    const distance = 45 + Math.random() * 15;
    return {
      x: Math.cos(angle) * distance,
      y: Math.sin(angle) * distance,
    };
  });

  return (
    <div className="absolute inset-0 pointer-events-none z-[9999] flex items-center justify-center overflow-visible">
      {/* Floating Checkmark Overlay */}
      <motion.div
        initial={{ y: 10, opacity: 0, scale: 0.5 }}
        animate={{ y: -45, opacity: 1, scale: 1.2 }}
        exit={{ opacity: 0, y: -60 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="absolute h-9 w-9 bg-emerald-600 rounded-full flex items-center justify-center text-white shadow-lg border border-emerald-400"
      >
        <Check size={18} strokeWidth={4} />
      </motion.div>

      {/* Floating Green Success Particles */}
      {particles.map((p, idx) => (
        <motion.div
          key={idx}
          initial={{ x: 0, y: 0, scale: 0.2, opacity: 1 }}
          animate={{ x: p.x, y: p.y, scale: 1, opacity: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="absolute h-2.5 w-2.5 bg-emerald-450 rounded-full"
        />
      ))}
    </div>
  );
}
