'use client';

import React, { useEffect, useState } from 'react';
import { motion, useSpring, useMotionValue } from 'framer-motion';

const CustomCursor = () => {
  const [isHovered, setIsHovered] = useState(false);
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);

  const springConfig = { damping: 25, stiffness: 150 };
  const springX = useSpring(cursorX, springConfig);
  const springY = useSpring(cursorY, springConfig);

  useEffect(() => {
    const moveCursor = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
    };

    const handleHover = () => {
      const hoveredElements = document.querySelectorAll('a, button, .card, input');
      hoveredElements.forEach((el) => {
        el.addEventListener('mouseenter', () => setIsHovered(true));
        el.addEventListener('mouseleave', () => setIsHovered(false));
      });
    };

    window.addEventListener('mousemove', moveCursor);
    handleHover();

    return () => {
      window.removeEventListener('mousemove', moveCursor);
    };
  }, [cursorX, cursorY]);

  return (
    <motion.div
      className="fixed top-0 left-0 w-8 h-8 rounded-full bg-amber-500/20 pointer-events-none z-[9999] hidden lg:block backdrop-blur-[2px] border border-amber-500/30"
      style={{
        x: springX,
        y: springY,
        translateX: '-50%',
        translateY: '-50%',
        scale: isHovered ? 2.5 : 1,
      }}
    >
        <motion.div 
            className="absolute inset-0 m-auto w-1 h-1 bg-amber-600 rounded-full"
            animate={{ scale: isHovered ? 0 : 1 }}
        />
    </motion.div>
  );
};

export default CustomCursor;
