'use client';

import React, { useState, useEffect } from 'react';
import {
  Tag,
  Save,
  ArrowLeft,
  Loader2,
  ImageIcon,
  Globe,
  User,
  Info,
  HelpCircle
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { API_URL } from '@/lib/api';
import { useToast } from '@/context/ToastContext';

interface BrandFormProps {
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

export default function BrandForm({ initialData, mode }: BrandFormProps) {
  const router = useRouter();
  const { addToast } = useToast();

  const [users, setUsers] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    id: initialData?.id || '',
    name: initialData?.name || '',
    description: initialData?.description || '',
    logo: initialData?.logo || '',
    website: initialData?.website || '',
    userId: initialData?.userId?.toString() || ''
  });

  useEffect(() => {
    fetch(`${API_URL}/api/admin-ops/users`)
      .then(r => r.json())
      .then(data => setUsers(data.filter((u: any) => u.role === 'VENDOR')))
      .catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const url = mode === 'edit'
        ? `${API_URL}/api/admin-ops/brands/${formData.id}`
        : `${API_URL}/api/admin-ops/brands`;
      const method = mode === 'edit' ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        addToast('Success', mode === 'edit' ? 'Brand identity synchronized' : 'Brand partner registered');
        router.push('/admin/brands');
        router.refresh();
      } else {
        addToast('Error', 'Failed to save brand details');
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
              onClick={() => router.push('/admin/brands')}
              className="h-10 w-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 hover:text-blue-600 transition-all shadow-sm"
            >
              <ArrowLeft size={18} />
            </button>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
              {mode === 'edit' ? 'Edit Brand' : 'Add New Brand'}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => router.push('/admin/brands')} className="px-4 py-2 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-100 transition-all">Discard</button>
            <button
              form="brand-form"
              type="submit"
              disabled={submitting}
              className="px-6 py-2 rounded-lg bg-[#2563eb] text-white text-xs font-black flex items-center gap-2 shadow-lg shadow-blue-500/20 hover:bg-[#1d4ed8] disabled:opacity-50 transition-all active:scale-95 uppercase tracking-wider"
            >
              {submitting ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              {mode === 'edit' ? 'Update' : 'Publish'}
            </button>
          </div>
        </div>
      </div>

      <div className="px-2">
        <form id="brand-form" onSubmit={handleSubmit} className="max-w-full mx-auto space-y-10 px-4">
          <div className="grid grid-cols-12 gap-10">
            <div className="col-span-12 lg:col-span-8 space-y-10">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <SectionHeader title="Core Identity" icon={Tag} colorClass="text-blue-600" />
                <div className="p-8 space-y-8">
                  <InputWrapper label="Brand Name">
                    <input
                      required
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Traditional Cold Pressed"
                      className="w-full h-14 px-6 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 ring-blue-500/5 outline-none font-bold text-slate-900 text-sm transition-all"
                    />
                  </InputWrapper>

                  <InputWrapper label="Assigned Reseller (Owner)" helpText="Select the vendor who owns or manages this brand.">
                    <div className="relative">
                      <select
                        value={formData.userId}
                        onChange={e => setFormData({ ...formData, userId: e.target.value })}
                        className="w-full h-14 px-6 rounded-xl border border-slate-200 focus:border-blue-500 outline-none font-bold text-sm appearance-none bg-white"
                      >
                        <option value="">No Owner (Generic Brand)</option>
                        {users.map(u => (
                          <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                        ))}
                      </select>
                      <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                        <User size={16} />
                      </div>
                    </div>
                  </InputWrapper>

                  <InputWrapper label="Brand Narrative">
                    <textarea
                      rows={6}
                      value={formData.description}
                      onChange={e => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Describe the heritage and quality standards of this brand partner..."
                      className="w-full px-6 py-4 rounded-xl border border-slate-200 focus:border-blue-500 outline-none font-bold text-slate-600 text-sm resize-none"
                    />
                  </InputWrapper>
                </div>
              </div>
            </div>

            <div className="col-span-12 lg:col-span-4 space-y-10">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <SectionHeader title="Visual Assets" icon={ImageIcon} colorClass="text-purple-600" />
                <div className="p-8 space-y-8">
                  <InputWrapper label="Logo Image URL">
                    <div className="relative">
                      <ImageIcon size={16} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        value={formData.logo}
                        onChange={e => setFormData({ ...formData, logo: e.target.value })}
                        placeholder="https://image-url.com/logo.png"
                        className="w-full h-11 px-4 pl-14 rounded-xl border border-slate-200 focus:border-blue-500 outline-none text-sm font-bold"
                      />
                    </div>
                  </InputWrapper>

                  <div className="aspect-square rounded-2xl bg-slate-50/50 border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden shadow-inner p-4 group-hover:scale-105 transition-transform duration-500">
                    {formData.logo ? (
                      <img src={formData.logo} className="w-full h-full object-contain" alt="Logo Preview" />
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-slate-300">
                        <ImageIcon size={40} />
                        <span className="text-[10px] font-black uppercase tracking-widest">Logo Preview</span>
                        <span className="text-[8px] font-bold uppercase tracking-widest text-slate-300">Recommended: 500 x 500px</span>
                      </div>
                    )}
                  </div>

                  <InputWrapper label="Official Website">
                    <div className="relative">
                      <Globe size={16} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        value={formData.website}
                        onChange={e => setFormData({ ...formData, website: e.target.value })}
                        placeholder="www.brandwebsite.com"
                        className="w-full h-11 px-4 pl-14 rounded-xl border border-slate-200 focus:border-blue-500 outline-none text-sm font-bold"
                      />
                    </div>
                  </InputWrapper>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
