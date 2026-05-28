'use client';

import React from 'react';
import { ThemeProvider } from "@/context/ThemeContext";
import { AuthProvider as RealAuthProvider } from "@/context/AuthContext";
import { ToastProvider } from "@/context/ToastContext";
import { CartProvider } from "@/context/CartContext";
import SmoothScroll from "@/components/SmoothScroll";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <RealAuthProvider>
        <ToastProvider>
          <CartProvider>
            <SmoothScroll>
              {children}
            </SmoothScroll>
          </CartProvider>
        </ToastProvider>
      </RealAuthProvider>
    </ThemeProvider>
  );
}

