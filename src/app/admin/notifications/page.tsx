'use client';

import React from 'react';
import { Bell, Send, Trash2, CheckCircle } from 'lucide-react';

const NotificationsPage = () => {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Notification Control</h1>
          <p className="text-[var(--muted-foreground)]">Send alerts for offers, discounts, and order updates to your users.</p>
        </div>
        <button className="flex items-center gap-2 rounded-xl bg-[var(--primary)] px-6 py-3 font-bold text-white shadow-lg shadow-[var(--primary)]/20 transition-all hover:bg-[var(--primary-dark)] active:scale-95">
          <Send className="h-5 w-5" /> Send New Notification
        </button>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
         {/* History */}
         <div className="lg:col-span-2 rounded-2xl border border-[var(--border)] bg-[var(--card)] overflow-hidden">
            <div className="border-b border-[var(--border)] p-6 bg-[var(--muted)]/30">
               <h2 className="font-bold flex items-center gap-2">
                  <Bell className="h-5 w-5 text-[var(--primary)]" /> Recent Notifications
               </h2>
            </div>
            <div className="divide-y divide-[var(--border)]">
               {[
                 { title: 'Flash Sale Live!', message: 'Our summer harvest sale is now live. Get 20% off on all grains.', date: '10 mins ago', status: 'Sent' },
                 { title: 'Order Shipped', message: 'Hi Rahul, your order #ORD-7809 has been shipped.', date: '2 hours ago', status: 'Read' },
                 { title: 'New Product Alert', message: 'Try our new Cold Pressed Coconut Oil, now in stock!', date: 'Yesterday', status: 'Sent' },
               ].map((n, i) => (
                 <div key={i} className="p-6 hover:bg-[var(--muted)]/20 transition-colors">
                    <div className="flex items-start justify-between">
                       <h3 className="font-bold">{n.title}</h3>
                       <span className="text-xs font-semibold text-[var(--muted-foreground)]">{n.date}</span>
                    </div>
                    <p className="mt-2 text-sm text-[var(--muted-foreground)]">{n.message}</p>
                    <div className="mt-4 flex items-center justify-between">
                       <span className={`flex items-center gap-1 text-xs font-bold ${n.status === 'Read' ? 'text-green-600' : 'text-blue-600'}`}>
                          <CheckCircle className="h-3 w-3" /> {n.status}
                       </span>
                       <button className="text-[var(--muted-foreground)] hover:text-red-500"><Trash2 className="h-4 w-4" /></button>
                    </div>
                 </div>
               ))}
            </div>
         </div>

         {/* Stats/Quick Info */}
         <div className="flex flex-col gap-6">
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--primary)]/5 p-6">
               <h3 className="font-bold text-[var(--primary)] mb-4 uppercase text-xs tracking-widest">Active Audience</h3>
               <p className="text-4xl font-black">8,452</p>
               <p className="mt-2 text-sm text-[var(--muted-foreground)]">Users subscribed to push notifications.</p>
            </div>
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--secondary)]/5 p-6">
               <h3 className="font-bold text-[var(--secondary)] mb-4 uppercase text-xs tracking-widest">Open Rate</h3>
               <p className="text-4xl font-black">24.5%</p>
               <p className="mt-2 text-sm text-[var(--muted-foreground)]">Avg. engagement over the last 30 days.</p>
            </div>
         </div>
      </div>
    </div>
  );
};

export default NotificationsPage;
