'use client';

import React, { useState } from 'react';
import {
  ShieldCheck, Ticket, Megaphone, CheckCircle, XCircle, Clock,
  Search, Eye, RefreshCw, Loader2, Store, AlertTriangle,
  ChevronDown, FileText, X, MessageSquare
} from 'lucide-react';
import { API_URL } from '@/lib/api';
import useSWR from 'swr';
import { motion, AnimatePresence } from 'framer-motion';

const authFetch = (url: string) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('namma_orru_token') : null;
  return fetch(url, { headers: token ? { Authorization: `Bearer ${token}` } : {} }).then(r => r.json());
};

type ApprovalStatus = 'PENDING' | 'ACTIVE' | 'REJECTED';
type ItemType = 'COUPON' | 'ANNOUNCEMENT';

interface ReviewItem {
  id: number;
  type: ItemType;
  title: string;
  subtitle: string;
  status: ApprovalStatus;
  vendorId: number | null;
  createdAt: string;
  rejectionNote?: string | null;
  approvedAt?: string | null;
  meta: Record<string, any>;
}

export default function VendorApprovalsPage() {
  const [tab, setTab]           = useState<ApprovalStatus>('PENDING');
  const [itemType, setItemType] = useState<'ALL' | ItemType>('ALL');
  const [search, setSearch]     = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Reject modal state
  const [rejectModal, setRejectModal] = useState<ReviewItem | null>(null);
  const [rejectNote, setRejectNote]   = useState('');
  const [processing, setProcessing]   = useState<string | null>(null);

  /* ── Fetch vendor coupons & announcements ─── */
  const { data: couponsData, mutate: mutateCoupons } = useSWR<any>(
    `${API_URL}/api/coupons?createdByType=VENDOR&limit=500`,
    authFetch, { refreshInterval: 30000 }
  );
  const { data: annData, mutate: mutateAnn } = useSWR<any>(
    `${API_URL}/api/offer-announcements?createdByType=VENDOR`,
    authFetch, { refreshInterval: 30000 }
  );

  const rawCoupons: any[]       = couponsData?.coupons || [];
  const rawAnnouncements: any[] = Array.isArray(annData) ? annData : [];

  /* ── Normalise ─────────────────────────────── */
  const items: ReviewItem[] = [
    ...rawCoupons.map(c => ({
      id: c.id, type: 'COUPON' as ItemType,
      title: c.code,
      subtitle: `${c.benefitType === 'PERCENTAGE' ? c.value + '% Off' : c.benefitType === 'FIXED' ? '₹' + c.value + ' Off' : 'Free Shipping'} · Min ₹${c.minOrderValue}`,
      status: (c.status || 'PENDING') as ApprovalStatus,
      vendorId: c.createdById, createdAt: c.createdAt,
      rejectionNote: c.rejectionNote, approvedAt: c.approvedAt, meta: c,
    })),
    ...rawAnnouncements.map(a => ({
      id: a.id, type: 'ANNOUNCEMENT' as ItemType,
      title: a.title, subtitle: a.message,
      status: (a.status || 'PENDING') as ApprovalStatus,
      vendorId: a.vendorId, createdAt: a.createdAt,
      rejectionNote: a.rejectionNote, approvedAt: a.approvedAt, meta: a,
    })),
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const filtered = items.filter(i =>
    i.status === tab &&
    (itemType === 'ALL' || i.type === itemType) &&
    (i.title.toLowerCase().includes(search.toLowerCase()) || i.subtitle.toLowerCase().includes(search.toLowerCase()))
  );

  const pendingCount  = items.filter(i => i.status === 'PENDING').length;
  const activeCount   = items.filter(i => i.status === 'ACTIVE').length;
  const rejectedCount = items.filter(i => i.status === 'REJECTED').length;

  /* ── Approve ──────────────────────────────── */
  const approve = async (item: ReviewItem) => {
    const key = `${item.type}-${item.id}`;
    setProcessing(key);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('namma_orru_token') : null;
      const headers = { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) };
      if (item.type === 'COUPON') {
        await fetch(`${API_URL}/api/coupons/${item.id}/approve`, { method: 'PATCH', headers, body: JSON.stringify({ action: 'APPROVE' }) });
        mutateCoupons();
      } else {
        await fetch(`${API_URL}/api/offer-announcements/${item.id}/approve`, { method: 'PATCH', headers, body: JSON.stringify({ action: 'APPROVE' }) });
        mutateAnn();
      }
    } finally { setProcessing(null); }
  };

  /* ── Reject (with note) ───────────────────── */
  const reject = async () => {
    if (!rejectModal) return;
    const key = `${rejectModal.type}-${rejectModal.id}`;
    setProcessing(key);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('namma_orru_token') : null;
      const headers = { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) };
      const body = JSON.stringify({ action: 'REJECT', rejectionNote: rejectNote });
      if (rejectModal.type === 'COUPON') {
        await fetch(`${API_URL}/api/coupons/${rejectModal.id}/approve`, { method: 'PATCH', headers, body });
        mutateCoupons();
      } else {
        await fetch(`${API_URL}/api/offer-announcements/${rejectModal.id}/approve`, { method: 'PATCH', headers, body });
        mutateAnn();
      }
      setRejectModal(null); setRejectNote('');
    } finally { setProcessing(null); }
  };

  /* ── Reactivate ───────────────────────────── */
  const reactivate = async (item: ReviewItem) => {
    const key = `${item.type}-${item.id}`;
    setProcessing(key);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('namma_orru_token') : null;
      const headers = { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) };
      if (item.type === 'COUPON') {
        await fetch(`${API_URL}/api/coupons/${item.id}/approve`, { method: 'PATCH', headers, body: JSON.stringify({ action: 'APPROVE' }) });
        mutateCoupons();
      } else {
        await fetch(`${API_URL}/api/offer-announcements/${item.id}/approve`, { method: 'PATCH', headers, body: JSON.stringify({ action: 'APPROVE' }) });
        mutateAnn();
      }
    } finally { setProcessing(null); }
  };

  const statusStyle: Record<string, string> = {
    PENDING:  'text-[#B45309] bg-[#FEF3C7] border-amber-200',
    ACTIVE:   'text-[#15803D] bg-[#DCFCE7] border-green-200',
    REJECTED: 'text-[#DC2626] bg-[#FEE2E2] border-red-200',
  };

  return (
    <div className="space-y-8 pb-20">
      {/* HEADER */}
      <div className="bg-white rounded-[20px] border border-[#E5E7EB] p-8 shadow-[0_4px_12px_rgba(0,0,0,0.05)] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
        <div>
          <h1 className="text-2xl font-black text-[#111827] tracking-tighter flex items-center gap-3">
            <ShieldCheck className="text-[#0F7A4D] h-7 w-7" />
            Vendor Approvals Center
          </h1>
          <p className="mt-2 text-[12px] uppercase tracking-widest font-bold text-[#6B7280]">
            Review, approve or reject vendor-submitted coupons and announcement banners
          </p>
        </div>
        {pendingCount > 0 && (
          <div className="flex items-center gap-2 bg-[#FEF3C7] border border-amber-200 text-[#B45309] px-4 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest animate-pulse">
            <AlertTriangle size={14} />
            {pendingCount} item{pendingCount !== 1 ? 's' : ''} awaiting review
          </div>
        )}
      </div>

      {/* KPI TAB CARDS */}
      <div className="grid grid-cols-3 gap-6">
        {([
          { label: 'Pending Review', value: pendingCount,  icon: Clock,       color: 'amber',   tab: 'PENDING'  },
          { label: 'Approved Live',  value: activeCount,   icon: CheckCircle, color: 'emerald', tab: 'ACTIVE'   },
          { label: 'Rejected',       value: rejectedCount, icon: XCircle,     color: 'red',     tab: 'REJECTED' },
        ] as const).map(card => {
          const cls: Record<string, string> = { amber: 'bg-[#FEF3C7] text-[#B45309]', emerald: 'bg-[#DCFCE7] text-[#15803D]', red: 'bg-[#FEE2E2] text-[#DC2626]' };
          const activeStyle = tab === card.tab 
            ? 'border-[#0F7A4D] ring-2 ring-[#0F7A4D]/10 bg-[#0F7A4D]/5' 
            : 'border-[#E5E7EB] hover:bg-[#F8FAF7]';
          return (
            <button key={card.tab} onClick={() => setTab(card.tab)}
              className={`text-left bg-white rounded-[20px] border p-6 shadow-[0_4px_12px_rgba(0,0,0,0.05)] transition-all cursor-pointer ${activeStyle}`}
            >
              <div className={`h-11 w-11 rounded-xl flex items-center justify-center mb-3 ${cls[card.color]}`}>
                <card.icon size={20} />
              </div>
              <div className="text-3xl font-black text-[#111827]">{card.value}</div>
              <div className="text-[10px] font-black uppercase tracking-widest text-[#6B7280] mt-1">{card.label}</div>
            </button>
          );
        })}
      </div>

      {/* FILTER BAR */}
      <div className="bg-white rounded-[20px] border border-[#E5E7EB] p-5 shadow-[0_4px_12px_rgba(0,0,0,0.05)] flex flex-col md:flex-row gap-4 md:items-center justify-between">
        <div className="flex gap-2 bg-[#F8FAF7] p-1.5 rounded-xl border border-[#E5E7EB]">
          {(['ALL', 'COUPON', 'ANNOUNCEMENT'] as const).map(t => (
            <button key={t} onClick={() => setItemType(t)}
              className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer ${itemType === t ? 'bg-[#0F7A4D] text-white shadow-sm' : 'text-[#6B7280] hover:text-[#111827] hover:bg-[#E5E7EB]/40'}`}
            >
              {t === 'ALL' ? 'All Types' : t === 'COUPON' ? '🎫 Coupons' : '📢 Banners'}
            </button>
          ))}
        </div>
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6B7280] h-4 w-4" />
          <input type="text" placeholder="Search by code or title..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full h-11 pl-11 pr-4 rounded-xl border border-[#E5E7EB] bg-[#F8FAF7] outline-none text-[13px] font-medium text-[#111827] focus:border-[#0F7A4D] focus:bg-white transition-colors"
          />
        </div>
      </div>

      {/* ITEMS LIST */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="bg-white rounded-[20px] border border-[#E5E7EB] py-20 text-center shadow-[0_4px_12px_rgba(0,0,0,0.05)]">
            <ShieldCheck className="h-12 w-12 text-[#6B7280]/30 mx-auto mb-4" />
            <p className="text-[#6B7280] font-black uppercase tracking-widest text-[11px]">
              {tab === 'PENDING' ? 'No pending submissions — all clear! ✅' : `No ${tab.toLowerCase()} items found.`}
            </p>
          </div>
        ) : filtered.map(item => {
          const key = `${item.type}-${item.id}`;
          const isProcessing = processing === key;
          const isExpanded = expandedId === key;

          return (
            <div key={key} className="bg-white rounded-[20px] border border-[#E5E7EB] shadow-[0_4px_12px_rgba(0,0,0,0.05)] overflow-hidden hover:border-[#0F7A4D]/50 transition-all">
              <div className="p-6 flex flex-col md:flex-row gap-5 md:items-center md:justify-between">
                {/* LEFT */}
                <div className="flex items-start gap-4 flex-1 min-w-0">
                  <div className={`flex-shrink-0 h-12 w-12 rounded-xl flex items-center justify-center ${item.type === 'COUPON' ? 'bg-[#DCFCE7] text-[#15803D]' : 'bg-blue-50 text-blue-600'}`}>
                    {item.type === 'COUPON' ? <Ticket size={20} /> : <Megaphone size={20} />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="text-[9px] font-black uppercase tracking-widest text-[#6B7280] bg-[#F8FAF7] border border-[#E5E7EB] px-2 py-0.5 rounded">{item.type}</span>
                      {item.vendorId && (
                        <span className="text-[9px] font-black uppercase tracking-widest text-purple-600 bg-purple-50 border border-purple-100 px-2 py-0.5 rounded flex items-center gap-1">
                          <Store size={9} /> Vendor #{item.vendorId}
                        </span>
                      )}
                    </div>
                    <h3 className="text-[15px] font-extrabold text-[#111827] truncate">{item.title}</h3>
                    <p className="text-[12px] text-[#6B7280] font-medium truncate mt-0.5">{item.subtitle}</p>
                    <p className="text-[10px] text-[#6B7280] font-medium mt-1">
                      Submitted: {new Date(item.createdAt).toLocaleString('en-IN')}
                    </p>
                    {item.rejectionNote && (
                      <div className="mt-2 flex items-start gap-2 bg-red-50 border border-red-100 text-red-700 text-[11px] font-bold rounded-xl px-3 py-2">
                        <MessageSquare size={12} className="flex-shrink-0 mt-0.5" />
                        <span><strong>Reason:</strong> {item.rejectionNote}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* RIGHT: Status + Actions */}
                <div className="flex flex-wrap items-center gap-2 flex-shrink-0">
                  <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl border ${statusStyle[item.status]}`}>
                    {item.status === 'ACTIVE' ? '✓ Approved' : item.status === 'PENDING' ? '⏳ Pending' : '✕ Rejected'}
                  </span>

                  <button onClick={() => setExpandedId(isExpanded ? null : key)}
                    className="h-9 px-3 bg-white hover:bg-[#F8FAF7] border border-[#E5E7EB] text-[#6B7280] rounded-xl text-[11px] font-black uppercase tracking-widest transition-all flex items-center gap-1.5 cursor-pointer">
                    <Eye size={13} /> {isExpanded ? 'Hide' : 'Details'}
                  </button>

                  {item.status === 'PENDING' && (
                    <>
                      <button disabled={isProcessing} onClick={() => approve(item)}
                        className="h-9 px-4 bg-[#0F7A4D] hover:bg-[#0c633e] text-white rounded-xl text-[11px] font-black uppercase tracking-widest transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer shadow-sm">
                        {isProcessing ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle size={13} />} Approve
                      </button>
                      <button disabled={isProcessing} onClick={() => { setRejectModal(item); setRejectNote(''); }}
                        className="h-9 px-4 bg-[#FEE2E2] hover:bg-[#FCA5A5]/40 border border-red-200 text-[#DC2626] rounded-xl text-[11px] font-black uppercase tracking-widest transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer">
                        <XCircle size={13} /> Reject
                      </button>
                    </>
                  )}
                  {item.status === 'REJECTED' && (
                    <button disabled={isProcessing} onClick={() => reactivate(item)}
                      className="h-9 px-4 bg-[#DCFCE7] hover:bg-green-100 border border-green-200 text-[#15803D] rounded-xl text-[11px] font-black uppercase tracking-widest transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer">
                      {isProcessing ? <Loader2 size={13} className="animate-spin" /> : <RefreshCw size={13} />} Reactivate
                    </button>
                  )}
                  {item.status === 'ACTIVE' && (
                    <button disabled={isProcessing} onClick={() => { setRejectModal(item); setRejectNote(''); }}
                      className="h-9 px-4 bg-[#FEE2E2] hover:bg-[#FCA5A5]/40 border border-red-200 text-[#DC2626] rounded-xl text-[11px] font-black uppercase tracking-widest transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer">
                      <XCircle size={13} /> Revoke
                    </button>
                  )}
                </div>
              </div>

              {/* EXPAND DETAIL PANEL */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden border-t border-[#E5E7EB]">
                    <div className="p-6 bg-[#F8FAF7]/50">
                      {item.type === 'COUPON' ? (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {[
                            { label: 'Discount Type', value: item.meta.benefitType },
                            { label: 'Value', value: item.meta.benefitType === 'PERCENTAGE' ? `${item.meta.value}%` : `₹${item.meta.value}` },
                            { label: 'Min Order', value: item.meta.minOrderValue ? `₹${item.meta.minOrderValue}` : 'No minimum' },
                            { label: 'Scope', value: item.meta.couponScope },
                            { label: 'Usage Limit', value: item.meta.usageLimit ?? 'Unlimited' },
                            { label: 'Per User', value: item.meta.perUserLimit },
                            { label: 'Expires', value: item.meta.expiresAt ? new Date(item.meta.expiresAt).toLocaleDateString('en-IN') : 'No expiry' },
                            { label: 'Times Used', value: item.meta._count?.usages ?? 0 },
                          ].map(f => (
                            <div key={f.label} className="bg-white border border-[#E5E7EB] rounded-xl p-4 shadow-sm">
                              <div className="text-[9px] font-black uppercase tracking-widest text-[#6B7280] mb-1">{f.label}</div>
                              <div className="text-[13px] font-extrabold text-[#111827]">{String(f.value)}</div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="w-full py-3 px-4 rounded-xl font-bold text-sm text-center border shadow-sm"
                            style={{ backgroundColor: item.meta.bgColor, color: item.meta.textColor, borderColor: 'rgba(0,0,0,0.05)' }}>
                            {item.meta.title}: {item.meta.message}
                            {item.meta.couponCode && ` · Code: ${item.meta.couponCode}`}
                            {item.meta.buttonText && <span className="ml-2 bg-white/20 px-2 py-0.5 rounded text-xs">{item.meta.buttonText}</span>}
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {[
                              { label: 'Offer Type', value: item.meta.offerType },
                              { label: 'Display Location', value: item.meta.announcementType?.replace(/_/g, ' ') || 'VENDOR PROMOTION' },
                              { label: 'Publish Homepage', value: item.meta.publishHomepage ? 'Yes' : 'No' },
                              { label: 'Coupon Code', value: item.meta.couponCode || 'None' },
                              { label: 'Redirect', value: item.meta.redirectUrl || 'None' },
                              { label: 'Start Date', value: new Date(item.meta.startDate).toLocaleDateString('en-IN') },
                              { label: 'End Date', value: new Date(item.meta.endDate).toLocaleDateString('en-IN') },
                              { label: 'Priority', value: item.meta.priorityOrder },
                            ].map(f => (
                              <div key={f.label} className="bg-white border border-[#E5E7EB] rounded-xl p-4 shadow-sm">
                                <div className="text-[9px] font-black uppercase tracking-widest text-[#6B7280] mb-1">{f.label}</div>
                                <div className="text-[13px] font-extrabold text-[#111827]">{String(f.value)}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* REJECT MODAL */}
      <AnimatePresence>
        {rejectModal && (
          <div className="fixed inset-0 bg-[#111827]/40 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-[20px] border border-[#E5E7EB] max-w-lg w-full shadow-2xl p-8">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-lg font-black text-[#111827] flex items-center gap-2">
                    <XCircle className="text-red-500 h-6 w-6" />
                    {rejectModal.status === 'ACTIVE' ? 'Revoke' : 'Reject'} {rejectModal.type === 'COUPON' ? 'Coupon' : 'Announcement'}
                  </h3>
                  <p className="text-[10px] text-[#6B7280] uppercase tracking-widest font-bold mt-1">
                    &ldquo;{rejectModal.title}&rdquo; — Vendor #{rejectModal.vendorId}
                  </p>
                </div>
                <button onClick={() => { setRejectModal(null); setRejectNote(''); }}
                  className="h-8 w-8 bg-[#F8FAF7] hover:bg-[#E5E7EB] rounded-full flex items-center justify-center text-[#6B7280] cursor-pointer border border-[#E5E7EB]">
                  <X size={14} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-[9px] font-black uppercase tracking-widest text-[#6B7280] mb-2 block">
                    Rejection Reason <span className="text-[#6B7280]/60">(Optional — visible to vendor)</span>
                  </label>
                  <textarea
                    value={rejectNote}
                    onChange={e => setRejectNote(e.target.value)}
                    placeholder="e.g. Coupon discount exceeds marketplace limit (max 30%). Please revise and resubmit."
                    rows={4}
                    className="w-full p-4 rounded-xl border border-[#E5E7EB] outline-none text-[13px] font-medium text-[#111827] bg-[#F8FAF7] focus:bg-white resize-none focus:border-[#0F7A4D] transition-colors"
                  />
                </div>

                <div className="bg-[#FEF3C7] border border-amber-200 rounded-xl p-4 text-[12px] text-[#B45309] font-medium flex gap-3">
                  <AlertTriangle size={16} className="flex-shrink-0 mt-0.5 text-[#B45309]" />
                  <span>The vendor will receive a real-time notification with your rejection reason. They can revise and resubmit.</span>
                </div>

                <div className="flex gap-3 pt-2">
                  <button onClick={() => { setRejectModal(null); setRejectNote(''); }}
                    className="flex-1 px-4 py-2.5 rounded-lg border border-[#E5E7EB] text-[#6B7280] font-black text-[12px] uppercase tracking-widest hover:bg-[#F8FAF7] cursor-pointer">
                    Cancel
                  </button>
                  <button onClick={reject} disabled={!!processing}
                    className="flex-1 px-4 py-2.5 rounded-lg bg-red-650 hover:bg-red-750 text-white font-black text-[12px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer shadow-sm">
                    {processing ? <Loader2 size={14} className="animate-spin" /> : <XCircle size={14} />}
                    {rejectModal.status === 'ACTIVE' ? 'Revoke Access' : 'Confirm Rejection'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
