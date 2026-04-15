'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { CheckCircle2, ShoppingCart, X } from 'lucide-react';
import Link from 'next/link';

interface Toast {
  id: number;
  message: string;
  productName: string;
}

interface ToastContextType {
  addToast: (message: string, productName: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (message: string, productName: string) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, productName }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  };

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed top-24 right-6 left-6 md:left-auto md:w-[400px] z-[200] flex flex-col gap-3">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="w-full bg-emerald-950 text-white p-5 rounded-2xl shadow-2xl flex items-center justify-between gap-4 animate-in fade-in slide-in-from-top-6 duration-500 border border-emerald-800/50 backdrop-blur-md"
          >
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-xl bg-amber-500 flex items-center justify-center text-emerald-950 shrink-0">
                <ShoppingCart size={20} strokeWidth={3} />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-widest text-amber-500 mb-1">{toast.message}</span>
                <span className="text-sm font-bold leading-tight line-clamp-1">{toast.productName}</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/cart"
                className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all"
              >
                View Cart
              </Link>
              <button 
                onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
                className="text-white/40 hover:text-white transition-colors"
              >
                <X size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within a ToastProvider');
  return context;
};
