'use client';

import React from 'react';
import useSWR from 'swr';
import Link from 'next/link';
import { Layers, Plus, Pencil, Trash2, Eye, MousePointerClick, Heart, BarChart3, Calendar } from 'lucide-react';
import { API_URL } from '@/lib/api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const fetcher = (url: string) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('namma_orru_token') : null;
  return fetch(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  }).then(res => res.json());
};

export default function PopupCampaignsPage() {
  const { data: campaigns, mutate, isLoading } = useSWR<any[]>(`${API_URL}/api/popup-campaigns`, fetcher);

  const handleToggleActive = async (campaign: any) => {
    try {
      const token = localStorage.getItem('namma_orru_token');
      const res = await fetch(`${API_URL}/api/popup-campaigns/${campaign.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` })
        },
        body: JSON.stringify({ isActive: !campaign.isActive })
      });
      if (res.ok) {
        toast.success(`Campaign ${!campaign.isActive ? 'activated' : 'deactivated'} successfully`);
        mutate();
      } else {
        toast.error('Failed to update campaign status');
      }
    } catch (err) {
      toast.error('An error occurred');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this campaign?')) return;
    try {
      const token = localStorage.getItem('namma_orru_token');
      const res = await fetch(`${API_URL}/api/popup-campaigns/${id}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      if (res.ok) {
        toast.success('Campaign deleted successfully');
        mutate();
      } else {
        toast.error('Failed to delete campaign');
      }
    } catch (err) {
      toast.error('An error occurred');
    }
  };

  // Calculate high-level analytics
  const totalViews = campaigns?.reduce((sum, c) => sum + (c.views || 0), 0) || 0;
  const totalClicks = campaigns?.reduce((sum, c) => sum + (c.clicks || 0), 0) || 0;
  const totalSubs = campaigns?.reduce((sum, c) => sum + (c.subscriptions || 0), 0) || 0;
  const overallConversion = totalViews > 0 ? ((totalSubs / totalViews) * 100).toFixed(1) : '0.0';

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-16">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tighter italic flex items-center gap-3">
            <Layers className="text-emerald-600" />
            Popup <span className="text-emerald-600">Campaigns</span>
          </h1>
          <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px] mt-2">
            Dynamic newsletter and offer popups configuration panel
          </p>
        </div>

        <Link
          href="/admin/marketing/popup-campaigns/create"
          className="h-12 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-black uppercase tracking-widest flex items-center gap-2 shadow-xl shadow-emerald-500/20 active:scale-95 transition-all cursor-pointer w-fit"
        >
          <Plus size={16} />
          Create Campaign
        </Link>
      </div>

      {/* Analytics Widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Popup Views', value: totalViews.toLocaleString(), icon: Eye, color: 'blue' },
          { label: 'Total Clicks', value: totalClicks.toLocaleString(), icon: MousePointerClick, color: 'emerald' },
          { label: 'Total Subscriptions', value: totalSubs.toLocaleString(), icon: Heart, color: 'rose' },
          { label: 'Overall Conversion Rate', value: `${overallConversion}%`, icon: BarChart3, color: 'amber' }
        ].map((widget, i) => (
          <div key={i} className="bg-white rounded-[20px] border border-slate-200 p-6 shadow-sm flex items-center gap-4 relative overflow-hidden group">
            <div className="h-12 w-12 rounded-xl bg-slate-50 text-slate-600 flex items-center justify-center shrink-0">
              <widget.icon size={22} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{widget.label}</p>
              <h3 className="text-2xl font-black text-slate-900 mt-1">{widget.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Campaign List Grid */}
      <div className="bg-white rounded-[25px] border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px] admin-data-table">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-400">
                <th className="py-4 px-6">Campaign Info</th>
                <th className="py-4 px-6">Schedule / Dates</th>
                <th className="py-4 px-6">Priority</th>
                <th className="py-4 px-6 text-center">Audience Target</th>
                <th className="py-4 px-6 text-center">Analytics</th>
                <th className="py-4 px-6 text-center">Status</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-150 text-[13px] font-bold text-slate-700">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 uppercase tracking-widest text-[11px]">
                    Loading Banners...
                  </td>
                </tr>
              ) : !campaigns || campaigns.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-20 text-center">
                    <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-slate-50 text-slate-300 mb-4">
                      <Layers size={28} />
                    </div>
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">No campaigns found</p>
                  </td>
                </tr>
              ) : (
                campaigns.map((camp: any) => {
                  const conv = camp.views > 0 ? ((camp.subscriptions / camp.views) * 100).toFixed(1) : '0.0';

                  return (
                    <tr key={camp.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-5 px-6">
                        <div className="flex flex-col gap-1">
                          <span className="font-extrabold text-slate-900 text-sm leading-tight">{camp.title}</span>
                          {camp.subtitle && <span className="text-slate-400 text-xs font-medium truncate max-w-xs">{camp.subtitle}</span>}
                          <div className="flex items-center gap-1.5 mt-1.5">
                            <span className="px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-700 border border-emerald-100">
                              {camp.popupType}
                            </span>
                            {camp.couponCode && (
                              <span className="px-2 py-0.5 rounded text-[8px] font-mono font-black uppercase bg-amber-50 text-amber-700 border border-amber-100">
                                CODE: {camp.couponCode}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-5 px-6 text-slate-400 text-xs font-semibold">
                        <div className="flex flex-col gap-1">
                          <span className="flex items-center gap-1">
                            <Calendar size={12} />
                            Start: {camp.startDate ? format(new Date(camp.startDate), 'MMM d, yyyy') : 'Immediate'}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar size={12} />
                            End: {camp.endDate ? format(new Date(camp.endDate), 'MMM d, yyyy') : 'No expiry'}
                          </span>
                        </div>
                      </td>
                      <td className="py-5 px-6">
                        <span className="text-slate-800 bg-slate-100 px-2.5 py-1 rounded-full text-[11px] font-extrabold">
                          {camp.priority}
                        </span>
                      </td>
                      <td className="py-5 px-6 text-center text-xs">
                        <div className="flex flex-col items-center gap-1">
                          {camp.onlyGuest && <span className="text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded font-black uppercase tracking-widest text-[8px]">Guests Only</span>}
                          {camp.onlyLoggedIn && <span className="text-blue-600 bg-blue-50 px-2 py-0.5 rounded font-black uppercase tracking-widest text-[8px]">Logged-in Only</span>}
                          {!camp.onlyGuest && !camp.onlyLoggedIn && <span className="text-slate-500 font-bold uppercase tracking-widest text-[8px]">All Visitors</span>}
                        </div>
                      </td>
                      <td className="py-5 px-6">
                        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-slate-500 font-semibold max-w-[180px] mx-auto">
                          <span>Views: <strong className="text-slate-900 font-extrabold">{camp.views}</strong></span>
                          <span>Clicks: <strong className="text-slate-900 font-extrabold">{camp.clicks}</strong></span>
                          <span>Subs: <strong className="text-slate-900 font-extrabold">{camp.subscriptions}</strong></span>
                          <span>Conv: <strong className="text-emerald-700 font-extrabold">{conv}%</strong></span>
                        </div>
                      </td>
                      <td className="py-5 px-6 text-center">
                        <button
                          onClick={() => handleToggleActive(camp)}
                          className="focus:outline-none hover:scale-105 active:scale-95 transition-all text-slate-400 hover:text-slate-600 cursor-pointer"
                        >
                          {camp.isActive ? (
                            <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-pulse" />
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-slate-400 bg-slate-50 px-2.5 py-1 rounded-full border border-slate-200">
                              Inactive
                            </span>
                          )}
                        </button>
                      </td>
                      <td className="py-5 px-6 text-right">
                        <div className="flex items-center gap-1.5 justify-end">
                          <Link
                            href={`/admin/marketing/popup-campaigns/${camp.id}/edit`}
                            className="h-8 w-8 rounded-lg bg-slate-50 border border-slate-200 text-slate-600 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200 flex items-center justify-center transition-all"
                            title="Edit campaign"
                          >
                            <Pencil size={13} />
                          </Link>
                          <button
                            onClick={() => handleDelete(camp.id)}
                            className="h-8 w-8 rounded-lg bg-slate-50 border border-slate-200 text-slate-400 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 flex items-center justify-center transition-all"
                            title="Delete campaign"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
