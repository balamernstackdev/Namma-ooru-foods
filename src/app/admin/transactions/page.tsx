
'use client';

import React, { useState } from 'react';
import { Search, Loader2, CheckCircle2, XCircle, CreditCard, ChevronDown, DollarSign, HelpCircle, ArrowDownCircle, ArrowUpCircle } from 'lucide-react';
import useSWR from 'swr';
import { API_URL } from '@/lib/api';
import { useToast } from '@/context/ToastContext';
import { usePlatformSettings } from '@/context/PlatformSettingsContext';
import AdminPagination from '@/components/admin/AdminPagination';

const fetcher = (url: string) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('namma_orru_token') : null;
  return fetch(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  }).then(res => res.json());
};

export default function AdminTransactions() {
  const { settings } = usePlatformSettings();
  const { addToast } = useToast();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL'); // ALL, SUCCESS, FAILED

  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  const itemsPerPage = 10;
  const { data, error } = useSWR(
    `${API_URL}/api/admin/transactions?page=${currentPage}&limit=100&search=${searchTerm}`,
    fetcher
  );

  const { transactions = [], total = 0 } = data || {};

  // Filter transactions in frontend to match exact user status requirements
  const filteredTransactions = transactions.filter((tx: any) => {
    if (statusFilter === 'ALL') return true;
    if (statusFilter === 'SUCCESS') return tx.status === 'SUCCESS';
    if (statusFilter === 'FAILED') return tx.status !== 'SUCCESS'; // not paid showing failed
    return true;
  });

  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const calculatedTotalPages = Math.max(1, Math.ceil(filteredTransactions.length / itemsPerPage));

  // Compute status summary
  const successCount = transactions.filter((t: any) => t.status === 'SUCCESS').length;
  const failedCount = transactions.filter((t: any) => t.status !== 'SUCCESS').length;

  const getStatusBadge = (status: string) => {
    if (status === 'SUCCESS') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <CheckCircle2 size={12} />
          Success
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
          <XCircle size={12} />
          Failed
        </span>
      );
    }
  };

  if (!data && !error) {
    return (
      <div className="w-full h-[60vh] flex flex-col items-center justify-center bg-white gap-6">
        <div className="h-10 w-10 border-4 border-emerald-950 border-t-amber-400 rounded-full animate-spin" />
        <p className="text-[10px] font-black uppercase tracking-widest text-[#022c22]">Processing Global Transactions...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-16">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tighter italic">Transaction <span className="text-emerald-600">Payments</span></h1>
        <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px] mt-2">Audit global transaction history, payment gateways, and success rates.</p>
      </div>


      {/* Advanced Filter Toolbar */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
        {/* Search */}
        <div className="relative w-full md:w-96">
          <input
            type="text"
            placeholder="Search transactions by Order ID, Ref, name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-200"
          />
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        </div>

        {/* Filter Tabs */}
        <div className="flex bg-slate-50 p-1.5 rounded-2xl border border-slate-100 w-full md:w-auto">
          {['ALL', 'SUCCESS', 'FAILED'].map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`flex-1 md:flex-none px-6 py-2.5 rounded-xl text-xs font-black tracking-widest uppercase transition-all duration-200 ${statusFilter === tab
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-400 hover:text-slate-600'
                }`}
            >
              {tab === 'FAILED' ? 'FAILED / NOT PAID' : tab}
            </button>
          ))}
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Transaction ID</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Order Reference</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Customer</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Amount</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Payment Gateway</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Provider Reference</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Status</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {paginatedTransactions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-slate-400 font-bold uppercase tracking-widest text-xs">
                    No transactions found match the criteria
                  </td>
                </tr>
              ) : (
                paginatedTransactions.map((tx: any) => (
                  <tr key={tx.id} className="hover:bg-slate-50/40 transition-colors duration-150">
                    <td className="px-6 py-4 text-xs font-bold text-slate-600">
                      TXN-{tx.id.toString().padStart(5, '0')}
                    </td>
                    <td className="px-6 py-4 text-xs font-black text-slate-900 tracking-wider">
                      {tx.order?.orderIdStr || 'N/A'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-slate-900">{tx.order?.user?.name || 'Guest User'}</span>
                        <span className="text-[10px] text-slate-400 font-medium">{tx.order?.user?.email && !tx.order.user.email.includes('@nammaoorufarms.local') ? tx.order.user.email : ''}</span>
                        {(tx.order?.shippingAddress?.phone || tx.order?.user?.phone) && (
                          <span className="text-[10px] text-slate-500 font-bold mt-0.5">📞 {tx.order?.shippingAddress?.phone || tx.order?.user?.phone}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs font-black text-slate-900">
                      ₹{Number(tx.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-slate-900">{tx.gateway || 'SmartGateway'}</span>
                        <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">{tx.method || 'Online'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs font-mono text-slate-500 font-bold">
                      {tx.providerRef || 'N/A'}
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(tx.status)}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-400 font-bold">
                      {new Date(tx.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {calculatedTotalPages > 1 && (
          <div className="px-6 py-4 border-t border-slate-100 flex justify-between items-center bg-slate-50/30">
            <span className="text-xs text-slate-400 font-bold">
              Showing {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredTransactions.length)} of {filteredTransactions.length} transactions
            </span>
            <AdminPagination
              currentPage={currentPage}
              totalPages={calculatedTotalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>
    </div>
  );
}
