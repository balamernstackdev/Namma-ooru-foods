'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface PageRevealProps {
  children: ReactNode;
  delay?: number;
}

export default function PageReveal({ children, delay = 0 }: PageRevealProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ 
        duration: 0.8, 
        delay,
        ease: [0.16, 1, 0.3, 1] 
      }}
    >
      {children}
    </motion.div>
  );
}

export const StaggerContainer = ({ children, delay = 0 }: { children: ReactNode, delay?: number }) => {
    return (
        <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={{
                hidden: { opacity: 0 },
                visible: {
                    opacity: 1,
                    transition: {
                        staggerChildren: 0.1,
                        delayChildren: delay
                    }
                }
            }}
        >
            {children}
        </motion.div>
    );
}

export const StaggerItem = ({ children }: { children: ReactNode }) => {
    return (
        <motion.div
            variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } }
            }}
        >
            {children}
        </motion.div>
    );
}
