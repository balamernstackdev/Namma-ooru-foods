'use client';

import React, { useState, useMemo } from 'react';
import useSWR from 'swr';
import { Search, Download, Trash2, Mail, Filter, Check, X, ShieldAlert } from 'lucide-react';
import { API_URL } from '@/lib/api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const fetcher = (url: string) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('namma_orru_token') : null;
  return fetch(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  }).then(res => res.json());
};

export default function SubscribersPage() {
  const [search, setSearch] = useState('');
  const [source, setSource] = useState('');
  const [couponSent, setCouponSent] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const limit = 10;

  const queryParams = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    ...(search && { search }),
    ...(source && { source }),
    ...(couponSent && { couponSent }),
    ...(status && { status }),
  }).toString();

  const { data, mutate, isLoading } = useSWR(`${API_URL}/api/community-join/subscribers?${queryParams}`, fetcher);

  const subscribers = data?.subscribers || [];
  const total = data?.total || 0;
  const pages = data?.pages || 1;

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this subscriber?')) return;
    try {
      const token = localStorage.getItem('namma_orru_token');
      const res = await fetch(`${API_URL}/api/community-join/subscribers/${id}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      if (res.ok) {
        toast.success('Subscriber deleted successfully');
        mutate();
      } else {
        toast.error('Failed to delete subscriber');
      }
    } catch (err) {
      toast.error('An error occurred');
    }
  };

  const handleExportCSV = async () => {
    try {
      const token = localStorage.getItem('namma_orru_token');
      const exportParams = new URLSearchParams({
        all: 'true',
        ...(search && { search }),
        ...(source && { source }),
        ...(couponSent && { couponSent }),
        ...(status && { status }),
      }).toString();

      const res = await fetch(`${API_URL}/api/community-join/subscribers?${exportParams}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      const exportData = await res.json();
      const allSubs = exportData?.subscribers || [];

      if (allSubs.length === 0) {
        toast.error('No subscribers to export');
        return;
      }

      const headers = ['Name', 'Email', 'Mobile Number', 'Source', 'Subscription Date', 'Coupon Sent', 'Coupon Code', 'Status'];
      const rows = allSubs.map((s: any) => [
        s.name || s.firstName || 'N/A',
        s.email,
        s.mobileNumber || 'N/A',
        s.source || 'N/A',
        s.createdAt ? format(new Date(s.createdAt), 'yyyy-MM-dd HH:mm:ss') : 'N/A',
        s.couponSent ? 'Yes' : 'No',
        s.couponCode || 'N/A',
        s.status || 'ACTIVE'
      ]);

      const csvContent = [
        headers.join(','),
        ...rows.map((r: any[]) => r.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `subscribers_export_${format(new Date(), 'yyyyMMdd_HHmmss')}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Subscribers list exported successfully!');
    } catch (err) {
      toast.error('Failed to export CSV');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-16">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tighter italic flex items-center gap-3">
            <Mail className="text-emerald-600" />
            Email <span className="text-emerald-600">Subscribers</span>
          </h1>
          <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px] mt-2">
            Manage your dynamic newsletter and offer popup subscribers
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="h-12 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-black uppercase tracking-widest flex items-center gap-2 shadow-xl shadow-emerald-500/20 active:scale-95 transition-all cursor-pointer"
        >
          <Download size={14} />
          Export CSV
        </button>
      </div>

      {/* Filters & Search */}
      <div className="bg-white rounded-[20px] border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search email, name, or phone..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="h-12 w-full pl-11 pr-4 rounded-xl bg-slate-50 border border-slate-200 outline-none font-bold text-xs text-slate-950 focus:bg-white focus:border-emerald-600 transition-colors"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <select
            value={source}
            onChange={(e) => { setSource(e.target.value); setPage(1); }}
            className="h-12 px-4 rounded-xl bg-slate-50 border border-slate-200 outline-none font-bold text-xs text-slate-700 focus:bg-white focus:border-emerald-600 transition-colors cursor-pointer"
          >
            <option value="">All Sources</option>
            <option value="Popup">Popup</option>
            <option value="FOOTER">Footer</option>
          </select>

          <select
            value={couponSent}
            onChange={(e) => { setCouponSent(e.target.value); setPage(1); }}
            className="h-12 px-4 rounded-xl bg-slate-50 border border-slate-200 outline-none font-bold text-xs text-slate-700 focus:bg-white focus:border-emerald-600 transition-colors cursor-pointer"
          >
            <option value="">All Coupons</option>
            <option value="true">Coupon Sent</option>
            <option value="false">No Coupon</option>
          </select>

          <select
            value={status}
            onChange={(e) => { setStatus(e.target.value); setPage(1); }}
            className="h-12 px-4 rounded-xl bg-slate-50 border border-slate-200 outline-none font-bold text-xs text-slate-700 focus:bg-white focus:border-emerald-600 transition-colors cursor-pointer"
          >
            <option value="">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="UNSUBSCRIBED">Unsubscribed</option>
          </select>
        </div>
      </div>

      {/* Grid List */}
      <div className="bg-white rounded-[25px] border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px] admin-data-table">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-400">
                <th className="py-4 px-6">Name</th>
                <th className="py-4 px-6">Email</th>
                <th className="py-4 px-6">Mobile Number</th>
                <th className="py-4 px-6">Source</th>
                <th className="py-4 px-6">Subscribed At</th>
                <th className="py-4 px-6">Coupon Code</th>
                <th className="py-4 px-6 text-center">Status</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-150 text-[13px] font-bold text-slate-700">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 uppercase tracking-widest text-[11px]">
                    Loading subscribers...
                  </td>
                </tr>
              ) : subscribers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-20 text-center">
                    <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-slate-50 text-slate-300 mb-4">
                      <Mail size={28} />
                    </div>
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">No subscribers found</p>
                  </td>
                </tr>
              ) : (
                subscribers.map((sub: any) => (
                  <tr key={sub.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-6 text-slate-900 font-extrabold">{sub.name || sub.firstName || 'N/A'}</td>
                    <td className="py-4 px-6">{sub.email}</td>
                    <td className="py-4 px-6">{sub.mobileNumber || 'N/A'}</td>
                    <td className="py-4 px-6">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest ${sub.source === 'Popup' ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-100 text-slate-600'}`}>
                        {sub.source || 'N/A'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-slate-400 font-medium">
                      {sub.createdAt ? format(new Date(sub.createdAt), 'MMM d, yyyy h:mm a') : 'N/A'}
                    </td>
                    <td className="py-4 px-6 font-mono text-xs">
                      {sub.couponSent ? (
                        <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                          {sub.couponCode || 'SENT'}
                        </span>
                      ) : (
                        <span className="text-slate-400">N/A</span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-black tracking-widest ${sub.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                        {sub.status || 'ACTIVE'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => handleDelete(sub.id)}
                        className="h-8 w-8 rounded-lg bg-slate-50 border border-slate-200 text-slate-400 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 flex items-center justify-center transition-all ml-auto"
                        title="Delete subscriber"
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

        {/* Pagination */}
        {pages > 1 && (
          <div className="p-6 border-t border-slate-150 flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              Page {page} of {pages} ({total} subscribers)
            </span>
            <div className="flex items-center gap-1.5">
              <button
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
                className="h-9 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-50 disabled:pointer-events-none active:scale-95"
              >
                Prev
              </button>
              <button
                disabled={page === pages}
                onClick={() => setPage(page + 1)}
                className="h-9 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-50 disabled:pointer-events-none active:scale-95"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
