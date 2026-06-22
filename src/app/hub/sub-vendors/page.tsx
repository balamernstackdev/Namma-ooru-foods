'use client';

import { useState } from 'react';
import Link from 'next/link';
import useSWR from 'swr';
import { API_URL } from '@/lib/api';
import { Search, ArrowUpRight, Users2 } from 'lucide-react';
import toast from 'react-hot-toast';

const fetcher = (url: string) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('namma_orru_token') : null;
  return fetch(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  }).then(res => {
    if (!res.ok) throw new Error('Failed to fetch sub-vendors');
    return res.json();
  });
};

const getStatus = (sv: any) => {
  if (sv.deletedAt) return 'Disabled';
  if (!sv.userId) return 'Pending';
  return 'Active';
};

const statusColor = (s: string) => {
  if (s === 'Active') return 'bg-green-100 text-green-800 border-green-200';
  if (s === 'Pending') return 'bg-amber-100 text-amber-800 border-amber-200';
  return 'bg-red-100 text-red-800 border-red-200';
};

export default function SubVendorsList() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);

  const { data, error, isLoading, mutate } = useSWR(
    `${API_URL}/api/vendor-hub/sub-vendors?page=${page}&limit=10&search=${searchTerm}`,
    fetcher
  );

  const subVendors = data?.subVendors || [];
  const total = data?.total || 0;
  const totalPages = data?.totalPages || 1;

  const filtered = subVendors.filter((sv: any) => {
    if (!statusFilter) return true;
    return getStatus(sv) === statusFilter;
  });

  const handleStatusUpdate = async (vendorId: number, newStatus: string) => {
    const token = localStorage.getItem('namma_orru_token');
    try {
      const payload: any = newStatus === 'Disabled'
        ? { deletedAt: new Date().toISOString() }
        : { deletedAt: null };

      const res = await fetch(`${API_URL}/api/sub-vendors/${vendorId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error('Status update failed');
      toast.success(`Vendor status updated to ${newStatus}`);
      mutate();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update vendor status');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 uppercase italic tracking-tight">
            Sub <span className="text-emerald-600">Vendors</span>
          </h1>
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mt-1">
            {total} vendors assigned to this hub
          </p>
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {/* Filters */}
        <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row gap-4 items-center bg-slate-50/50">
          <div className="relative w-full md:w-80">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by store name..."
              className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-sm font-semibold text-slate-700 bg-white"
              value={searchTerm}
              onChange={e => { setSearchTerm(e.target.value); setPage(1); }}
            />
          </div>
          <select
            className="border border-slate-200 rounded-xl px-4 py-2.5 bg-white focus:ring-2 focus:ring-emerald-500 outline-none text-sm font-semibold text-slate-700"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Pending">Pending</option>
            <option value="Disabled">Disabled</option>
          </select>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-16 text-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600 mx-auto mb-3" />
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Loading...</p>
            </div>
          ) : error ? (
            <div className="p-12 text-center text-red-500 font-semibold">Failed to load sub-vendors.</div>
          ) : filtered.length === 0 ? (
            <div className="p-16 text-center">
              <Users2 size={40} className="mx-auto text-slate-200 mb-4" />
              <p className="text-slate-400 text-sm font-bold">No sub-vendors found.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100">
                  {['Vendor ID', 'Store Name', 'Owner', 'Contact', 'Products', 'Orders', 'Revenue', 'Status', 'Actions'].map(h => (
                    <th key={h} className="px-5 py-4 text-[9px] font-black uppercase tracking-widest text-slate-400 whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map((vendor: any) => {
                  const status = getStatus(vendor);
                  const selId = `SEL-${vendor.id.toString().padStart(3, '0')}`;
                  return (
                    <tr key={vendor.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-5 py-4">
                        <span className="font-mono text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded border border-emerald-100">
                          {selId}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="font-bold text-slate-900 text-sm">{vendor.name}</div>
                        <div className="text-[10px] text-slate-400 font-semibold">{vendor.slug}</div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="text-sm font-semibold text-slate-700">{vendor.owner?.name || 'Unassigned'}</div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="text-xs font-semibold text-slate-600">{vendor.owner?.phone || '-'}</div>
                        <div className="text-[10px] text-slate-400">{vendor.owner?.email || '-'}</div>
                      </td>
                      <td className="px-5 py-4 text-center">
                        <span className="text-sm font-bold text-slate-800">{vendor._count?.products || 0}</span>
                      </td>
                      <td className="px-5 py-4 text-center">
                        <span className="text-sm font-bold text-slate-800">{vendor.ordersCount || 0}</span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-sm font-bold text-slate-800">
                          ₹{Number(vendor.revenue || 0).toLocaleString('en-IN')}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold border ${statusColor(status)}`}>
                          {status}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/hub/sub-vendors/${vendor.id}`}
                            className="inline-flex items-center gap-1 text-emerald-600 hover:text-emerald-700 font-bold text-[10px] uppercase tracking-wider"
                          >
                            View <ArrowUpRight size={12} />
                          </Link>
                          <span className="text-slate-200">|</span>
                          {status === 'Disabled' ? (
                            <button
                              onClick={() => handleStatusUpdate(vendor.id, 'Restore')}
                              className="text-green-600 hover:text-green-800 font-bold text-[10px] uppercase tracking-wider"
                            >
                              Restore
                            </button>
                          ) : (
                            <button
                              onClick={() => handleStatusUpdate(vendor.id, 'Disabled')}
                              className="text-red-500 hover:text-red-700 font-bold text-[10px] uppercase tracking-wider"
                            >
                              Disable
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-5 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/30 text-xs font-semibold text-slate-500">
            <span>Page {page} of {totalPages} · {total} total</span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(p - 1, 1))}
                disabled={page === 1}
                className="px-3 py-1.5 border border-slate-200 rounded-lg bg-white text-slate-700 disabled:opacity-40 hover:border-emerald-300 hover:text-emerald-700 transition-all"
              >
                Previous
              </button>
              <button
                onClick={() => setPage(p => Math.min(p + 1, totalPages))}
                disabled={page === totalPages}
                className="px-3 py-1.5 border border-slate-200 rounded-lg bg-white text-slate-700 disabled:opacity-40 hover:border-emerald-300 hover:text-emerald-700 transition-all"
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
