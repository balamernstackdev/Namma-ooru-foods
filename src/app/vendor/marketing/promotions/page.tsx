'use client';

import React, { useState } from 'react';
import {
  Tag, Ticket, Megaphone, Clock, ShoppingCart, ArrowRight
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { API_URL } from '@/lib/api';
import useSWR from 'swr';
import Link from 'next/link';

const fetcher = (url: string) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('namma_orru_token') : null;
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return fetch(url, { headers }).then(res => res.json());
};

export default function VendorPromotionsPage() {
  const { user } = useAuth();
  const vendorId = user?.brandId || user?.subVendorId;

  const { data: couponsData } = useSWR<any>(
    vendorId ? `${API_URL}/api/coupons?vendorId=${vendorId}&limit=100` : null,
    fetcher
  );
  const { data: annRaw } = useSWR<any>(
    vendorId ? `${API_URL}/api/offer-announcements?vendorId=${vendorId}` : null,
    fetcher
  );

  const coupons = couponsData?.coupons || [];
  const announcements = Array.isArray(annRaw) ? annRaw : [];

  // Aggregate stats
  const activeCoupons   = coupons.filter((c: any) => c.status === 'ACTIVE').length;
  const pendingCoupons  = coupons.filter((c: any) => c.status === 'PENDING').length;
  const activeAnn       = announcements.filter((a: any) => a.status === 'ACTIVE').length;
  const pendingAnn      = announcements.filter((a: any) => a.status === 'PENDING').length;
  const totalUsage      = coupons.reduce((acc: number, c: any) => acc + (c._count?.usages || 0), 0);

  const stats = [
    { label: 'Active Coupons',       value: activeCoupons,  icon: Ticket,     color: 'emerald' },
    { label: 'Live Announcements',   value: activeAnn,      icon: Megaphone,  color: 'blue'    },
    { label: 'Pending Review',       value: pendingCoupons + pendingAnn, icon: Clock, color: 'amber' },
    { label: 'Total Coupon Usages',  value: totalUsage,     icon: ShoppingCart, color: 'purple' },
  ];

  const colorMap: Record<string, string> = {
    emerald: 'bg-[#DCFCE7] text-[#15803D]',
    blue:    'bg-blue-50 text-blue-600',
    amber:   'bg-[#FEF3C7] text-[#B45309]',
    purple:  'bg-purple-50 text-purple-600',
  };

  return (
    <div className="space-y-10 pb-20">
      {/* PAGE HEADER */}
      <div className="relative overflow-hidden rounded-[20px] bg-white border border-[#E5E7EB] p-8 md:p-10 shadow-[0_4px_12px_rgba(0,0,0,0.05)]">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-6 justify-between">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="h-10 w-10 bg-[#DCFCE7] rounded-2xl flex items-center justify-center">
                <Tag className="text-[#15803D] h-5 w-5" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#0F7A4D]">Marketing Hub</span>
            </div>
            <h1 className="text-4xl font-black text-[#111827] tracking-tight leading-none mb-2">
              Promotions & Campaigns
            </h1>
            <p className="text-[#6B7280] text-sm font-medium max-w-lg">
              Centralized command center for all your store's coupons, announcement banners and promotional campaigns.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link href="/vendor/marketing/coupons"
              className="flex items-center gap-3 bg-[#0F7A4D] text-white px-6 py-3.5 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-[#0c623d] transition-all shadow-[0_4px_12px_rgba(15,122,77,0.2)] group">
              <Ticket size={15} />
              Manage Coupons
              <ArrowRight size={13} className="ml-auto group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="/vendor/marketing/announcements"
              className="flex items-center gap-3 bg-white text-[#111827] border border-[#E5E7EB] px-6 py-3.5 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-slate-50 transition-all group">
              <Megaphone size={15} className="text-[#0F7A4D]" />
              Manage Banners
              <ArrowRight size={13} className="ml-auto group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>

      {/* KPI STATS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
        {stats.map(s => (
          <div key={s.label} className="bg-white rounded-[20px] border border-[#E5E7EB] p-6 shadow-[0_4px_12px_rgba(0,0,0,0.05)] flex flex-col gap-4">
            <div className={`h-11 w-11 rounded-2xl flex items-center justify-center ${colorMap[s.color]}`}>
              <s.icon size={20} />
            </div>
            <div>
              <div className="text-3xl font-black text-[#111827]">{s.value}</div>
              <div className="text-[10px] font-black uppercase tracking-widest text-[#6B7280] mt-1">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* SPLIT VIEW: Recent Coupons + Recent Announcements */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* RECENT COUPONS */}
        <div className="bg-white rounded-[20px] border border-[#E5E7EB] shadow-[0_4px_12px_rgba(0,0,0,0.05)] overflow-hidden">
          <div className="p-6 border-b border-[#E5E7EB] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 bg-[#DCFCE7] text-[#15803D] rounded-xl flex items-center justify-center">
                <Ticket size={16} />
              </div>
              <h2 className="text-[13px] font-black uppercase tracking-widest text-[#111827]">Recent Coupons</h2>
            </div>
            <Link href="/vendor/marketing/coupons"
              className="text-[10px] font-black uppercase tracking-widest text-[#0F7A4D] hover:text-[#0c623d] flex items-center gap-1">
              View All <ArrowRight size={12} />
            </Link>
          </div>
          <div className="divide-y divide-[#E5E7EB]">
            {coupons.length === 0 ? (
              <div className="py-16 text-center text-[#6B7280] text-[11px] font-bold uppercase tracking-widest">
                No coupons created yet
              </div>
            ) : coupons.slice(0, 5).map((c: any) => (
              <div key={c.id} className="px-6 py-4 flex items-center justify-between hover:bg-[#F8FAF7]/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 bg-[#F8FAF7] rounded-xl flex items-center justify-center text-slate-500 border border-[#E5E7EB]">
                    <Ticket size={15} />
                  </div>
                  <div>
                    <div className="text-[13px] font-extrabold text-[#111827]">{c.code}</div>
                    <div className="text-[10px] text-[#6B7280] font-medium">
                      {c.benefitType === 'PERCENTAGE' ? `${c.value}% Off` :
                       c.benefitType === 'FIXED' ? `₹${c.value} Off` : 'Free Shipping'}
                    </div>
                  </div>
                </div>
                {c.status === 'ACTIVE'   && <span className="text-[9px] font-black uppercase tracking-widest text-[#15803D] bg-[#DCFCE7] px-2.5 py-1 rounded-lg border border-[#DCFCE7]">Active</span>}
                {c.status === 'PENDING'  && <span className="text-[9px] font-black uppercase tracking-widest text-[#B45309] bg-[#FEF3C7] px-2.5 py-1 rounded-lg border border-[#FEF3C7]">Pending</span>}
                {c.status === 'REJECTED' && <span className="text-[9px] font-black uppercase tracking-widest text-[#DC2626] bg-[#FEE2E2] px-2.5 py-1 rounded-lg border border-[#FEE2E2]">Rejected</span>}
              </div>
            ))}
          </div>
        </div>

        {/* RECENT ANNOUNCEMENTS */}
        <div className="bg-white rounded-[20px] border border-[#E5E7EB] shadow-[0_4px_12px_rgba(0,0,0,0.05)] overflow-hidden">
          <div className="p-6 border-b border-[#E5E7EB] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                <Megaphone size={16} />
              </div>
              <h2 className="text-[13px] font-black uppercase tracking-widest text-[#111827]">Announcement Bars</h2>
            </div>
            <Link href="/vendor/marketing/announcements"
              className="text-[10px] font-black uppercase tracking-widest text-[#0F7A4D] hover:text-[#0c623d] flex items-center gap-1">
              View All <ArrowRight size={12} />
            </Link>
          </div>
          <div className="divide-y divide-[#E5E7EB]">
            {announcements.length === 0 ? (
              <div className="py-16 text-center text-[#6B7280] text-[11px] font-bold uppercase tracking-widest">
                No announcement bars configured
              </div>
            ) : announcements.slice(0, 5).map((a: any) => (
              <div key={a.id} className="px-6 py-4 flex items-center gap-3 hover:bg-[#F8FAF7]/50 transition-colors">
                <div
                  className="h-9 min-w-[2.25rem] rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: a.bgColor }}
                >
                  <Megaphone size={14} style={{ color: a.textColor }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-extrabold text-[#111827] truncate">{a.title}</div>
                  <div className="text-[10px] text-[#6B7280] font-medium truncate">{a.message}</div>
                </div>
                {a.status === 'ACTIVE'   && <span className="flex-shrink-0 text-[9px] font-black uppercase tracking-widest text-[#15803D] bg-[#DCFCE7] px-2.5 py-1 rounded-lg border border-[#DCFCE7]">Live</span>}
                {a.status === 'PENDING'  && <span className="flex-shrink-0 text-[9px] font-black uppercase tracking-widest text-[#B45309] bg-[#FEF3C7] px-2.5 py-1 rounded-lg border border-[#FEF3C7]">Pending</span>}
                {a.status === 'REJECTED' && <span className="flex-shrink-0 text-[9px] font-black uppercase tracking-widest text-[#DC2626] bg-[#FEE2E2] px-2.5 py-1 rounded-lg border border-[#FEE2E2]">Rejected</span>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
