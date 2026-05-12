'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { CheckCircle2, ShoppingCart, X } from 'lucide-react';
import Link from 'next/link';

interface Toast {
  id: number;
  message: string;
  title?: string;
  type: 'success' | 'error' | 'info';
}

interface ToastContextType {
  addToast: (title: string, message: string, type?: 'success' | 'error' | 'info') => void;
  toast: {
     success: (msg: string) => void;
     error: (msg: string) => void;
  };
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (title: string, message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  };

  const toastHelper = {
     success: (msg: string) => addToast('Success', msg, 'success'),
     error: (msg: string) => addToast('Error', msg, 'error'),
  };

  return (
    <ToastContext.Provider value={{ addToast, toast: toastHelper }}>
      {children}
      <div className="fixed bottom-10 right-10 z-[300] flex flex-col gap-3">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`flex items-center gap-3 px-6 py-3.5 rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.3)] animate-in fade-in slide-in-from-bottom-4 duration-500 border border-white/10 ${
              toast.type === 'error' 
                ? 'bg-red-950 text-white' 
                : 'bg-emerald-950 text-white'
            }`}
          >
            <div className={`h-6 w-6 rounded-full flex items-center justify-center ${
              toast.type === 'error'
                ? 'bg-red-500 text-red-950'
                : 'bg-emerald-500 text-emerald-950'
            }`}>
              <CheckCircle2 size={14} strokeWidth={3} />
            </div>
            <div className="flex flex-col">
              {toast.title && <span className="text-[10px] font-black uppercase tracking-widest opacity-60 leading-none mb-1">{toast.title}</span>}
              <span className="text-[13px] font-bold whitespace-nowrap">{toast.message}</span>
            </div>
            <button 
              onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
              className="ml-2 text-white/40 hover:text-white transition-colors"
            >
              <X size={14} />
            </button>
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
