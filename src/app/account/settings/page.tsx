'use client';

import React, { useState } from 'react';
import { Settings, Bell, Shield, Eye, Smartphone, LogOut, ChevronRight, Globe, Moon, ChevronLeft } from 'lucide-react';
import Link from 'next/link';

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    notifications: {
      email: true,
      orderUpdates: true,
      promotions: true,
      sms: true
    },
    privacy: {
      profileVisible: true,
      showActivity: true
    },
    app: {
      darkMode: false,
      language: 'English (US)'
    }
  });

  const toggleSetting = (category: string, key: string) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        //@ts-ignore
        ...prev[category],
        //@ts-ignore
        [key]: !prev[category][key]
      }
    }));
  };

  return (
    <div className="py-2 px-0 md:px-4">
      <div className="max-w-3xl">
        
        {/* Mobile Back Button */}
        <Link href="/account" className="md:hidden flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-emerald-600 mb-6 bg-emerald-50 w-fit px-4 py-2 rounded-full">
          <ChevronLeft className="h-4 w-4" /> Back to Account
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl font-black text-emerald-950 tracking-tighter">Settings</h1>
          <p className="text-[12px] text-slate-400 font-medium mt-1">Manage your account preferences and security</p>
        </div>

        <div className="flex flex-col gap-8">
          
          {/* Notification Settings */}
          <section className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm">
            <div className="flex items-center gap-3 mb-8">
              <div className="h-10 w-10 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600">
                <Bell className="h-5 w-5" />
              </div>
              <h2 className="text-[14px] font-black uppercase tracking-widest text-emerald-950">Notification Preferences</h2>
            </div>
            
            <div className="flex flex-col gap-6">
              {[
                { label: 'Email Notifications', key: 'email', desc: 'Receive updates on your registered email' },
                { label: 'Order Status Updates', key: 'orderUpdates', desc: 'Get real-time alerts about your package' },
                { label: 'Promotional Offers', key: 'promotions', desc: 'Learn about new arrivals and discounts' },
                { label: 'SMS Alerts', key: 'sms', desc: 'Secure verification and delivery alerts' }
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between group">
                  <div className="max-w-[80%]">
                    <p className="text-[14px] font-black text-emerald-950 mb-1">{item.label}</p>
                    <p className="text-[11px] text-slate-400 font-medium">{item.desc}</p>
                  </div>
                  <button 
                    onClick={() => toggleSetting('notifications', item.key)}
                    className={`w-12 h-6 rounded-full transition-all relative ${settings.notifications[item.key as keyof typeof settings.notifications] ? 'bg-emerald-600' : 'bg-slate-200'}`}
                  >
                    <div className={`h-4 w-4 bg-white rounded-full absolute top-1 transition-all ${settings.notifications[item.key as keyof typeof settings.notifications] ? 'left-7' : 'left-1'}`} />
                  </button>
                </div>
              ))}
            </div>
          </section>



        </div>
      </div>
    </div>
  );
}
