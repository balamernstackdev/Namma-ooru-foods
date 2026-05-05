'use client';

import React, { useState, useEffect } from 'react';
import {
  Tag,
  Save,
  ArrowLeft,
  Loader2,
  Calendar,
  Zap,
  ShieldAlert,
  Percent,
  IndianRupee,
  HelpCircle,
  Clock,
  Globe
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { API_URL } from '@/lib/api';
import { useToast } from '@/context/ToastContext';

interface CouponFormProps {
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

export default function CouponForm({ initialData, mode }: CouponFormProps) {
  const router = useRouter();
  const { addToast } = useToast();
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    id: initialData?.id || '',
    code: initialData?.code || '',
    type: initialData?.type || 'PERCENTAGE',
    value: initialData?.value?.toString() || '',
    minOrderValue: initialData?.minOrderValue?.toString() || '',
    maxDiscount: initialData?.maxDiscount?.toString() || '',
    usageLimit: initialData?.usageLimit?.toString() || '',
    perUserLimit: initialData?.perUserLimit?.toString() || '1',
    expiresAt: initialData?.expiresAt ? new Date(initialData.expiresAt).toISOString().slice(0, 16) : ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const url = mode === 'edit'
        ? `${API_URL}/api/coupons/${formData.id}`
        : `${API_URL}/api/coupons`;
      const method = mode === 'edit' ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        addToast('Success', mode === 'edit' ? 'Promotion calibrated successfully' : 'Coupon deployed to marketplace');
        router.push('/admin/coupons');
        router.refresh();
      } else {
        const err = await res.json();
        addToast('Error', err.error || 'Failed to save coupon');
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
              onClick={() => router.push('/admin/coupons')}
              className="h-10 w-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 hover:text-blue-600 transition-all shadow-sm"
            >
              <ArrowLeft size={18} />
            </button>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
              {mode === 'edit' ? 'Edit Coupon' : 'Deploy New Promotion'}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => router.push('/admin/coupons')} className="px-4 py-2 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-100 transition-all">Discard</button>
            <button
              form="coupon-form"
              type="submit"
              disabled={submitting}
              className="px-6 py-2 rounded-lg bg-[#2563eb] text-white text-xs font-black flex items-center gap-2 shadow-lg shadow-blue-500/20 hover:bg-[#1d4ed8] disabled:opacity-50 transition-all active:scale-95 uppercase tracking-wider"
            >
              {submitting ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              {mode === 'edit' ? 'Update' : 'Deploy'}
            </button>
          </div>
        </div>
      </div>

      <div className="px-2">
        <form id="coupon-form" onSubmit={handleSubmit} className="max-w-full mx-auto space-y-10 px-4">
          <div className="grid grid-cols-12 gap-8">
            {/* Main Configuration */}
            <div className="col-span-12 space-y-8">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <SectionHeader title="Trigger & Value" icon={Zap} colorClass="text-amber-500" />
                <div className="p-8 space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <InputWrapper label="Coupon Code" helpText="The unique string customers enter at checkout.">
                      <div className="relative">
                        <Tag size={16} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          required
                          value={formData.code}
                          onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                          placeholder="e.g. HARVEST2026"
                          className="w-full h-14 pl-14 pr-6 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 ring-blue-500/5 outline-none font-black text-slate-900 text-sm transition-all"
                        />
                      </div>
                    </InputWrapper>

                    <InputWrapper label="Promotion Type">
                      <div className="relative">
                        <select
                          value={formData.type}
                          onChange={e => setFormData({ ...formData, type: e.target.value })}
                          className="w-full h-14 px-6 rounded-xl border border-slate-200 focus:border-blue-500 outline-none font-bold text-sm appearance-none bg-white"
                        >
                          <option value="PERCENTAGE">Percentage Off</option>
                          <option value="FIXED">Fixed Amount Off</option>
                          <option value="FREE_SHIPPING">Free Shipping</option>
                        </select>
                        <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                           <Globe size={16} />
                        </div>
                      </div>
                    </InputWrapper>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <InputWrapper label="Benefit Value">
                      <div className="relative">
                        {formData.type === 'PERCENTAGE' ? <Percent size={16} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" /> : <IndianRupee size={16} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" />}
                        <input
                          required
                          type="number"
                          value={formData.value}
                          onChange={e => setFormData({ ...formData, value: e.target.value })}
                          placeholder="0.00"
                          className="w-full h-14 pl-14 pr-6 rounded-xl border border-slate-200 focus:border-blue-500 outline-none font-bold text-slate-900 text-sm transition-all"
                        />
                      </div>
                    </InputWrapper>

                    <InputWrapper label="Min Order Value">
                      <div className="relative">
                        <IndianRupee size={16} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          required
                          type="number"
                          value={formData.minOrderValue}
                          onChange={e => setFormData({ ...formData, minOrderValue: e.target.value })}
                          placeholder="0.00"
                          className="w-full h-14 pl-14 pr-6 rounded-xl border border-slate-200 focus:border-blue-500 outline-none font-bold text-slate-900 text-sm transition-all"
                        />
                      </div>
                    </InputWrapper>

                    <InputWrapper label="Max Discount Cap" helpText="Only applicable for Percentage type.">
                      <div className="relative">
                        <IndianRupee size={16} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type="number"
                          disabled={formData.type !== 'PERCENTAGE'}
                          value={formData.maxDiscount}
                          onChange={e => setFormData({ ...formData, maxDiscount: e.target.value })}
                          placeholder="Optional"
                          className="w-full h-14 pl-14 pr-6 rounded-xl border border-slate-200 focus:border-blue-500 outline-none font-bold text-slate-900 text-sm transition-all disabled:bg-slate-50 disabled:text-slate-400"
                        />
                      </div>
                    </InputWrapper>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <SectionHeader title="Lifespan & Availability" icon={Clock} colorClass="text-purple-600" />
                <div className="p-8 space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <InputWrapper label="Global Usage Limit" helpText="Total number of times this coupon can be used across all users.">
                      <input
                        type="number"
                        value={formData.usageLimit}
                        onChange={e => setFormData({ ...formData, usageLimit: e.target.value })}
                        placeholder="Leave empty for unlimited"
                        className="w-full h-14 px-6 rounded-xl border border-slate-200 focus:border-blue-500 outline-none font-bold text-slate-900 text-sm transition-all"
                      />
                    </InputWrapper>

                    <InputWrapper label="Per User Limit" helpText="How many times a single customer can use this coupon.">
                      <input
                        required
                        type="number"
                        value={formData.perUserLimit}
                        onChange={e => setFormData({ ...formData, perUserLimit: e.target.value })}
                        placeholder="1"
                        className="w-full h-14 px-6 rounded-xl border border-slate-200 focus:border-blue-500 outline-none font-bold text-slate-900 text-sm transition-all"
                      />
                    </InputWrapper>
                  </div>

                  <InputWrapper label="Expiration Date & Time">
                    <div className="relative">
                      <Calendar size={16} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="datetime-local"
                        value={formData.expiresAt}
                        onChange={e => setFormData({ ...formData, expiresAt: e.target.value })}
                        className="w-full h-14 pl-14 pr-6 rounded-xl border border-slate-200 focus:border-blue-500 outline-none font-bold text-slate-900 text-sm transition-all"
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
