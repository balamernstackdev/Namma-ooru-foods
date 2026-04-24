'use client';

import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, Edit3, Save, X, Camera, ShieldCheck, Calendar, ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Skeleton } from '@/components/Skeleton';

export default function ProfilePage() {
  const { user, isLoading } = useAuth();
  const [editing, setEditing] = useState(false);
  
  // Local state for editing form
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    dob: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
  });

  // Sync local form state with user data when it loads
  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || 'Not provided',
        dob: '', 
        address: user.defaultAddress?.line1 || '',
        city: user.defaultAddress?.city || '',
        state: user.defaultAddress?.state || '',
        pincode: user.defaultAddress?.pincode || '',
      });
    }
  }, [user]);

  const handleSave = () => { 
    // Logic for saving to backend would go here
    setEditing(false); 
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl space-y-8">
        <Skeleton className="h-10 w-48 rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <Skeleton className="h-64 rounded-[1.5rem]" />
           <Skeleton className="h-64 rounded-[1.5rem]" />
        </div>
      </div>
    );
  }

  if (!user) {
     return <div className="text-slate-400 font-bold uppercase tracking-widest text-center py-20">Please log in to view profile</div>;
  }

  return (
    <div className="py-0 px-0 md:px-4">
      <div className="max-w-4xl">

        {/* Mobile Back Button */}
        <Link href="/account" className="md:hidden flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-emerald-600 mb-6 bg-emerald-50 w-fit px-4 py-2 rounded-full">
          <ChevronLeft className="h-4 w-4" /> Back to Account
        </Link>

        {/* Page Title & Edit Action */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-[20px] font-black text-emerald-950 tracking-tighter uppercase">My Profile</h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Manage your identity and address</p>
          </div>
          <button
            onClick={() => setEditing(!editing)}
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all ${editing ? 'bg-slate-100 text-slate-500' : 'bg-amber-400 text-emerald-950 hover:bg-amber-300 shadow-lg shadow-amber-500/20'}`}
          >
            <Edit3 className="h-4 w-4" strokeWidth={2.5} />
            {editing ? 'Cancel' : 'Edit Profile'}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Personal Details */}
          <div className="bg-white rounded-[1.5rem] p-6 border border-slate-100 shadow-sm">
            <h2 className="text-[12px] font-black uppercase tracking-[0.2em] text-emerald-950 border-l-4 border-amber-400 pl-3 mb-6">Personal Details</h2>
            <div className="flex flex-col gap-5">
              {[
                { label: 'Full Name', key: 'name', icon: User, type: 'text' },
                { label: 'Email Address', key: 'email', icon: Mail, type: 'email' },
                { label: 'Mobile Number', key: 'phone', icon: Phone, type: 'tel' },
                { label: 'Date of Birth', key: 'dob', icon: Calendar, type: 'date' },
              ].map(({ label, key, icon: Icon, type }) => (
                <div key={key}>
                  <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2 block">{label}</label>
                  {editing ? (
                    <input
                      type={type}
                      value={form[key as keyof typeof form]}
                      onChange={e => setForm((f: any) => ({ ...f, [key]: e.target.value }))}
                      className="w-full h-11 px-4 rounded-xl border-2 border-slate-100 focus:border-emerald-500 outline-none text-[13px] font-bold text-emerald-950 bg-slate-50 transition-all"
                    />
                  ) : (
                    <div className="flex items-center gap-3">
                      <Icon className="h-4 w-4 text-emerald-600 shrink-0" strokeWidth={2.5} />
                      <span className="text-[13px] font-bold text-emerald-950 capitalize">{form[key as keyof typeof form]}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Address Details */}
          <div className="bg-white rounded-[1.5rem] p-6 border border-slate-100 shadow-sm">
            <h2 className="text-[12px] font-black uppercase tracking-[0.2em] text-emerald-950 border-l-4 border-amber-400 pl-3 mb-6">Delivery Address</h2>
            <div className="flex flex-col gap-5">
              {[
                { label: 'Street Address', key: 'address', type: 'text' },
                { label: 'City', key: 'city', type: 'text' },
                { label: 'State', key: 'state', type: 'text' },
                { label: 'PIN Code', key: 'pincode', type: 'text' },
              ].map(({ label, key, type }) => (
                <div key={key}>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">{label}</label>
                  {editing ? (
                    <input
                      type={type}
                      value={form[key as keyof typeof form]}
                      onChange={e => setForm((f: any) => ({ ...f, [key]: e.target.value }))}
                      className="w-full h-11 px-4 rounded-xl border-2 border-slate-100 focus:border-emerald-500 outline-none text-[13px] font-bold text-emerald-950 bg-slate-50 transition-all"
                    />
                  ) : (
                    <div className="flex items-center gap-3">
                      <MapPin className="h-4 w-4 text-emerald-600 shrink-0" strokeWidth={2.5} />
                      <span className="text-[14px] font-bold text-emerald-950">{form[key as keyof typeof form] || 'N/A'}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {editing && (
          <div className="mt-6 flex gap-4 justify-end">
            <button
              onClick={() => { setEditing(false); }}
              className="flex items-center gap-2 px-6 py-3 rounded-2xl border-2 border-slate-200 text-slate-500 font-black text-[12px] uppercase tracking-widest hover:bg-slate-50 transition-all"
            >
              <X className="h-4 w-4" /> Discard
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-8 py-3 rounded-2xl bg-emerald-950 text-white font-black text-[12px] uppercase tracking-widest hover:bg-emerald-800 transition-all shadow-lg"
            >
              <Save className="h-4 w-4" /> Save Changes
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
