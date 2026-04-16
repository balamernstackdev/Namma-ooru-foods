'use client';

import React, { useState } from 'react';
import { Settings, Bell, Shield, Eye, Smartphone, LogOut, ChevronRight, Globe, Moon, ChevronLeft } from 'lucide-react';
import Link from 'next/link';

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    notifications: {
      email: true,
      orderUpdates: true,
      promotions: false,
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

          {/* Security & Privacy */}
          <section className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm">
            <div className="flex items-center gap-3 mb-8">
              <div className="h-10 w-10 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                <Shield className="h-5 w-5" />
              </div>
              <h2 className="text-[14px] font-black uppercase tracking-widest text-emerald-950">Security & Privacy</h2>
            </div>
            
            <div className="flex flex-col gap-6">
              <button className="flex items-center justify-between group text-left">
                <div>
                  <p className="text-[14px] font-black text-emerald-950 mb-1">Change Password</p>
                  <p className="text-[11px] text-slate-400 font-medium">Last changed 3 months ago</p>
                </div>
                <ChevronRight className="h-5 w-5 text-slate-300 group-hover:text-emerald-600 transition-all" />
              </button>
              
              <button className="flex items-center justify-between group text-left">
                <div>
                  <p className="text-[14px] font-black text-emerald-950 mb-1">Two-Factor Authentication</p>
                  <p className="text-[11px] text-emerald-600 font-black uppercase tracking-widest">Recommended</p>
                </div>
                <div className="h-5 w-5 rounded-full border-2 border-slate-200" />
              </button>

              <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                <div>
                  <p className="text-[14px] font-black text-emerald-950 mb-1">Profile Visibility</p>
                  <p className="text-[11px] text-slate-400 font-medium">Allow others to see your public reviews</p>
                </div>
                <button 
                  onClick={() => toggleSetting('privacy', 'profileVisible')}
                  className={`w-12 h-6 rounded-full transition-all relative ${settings.privacy.profileVisible ? 'bg-emerald-600' : 'bg-slate-200'}`}
                >
                  <div className={`h-4 w-4 bg-white rounded-full absolute top-1 transition-all ${settings.privacy.profileVisible ? 'left-7' : 'left-1'}`} />
                </button>
              </div>
            </div>
          </section>

          {/* Preferences */}
          <section className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm">
            <div className="flex items-center gap-3 mb-8">
              <div className="h-10 w-10 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-600">
                <Smartphone className="h-5 w-5" />
              </div>
              <h2 className="text-[14px] font-black uppercase tracking-widest text-emerald-950">App Preferences</h2>
            </div>
            
            <div className="flex flex-col gap-6">
              <div className="flex items-center justify-between group">
                <div className="flex items-center gap-4">
                  <div className="h-8 w-8 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                    <Globe className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-[14px] font-black text-emerald-950 mb-0.5">App Language</p>
                    <p className="text-[10px] text-slate-400 font-medium">{settings.app.language}</p>
                  </div>
                </div>
                <button className="text-[11px] font-black uppercase tracking-[0.2em] text-emerald-600 hover:underline">Change</button>
              </div>

              <div className="flex items-center justify-between group">
                <div className="flex items-center gap-4">
                  <div className="h-8 w-8 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                    <Moon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-[14px] font-black text-emerald-950 mb-0.5">Dark Mode</p>
                    <p className="text-[10px] text-slate-400 font-medium">Experimental feature</p>
                  </div>
                </div>
                <button 
                  onClick={() => toggleSetting('app', 'darkMode')}
                  className={`w-12 h-6 rounded-full transition-all relative ${settings.app.darkMode ? 'bg-emerald-600' : 'bg-slate-200'}`}
                >
                  <div className={`h-4 w-4 bg-white rounded-full absolute top-1 transition-all ${settings.app.darkMode ? 'left-7' : 'left-1'}`} />
                </button>
              </div>
            </div>
          </section>

          {/* Danger Zone */}
          <div className="flex flex-col gap-4">
            <button className="w-full bg-red-50 hover:bg-red-100 text-red-500 rounded-2xl p-5 border border-red-100 transition-all flex items-center justify-between group">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 bg-white rounded-xl shadow-sm flex items-center justify-center">
                  <LogOut className="h-5 w-5" />
                </div>
                <div className="text-left">
                  <p className="text-[13px] font-black uppercase tracking-widest leading-none mb-1">Sign out from all devices</p>
                  <p className="text-[10px] font-medium opacity-70">Secures your account everywhere</p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 opacity-50 group-hover:translate-x-1 transition-all" />
            </button>
            <button className="w-full text-slate-400 hover:text-red-400 text-[11px] font-black uppercase tracking-[0.3em] py-4 transition-colors">
              Deactivate Account
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
