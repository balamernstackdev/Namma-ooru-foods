'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, CheckCircle, AlertCircle, ShoppingBag } from 'lucide-react';

interface Notification {
  id: number;
  title: string;
  message: string;
  type: 'order' | 'system' | 'alert';
  time: string;
}

export default function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([
    { id: 1, title: 'New Product Ordered', message: 'Anita Sharma purchased Organic Foxtail Millet.', type: 'order', time: '2m ago' },
    { id: 2, title: 'Stock Alert', message: 'Mango Pickle is running low on stock.', type: 'alert', time: '1h ago' },
    { id: 3, title: 'System Update', message: 'Platform version 2.4 is now live.', type: 'system', time: '5h ago' }
  ]);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="h-12 w-12 rounded-full border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-center text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all relative"
      >
        <Bell size={20} />
        {notifications.length > 0 && (
          <div className="absolute top-3 right-3.5 h-2 w-2 bg-amber-500 rounded-full border-2 border-white dark:border-slate-900" />
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-40 bg-black/5 backdrop-blur-[2px]"
            />
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute right-0 mt-4 w-96 bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-2xl z-50 overflow-hidden"
            >
              <div className="p-6 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between">
                <h3 className="text-sm font-black text-emerald-950 dark:text-white uppercase tracking-widest">Live Feed</h3>
                <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-1 rounded-md">{notifications.length} NEW</span>
              </div>

              <div className="max-h-[400px] overflow-y-auto">
                {notifications.map((n) => (
                  <div key={n.id} className="p-6 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors border-b border-slate-50 dark:border-slate-800 last:border-0 group">
                    <div className="flex gap-4">
                      <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${n.type === 'order' ? 'bg-emerald-50 text-emerald-600' :
                        n.type === 'alert' ? 'bg-amber-50 text-amber-600' :
                          'bg-blue-50 text-blue-600'
                        }`}>
                        {n.type === 'order' ? <ShoppingBag size={18} /> :
                          n.type === 'alert' ? <AlertCircle size={18} /> :
                            <CheckCircle size={18} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-black text-emerald-950 dark:text-white leading-tight">{n.title}</p>
                        <p className="text-[11px] text-slate-400 font-medium mt-1 leading-relaxed">{n.message}</p>
                        <p className="text-[9px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-widest mt-3">{n.time}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <button className="w-full py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-emerald-600 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
                Clear All Broadcasts
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
