'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Plus, Edit2, Trash2, Megaphone, Calendar, Eye, MousePointerClick,
  BarChart3, Copy, Search, Filter, DollarSign, TrendingUp
} from 'lucide-react';
import { API_URL } from '@/lib/api';
import { toast } from 'sonner';

interface Announcement {
  id: number;
  title: string;
  message: string;
  couponCode: string | null;
  buttonText: string | null;
  offerType: string;
  bgColor: string;
  textColor: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  priorityOrder: number;
  views: number;
  clicks: number;
  ordersGenerated: number;
  revenueGenerated: number;
  announcementType: string;
  publishHomepage: boolean;
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

export default function AnnouncementBarsListPage() {
  const router = useRouter();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'PAUSED'>('ALL');

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/offer-announcements?createdByType=ADMIN`);
      const data = await res.json();
      setAnnouncements(Array.isArray(data) ? data : []);
    } catch {
      toast.error('Failed to load announcements');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this announcement?')) return;
    try {
      const res = await fetch(`${API_URL}/api/offer-announcements/${id}`, { method: 'DELETE' });
      if (res.ok) { toast.success('Deleted successfully'); fetchData(); }
      else toast.error('Failed to delete');
    } catch { toast.error('Failed to delete'); }
  };

  const handleToggle = async (ann: Announcement) => {
    const newIsActive = !ann.isActive;
    try {
      const res = await fetch(`${API_URL}/api/offer-announcements/${ann.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: newIsActive, status: newIsActive ? 'ACTIVE' : 'INACTIVE' })
      });
      if (res.ok) { toast.success(newIsActive ? 'Activated' : 'Paused'); fetchData(); }
    } catch { toast.error('Failed to update status'); }
  };

  const handleDuplicate = async (ann: Announcement) => {
    try {
      const res = await fetch(`${API_URL}/api/offer-announcements`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `${ann.title} (Copy)`,
          message: ann.message,
          couponCode: ann.couponCode,
          buttonText: ann.buttonText,
          offerType: ann.offerType,
          bgColor: ann.bgColor,
          textColor: ann.textColor,
          startDate: ann.startDate,
          endDate: ann.endDate,
          isActive: false,
          priorityOrder: ann.priorityOrder,
          announcementType: ann.announcementType,
          publishHomepage: ann.publishHomepage,
          status: 'INACTIVE',
          createdByType: 'ADMIN'
        })
      });
      if (res.ok) { toast.success('Duplicated successfully'); fetchData(); }
      else toast.error('Failed to duplicate');
    } catch { toast.error('Failed to duplicate'); }
  };

  const totalViews = announcements.reduce((a, x) => a + x.views, 0);
  const totalClicks = announcements.reduce((a, x) => a + x.clicks, 0);
  const totalRevenue = announcements.reduce((a, x) => a + Number(x.revenueGenerated), 0);
  const avgCTR = totalViews > 0 ? ((totalClicks / totalViews) * 100).toFixed(2) : '0.00';

  const filtered = announcements.filter(a => {
    const matchSearch = !search || a.title.toLowerCase().includes(search.toLowerCase()) || a.message.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'ALL' || (statusFilter === 'ACTIVE' ? a.isActive : !a.isActive);
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-16">

      {/* HEADER */}
      <div className="bg-white rounded-[20px] border border-[#E5E7EB] p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl font-black text-[#111827] tracking-tighter flex items-center gap-3">
            <Megaphone className="text-[#0F7A4D]" /> Announcement Bars
          </h1>
          <p className="mt-2 text-[12px] uppercase tracking-widest font-bold text-[#6B7280]">
            Manage active offers, promos, and campaigns displayed above the header
          </p>
        </div>
        <Link
          href="/admin/marketing/announcement-bar/create"
          className="h-11 px-6 rounded-xl bg-[#0F7A4D] hover:bg-[#0c633e] text-white font-black text-[11px] uppercase tracking-widest flex items-center gap-2 transition-all active:scale-95 shadow-sm"
        >
          <Plus size={16} /> Create Announcement
        </Link>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          { label: 'Total Campaigns', value: announcements.length, icon: <Megaphone size={20} />, color: 'text-[#0F7A4D]', bg: 'bg-emerald-50' },
          { label: 'Total Views', value: totalViews.toLocaleString(), icon: <Eye size={20} />, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Total Clicks', value: totalClicks.toLocaleString(), icon: <MousePointerClick size={20} />, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Avg. CTR', value: `${avgCTR}%`, icon: <TrendingUp size={20} />, color: 'text-purple-600', bg: 'bg-purple-50' },
        ].map((s, i) => (
          <div key={i} className="bg-white border border-[#E5E7EB] p-5 rounded-[20px] shadow-sm flex items-center gap-4">
            <div className={`h-12 w-12 rounded-xl ${s.bg} ${s.color} flex items-center justify-center shrink-0`}>{s.icon}</div>
            <div>
              <span className="text-[9px] font-black uppercase tracking-widest text-[#6B7280] block">{s.label}</span>
              <span className="text-2xl font-black text-[#111827] mt-0.5 block">{s.value}</span>
            </div>
          </div>
        ))}
      </div>

      {/* LISTING */}
      <div className="bg-white rounded-[20px] border border-[#E5E7EB] shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="p-6 border-b border-[#E5E7EB] flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div>
            <h3 className="text-lg font-black text-[#111827] tracking-tight">Active &amp; Scheduled Strips</h3>
            <p className="text-[10px] font-bold text-[#6B7280] uppercase tracking-widest mt-0.5">Real-time status management and metric dashboard</p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            {/* Search */}
            <div className="flex items-center gap-2 h-9 px-3 bg-[#F8FAF7] border border-[#E5E7EB] rounded-lg">
              <Search size={13} className="text-[#6B7280]" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search campaigns..."
                className="bg-transparent outline-none text-[11px] font-medium text-[#111827] placeholder:text-[#6B7280] w-40"
              />
            </div>
            {/* Status filter */}
            <div className="flex items-center gap-1 bg-[#F8FAF7] border border-[#E5E7EB] rounded-lg p-1">
              {(['ALL', 'ACTIVE', 'PAUSED'] as const).map(s => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`h-7 px-3 rounded-md text-[10px] font-black uppercase tracking-wider transition-colors ${statusFilter === s ? 'bg-white text-[#111827] shadow-sm' : 'text-[#6B7280] hover:text-[#111827]'}`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Desktop Table */}
        <div className="hidden lg:block overflow-x-auto min-h-[280px]">
          <table className="w-full text-left min-w-[1000px] admin-data-table">
            <thead>
              <tr className="border-b border-[#E5E7EB] bg-[#F8FAF7] text-[10px] font-black uppercase tracking-wider text-[#6B7280]">
                <th className="py-4 px-6">Offer Name</th>
                <th className="py-4 px-6">Display Format</th>
                <th className="py-4 px-6">Type</th>
                <th className="py-4 px-6">Duration</th>
                <th className="py-4 px-6 text-center">Priority</th>
                <th className="py-4 px-6 text-center">Status</th>
                <th className="py-4 px-6 text-right">Views</th>
                <th className="py-4 px-6 text-right">Clicks</th>
                <th className="py-4 px-6 text-right">CTR</th>
                <th className="py-4 px-6 text-right">Revenue</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB]">
              {loading ? (
                <tr><td colSpan={11} className="py-20 text-center">
                  <div className="h-8 w-8 border-4 border-slate-200 border-t-[#0F7A4D] rounded-full animate-spin mx-auto" />
                </td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={11} className="py-20 text-center">
                  <Megaphone className="h-12 w-12 text-[#6B7280]/40 mx-auto mb-3" />
                  <p className="text-xs font-black text-[#6B7280] uppercase tracking-widest">No announcement bars found</p>
                  <Link href="/admin/marketing/announcement-bar/create" className="mt-4 inline-flex items-center gap-1.5 text-[11px] font-black text-[#0F7A4D] uppercase tracking-widest hover:underline">
                    <Plus size={13} /> Create your first campaign
                  </Link>
                </td></tr>
              ) : filtered.map(ann => (
                <tr key={ann.id} className="hover:bg-[#F8FAF7]/60 transition-colors">
                  <td className="py-5 px-6">
                    <div className="flex items-center gap-3">
                      <div style={{ backgroundColor: ann.bgColor, color: ann.textColor }} className="h-10 w-10 rounded-xl flex items-center justify-center font-black text-sm shrink-0 border border-[#E5E7EB] shadow-sm">
                        {ann.title[0] || '?'}
                      </div>
                      <div className="min-w-0">
                        <span className="text-sm font-black text-[#111827] truncate block max-w-[200px]">{ann.title}</span>
                        <span className="text-[10px] text-[#6B7280] truncate block max-w-[200px] mt-0.5">{ann.message}</span>
                        {ann.couponCode && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            <span className="bg-[#FEF3C7] text-[#B45309] px-1.5 py-0.5 rounded text-[8px] font-black uppercase border border-amber-200">{ann.couponCode}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="py-5 px-6">
                    {(() => {
                      const badge = getFormatBadge(ann.announcementType);
                      return (
                        <span className={`text-[10px] font-black uppercase tracking-widest border px-2.5 py-1 rounded-full ${badge.classes}`}>
                          {badge.text}
                        </span>
                      );
                    })()}
                  </td>
                  <td className="py-5 px-6">
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#111827] bg-[#F8FAF7] border border-[#E5E7EB] px-2.5 py-1 rounded-full">{ann.offerType}</span>
                  </td>
                  <td className="py-5 px-6 text-xs text-[#6B7280] font-semibold">
                    <div className="flex items-center gap-1.5">
                      <Calendar size={12} />
                      <span>{new Date(ann.startDate).toLocaleDateString('en-IN', { day:'numeric', month:'short' })} – {new Date(ann.endDate).toLocaleDateString('en-IN', { day:'numeric', month:'short' })}</span>
                    </div>
                  </td>
                  <td className="py-5 px-6 text-center text-xs font-bold text-[#111827]">{ann.priorityOrder}</td>
                  <td className="py-5 px-6 text-center">
                    <button onClick={() => handleToggle(ann)} className="group">
                      {ann.isActive
                        ? <span className="inline-flex px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border border-green-200 bg-[#DCFCE7] text-[#15803D] group-hover:bg-red-50 group-hover:border-red-200 group-hover:text-red-600 transition-colors">Active</span>
                        : <span className="inline-flex px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border border-red-200 bg-[#FEE2E2] text-[#DC2626] group-hover:bg-green-50 group-hover:border-green-200 group-hover:text-green-700 transition-colors">Paused</span>
                      }
                    </button>
                  </td>
                  <td className="py-5 px-6 text-right text-xs font-bold text-[#111827]">{ann.views.toLocaleString()}</td>
                  <td className="py-5 px-6 text-right text-xs font-bold text-[#111827]">{ann.clicks.toLocaleString()}</td>
                  <td className="py-5 px-6 text-right text-xs font-black text-[#0F7A4D]">
                    {ann.views > 0 ? ((ann.clicks / ann.views) * 100).toFixed(1) + '%' : '0.0%'}
                  </td>
                  <td className="py-5 px-6 text-right text-xs font-black text-[#111827]">
                    ₹{Number(ann.revenueGenerated).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="py-5 px-6">
                    <div className="flex items-center justify-end gap-1.5">
                      <Link
                        href={`/admin/marketing/announcement-bar/${ann.id}/edit`}
                        className="h-8 w-8 rounded-lg border border-[#E5E7EB] text-[#6B7280] hover:text-[#0F7A4D] hover:border-[#0F7A4D] flex items-center justify-center transition-colors bg-white shadow-sm"
                        title="Edit"
                      >
                        <Edit2 size={13} />
                      </Link>
                      <button
                        onClick={() => handleDuplicate(ann)}
                        className="h-8 w-8 rounded-lg border border-[#E5E7EB] text-[#6B7280] hover:text-blue-600 hover:border-blue-200 flex items-center justify-center transition-colors bg-white shadow-sm"
                        title="Duplicate"
                      >
                        <Copy size={13} />
                      </button>
                      <button
                        onClick={() => handleDelete(ann.id)}
                        className="h-8 w-8 rounded-lg border border-[#E5E7EB] text-red-400 hover:text-red-600 hover:border-red-200 flex items-center justify-center transition-colors bg-white shadow-sm"
                        title="Delete"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="lg:hidden divide-y divide-[#E5E7EB]">
          {loading ? (
            [1,2,3].map(i => (
              <div key={i} className="p-5 animate-pulse space-y-3">
                <div className="h-4 bg-slate-100 rounded w-1/3" />
                <div className="h-3 bg-slate-100 rounded w-1/2" />
              </div>
            ))
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center">
              <Megaphone className="h-10 w-10 text-[#6B7280]/40 mx-auto mb-3" />
              <p className="text-xs font-black text-[#6B7280] uppercase tracking-widest">No announcements found</p>
            </div>
          ) : filtered.map(ann => (
            <div key={ann.id} className="p-5 space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div style={{ backgroundColor: ann.bgColor, color: ann.textColor }} className="h-10 w-10 rounded-xl flex items-center justify-center font-black text-sm shrink-0">
                    {ann.title[0]}
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-sm font-black text-[#111827] truncate">{ann.title}</h4>
                    <p className="text-[10px] text-[#6B7280] mt-0.5 uppercase tracking-widest">{ann.offerType}</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {(() => {
                        const badge = getFormatBadge(ann.announcementType);
                        return (
                          <span className={`text-[8px] font-black uppercase tracking-wider border px-1.5 py-0.5 rounded ${badge.classes}`}>
                            {badge.text}
                          </span>
                        );
                      })()}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <Link href={`/admin/marketing/announcement-bar/${ann.id}/edit`} className="h-9 w-9 flex items-center justify-center rounded-lg bg-white border border-[#E5E7EB] text-[#6B7280]"><Edit2 size={13} /></Link>
                  <button onClick={() => handleDelete(ann.id)} className="h-9 w-9 flex items-center justify-center rounded-lg bg-white border border-[#E5E7EB] text-red-400"><Trash2 size={13} /></button>
                </div>
              </div>
              <p className="text-xs text-[#6B7280]">{ann.message}</p>
              <div className="grid grid-cols-3 gap-3 text-center border-t border-b border-[#E5E7EB] py-3">
                <div><p className="text-[8px] font-black uppercase text-[#6B7280]">Views</p><p className="text-xs font-bold">{ann.views.toLocaleString()}</p></div>
                <div><p className="text-[8px] font-black uppercase text-[#6B7280]">Clicks</p><p className="text-xs font-bold">{ann.clicks.toLocaleString()}</p></div>
                <div><p className="text-[8px] font-black uppercase text-[#6B7280]">CTR</p><p className="text-xs font-black text-[#0F7A4D]">{ann.views > 0 ? ((ann.clicks / ann.views)*100).toFixed(1)+'%' : '0%'}</p></div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-[#6B7280] flex items-center gap-1"><Calendar size={11} />{new Date(ann.endDate).toLocaleDateString('en-IN')}</span>
                <button onClick={() => handleToggle(ann)}>
                  {ann.isActive
                    ? <span className="px-2.5 py-1 rounded-full text-[9px] font-black uppercase border border-green-200 bg-[#DCFCE7] text-[#15803D]">Active</span>
                    : <span className="px-2.5 py-1 rounded-full text-[9px] font-black uppercase border border-red-200 bg-[#FEE2E2] text-[#DC2626]">Paused</span>
                  }
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
