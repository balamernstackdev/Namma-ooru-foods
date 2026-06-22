'use client';

import React, { useState } from 'react';
import { 
  Ticket, Plus, Search, Calendar, Trash2, CheckCircle, 
  Clock, XCircle, Loader2, Eye, Percent
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { API_URL } from '@/lib/api';
import useSWR from 'swr';
import { motion, AnimatePresence } from 'framer-motion';

const fetcher = (url: string) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('namma_orru_token') : null;
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return fetch(url, { headers }).then(res => res.json());
};

interface Coupon {
  id: number;
  code: string;
  type: string;
  value: number;
  minOrderValue: number;
  usageLimit: number | null;
  perUserLimit: number;
  expiresAt: string | null;
  isActive: boolean;
  status: string; // PENDING, ACTIVE, REJECTED
  createdByType: string;
  createdById: number | null;
  createdAt: string;
  benefitType: string;
  couponScope: string;
}

export default function VendorCouponsPage() {
  const { user } = useAuth();
  const vendorId = user?.brandId || user?.subVendorId;

  // Tabs: 'ALL', 'ACTIVE', 'PENDING', 'REJECTED'
  const [activeTab, setActiveTab] = useState<'ALL' | 'ACTIVE' | 'PENDING' | 'REJECTED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [form, setForm] = useState({
    code: '',
    name: '',
    description: '',
    benefitType: 'PERCENTAGE', // PERCENTAGE, FIXED, FREE_SHIPPING
    value: '',
    minOrderValue: '0',
    usageLimit: '',
    perUserLimit: '1',
    expiresAt: '',
    couponScope: 'GENERAL', // GENERAL, PRODUCT
    selectedProducts: [] as number[],
  });

  // Fetch Vendor Coupons
  const { data: couponsData, mutate } = useSWR<any>(
    vendorId ? `${API_URL}/api/coupons?vendorId=${vendorId}` : null,
    fetcher
  );
  const coupons: Coupon[] = couponsData?.coupons || [];

  // Fetch Vendor Products for scoping
  const { data: productsData } = useSWR<any>(
    vendorId ? `${API_URL}/api/products?vendorId=${vendorId}&limit=1000` : null,
    fetcher
  );
  const products = productsData?.products || [];

  // Filter coupons based on tab and query
  const filteredCoupons = coupons.filter(c => {
    const matchesTab = activeTab === 'ALL' || c.status === activeTab;
    const matchesSearch = c.code.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  // Form Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vendorId) return;

    if (!form.code || !form.value) {
      alert('Please fill in Coupon Code and Discount Value');
      return;
    }

    setIsSubmitting(true);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('namma_orru_token') : null;
      
      const payload = {
        code: form.code.toUpperCase().replace(/\s+/g, ''),
        type: form.benefitType,
        value: parseFloat(form.value),
        minOrderValue: parseFloat(form.minOrderValue || '0'),
        usageLimit: form.usageLimit ? parseInt(form.usageLimit) : null,
        perUserLimit: parseInt(form.perUserLimit || '1'),
        expiresAt: form.expiresAt ? new Date(form.expiresAt).toISOString() : null,
        benefitType: form.benefitType,
        couponScope: form.couponScope,
        couponVendors: [vendorId], // Restrict scoping to this vendor
        couponProducts: form.couponScope === 'PRODUCT' ? form.selectedProducts : null,
        createdByType: 'VENDOR',
        createdById: vendorId,
        status: 'PENDING', // Initially pending admin approval
        isActive: true,
      };

      const res = await fetch(`${API_URL}/api/coupons`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to create coupon');
      }

      alert('Coupon created successfully and submitted for Admin Approval!');
      setIsCreateOpen(false);
      // Reset form
      setForm({
        code: '',
        name: '',
        description: '',
        benefitType: 'PERCENTAGE',
        value: '',
        minOrderValue: '0',
        usageLimit: '',
        perUserLimit: '1',
        expiresAt: '',
        couponScope: 'GENERAL',
        selectedProducts: [],
      });
      mutate();
    } catch (err: any) {
      alert(err.message || 'Error occurred while saving coupon.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteCoupon = async (id: number) => {
    if (!confirm('Are you sure you want to delete this coupon?')) return;
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('namma_orru_token') : null;
      await fetch(`${API_URL}/api/coupons/${id}`, {
        method: 'DELETE',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
      });
      mutate();
    } catch (err) {
      console.error(err);
    }
  };

  // KPIs
  const activeCount = coupons.filter(c => c.status === 'ACTIVE').length;
  const pendingCount = coupons.filter(c => c.status === 'PENDING').length;
  const usageCountTotal = coupons.reduce((acc, c: any) => acc + (c.usageCount || 0), 0);

  return (
    <div className="space-y-8 pb-20">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-[#111827] tracking-tight flex items-center gap-3">
            <Ticket className="text-[#0F7A4D] h-8 w-8" />
            Coupons <span className="text-[#0F7A4D] font-light">& Campaigns</span>
          </h1>
          <p className="text-[#6B7280] font-bold uppercase tracking-widest text-[10px] mt-2">
            Configure target discount codes, track usage metrics, and scale your brand conversions.
          </p>
        </div>
        <button
          onClick={() => setIsCreateOpen(true)}
          className="flex items-center gap-2 bg-[#0F7A4D] text-white px-6 py-3 rounded-[20px] font-black text-[12px] uppercase tracking-widest hover:bg-[#0c623d] transition-all shadow-[0_4px_12px_rgba(15,122,77,0.2)] cursor-pointer"
        >
          <Plus size={16} /> Create Coupon
        </button>
      </div>

      {/* KPI WIDGETS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-[20px] border border-[#E5E7EB] p-6 flex items-center justify-between shadow-[0_4px_12px_rgba(0,0,0,0.05)]">
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#6B7280]">Active Coupons</span>
            <h3 className="text-3xl font-black text-[#111827]">{activeCount}</h3>
          </div>
          <div className="h-12 w-12 bg-[#DCFCE7] text-[#15803D] rounded-2xl flex items-center justify-center">
            <CheckCircle size={22} />
          </div>
        </div>

        <div className="bg-white rounded-[20px] border border-[#E5E7EB] p-6 flex items-center justify-between shadow-[0_4px_12px_rgba(0,0,0,0.05)]">
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#6B7280]">Pending Approval</span>
            <h3 className="text-3xl font-black text-[#111827]">{pendingCount}</h3>
          </div>
          <div className="h-12 w-12 bg-[#FEF3C7] text-[#B45309] rounded-2xl flex items-center justify-center">
            <Clock size={22} className="animate-pulse" />
          </div>
        </div>

        <div className="bg-white rounded-[20px] border border-[#E5E7EB] p-6 flex items-center justify-between shadow-[0_4px_12px_rgba(0,0,0,0.05)]">
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#6B7280]">Total Usage</span>
            <h3 className="text-3xl font-black text-[#111827]">{usageCountTotal}</h3>
          </div>
          <div className="h-12 w-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
            <Eye size={22} />
          </div>
        </div>
      </div>

      {/* TABS & SEARCH */}
      <div className="bg-white rounded-[20px] border border-[#E5E7EB] p-6 shadow-[0_4px_12px_rgba(0,0,0,0.05)] space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2 bg-[#F8FAF7] p-1.5 rounded-2xl border border-[#E5E7EB] w-full lg:w-auto">
            {(['ALL', 'ACTIVE', 'PENDING', 'REJECTED'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 sm:flex-none text-center px-4 sm:px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer ${
                  activeTab === tab 
                    ? 'bg-[#0F7A4D] text-white shadow-md' 
                    : 'text-[#6B7280] hover:text-[#111827] hover:bg-[#F8FAF7]'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="relative max-w-sm w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search coupon code..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full h-11 pl-11 pr-4 rounded-xl border border-[#E5E7EB] focus:border-[#0F7A4D] outline-none text-[13px] font-bold text-slate-800 bg-[#F8FAF7]/50 focus:bg-white transition-all focus:ring-4 focus:ring-[#0F7A4D]/5"
            />
          </div>
        </div>

        {/* LIST TABLE */}
        {/* Desktop View */}
        <div className="hidden md:block overflow-x-auto rounded-[20px] border border-[#E5E7EB] min-h-[280px]">
          <table className="w-full text-left border-collapse min-w-[1000px] admin-data-table">
            <thead>
              <tr className="bg-[#F8FAF7] border-b border-[#E5E7EB]">
                <th className="px-6 py-4.5 text-[10px] font-black uppercase tracking-widest text-[#6B7280]">Coupon Details</th>
                <th className="px-6 py-4.5 text-[10px] font-black uppercase tracking-widest text-[#6B7280]">Benefit</th>
                <th className="px-6 py-4.5 text-[10px] font-black uppercase tracking-widest text-[#6B7280]">Validity Scope</th>
                <th className="px-6 py-4.5 text-[10px] font-black uppercase tracking-widest text-[#6B7280]">Approval State</th>
                <th className="px-6 py-4.5 text-[10px] font-black uppercase tracking-widest text-[#6B7280] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB] font-bold text-[13px] text-[#111827]">
              {filteredCoupons.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center text-[#6B7280] uppercase tracking-widest text-[11px]">
                    No coupons found in this registry.
                  </td>
                </tr>
              ) : (
                filteredCoupons.map(coupon => (
                  <tr key={coupon.id} className="hover:bg-[#F8FAF7]/30 transition-colors">
                    <td className="px-6 py-4.5">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-[#DCFCE7] text-[#15803D] rounded-xl flex items-center justify-center">
                          <Ticket size={18} />
                        </div>
                        <div>
                          <div className="font-extrabold text-[14px] text-[#111827] tracking-tight">{coupon.code}</div>
                          {coupon.expiresAt && (
                            <div className="text-[10px] text-[#6B7280] font-medium flex items-center gap-1 mt-1">
                              <Calendar size={12} /> Expires: {new Date(coupon.expiresAt).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4.5">
                      {coupon.benefitType === 'PERCENTAGE' && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
                          <Percent size={12} /> {coupon.value}% Off
                        </span>
                      )}
                      {coupon.benefitType === 'FIXED' && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
                          ₹{coupon.value} Off
                        </span>
                      )}
                      {coupon.benefitType === 'FREE_SHIPPING' && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-purple-700 bg-purple-50 px-3 py-1 rounded-full border border-purple-100">
                          Free Shipping
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4.5">
                      {coupon.couponScope === 'PRODUCT' ? (
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#6B7280] bg-slate-100 px-3 py-1 rounded-full">
                          Specific Products
                        </span>
                      ) : (
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#15803D] bg-[#DCFCE7] px-3 py-1 rounded-full">
                          All Store Products
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4.5">
                      {coupon.status === 'ACTIVE' && (
                        <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-[#15803D] bg-[#DCFCE7] px-3 py-1.5 rounded-xl border border-[#DCFCE7]">
                          <CheckCircle size={12} /> Active
                        </span>
                      )}
                      {coupon.status === 'PENDING' && (
                        <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-[#B45309] bg-[#FEF3C7] px-3 py-1.5 rounded-xl border border-[#FEF3C7]">
                          <Clock size={12} className="animate-pulse" /> Pending Approval
                        </span>
                      )}
                      {coupon.status === 'REJECTED' && (
                        <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-[#DC2626] bg-[#FEE2E2] px-3 py-1.5 rounded-xl border border-[#FEE2E2]">
                          <XCircle size={12} /> Rejected
                        </span>
                      )}
                      {(coupon as any).rejectionNote && (
                        <div className="mt-2 text-[10px] text-[#DC2626] font-bold bg-[#FEE2E2] border border-[#FEE2E2] px-2 py-1.5 rounded-lg flex gap-1.5 items-start">
                          <span className="flex-shrink-0">💬</span>
                          <span>{(coupon as any).rejectionNote}</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4.5 text-right">
                      <button
                        onClick={() => deleteCoupon(coupon.id)}
                        className="h-9 w-9 bg-white hover:bg-red-50 border border-[#E5E7EB] hover:border-red-200 text-slate-400 hover:text-red-500 rounded-xl transition-all inline-flex items-center justify-center cursor-pointer"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile View - Card Layout */}
        <div className="block md:hidden divide-y divide-[#E5E7EB] border border-[#E5E7EB] rounded-[20px] overflow-hidden">
          {filteredCoupons.length === 0 ? (
            <div className="py-16 text-center text-[#6B7280] uppercase tracking-widest text-[11px]">
              No coupons found in this registry.
            </div>
          ) : (
            filteredCoupons.map(coupon => (
              <div key={coupon.id} className="p-5 space-y-4 bg-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="h-9 w-9 bg-[#DCFCE7] text-[#15803D] rounded-xl flex items-center justify-center shrink-0">
                      <Ticket size={16} />
                    </div>
                    <span className="font-extrabold text-[14px] text-[#111827] tracking-tight">{coupon.code}</span>
                  </div>
                  <button
                    onClick={() => deleteCoupon(coupon.id)}
                    className="h-9 w-9 bg-white hover:bg-red-50 border border-[#E5E7EB] hover:border-red-200 text-slate-400 hover:text-red-500 rounded-xl transition-all flex items-center justify-center cursor-pointer"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3 bg-[#F8FAF7] rounded-xl p-4 border border-[#E5E7EB] text-xs">
                  <div className="space-y-1">
                    <span className="text-[9px] text-[#6B7280] uppercase tracking-wider block font-bold">Benefit</span>
                    {coupon.benefitType === 'PERCENTAGE' && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-blue-700">
                        {coupon.value}% Off
                      </span>
                    )}
                    {coupon.benefitType === 'FIXED' && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-indigo-700">
                        ₹{coupon.value} Off
                      </span>
                    )}
                    {coupon.benefitType === 'FREE_SHIPPING' && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-purple-700">
                        Free Shipping
                      </span>
                    )}
                  </div>
                  <div className="space-y-1">
                    <span className="text-[9px] text-[#6B7280] uppercase tracking-wider block font-bold">Scope</span>
                    <span className="font-bold text-slate-800 block truncate">
                      {coupon.couponScope === 'PRODUCT' ? 'Specific Products' : 'All Store'}
                    </span>
                  </div>
                  <div className="col-span-2 pt-2 border-t border-[#E5E7EB] flex items-center justify-between">
                    <span className="text-[9px] text-[#6B7280] uppercase tracking-wider font-bold">Validity</span>
                    {coupon.expiresAt ? (
                      <span className="text-[10px] font-bold text-slate-600">Expires: {new Date(coupon.expiresAt).toLocaleDateString()}</span>
                    ) : (
                      <span className="text-[10px] font-bold text-slate-400 italic">Indefinite</span>
                    )}
                  </div>
                  <div className="col-span-2 pt-2 border-t border-[#E5E7EB] space-y-1">
                    <span className="text-[9px] text-[#6B7280] uppercase tracking-wider block font-bold">Approval State</span>
                    <div className="flex flex-wrap items-center gap-2">
                      {coupon.status === 'ACTIVE' && (
                        <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-[#15803D] bg-[#DCFCE7] px-2.5 py-1 rounded-lg border border-[#DCFCE7]">
                          Active
                        </span>
                      )}
                      {coupon.status === 'PENDING' && (
                        <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-[#B45309] bg-[#FEF3C7] px-2.5 py-1 rounded-lg border border-[#FEF3C7]">
                          Pending
                        </span>
                      )}
                      {coupon.status === 'REJECTED' && (
                        <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-[#DC2626] bg-[#FEE2E2] px-2.5 py-1 rounded-lg border border-[#FEE2E2]">
                          Rejected
                        </span>
                      )}
                      {(coupon as any).rejectionNote && (
                        <p className="text-[9px] text-[#DC2626] font-bold mt-1 bg-[#FEE2E2]/60 px-2 py-1 rounded-md">
                          💬 {(coupon as any).rejectionNote}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* CREATE MODAL */}
      <AnimatePresence>
        {isCreateOpen && (
          <div className="fixed inset-0 bg-[#111827]/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-[20px] border border-[#E5E7EB] max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-5 sm:p-8"
              data-lenis-prevent
            >
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-xl font-black text-[#111827] uppercase tracking-tight flex items-center gap-2">
                    <Ticket className="text-[#0F7A4D] h-6 w-6" /> Create Store Coupon
                  </h3>
                  <p className="text-[10px] text-[#6B7280] uppercase tracking-widest font-bold mt-1">
                    Submitted coupons go to Pending Approval before launch
                  </p>
                </div>
                <button
                  onClick={() => setIsCreateOpen(false)}
                  className="h-10 w-10 bg-slate-100 hover:bg-slate-200 rounded-full flex items-center justify-center text-slate-500 cursor-pointer"
                >
                  <XCircle size={18} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[9px] font-black uppercase tracking-widest text-[#6B7280] mb-2 block">Coupon Code</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. RATHINI10"
                      value={form.code}
                      onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))}
                      className="w-full h-11 px-4 rounded-xl border border-[#E5E7EB] focus:border-[#0F7A4D] outline-none text-[13px] font-bold text-slate-800 bg-[#F8FAF7]/50 focus:bg-white focus:ring-4 focus:ring-[#0F7A4D]/5"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-black uppercase tracking-widest text-[#6B7280] mb-2 block">Coupon Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rathini Flat 10%"
                      value={form.name}
                      onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                      className="w-full h-11 px-4 rounded-xl border border-[#E5E7EB] focus:border-[#0F7A4D] outline-none text-[13px] font-bold text-slate-800 bg-[#F8FAF7]/50 focus:bg-white focus:ring-4 focus:ring-[#0F7A4D]/5"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[9px] font-black uppercase tracking-widest text-[#6B7280] mb-2 block">Description</label>
                  <textarea
                    placeholder="Describe the offer rules for customers"
                    value={form.description}
                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    className="w-full min-h-[80px] p-4 rounded-xl border border-[#E5E7EB] focus:border-[#0F7A4D] outline-none text-[13px] font-bold text-slate-800 bg-[#F8FAF7]/50 focus:bg-white resize-none focus:ring-4 focus:ring-[#0F7A4D]/5"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-[9px] font-black uppercase tracking-widest text-[#6B7280] mb-2 block">Discount Type</label>
                    <select
                      value={form.benefitType}
                      onChange={e => setForm(f => ({ ...f, benefitType: e.target.value }))}
                      className="w-full h-11 px-4 rounded-xl border border-[#E5E7EB] focus:border-[#0F7A4D] outline-none text-[13px] font-bold text-slate-800 bg-[#F8FAF7]/50 focus:bg-white focus:ring-4 focus:ring-[#0F7A4D]/5"
                    >
                      <option value="PERCENTAGE">Percentage (%)</option>
                      <option value="FIXED">Flat Discount (₹)</option>
                      <option value="FREE_SHIPPING">Free Shipping</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[9px] font-black uppercase tracking-widest text-[#6B7280] mb-2 block">Discount Value</label>
                    <input
                      type="number"
                      required={form.benefitType !== 'FREE_SHIPPING'}
                      disabled={form.benefitType === 'FREE_SHIPPING'}
                      placeholder={form.benefitType === 'PERCENTAGE' ? '10' : '100'}
                      value={form.value}
                      onChange={e => setForm(f => ({ ...f, value: e.target.value }))}
                      className="w-full h-11 px-4 rounded-xl border border-[#E5E7EB] focus:border-[#0F7A4D] outline-none text-[13px] font-bold text-slate-800 bg-[#F8FAF7]/50 focus:bg-white disabled:bg-slate-100 disabled:cursor-not-allowed focus:ring-4 focus:ring-[#0F7A4D]/5"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-black uppercase tracking-widest text-[#6B7280] mb-2 block">Min Order Value (₹)</label>
                    <input
                      type="number"
                      placeholder="0"
                      value={form.minOrderValue}
                      onChange={e => setForm(f => ({ ...f, minOrderValue: e.target.value }))}
                      className="w-full h-11 px-4 rounded-xl border border-[#E5E7EB] focus:border-[#0F7A4D] outline-none text-[13px] font-bold text-slate-800 bg-[#F8FAF7]/50 focus:bg-white focus:ring-4 focus:ring-[#0F7A4D]/5"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-[9px] font-black uppercase tracking-widest text-[#6B7280] mb-2 block">Total Usage Limit</label>
                    <input
                      type="number"
                      placeholder="Unlimited"
                      value={form.usageLimit}
                      onChange={e => setForm(f => ({ ...f, usageLimit: e.target.value }))}
                      className="w-full h-11 px-4 rounded-xl border border-[#E5E7EB] focus:border-[#0F7A4D] outline-none text-[13px] font-bold text-slate-800 bg-[#F8FAF7]/50 focus:bg-white focus:ring-4 focus:ring-[#0F7A4D]/5"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-black uppercase tracking-widest text-[#6B7280] mb-2 block">Usage Per Customer</label>
                    <input
                      type="number"
                      placeholder="1"
                      value={form.perUserLimit}
                      onChange={e => setForm(f => ({ ...f, perUserLimit: e.target.value }))}
                      className="w-full h-11 px-4 rounded-xl border border-[#E5E7EB] focus:border-[#0F7A4D] outline-none text-[13px] font-bold text-slate-800 bg-[#F8FAF7]/50 focus:bg-white focus:ring-4 focus:ring-[#0F7A4D]/5"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-black uppercase tracking-widest text-[#6B7280] mb-2 block">Expires At</label>
                    <input
                      type="date"
                      value={form.expiresAt}
                      onChange={e => setForm(f => ({ ...f, expiresAt: e.target.value }))}
                      className="w-full h-11 px-4 rounded-xl border border-[#E5E7EB] focus:border-[#0F7A4D] outline-none text-[13px] font-bold text-slate-800 bg-[#F8FAF7]/50 focus:bg-white focus:ring-4 focus:ring-[#0F7A4D]/5"
                    />
                  </div>
                </div>

                <div className="border-t border-[#E5E7EB] pt-6">
                  <label className="text-[9px] font-black uppercase tracking-widest text-[#6B7280] mb-2 block">Applicability Scopes</label>
                  <select
                    value={form.couponScope}
                    onChange={e => setForm(f => ({ ...f, couponScope: e.target.value }))}
                    className="w-full h-11 px-4 rounded-xl border border-[#E5E7EB] focus:border-[#0F7A4D] outline-none text-[13px] font-bold text-slate-800 bg-[#F8FAF7]/50 focus:bg-white focus:ring-4 focus:ring-[#0F7A4D]/5"
                  >
                    <option value="GENERAL">All My Products</option>
                    <option value="PRODUCT">Selected Products</option>
                  </select>

                  {form.couponScope === 'PRODUCT' && (
                    <div className="mt-4 p-4 bg-[#F8FAF7] rounded-[20px] space-y-3 border border-[#E5E7EB]">
                      <span className="text-[9px] font-black uppercase tracking-widest text-[#6B7280]">Select eligible products</span>
                      <div className="max-h-48 overflow-y-auto space-y-2 pr-2">
                        {products.length === 0 ? (
                          <div className="text-[11px] text-[#6B7280] font-bold uppercase tracking-wider py-4">
                            No products found in your inventory
                          </div>
                        ) : (
                          products.map((p: any) => {
                            const isChecked = form.selectedProducts.includes(p.id);
                            return (
                              <label key={p.id} className="flex items-center gap-3 p-2 bg-white border border-[#E5E7EB] rounded-xl cursor-pointer hover:border-[#0F7A4D]">
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => {
                                    setForm(f => {
                                      const productsList = f.selectedProducts.includes(p.id)
                                        ? f.selectedProducts.filter(id => id !== p.id)
                                        : [...f.selectedProducts, p.id];
                                      return { ...f, selectedProducts: productsList };
                                    });
                                  }}
                                  className="h-4 w-4 text-[#0F7A4D] focus:ring-[#0F7A4D] rounded border-slate-300"
                                />
                                <div className="flex items-center gap-2">
                                  {p.image && <img src={p.image} className="w-8 h-8 rounded-lg object-contain" alt="" />}
                                  <span className="text-xs font-bold text-slate-800">{p.name}</span>
                                </div>
                              </label>
                            );
                          })
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row gap-3 justify-end pt-4 border-t border-[#E5E7EB]">
                  <button
                    type="button"
                    onClick={() => setIsCreateOpen(false)}
                    className="px-6 py-3 rounded-2xl border-2 border-slate-200 text-slate-500 font-black text-[12px] uppercase tracking-widest hover:bg-slate-50 cursor-pointer w-full sm:w-auto"
                  >
                    Discard
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex items-center justify-center gap-2 px-8 py-3 rounded-2xl bg-[#0F7A4D] text-white font-black text-[12px] uppercase tracking-widest hover:bg-[#0c623d] transition-all shadow-[0_4px_12px_rgba(15,122,77,0.2)] disabled:opacity-50 cursor-pointer w-full sm:w-auto"
                  >
                    {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                    Submit Coupon
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
