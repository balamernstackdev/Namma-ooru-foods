'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Plus } from 'lucide-react';
import {
  Tag,
  Save,
  ArrowLeft,
  Loader2,
  ImageIcon,
  Globe,
  User,
  Info,
  HelpCircle,
  ChevronDown,
  Search
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
  <div className="px-8 py-3.5 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3 rounded-t-2xl">
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

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredUsers = users.filter(u =>
    (u.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (u.email || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const uploadData = new FormData();
    uploadData.append('image', file);

    try {
      const res = await fetch(`${API_URL}/api/upload/image`, {
        method: 'POST',
        body: uploadData,
      });

      if (res.ok) {
        const data = await res.json();
        setFormData(prev => ({ ...prev, logo: data.url }));
        addToast('Success', 'Logo uploaded successfully');
      } else {
        addToast('Error', 'Image upload failed');
      }
    } catch (e) {
      addToast('Error', 'Network error during upload');
    } finally {
      setIsUploading(false);
    }
  };

  useEffect(() => {
    fetch(`${API_URL}/api/admin-ops/users`)
      .then(r => r.json())
      .then(data => setUsers(data.filter((u: any) => u.role === 'VENDOR')))
      .catch(() => { });
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
        const errorData = await res.json().catch(() => ({}));
        addToast('Error', errorData.error || 'Failed to save brand details');
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
        <form id="brand-form" onSubmit={handleSubmit} className="max-w-[1200px] mx-auto space-y-10 px-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm w-full">
            <SectionHeader title="View Brand" icon={Tag} colorClass="text-blue-600" />
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
                  <div
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="w-full h-14 px-6 rounded-xl border border-slate-200 focus:border-blue-500 outline-none font-bold text-sm bg-white flex items-center justify-between cursor-pointer transition-all"
                  >
                    <span className={formData.userId ? 'text-slate-900 truncate pr-4' : 'text-slate-400'}>
                      {formData.userId ? users.find(u => u.id.toString() === formData.userId)?.name : 'No Owner (Generic Brand)'}
                    </span>
                    <ChevronDown size={18} className={`text-slate-400 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                  </div>

                  {isDropdownOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setIsDropdownOpen(false)} />
                      <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl border border-slate-200 shadow-xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                        <div className="p-3 border-b border-slate-100 bg-slate-50/50">
                          <div className="relative">
                            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                              type="text"
                              autoFocus
                              placeholder="Search by vendor name or email..."
                              value={searchQuery}
                              onChange={e => setSearchQuery(e.target.value)}
                              className="w-full h-10 pl-9 pr-4 rounded-lg bg-white border border-slate-200 focus:border-blue-500 focus:ring-2 ring-blue-500/20 outline-none text-xs font-bold transition-all shadow-sm"
                            />
                          </div>
                        </div>
                        <div className="max-h-64 overflow-y-auto p-2 space-y-1">
                          <div
                            onClick={() => {
                              setFormData({ ...formData, userId: '' });
                              setIsDropdownOpen(false);
                              setSearchQuery('');
                            }}
                            className={`px-4 py-3 rounded-lg text-sm font-bold cursor-pointer transition-all flex items-center justify-between ${!formData.userId ? 'bg-blue-50 text-blue-700' : 'text-slate-700 hover:bg-slate-50'}`}
                          >
                            <span>No Owner (Generic Brand)</span>
                            {!formData.userId && <div className="h-2 w-2 rounded-full bg-blue-600 shrink-0" />}
                          </div>
                          {filteredUsers.map(u => (
                            <div
                              key={u.id}
                              onClick={() => {
                                setFormData({ ...formData, userId: u.id.toString() });
                                setIsDropdownOpen(false);
                                setSearchQuery('');
                              }}
                              className={`px-4 py-3 rounded-lg text-sm font-bold cursor-pointer transition-all flex items-center justify-between ${formData.userId === u.id.toString() ? 'bg-blue-50 text-blue-700' : 'text-slate-700 hover:bg-slate-50'}`}
                            >
                              <div className="flex flex-col truncate pr-4">
                                <span className="truncate">{u.name}</span>
                                <span className="text-[10px] text-slate-400 font-medium truncate">{u.email}</span>
                              </div>
                              {formData.userId === u.id.toString() && <div className="h-2 w-2 rounded-full bg-blue-600 shrink-0" />}
                            </div>
                          ))}
                          {filteredUsers.length === 0 && (
                            <div className="px-4 py-10 text-center flex flex-col items-center justify-center gap-2">
                              <Search size={24} className="text-slate-200" />
                              <span className="text-[11px] font-black uppercase tracking-widest text-slate-400">No vendors found</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </>
                  )}
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

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm w-full">
            <SectionHeader title="Visual Assets" icon={ImageIcon} colorClass="text-purple-600" />
            <div className="p-8 space-y-8">
              <div className="flex flex-col gap-2">
                <span className="text-[11px] font-black text-slate-500 uppercase tracking-wider mb-2 px-1">Brand Logo</span>

                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="h-64 w-64 rounded-2xl bg-slate-50/50 border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden shadow-inner p-4 hover:scale-105 transition-transform duration-500 cursor-pointer hover:border-blue-500 relative"
                >
                  <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />
                  {isUploading ? (
                    <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
                  ) : formData.logo ? (
                    <>
                      <img src={formData.logo} className="w-full h-full object-contain" alt="Logo Preview" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 flex items-center justify-center transition-all duration-300">
                        <span className="text-white text-[10px] font-black uppercase tracking-widest">Change Image</span>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-slate-300 hover:text-blue-500 transition-colors">
                      <div className="h-12 w-12 rounded-full bg-white shadow-sm flex items-center justify-center">
                        <Plus size={24} />
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-widest mt-2">Upload Logo</span>
                      <span className="text-[8px] font-bold uppercase tracking-widest text-slate-300">Recommended: 500 x 500px</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
