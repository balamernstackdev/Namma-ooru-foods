'use client';

import React from 'react';
import { ThemeProvider } from "@/context/ThemeContext";
import { AuthProvider as RealAuthProvider } from "@/context/AuthContext";
import { ToastProvider } from "@/context/ToastContext";
import { CartProvider } from "@/context/CartContext";
import { PlatformSettingsProvider } from "@/context/PlatformSettingsContext";
import SmoothScroll from "@/components/SmoothScroll";
import { SWRConfig } from 'swr';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SWRConfig value={{
      fetcher: (url: string) => fetch(url).then(res => res.json()),
      revalidateOnFocus: true,
      shouldRetryOnError: true,
      errorRetryCount: 2,
      onError: (error, key) => {
        console.error(`%c SWR Error [Key: ${key}]`, 'color: #dc2626; font-weight: bold;', error);
      }
    }}>
      <ThemeProvider>
        <PlatformSettingsProvider>
          <RealAuthProvider>
            <ToastProvider>
              <CartProvider>
                <SmoothScroll>
                  {children}
                </SmoothScroll>
              </CartProvider>
            </ToastProvider>
          </RealAuthProvider>
        </PlatformSettingsProvider>
      </ThemeProvider>
    </SWRConfig>
  );
}

