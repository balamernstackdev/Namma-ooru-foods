'use client';

import { useState } from 'react';
import useSWR from 'swr';
import Link from 'next/link';
import { API_URL } from '@/lib/api';
import { Search, Users, ChevronRight, ChevronLeft, Phone, Mail } from 'lucide-react';
import { format } from 'date-fns';

const fetcher = (url: string) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('namma_orru_token') : null;
  return fetch(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  }).then(res => {
    if (!res.ok) throw new Error('Failed to fetch customers');
    return res.json();
  });
};

const fmt  = (n: number) => Number(n || 0).toLocaleString('en-IN');
const fmtRs = (n: number) => `₹${fmt(Math.round(n))}`;

export default function HubCustomersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);

  const { data, error, isLoading } = useSWR(
    `${API_URL}/api/vendor-hub/customers?page=${page}&limit=15&search=${encodeURIComponent(searchTerm)}`,
    fetcher
  );

  const customers = data?.customers || [];
  const totalPages = data?.totalPages || 1;
  const total = data?.total || 0;

  return (
    <div className="space-y-6 pb-8">
      {/* PAGE HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          {/* Breadcrumb */}
          <div className="flex items-center gap-1 text-[11px] font-black uppercase tracking-widest text-slate-400 mb-1.5">
            <Link href="/hub/dashboard" className="hover:text-[#059669] transition-colors">Dashboard</Link>
            <ChevronRight size={10} />
            <span className="text-slate-500">Hub Customers</span>
          </div>
          <h2 className="text-3xl lg:text-[36px] font-black tracking-tight leading-tight uppercase italic text-[#0F172A]">
            Hub <span className="text-[#059669]">Customers</span>
          </h2>
          <p className="text-[15px] font-medium text-slate-500 mt-1">
            View all unique buyers who ordered from vendors in your regional hub.
          </p>
        </div>

        {/* Summary count pill */}
        <div className="flex items-center gap-2.5 px-4 py-2 bg-white rounded-xl border border-slate-200/60 shadow-sm shrink-0">
          <Users size={15} className="text-[#059669]" />
          <span className="text-xs font-black text-slate-700">{fmt(total)} Customers</span>
        </div>
      </div>

      {/* TABLE CARD */}
      <div className="bg-white rounded-[18px] border border-slate-200/60 shadow-sm overflow-hidden">
        {/* Search Bar */}
        <div className="p-5 border-b border-slate-100 bg-slate-50/50">
          <div className="relative w-full md:w-80">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, email or mobile..."
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#059669]/20 focus:border-[#059669] outline-none text-sm font-semibold text-slate-700 bg-white transition-all"
              value={searchTerm}
              onChange={e => { setSearchTerm(e.target.value); setPage(1); }}
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-16 text-center">
              <div className="animate-spin rounded-full h-10 w-10 border-4 border-slate-100 border-t-[#059669] mx-auto mb-3" />
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Loading customers...</p>
            </div>
          ) : error ? (
            <div className="p-12 text-center text-red-500 font-semibold text-sm">Failed to load customers. Please retry.</div>
          ) : customers.length === 0 ? (
            <div className="p-16 text-center">
              <Users size={40} className="mx-auto text-slate-200 mb-4" />
              <p className="text-slate-400 text-sm font-bold uppercase tracking-wider">No customers found.</p>
              <p className="text-slate-400 text-xs font-medium mt-1">Customers will appear here once orders are placed.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100">
                  {['#', 'Customer', 'Contact', 'Orders', 'Total Spend', 'Member Since'].map(h => (
                    <th key={h} className="px-5 py-4 text-[9px] font-black uppercase tracking-widest text-slate-400 whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {customers.map((customer: any, idx: number) => (
                  <tr key={customer.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-5 py-4 text-xs font-bold text-slate-400">
                      {(page - 1) * 15 + idx + 1}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-xl bg-[#059669]/10 flex items-center justify-center text-[#059669] font-black text-sm shrink-0 border border-[#059669]/20">
                          {(customer.name || 'G')[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900">{customer.name || 'Guest'}</p>
                          <p className="text-[10px] font-bold text-slate-400 font-mono mt-0.5">ID: {customer.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-col gap-1">
                        {customer.email && (
                          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-semibold">
                            <Mail size={11} className="text-slate-400" />
                            {customer.email.includes('@nammaoorufarms.local') ? '—' : customer.email}
                          </div>
                        )}
                        {customer.phone && (
                          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-semibold">
                            <Phone size={11} className="text-slate-400" />
                            {customer.phone}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <span className="inline-flex items-center justify-center h-7 w-7 rounded-full bg-indigo-50 text-indigo-700 text-xs font-black border border-indigo-100">
                        {customer.orderCount ?? customer._count?.orders ?? 0}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-sm font-black text-[#059669]">
                        {fmtRs(customer.totalSpend || 0)}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-xs text-slate-500 font-semibold">
                      {customer.createdAt ? format(new Date(customer.createdAt), 'dd MMM yyyy') : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-5 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/30">
            <span className="text-[11px] font-bold text-slate-500">
              Page {page} of {totalPages} &middot; {total} customers total
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(p - 1, 1))}
                disabled={page === 1}
                className="flex items-center gap-1.5 px-4 py-2 border border-slate-200 rounded-xl bg-white text-slate-700 text-xs font-bold hover:border-[#059669]/40 hover:text-[#059669] disabled:opacity-40 transition-all"
              >
                <ChevronLeft size={14} /> Previous
              </button>
              <button
                onClick={() => setPage(p => Math.min(p + 1, totalPages))}
                disabled={page === totalPages}
                className="flex items-center gap-1.5 px-4 py-2 border border-slate-200 rounded-xl bg-white text-slate-700 text-xs font-bold hover:border-[#059669]/40 hover:text-[#059669] disabled:opacity-40 transition-all"
              >
                Next <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
