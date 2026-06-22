'use client';

import React, { useState } from 'react';
import { 
  Megaphone, Plus, Search, Calendar, Trash2, CheckCircle, 
  Clock, XCircle, Loader2, Eye, Paintbrush, ArrowRight
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

interface OfferAnnouncement {
  id: number;
  title: string;
  message: string;
  couponCode: string | null;
  buttonText: string | null;
  redirectUrl: string | null;
  offerType: string;
  bgColor: string;
  textColor: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  priorityOrder: number;
  status: string; // PENDING, ACTIVE, REJECTED
  announcementType: string;
  vendorId: number | null;
  publishHomepage?: boolean;
}

const getFormatBadge = (type?: string | null) => {
  const t = type || 'TOP_ANNOUNCEMENT_BAR';
  if (t === 'TOP_ANNOUNCEMENT_BAR' || t === 'ADMIN' || t === 'VENDOR') {
    return {
      text: 'TOP BAR',
      classes: 'bg-emerald-50 border-emerald-200 text-emerald-700'
    };
  }
  if (t === 'HERO_BANNER') {
    return {
      text: 'HERO SLIDER',
      classes: 'bg-blue-50 border-blue-200 text-blue-700'
    };
  }
  if (t === 'POPUP_OFFER') {
    return {
      text: 'POPUP MODAL',
      classes: 'bg-amber-50 border-amber-200 text-amber-700'
    };
  }
  if (t === 'VENDOR_PROMOTION') {
    return {
      text: 'VENDOR PROMOTION',
      classes: 'bg-purple-50 border-purple-200 text-purple-700'
    };
  }
  return {
    text: t.replace(/_/g, ' '),
    classes: 'bg-slate-50 border-slate-200 text-slate-700'
  };
};

export default function VendorAnnouncementsPage() {
  const { user } = useAuth();
  const vendorId = user?.brandId || user?.subVendorId;

  const [activeTab, setActiveTab] = useState<'ALL' | 'ACTIVE' | 'PENDING' | 'REJECTED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [form, setForm] = useState({
    title: '',
    message: '',
    couponCode: '',
    buttonText: '',
    redirectUrl: '',
    offerType: 'GENERAL', // GENERAL, DISCOUNT, FESTIVAL, EVENT
    bgColor: '#0F7A4D',
    textColor: '#FFFFFF',
    startDate: '',
    endDate: '',
    priorityOrder: '0',
    publishHomepage: false,
    announcementType: 'VENDOR_PROMOTION',
  });

  // Fetch Vendor Announcements
  const { data: rawAnnouncements, mutate } = useSWR<OfferAnnouncement[]>(
    vendorId ? `${API_URL}/api/offer-announcements?vendorId=${vendorId}` : null,
    fetcher
  );
  const announcements = Array.isArray(rawAnnouncements) ? rawAnnouncements : [];

  // Filter based on tab and query
  const filteredAnnouncements = announcements.filter(a => {
    const matchesTab = activeTab === 'ALL' || a.status === activeTab;
    const matchesSearch = a.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          a.message.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  // Form Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vendorId) return;

    if (!form.title || !form.message || !form.startDate || !form.endDate) {
      alert('Please fill in all required fields (Title, Message, Start & End Dates)');
      return;
    }

    setIsSubmitting(true);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('namma_orru_token') : null;
      
      const payload = {
        title: form.title,
        message: form.message,
        couponCode: form.couponCode || null,
        buttonText: form.buttonText || null,
        redirectUrl: form.redirectUrl || null,
        offerType: form.offerType,
        bgColor: form.bgColor,
        textColor: form.textColor,
        startDate: new Date(form.startDate).toISOString(),
        endDate: new Date(form.endDate).toISOString(),
        isActive: true,
        priorityOrder: parseInt(form.priorityOrder || '0'),
        vendorId: vendorId,
        announcementType: form.announcementType,
        publishHomepage: form.publishHomepage,
        status: 'PENDING', // Submissions require approval
        createdByType: 'VENDOR',
      };

      const res = await fetch(`${API_URL}/api/offer-announcements`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to create announcement');
      }

      alert('Announcement bar successfully created and submitted for admin approval!');
      setIsCreateOpen(false);
      // Reset form
      setForm({
        title: '',
        message: '',
        couponCode: '',
        buttonText: '',
        redirectUrl: '',
        offerType: 'GENERAL',
        bgColor: '#0F7A4D',
        textColor: '#FFFFFF',
        startDate: '',
        endDate: '',
        priorityOrder: '0',
        publishHomepage: false,
        announcementType: 'VENDOR_PROMOTION',
      });
      mutate();
    } catch (err: any) {
      alert(err.message || 'Error occurred while saving announcement.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteAnnouncement = async (id: number) => {
    if (!confirm('Are you sure you want to delete this announcement?')) return;
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('namma_orru_token') : null;
      await fetch(`${API_URL}/api/offer-announcements/${id}`, {
        method: 'DELETE',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
      });
      mutate();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8 pb-20">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-[#111827] tracking-tight flex items-center gap-3">
            <Megaphone className="text-[#0F7A4D] h-8 w-8" />
            Announcement Bars <span className="text-[#0F7A4D] font-light">& Banners</span>
          </h1>
          <p className="text-[#6B7280] font-bold uppercase tracking-widest text-[10px] mt-2">
            Create premium offer ribbons to pin at the very top of your digital store pages.
          </p>
        </div>
        <button
          onClick={() => setIsCreateOpen(true)}
          className="flex items-center gap-2 bg-[#0F7A4D] text-white px-6 py-3 rounded-[20px] font-black text-[12px] uppercase tracking-widest hover:bg-[#0c623d] transition-all shadow-[0_4px_12px_rgba(15,122,77,0.2)] cursor-pointer"
        >
          <Plus size={16} /> Add Announcement
        </button>
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
              placeholder="Search announcements..."
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
                <th className="px-6 py-4.5 text-[10px] font-black uppercase tracking-widest text-[#6B7280]">Preview & Content</th>
                <th className="px-6 py-4.5 text-[10px] font-black uppercase tracking-widest text-[#6B7280]">Coupon</th>
                <th className="px-6 py-4.5 text-[10px] font-black uppercase tracking-widest text-[#6B7280]">Campaign Timeline</th>
                <th className="px-6 py-4.5 text-[10px] font-black uppercase tracking-widest text-[#6B7280]">Status</th>
                <th className="px-6 py-4.5 text-[10px] font-black uppercase tracking-widest text-[#6B7280] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB] font-bold text-[13px] text-[#111827]">
              {filteredAnnouncements.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center text-[#6B7280] uppercase tracking-widest text-[11px]">
                    No announcements configured in this registry.
                  </td>
                </tr>
              ) : (
                filteredAnnouncements.map(ann => (
                  <tr key={ann.id} className="hover:bg-[#F8FAF7]/30 transition-colors">
                    <td className="px-6 py-4.5 max-w-sm">
                      <div className="space-y-2">
                        <div className="text-[14px] font-extrabold text-[#111827]">{ann.title}</div>
                        <p className="text-[12px] text-[#6B7280] font-medium line-clamp-1">{ann.message}</p>
                        {/* Interactive Banner Preview */}
                        <div 
                          className="px-3 py-1.5 rounded-lg text-[10px] font-bold inline-flex items-center gap-2 border shadow-sm"
                          style={{ backgroundColor: ann.bgColor, color: ann.textColor, borderColor: 'rgba(0,0,0,0.05)' }}
                        >
                          <Megaphone size={10} />
                          <span className="truncate">{ann.message}</span>
                          {ann.buttonText && (
                            <span className="bg-white/20 px-2 py-0.5 rounded text-[9px] uppercase font-black tracking-wider ml-1">
                              {ann.buttonText}
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-1.5 mt-1">
                          {(() => {
                            const badge = getFormatBadge(ann.announcementType);
                            return (
                              <span className={`inline-block px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border ${badge.classes}`}>
                                {badge.text}
                              </span>
                            );
                          })()}
                          {ann.publishHomepage && (
                            <span className="inline-block bg-sky-50 text-sky-600 px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border border-sky-100">
                              Homepage Slider
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4.5">
                      {ann.couponCode ? (
                        <span className="text-[11px] font-extrabold text-[#15803D] bg-[#DCFCE7] border border-[#DCFCE7] px-3 py-1 rounded-full">
                          {ann.couponCode}
                        </span>
                      ) : (
                        <span className="text-[11px] font-medium text-[#6B7280]">None</span>
                      )}
                    </td>
                    <td className="px-6 py-4.5">
                      <div className="space-y-1 text-[#6B7280] font-bold text-xs">
                        <div>Start: {new Date(ann.startDate).toLocaleDateString()}</div>
                        <div>End: {new Date(ann.endDate).toLocaleDateString()}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4.5">
                      {ann.status === 'ACTIVE' && (
                        <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-[#15803D] bg-[#DCFCE7] px-3 py-1.5 rounded-xl border border-[#DCFCE7]">
                          <CheckCircle size={12} /> Live
                        </span>
                      )}
                      {ann.status === 'PENDING' && (
                        <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-[#B45309] bg-[#FEF3C7] px-3 py-1.5 rounded-xl border border-[#FEF3C7]">
                          <Clock size={12} className="animate-pulse" /> Pending
                        </span>
                      )}
                      {ann.status === 'REJECTED' && (
                        <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-[#DC2626] bg-[#FEE2E2] px-3 py-1.5 rounded-xl border border-[#FEE2E2]">
                          <XCircle size={12} /> Rejected
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4.5 text-right">
                      <button
                        onClick={() => deleteAnnouncement(ann.id)}
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
        <div className="block md:hidden divide-y divide-[#E5E7EB] border border-[#E5E7EB] rounded-[20px] overflow-hidden bg-white">
          {filteredAnnouncements.length === 0 ? (
            <div className="py-16 text-center text-[#6B7280] uppercase tracking-widest text-[11px]">
              No announcements configured in this registry.
            </div>
          ) : (
            filteredAnnouncements.map(ann => (
              <div key={ann.id} className="p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-[14px] text-[#111827]">{ann.title}</span>
                  <button
                    onClick={() => deleteAnnouncement(ann.id)}
                    className="h-9 w-9 bg-white hover:bg-red-50 border border-[#E5E7EB] hover:border-red-200 text-slate-400 hover:text-red-500 rounded-xl transition-all flex items-center justify-center cursor-pointer"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                <div 
                  className="w-full flex items-center justify-center px-3 py-2 rounded-xl font-bold text-[10px] border shadow-sm"
                  style={{ backgroundColor: ann.bgColor, color: ann.textColor, borderColor: 'rgba(0,0,0,0.05)' }}
                >
                  <Megaphone size={10} className="mr-1.5 shrink-0" />
                  <span className="truncate">{ann.message}</span>
                  {ann.buttonText && (
                    <span className="bg-white/20 px-2 py-0.5 rounded text-[8px] uppercase font-black tracking-wider ml-1.5">
                      {ann.buttonText}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3 bg-[#F8FAF7] rounded-xl p-4 border border-[#E5E7EB] text-xs">
                  <div className="space-y-1">
                    <span className="text-[9px] text-[#6B7280] uppercase tracking-wider block font-bold">Type Scope</span>
                    {(() => {
                      const badge = getFormatBadge(ann.announcementType);
                      return (
                        <span className={`inline-block px-2 py-0.5 rounded text-[8px] font-black border ${badge.classes}`}>
                          {badge.text}
                        </span>
                      );
                    })()}
                  </div>
                  <div className="space-y-1">
                    <span className="text-[9px] text-[#6B7280] uppercase tracking-wider block font-bold">Coupon Code</span>
                    {ann.couponCode ? (
                      <span className="text-[10px] font-extrabold text-[#15803D]">{ann.couponCode}</span>
                    ) : (
                      <span className="text-[10px] text-slate-400 italic">None</span>
                    )}
                  </div>
                  <div className="col-span-2 pt-2 border-t border-[#E5E7EB] space-y-1 text-slate-600 font-bold">
                    <span className="text-[9px] text-[#6B7280] uppercase tracking-wider block font-bold">Duration</span>
                    <span>{new Date(ann.startDate).toLocaleDateString()} to {new Date(ann.endDate).toLocaleDateString()}</span>
                  </div>
                  <div className="col-span-2 pt-2 border-t border-[#E5E7EB] flex items-center justify-between">
                    <span className="text-[9px] text-[#6B7280] uppercase tracking-wider font-bold">Approval State</span>
                    {ann.status === 'ACTIVE' && (
                      <span className="inline-flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-[#15803D] bg-[#DCFCE7] px-2.5 py-1 rounded-lg border border-[#DCFCE7]">
                        Live
                      </span>
                    )}
                    {ann.status === 'PENDING' && (
                      <span className="inline-flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-[#B45309] bg-[#FEF3C7] px-2.5 py-1 rounded-lg border border-[#FEF3C7]">
                        Pending
                      </span>
                    )}
                    {ann.status === 'REJECTED' && (
                      <span className="inline-flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-[#DC2626] bg-[#FEE2E2] px-2.5 py-1 rounded-lg border border-[#FEE2E2]">
                        Rejected
                      </span>
                    )}
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
                    <Megaphone className="text-[#0F7A4D] h-6 w-6" /> Create Announcement Bar
                  </h3>
                  <p className="text-[10px] text-[#6B7280] uppercase tracking-widest font-bold mt-1">
                    Configure high impact ribbons for user targeting
                  </p>
                </div>
                <button
                  onClick={() => setIsCreateOpen(false)}
                  className="h-10 w-10 bg-slate-100 hover:bg-slate-200 rounded-full flex items-center justify-center text-slate-500 cursor-pointer"
                >
                  <XCircle size={18} />
                </button>
              </div>

              {/* LIVE PREVIEW BOX */}
              <div className="mb-6 p-4 bg-[#F8FAF7] border border-[#E5E7EB] rounded-[20px] space-y-2">
                <span className="text-[9px] font-black uppercase tracking-widest text-[#6B7280]">Ribbon Banner Live Preview</span>
                <div 
                  className="w-full min-h-[44px] flex items-center justify-center px-4 py-2.5 rounded-xl font-black text-xs text-center border shadow-sm transition-all"
                  style={{ backgroundColor: form.bgColor, color: form.textColor, borderColor: 'rgba(0,0,0,0.05)' }}
                >
                  <div className="flex items-center justify-center gap-2 flex-wrap">
                    <span className="bg-white/20 px-2 py-0.5 rounded text-[8px] uppercase tracking-widest font-black">
                      {form.offerType}
                    </span>
                    <span>{form.title ? `${form.title}: ` : ''}{form.message || 'Ribbon announcement text here...'}</span>
                    {form.couponCode && (
                      <span className="border border-white/40 px-2 py-0.5 rounded text-[9px] bg-white/10 select-all font-black">
                        Code: {form.couponCode.toUpperCase()}
                      </span>
                    )}
                    {form.buttonText && (
                      <span className="bg-white text-slate-900 px-2.5 py-0.5 rounded text-[9px] uppercase tracking-wider font-extrabold shadow-sm hover:scale-105 transition-all">
                        {form.buttonText}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[9px] font-black uppercase tracking-widest text-[#6B7280] mb-2 block">Offer Title</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Festival Season Offer"
                      value={form.title}
                      onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                      className="w-full h-11 px-4 rounded-xl border border-[#E5E7EB] focus:border-[#0F7A4D] outline-none text-[13px] font-bold text-slate-800 bg-[#F8FAF7]/50 focus:bg-white focus:ring-4 focus:ring-[#0F7A4D]/5"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-black uppercase tracking-widest text-[#6B7280] mb-2 block">Offer Type</label>
                    <select
                      value={form.offerType}
                      onChange={e => setForm(f => ({ ...f, offerType: e.target.value }))}
                      className="w-full h-11 px-4 rounded-xl border border-[#E5E7EB] focus:border-[#0F7A4D] outline-none text-[13px] font-bold text-slate-800 bg-[#F8FAF7]/50 focus:bg-white focus:ring-4 focus:ring-[#0F7A4D]/5"
                    >
                      <option value="GENERAL">General Info</option>
                      <option value="DISCOUNT">Discount Event</option>
                      <option value="FESTIVAL">Festival Campaign</option>
                      <option value="SHIPPING">Shipping Waiver</option>
                    </select>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-[9px] font-black uppercase tracking-widest text-[#6B7280] block">Offer Message / Banner Body *</label>
                    <span className="text-[10px] font-bold text-[#6B7280]">{(form.message || '').length}/50</span>
                  </div>
                  <textarea
                    required
                    maxLength={50}
                    placeholder="Provide a short, impactful notification (Max 50 characters)"
                    value={form.message}
                    onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                    className="w-full min-h-[70px] p-4 rounded-xl border border-[#E5E7EB] focus:border-[#0F7A4D] outline-none text-[13px] font-bold text-slate-800 bg-[#F8FAF7]/50 focus:bg-white resize-none focus:ring-4 focus:ring-[#0F7A4D]/5"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-[9px] font-black uppercase tracking-widest text-[#6B7280] mb-2 block">Promo Code (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. ORGANIC20"
                      value={form.couponCode}
                      onChange={e => setForm(f => ({ ...f, couponCode: e.target.value.toUpperCase() }))}
                      className="w-full h-11 px-4 rounded-xl border border-[#E5E7EB] focus:border-[#0F7A4D] outline-none text-[13px] font-bold text-slate-800 bg-[#F8FAF7]/50 focus:bg-white focus:ring-4 focus:ring-[#0F7A4D]/5"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-black uppercase tracking-widest text-[#6B7280] mb-2 block">Action Button Text</label>
                    <input
                      type="text"
                      placeholder="e.g. Shop Now"
                      value={form.buttonText}
                      onChange={e => setForm(f => ({ ...f, buttonText: e.target.value }))}
                      className="w-full h-11 px-4 rounded-xl border border-[#E5E7EB] focus:border-[#0F7A4D] outline-none text-[13px] font-bold text-slate-800 bg-[#F8FAF7]/50 focus:bg-white focus:ring-4 focus:ring-[#0F7A4D]/5"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-black uppercase tracking-widest text-[#6B7280] mb-2 block">Redirect URL</label>
                    <input
                      type="text"
                      placeholder="e.g. /promotions"
                      value={form.redirectUrl}
                      onChange={e => setForm(f => ({ ...f, redirectUrl: e.target.value }))}
                      className="w-full h-11 px-4 rounded-xl border border-[#E5E7EB] focus:border-[#0F7A4D] outline-none text-[13px] font-bold text-slate-800 bg-[#F8FAF7]/50 focus:bg-white focus:ring-4 focus:ring-[#0F7A4D]/5"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div>
                    <label className="text-[9px] font-black uppercase tracking-widest text-[#6B7280] mb-2 block">Bg Color</label>
                    <div className="flex gap-2 items-center">
                      <input
                        type="color"
                        value={form.bgColor}
                        onChange={e => setForm(f => ({ ...f, bgColor: e.target.value }))}
                        className="h-10 w-10 border border-[#E5E7EB] rounded-lg cursor-pointer p-0 overflow-hidden shrink-0"
                      />
                      <input
                        type="text"
                        value={form.bgColor}
                        onChange={e => setForm(f => ({ ...f, bgColor: e.target.value }))}
                        className="w-full h-10 px-2 rounded-lg border border-[#E5E7EB] text-xs font-mono font-bold"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[9px] font-black uppercase tracking-widest text-[#6B7280] mb-2 block">Text Color</label>
                    <div className="flex gap-2 items-center">
                      <input
                        type="color"
                        value={form.textColor}
                        onChange={e => setForm(f => ({ ...f, textColor: e.target.value }))}
                        className="h-10 w-10 border border-[#E5E7EB] rounded-lg cursor-pointer p-0 overflow-hidden shrink-0"
                      />
                      <input
                        type="text"
                        value={form.textColor}
                        onChange={e => setForm(f => ({ ...f, textColor: e.target.value }))}
                        className="w-full h-10 px-2 rounded-lg border border-[#E5E7EB] text-xs font-mono font-bold"
                      />
                    </div>
                  </div>
                  <div className="col-span-2">
                    <label className="text-[9px] font-black uppercase tracking-widest text-[#6B7280] mb-2 block">Priority Rank</label>
                    <input
                      type="number"
                      placeholder="0"
                      value={form.priorityOrder}
                      onChange={e => setForm(f => ({ ...f, priorityOrder: e.target.value }))}
                      className="w-full h-11 px-4 rounded-xl border border-[#E5E7EB] focus:border-[#0F7A4D] outline-none text-[13px] font-bold text-slate-800 bg-[#F8FAF7]/50 focus:bg-white focus:ring-4 focus:ring-[#0F7A4D]/5"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[9px] font-black uppercase tracking-widest text-[#6B7280] mb-2 block">Start Date</label>
                    <input
                      type="date"
                      required
                      value={form.startDate}
                      onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))}
                      className="w-full h-11 px-4 rounded-xl border border-[#E5E7EB] focus:border-[#0F7A4D] outline-none text-[13px] font-bold text-slate-800 bg-[#F8FAF7]/50 focus:bg-white focus:ring-4 focus:ring-[#0F7A4D]/5"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-black uppercase tracking-widest text-[#6B7280] mb-2 block">End Date</label>
                    <input
                      type="date"
                      required
                      value={form.endDate}
                      onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))}
                      className="w-full h-11 px-4 rounded-xl border border-[#E5E7EB] focus:border-[#0F7A4D] outline-none text-[13px] font-bold text-slate-800 bg-[#F8FAF7]/50 focus:bg-white focus:ring-4 focus:ring-[#0F7A4D]/5"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[9px] font-black uppercase tracking-widest text-[#6B7280] mb-2 block">Display Location</label>
                    <select
                      value={form.announcementType}
                      onChange={e => setForm(f => ({ ...f, announcementType: e.target.value }))}
                      className="w-full h-11 px-4 rounded-xl border border-[#E5E7EB] focus:border-[#0F7A4D] outline-none text-[13px] font-bold text-slate-800 bg-[#F8FAF7]/50 focus:bg-white focus:ring-4 focus:ring-[#0F7A4D]/5"
                    >
                      <option value="VENDOR_PROMOTION">Vendor Promotion Ribbon</option>
                      <option value="HERO_BANNER">Homepage Hero Slider Banner</option>
                      <option value="TOP_ANNOUNCEMENT_BAR">Top Announcement Bar</option>
                      <option value="POPUP_OFFER">Popup Offer Modal</option>
                    </select>
                  </div>
                  <div className="flex flex-col justify-end">
                    <label className="text-[9px] font-black uppercase tracking-widest text-[#6B7280] mb-2 block">Publish on Homepage Slider</label>
                    <button
                      type="button"
                      onClick={() => setForm(f => ({ ...f, publishHomepage: !f.publishHomepage }))}
                      className="w-full h-11 flex items-center justify-between px-4 rounded-xl border border-[#E5E7EB] text-[#6B7280] font-bold text-[12px] bg-[#F8FAF7]/50 hover:bg-[#F8FAF7] transition-colors"
                    >
                      <span>{form.publishHomepage ? 'Yes, publish on homepage' : 'No, display locally only'}</span>
                      <div className={`w-8 h-4 rounded-full p-0.5 transition-colors ${form.publishHomepage ? 'bg-[#0F7A4D]' : 'bg-slate-300'}`}>
                        <div className={`bg-white w-3 h-3 rounded-full transition-transform ${form.publishHomepage ? 'translate-x-4' : 'translate-x-0'}`} />
                      </div>
                    </button>
                  </div>
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
                    Submit Ribbon
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
