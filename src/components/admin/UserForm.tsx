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
  History,
  Eye,
  EyeOff,
  Store,
  FileText,
  Globe,
  Upload,
  Image as ImageIcon
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
  const [showPassword, setShowPassword] = useState(false);
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
    headVendorId: '',
    brandName: '',
    brandDescription: '',
    brandLogo: '',
    failedLoginAttempts: initialData?.failedLoginAttempts || 0,
    lockoutUntil: initialData?.lockoutUntil ? new Date(initialData.lockoutUntil).toISOString().slice(0, 16) : ''
  });

  const [hubsList, setHubsList] = useState<any[]>([]);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const logoInputRef = React.useRef<HTMLInputElement>(null);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingLogo(true);
    const uploadData = new FormData();
    uploadData.append('image', file);

    try {
      const res = await fetch(`${API_URL}/api/upload/image`, {
        method: 'POST',
        body: uploadData,
      });

      if (res.ok) {
        const data = await res.json();
        setFormData(prev => ({ ...prev, brandLogo: data.url }));
        addToast('Success', 'Brand logo successfully uploaded & stored');
      } else {
        addToast('Error', 'Brand logo upload failed');
      }
    } catch (err) {
      addToast('Error', 'Connection to upload service failed');
    } finally {
      setIsUploadingLogo(false);
    }
  };

  useEffect(() => {
    // Fetch dependencies (Roles, Groups, Segments)
    fetch(`${API_URL}/api/admin-ops/roles`)
      .then(r => r.json().catch(() => []))
      .then(r => {
        setRoles(r || []);
      });

    fetch(`${API_URL}/api/admin-ops/hubs`)
      .then(r => r.json())
      .then(data => {
        const hubsArray = Array.isArray(data) ? data : data.headVendors || [];
        setHubsList(hubsArray);
        if (hubsArray.length > 0 && !formData.headVendorId) {
          setFormData(prev => ({ ...prev, headVendorId: hubsArray[0].id.toString() }));
        }
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
        addToast('Success', mode === 'edit' ? 'User profile synchronized' : 'New user created successfully');
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
              {mode === 'edit' ? 'Edit User Profile' : 'Onboard New User'}
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

                    {formData.role === 'VENDOR' && (
                      <InputWrapper label="Assign to Regional Hub" helpText="The top-level collective this vendor belongs to.">
                        <div className="relative">
                          <Database size={16} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" />
                          <select
                            value={formData.headVendorId}
                            onChange={e => setFormData({ ...formData, headVendorId: e.target.value })}
                            className="w-full h-14 pl-14 pr-12 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 ring-blue-500/5 outline-none font-bold text-slate-900 text-sm appearance-none bg-white transition-all cursor-pointer"
                          >
                            {hubsList.map(hub => (
                              <option key={hub.id} value={hub.id}>{hub.name}</option>
                            ))}
                            {hubsList.length === 0 && <option disabled value="">No Hubs Available</option>}
                          </select>
                          <ChevronDown size={14} className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                        </div>
                      </InputWrapper>
                    )}
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
                    <InputWrapper label="Phone Number" helpText="⭐ This is the LOGIN identifier — user logs in via OTP to this mobile number.">
                      <div className="relative">
                        <Phone size={16} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type="tel"
                          autoComplete="off"
                          maxLength={15}
                          value={formData.phone}
                          onChange={e => setFormData({ ...formData, phone: e.target.value.replace(/[^\d+]/g, '') })}
                          placeholder="Mobile number (e.g. +919000896898)"
                          className="w-full h-14 pl-14 pr-6 rounded-xl border border-slate-200 focus:border-blue-500 outline-none font-bold text-slate-900 text-sm transition-all"
                        />
                      </div>
                      <p className="text-[10px] text-blue-500 font-bold mt-1 px-1">📱 User logs in via OTP sent to this number</p>
                    </InputWrapper>

                    <InputWrapper label={initialData ? "Change Password" : "Initial Password"} helpText={initialData ? "Leave blank to keep current password" : "Generated or custom password for first login."}>
                      <div className="relative">
                        <Lock size={16} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          required={!initialData}
                          type={showPassword ? 'text' : 'password'}
                          value={formData.password}
                          onChange={e => setFormData({ ...formData, password: e.target.value })}
                          placeholder={initialData ? "Leave blank to keep current" : "••••••••"}
                          className={`w-full h-14 pl-14 pr-14 rounded-xl border border-slate-200 focus:border-blue-500 outline-none font-bold text-slate-900 text-sm transition-all ${(!showPassword && formData.password) ? 'tracking-[0.3em]' : 'tracking-normal'}`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-500 transition-all cursor-pointer p-1"
                        >
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </InputWrapper>
                  </div>
                </div>
              </div>

              {/* Vendor Brand Details Section - Only visible when role is VENDOR */}
              {formData.role === 'VENDOR' && !initialData && (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  <SectionHeader title="Brand / Store Details" icon={Store} colorClass="text-emerald-600" />
                  <div className="p-8 space-y-8">
                    <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-4 flex items-start gap-3">
                      <ShieldCheck size={16} className="text-emerald-600 mt-0.5 shrink-0" />
                      <p className="text-[11px] font-bold text-emerald-800 leading-relaxed">
                        A new brand store will be automatically created under the selected Regional Hub.
                        Fill in the brand details below, or leave defaults to use auto-generated values.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                      {/* Left side: Brand Name & Description */}
                      <div className="lg:col-span-8 space-y-8 flex flex-col justify-center">
                        <InputWrapper label="Brand / Store Name" helpText="The public-facing name for this vendor's brand.">
                          <div className="relative">
                            <Store size={16} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                              value={formData.brandName}
                              onChange={e => setFormData({ ...formData, brandName: e.target.value })}
                              placeholder={`${formData.name ? formData.name + "'s Brand" : "e.g. Organic Fresh Store"}`}
                              className="w-full h-14 pl-14 pr-6 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-4 ring-emerald-500/5 outline-none font-bold text-slate-900 text-sm transition-all"
                            />
                          </div>
                        </InputWrapper>

                        <InputWrapper label="Brand Description" helpText="A brief description of what this vendor's brand offers.">
                          <div className="relative">
                            <FileText size={16} className="absolute left-6 top-4 text-slate-400" />
                            <textarea
                              rows={4}
                              value={formData.brandDescription}
                              onChange={e => setFormData({ ...formData, brandDescription: e.target.value })}
                              placeholder="Premium selection of organic and heritage food products..."
                              className="w-full pl-14 pr-6 py-4 rounded-xl border border-slate-200 focus:border-emerald-500 outline-none font-bold text-slate-900 text-sm transition-all resize-none"
                            />
                          </div>
                        </InputWrapper>
                      </div>

                      {/* Right side: Modern S3 Logo Upload widget */}
                      <div className="lg:col-span-4 flex flex-col">
                        <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider mb-3 px-1">Brand Logo / Asset</label>
                        <div
                          onClick={() => !isUploadingLogo && logoInputRef.current?.click()}
                          className={`flex-1 min-h-[220px] bg-slate-50/50 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center gap-6 group cursor-pointer hover:border-emerald-500/50 transition-all overflow-hidden relative ${isUploadingLogo ? 'opacity-50 cursor-wait' : ''}`}
                        >
                          <input type="file" ref={logoInputRef} className="hidden" accept="image/*" onChange={handleLogoUpload} />
                          {isUploadingLogo ? (
                            <div className="flex flex-col items-center gap-2">
                              <Loader2 className="h-8 w-8 text-emerald-600 animate-spin" />
                              <span className="text-[9px] font-black uppercase tracking-widest text-emerald-600">Uploading to S3...</span>
                            </div>
                          ) : (formData.brandLogo && formData.brandLogo.trim() !== '') ? (
                            <div className="relative w-full h-full min-h-[220px] group">
                              <img src={formData.brandLogo} className="w-full h-full object-contain p-4 transition-transform duration-1000 group-hover:scale-105" alt="Brand Logo" />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all backdrop-blur-sm">
                                <Upload size={20} className="text-white" />
                              </div>
                            </div>
                          ) : (
                            <>
                              <div className="h-12 w-12 rounded-xl bg-white shadow-sm flex items-center justify-center text-slate-300 group-hover:text-emerald-500 transition-all">
                                <ImageIcon size={24} />
                              </div>
                              <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Upload Logo</span>
                              <span className="text-[8px] font-bold uppercase tracking-widest text-slate-300 mt-1">Recommended: 400 x 400px</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
