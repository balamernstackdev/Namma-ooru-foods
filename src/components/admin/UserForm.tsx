'use client';

import React, { useState, useEffect } from 'react';
import {
  Users,
  Save,
  ArrowLeft,
  Loader2,
  Mail,
  Phone,
  Shield,
  Lock,
  ChevronDown,
  HelpCircle,
  UserPlus,
  ShieldCheck,
  UserCircle,
  Database,
  History
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { API_URL } from '@/lib/api';
import { useToast } from '@/context/ToastContext';

interface UserFormProps {
  initialData?: any;
  mode: 'create' | 'edit';
}

const InputWrapper = ({ label, children, helpText }: any) => (
  <div className="space-y-2 flex-1">
    <div className="flex items-center justify-between px-1">
      <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider">
        {label}
      </label>
      {helpText && (
        <div className="group relative">
          <HelpCircle size={14} className="text-slate-300 cursor-help hover:text-blue-500 transition-all" />
          <div className="absolute bottom-full right-0 mb-2 w-48 p-2 bg-slate-800 text-white text-[10px] rounded shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
            {helpText}
          </div>
        </div>
      )}
    </div>
    <div className="relative">{children}</div>
  </div>
);

const SectionHeader = ({ title, icon: Icon, colorClass = "text-blue-600" }: any) => (
  <div className="px-8 py-3.5 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
    <Icon size={14} className={colorClass} />
    <h2 className="text-[9px] font-black text-slate-900 uppercase tracking-[0.3em]">{title}</h2>
  </div>
);

export default function UserForm({ initialData, mode }: UserFormProps) {
  const router = useRouter();
  const { addToast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [roles, setRoles] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    id: initialData?.id || '',
    name: initialData?.name || '',
    email: initialData?.email || '',
    phone: initialData?.phone || '',
    role: initialData?.role || 'USER',
    roleId: initialData?.roleId?.toString() || '',
    groupId: initialData?.groupId?.toString() || '',
    segmentId: initialData?.segmentId?.toString() || '',
    password: '',
    failedLoginAttempts: initialData?.failedLoginAttempts || 0,
    lockoutUntil: initialData?.lockoutUntil ? new Date(initialData.lockoutUntil).toISOString().slice(0, 16) : ''
  });

  useEffect(() => {
    // Fetch dependencies (Roles, Groups, Segments)
    // In a real app, these would be separate endpoints
    fetch(`${API_URL}/api/admin-ops/roles`)
      .then(r => r.json().catch(() => []))
      .then(r => {
        setRoles(r || []);
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const url = mode === 'edit'
        ? `${API_URL}/api/admin-ops/users/${formData.id}`
        : `${API_URL}/api/admin-ops/users`;
      const method = mode === 'edit' ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        addToast('Success', mode === 'edit' ? 'User profile synchronized' : 'New user architected');
        router.push('/admin/users');
        router.refresh();
      } else {
        const err = await res.json();
        addToast('Error', err.error || 'Failed to save user details');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full pb-24 animate-in fade-in duration-1000 bg-[#f8fafc]">
      <div className="sticky top-0 z-40 bg-[#f8fafc]/80 backdrop-blur-xl border-b border-slate-200 mb-8 py-6 px-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/admin/users')}
              className="h-10 w-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 hover:text-blue-600 transition-all shadow-sm"
            >
              <ArrowLeft size={18} />
            </button>
            <h1 className="text-[18px] font-black text-slate-900 tracking-tight">
              {mode === 'edit' ? 'Calibrate Identity' : 'Onboard New User'}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => router.push('/admin/users')} className="px-4 py-2 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-100 transition-all">Discard</button>
            <button
              form="user-form"
              type="submit"
              disabled={submitting}
              className="px-6 py-2 rounded-lg bg-[#2563eb] text-white text-xs font-black flex items-center gap-2 shadow-lg shadow-blue-500/20 hover:bg-[#1d4ed8] disabled:opacity-50 transition-all active:scale-95 uppercase tracking-wider"
            >
              {submitting ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              {mode === 'edit' ? 'Update Profile' : 'Create Account'}
            </button>
          </div>
        </div>
      </div>

      <div className="px-2">
        <form id="user-form" onSubmit={handleSubmit} className="max-w-full mx-auto space-y-10 px-4">
          <div className="grid grid-cols-1 gap-8">
            {/* Core Identity */}
            <div className="col-span-1 space-y-8">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <SectionHeader title="User Details" icon={Shield} colorClass="text-blue-600" />
                <div className="p-8 space-y-8">
                  <div className="grid grid-cols-1 gap-8">
                    <InputWrapper label="Internal Role Type" helpText="Broad classification for analytics.">
                      <div className="relative">
                        <Users size={16} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" />
                        <select
                          value={formData.role}
                          onChange={e => setFormData({ ...formData, role: e.target.value })}
                          className="w-full h-14 pl-14 pr-12 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 ring-blue-500/5 outline-none font-bold text-slate-900 text-sm appearance-none bg-white transition-all cursor-pointer"
                        >
                          <option value="USER">Customer / Consumer</option>
                          <option value="ADMIN">System Administrator</option>
                          <option value="VENDOR">Partner Vendor / Reseller</option>
                        </select>
                        <ChevronDown size={14} className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                      </div>
                    </InputWrapper>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <InputWrapper label="Full Name" helpText="User's primary display name.">
                      <div className="relative">
                        <UserCircle size={16} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          required
                          value={formData.name}
                          onChange={e => setFormData({ ...formData, name: e.target.value })}
                          placeholder="e.g. Arul Selvan"
                          className="w-full h-14 pl-14 pr-6 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 ring-blue-500/5 outline-none font-bold text-slate-900 text-sm transition-all"
                        />
                      </div>
                    </InputWrapper>

                    <InputWrapper label="Email Address" helpText="Used for authentication and notifications.">
                      <div className="relative">
                        <Mail size={16} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          required
                          type="email"
                          value={formData.email}
                          onChange={e => setFormData({ ...formData, email: e.target.value })}
                          placeholder="arul@example.com"
                          className="w-full h-14 pl-14 pr-6 rounded-xl border border-slate-200 focus:border-blue-500 outline-none font-bold text-slate-900 text-sm transition-all"
                        />
                      </div>
                    </InputWrapper>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <InputWrapper label="Phone Number" helpText="Used for SMS alerts and order verification.">
                      <div className="relative">
                        <Phone size={16} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          value={formData.phone}
                          onChange={e => setFormData({ ...formData, phone: e.target.value })}
                          placeholder="+91 98765 43210"
                          className="w-full h-14 pl-14 pr-6 rounded-xl border border-slate-200 focus:border-blue-500 outline-none font-bold text-slate-900 text-sm transition-all"
                        />
                      </div>
                    </InputWrapper>

                    {!initialData && (
                      <InputWrapper label="Initial Password" helpText="Generated or custom password for first login.">
                        <div className="relative">
                          <Lock size={16} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input
                            required
                            type="password"
                            value={formData.password}
                            onChange={e => setFormData({ ...formData, password: e.target.value })}
                            placeholder="••••••••"
                            className="w-full h-14 pl-14 pr-6 rounded-xl border border-slate-200 focus:border-blue-500 outline-none font-bold text-slate-900 text-sm transition-all"
                          />
                        </div>
                      </InputWrapper>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
