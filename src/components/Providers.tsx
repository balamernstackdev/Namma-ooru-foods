'use client';

import React from 'react';
import { ThemeProvider } from "@/context/ThemeContext";
import { AuthProvider as RealAuthProvider } from "@/context/AuthContext";
import { ToastProvider } from "@/context/ToastContext";
import SmoothScroll from "@/components/SmoothScroll";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <RealAuthProvider>
        <ToastProvider>
          <SmoothScroll>
            {children}
          </SmoothScroll>
        </ToastProvider>
      </RealAuthProvider>
    </ThemeProvider>
  );
}
