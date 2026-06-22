'use client';

import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, Edit3, Save, X, Camera, ShieldCheck, Calendar, ChevronLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Skeleton } from '@/components/Skeleton';
import { API_URL } from '@/lib/api';

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
    addressId: null as number | null,
  });

  // Sync local form state with user data when it loads
  useEffect(() => {
    if (user) {
      console.log('[ProfilePage] Loaded user profile data:', {
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.defaultAddress
      });

      // Console validation check
      if (!user.name) console.warn('[ProfilePage Validation] Name is missing');
      if (!user.email) console.warn('[ProfilePage Validation] Email is missing');
      if (!user.phone) console.warn('[ProfilePage Validation] Phone is missing');
      if (!user.defaultAddress) console.warn('[ProfilePage Validation] Default address is missing');

      setForm({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        dob: '',
        address: user.defaultAddress?.line1 || '',
        city: user.defaultAddress?.city || '',
        state: user.defaultAddress?.state || '',
        pincode: user.defaultAddress?.pincode || '',
        addressId: user.defaultAddress?.id || null,
      });
    }
  }, [user]);

  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!user) return;

    // Console/API validation to verify fields before request
    console.log('[ProfilePage] Validating profile data before save:', {
      name: form.name,
      email: form.email,
      phone: form.phone,
      address: {
        line1: form.address,
        city: form.city,
        state: form.state,
        pincode: form.pincode
      }
    });

    if (!form.name.trim()) {
      alert('Full Name cannot be empty');
      return;
    }
    if (!form.email.trim()) {
      alert('Email Address cannot be empty');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      alert('Please enter a valid email address');
      return;
    }
    if (!form.phone.trim()) {
      alert('Mobile Number cannot be empty');
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch(`${API_URL}/api/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim().toLowerCase(), // Normalize email to lowercase
          phone: form.phone.trim(),
        })
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || 'Failed to update profile');
      }

      // Now save the address
      const addressPayload = {
        userId: user.id,
        name: form.name,
        phone: form.phone,
        line1: form.address,
        city: form.city,
        state: form.state,
        pincode: form.pincode,
        isDefault: true
      };

      let addressRes;
      if (form.addressId) {
        addressRes = await fetch(`${API_URL}/api/addresses/${form.addressId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(addressPayload)
        });
      } else if (form.address || form.city || form.pincode) {
        addressRes = await fetch(`${API_URL}/api/addresses/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(addressPayload)
        });
      }

      if (addressRes && !addressRes.ok) throw new Error('Failed to save address');

      // Successfully updated personal and address details
      // A full page reload is a simple way to refresh AuthContext state
      window.location.reload();
    } catch (err: any) {
      console.error(err);
      alert(err instanceof Error ? err.message : 'Failed to save profile. Please try again.');
    } finally {
      setIsSaving(false);
      setEditing(false);
    }
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
              ].map(({ label, key, icon: Icon, type }) => (
                <div key={key}>
                  <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2 block">{label}</label>
                  {editing ? (
                    <input
                      type={type}
                      value={form[key as keyof typeof form] ?? ''}
                      onChange={e => setForm((f: any) => ({ ...f, [key]: e.target.value }))}
                      className="w-full h-11 px-4 rounded-xl border-2 border-slate-100 focus:border-emerald-500 outline-none text-[13px] font-bold text-emerald-950 bg-slate-50 transition-all"
                    />
                  ) : (
                    <div className="flex items-center gap-3">
                      <Icon className="h-4 w-4 text-emerald-600 shrink-0" strokeWidth={2.5} />
                      <span className={`text-[13px] font-bold text-emerald-950 ${key === 'name' ? 'capitalize' : ''}`}>
                        {key === 'email' 
                          ? (form.email ? form.email.toLowerCase() : 'Email not available') 
                          : key === 'phone' 
                            ? (form.phone ? form.phone : 'Mobile number not added')
                            : (form.name || 'N/A')
                        }
                      </span>
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
                      value={form[key as keyof typeof form] ?? ''}
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
              disabled={isSaving}
              className="flex items-center gap-2 px-8 py-3 rounded-2xl bg-emerald-950 text-white font-black text-[12px] uppercase tracking-widest hover:bg-emerald-800 transition-all shadow-lg disabled:opacity-50"
            >
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
