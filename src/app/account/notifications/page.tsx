'use client';

import React, { useState } from 'react';
import { Bell, ShoppingBag, Tag, Info, Trash2, Check, Clock, ChevronLeft } from 'lucide-react';
import Link from 'next/link';

const initialNotifications = [
  {
    id: 1,
    type: 'order',
    title: 'Order Delivered!',
    message: 'Your order NOF-2024-001847 has been successfully delivered. Please rate the products.',
    time: '2 hours ago',
    unread: true,
    icon: ShoppingBag,
    color: 'bg-emerald-100 text-emerald-700'
  },
  {
    id: 2,
    type: 'promo',
    title: 'Weekend Special Offer',
    message: 'Get flat 20% OFF on all Organic Ghee and Honey. Valid until Sunday midnight.',
    time: '5 hours ago',
    unread: true,
    icon: Tag,
    color: 'bg-amber-100 text-amber-600'
  },
  {
    id: 3,
    type: 'info',
    title: 'New Arrival',
    message: 'Farm-fresh Malabar Peppercorns are back in stock. Direct from our Wayanad partners.',
    time: '1 day ago',
    unread: false,
    icon: Info,
    color: 'bg-blue-100 text-blue-600'
  },
  {
    id: 4,
    type: 'order',
    title: 'Refund Processed',
    message: 'Refund for order NOF-2024-001401 has been credited to your wallet.',
    time: '2 days ago',
    unread: false,
    icon: Check,
    color: 'bg-rose-100 text-rose-600'
  },
  {
    id: 5,
    type: 'promo',
    title: 'Free Delivery Alert',
    message: 'Enjoy free delivery on your next 3 orders using code NAMMAFREEDEL.',
    time: '3 days ago',
    unread: false,
    icon: Bell,
    color: 'bg-purple-100 text-purple-600'
  }
];

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState(initialNotifications);

  const markAsRead = (id: number) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, unread: false } : n));
  };

  const removeNotification = (id: number) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  return (
    <div className="py-0 px-0 md:px-4">
      <div className="max-w-4xl">
        
        {/* Mobile Back Button */}
        <Link href="/account" className="md:hidden flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-emerald-600 mb-6 bg-emerald-50 w-fit px-4 py-2 rounded-full">
          <ChevronLeft className="h-4 w-4" /> Back to Account
        </Link>

        {/* Page Title & Actions */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-[32px] font-black text-emerald-950 tracking-tighter uppercase">Notifications</h1>
            <p className="text-[12px] text-slate-400 font-bold uppercase tracking-widest mt-1">Stay updated with your latest alerts</p>
          </div>
          {notifications.length > 0 && (
            <button 
              onClick={clearAll}
              className="text-[11px] font-black uppercase tracking-[0.2em] text-red-500 hover:text-white hover:bg-red-500 border border-transparent hover:border-red-500 px-4 py-2 rounded-xl transition-all"
            >
              Clear All
            </button>
          )}
        </div>

        {notifications.length === 0 ? (
          <div className="bg-white rounded-[2rem] p-20 text-center shadow-sm border border-slate-100">
            <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-200">
              <Bell className="h-8 w-8" />
            </div>
            <h2 className="text-xl font-black text-slate-300 mb-2">No new notifications</h2>
            <p className="text-slate-300 text-sm mb-8">We'll let you know when something important happens.</p>
            <Link href="/" className="inline-block px-8 py-3 bg-emerald-950 text-white rounded-2xl font-black text-[12px] uppercase tracking-widest hover:bg-emerald-800 transition-all">Back to Home</Link>
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            {notifications.map(notification => (
              <div 
                key={notification.id} 
                className={`group bg-white rounded-[1.5rem] p-6 border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] transition-all hover:shadow-xl hover:-translate-y-0.5 relative overflow-hidden flex gap-5 items-start ${notification.unread ? 'border-l-[6px] border-l-emerald-500' : 'border-l-[6px] border-l-slate-200'}`}
                onClick={() => markAsRead(notification.id)}
              >
                <div className={`h-14 w-14 rounded-2xl shrink-0 flex items-center justify-center ${notification.color}`}>
                  <notification.icon className="h-7 w-7" strokeWidth={2.2} />
                </div>
                
                <div className="flex-1 min-w-0 pt-1">
                  <div className="flex items-center justify-between gap-4 mb-2">
                    <h3 className={`text-[17px] font-black tracking-tight leading-tight ${notification.unread ? 'text-emerald-950' : 'text-slate-500'}`}>
                      {notification.title}
                    </h3>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-1.5 bg-slate-50 px-3 py-1 rounded-full">
                        <Clock className="h-3 w-3" /> {notification.time}
                      </span>
                    </div>
                  </div>
                  <p className={`text-[14px] leading-relaxed max-w-2xl ${notification.unread ? 'text-slate-600 font-medium' : 'text-slate-400'}`}>
                    {notification.message}
                  </p>
                </div>

                {notification.unread && (
                  <div className="absolute top-3 right-3 h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                )}
                
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    removeNotification(notification.id);
                  }}
                  className="absolute bottom-4 right-4 h-8 w-8 rounded-lg bg-red-50 text-red-300 items-center justify-center hover:bg-red-500 hover:text-white transition-all flex md:opacity-0 group-hover:opacity-100"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
