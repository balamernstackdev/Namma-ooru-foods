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
    <Icon size={16} className={colorClass} />
    <h2 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em]">{title}</h2>
  </div>
);

export default function UserForm({ initialData, mode }: UserFormProps) {
  const router = useRouter();
  const { addToast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [roles, setRoles] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [segments, setSegments] = useState<any[]>([]);

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
    Promise.all([
      fetch(`${API_URL}/api/admin-ops/roles`).then(r => r.json().catch(() => [])),
      fetch(`${API_URL}/api/admin-ops/customer-groups`).then(r => r.json().catch(() => [])),
      fetch(`${API_URL}/api/admin-ops/segments`).then(r => r.json().catch(() => []))
    ]).then(([r, g, s]) => {
      setRoles(r || []);
      setGroups(g || []);
      setSegments(s || []);
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
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
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
          <div className="grid grid-cols-12 gap-8">
            {/* Core Identity */}
            <div className="col-span-12 lg:col-span-8 space-y-8">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <SectionHeader title="Core Credentials" icon={Shield} colorClass="text-blue-600" />
                <div className="p-8 space-y-8">
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

              {/* Advanced Classification */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <SectionHeader title="Segmentation & Metadata" icon={Database} colorClass="text-emerald-600" />
                <div className="p-8 space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <InputWrapper label="Customer Group" helpText="Pricing rules or loyalty tiers.">
                       <div className="relative">
                        <select
                          value={formData.groupId}
                          onChange={e => setFormData({ ...formData, groupId: e.target.value })}
                          className="w-full h-14 px-6 rounded-xl border border-slate-200 focus:border-blue-500 outline-none font-bold text-sm appearance-none bg-white"
                        >
                          <option value="">No Group</option>
                          {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                        </select>
                        <ChevronDown size={14} className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400" />
                      </div>
                    </InputWrapper>

                    <InputWrapper label="Marketing Segment" helpText="Behavioral targeting for campaigns.">
                       <div className="relative">
                        <select
                          value={formData.segmentId}
                          onChange={e => setFormData({ ...formData, segmentId: e.target.value })}
                          className="w-full h-14 px-6 rounded-xl border border-slate-200 focus:border-blue-500 outline-none font-bold text-sm appearance-none bg-white"
                        >
                          <option value="">Unassigned</option>
                          {segments.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                        <ChevronDown size={14} className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400" />
                      </div>
                    </InputWrapper>

                    <InputWrapper label="Internal Role Type" helpText="Broad classification for analytics.">
                      <div className="relative">
                        <select
                          value={formData.role}
                          onChange={e => setFormData({ ...formData, role: e.target.value })}
                          className="w-full h-14 px-6 rounded-xl border border-slate-200 focus:border-blue-500 outline-none font-bold text-sm appearance-none bg-white"
                        >
                          <option value="USER">Customer</option>
                          <option value="ADMIN">Staff / Admin</option>
                          <option value="VENDOR">Partner Vendor</option>
                        </select>
                        <ChevronDown size={14} className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400" />
                      </div>
                    </InputWrapper>
                  </div>
                </div>
              </div>
            </div>

            {/* Security & Lifecycle */}
            <div className="col-span-12 lg:col-span-4 space-y-8">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <SectionHeader title="Access Protocol" icon={ShieldCheck} colorClass="text-purple-600" />
                <div className="p-8 space-y-6">
                   <InputWrapper label="Granular Permission Role" helpText="Linked to specific Admin Role resource table.">
                      <div className="relative">
                        <select
                          value={formData.roleId}
                          onChange={e => setFormData({ ...formData, roleId: e.target.value })}
                          className="w-full h-14 px-6 rounded-xl border border-slate-200 focus:border-blue-500 outline-none font-bold text-sm appearance-none bg-white"
                        >
                          <option value="">Default Access</option>
                          {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                        </select>
                        <ChevronDown size={14} className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400" />
                      </div>
                   </InputWrapper>

                   {mode === 'edit' && (
                     <>
                      <InputWrapper label="Lockout Until" helpText="Temporary suspension for security violations.">
                        <div className="relative">
                          <History size={16} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input
                            type="datetime-local"
                            value={formData.lockoutUntil}
                            onChange={e => setFormData({ ...formData, lockoutUntil: e.target.value })}
                            className="w-full h-14 pl-14 pr-6 rounded-xl border border-slate-200 focus:border-blue-500 outline-none font-bold text-slate-900 text-sm"
                          />
                        </div>
                      </InputWrapper>

                      <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                         <div>
                            <p className="text-[11px] font-black text-slate-900 uppercase">Failed Attempts</p>
                            <p className="text-[10px] font-bold text-slate-400">Security audit metric</p>
                         </div>
                         <span className={`text-sm font-black ${formData.failedLoginAttempts > 3 ? 'text-red-500' : 'text-slate-400'}`}>
                           {formData.failedLoginAttempts}
                         </span>
                      </div>
                     </>
                   )}
                </div>
              </div>

              <div className="bg-blue-600 rounded-3xl p-8 text-white shadow-xl shadow-blue-500/20 relative overflow-hidden">
                <div className="relative z-10">
                  <h3 className="text-xl font-black tracking-tight mb-2 uppercase">Onboarding Audit</h3>
                  <p className="text-blue-100 text-xs font-bold leading-relaxed">
                    Identity calibration ensures proper resource allocation across the Namma Orru ecosystem. Ensure email verification is completed for transactional emails.
                  </p>
                </div>
                <UserPlus className="absolute -bottom-10 -right-10 h-40 w-40 text-white/5 rotate-12" />
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
