'use client';

import React, { useState } from 'react';
import useSWR from 'swr';
import { useAuth } from '@/context/AuthContext';
import { API_URL } from '@/lib/api';
import {
  Landmark,
  Clock,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  FileText,
  Calendar,
  DollarSign,
  ArrowUpRight,
  Download
} from 'lucide-react';

const fetcher = (url: string) => {
  const token = localStorage.getItem('token');
  return fetch(url, { headers: { Authorization: `Bearer ${token}` } }).then(res => res.json());
};

export default function VendorPayoutsPage() {
  const { user } = useAuth();
  const vendorId = user?.brandId;
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 8;

  // Fetch Payouts List
  const { data: payoutsRaw, isLoading: loadingPayouts } = useSWR(
    vendorId ? `${API_URL}/api/vendor/payouts/vendor/${vendorId}` : null,
    fetcher
  );
  // Safety guard — API returns raw array but could return error object on failure
  const payouts: any[] = Array.isArray(payoutsRaw) ? payoutsRaw : [];

  const totalPages = Math.ceil(payouts.length / ITEMS_PER_PAGE) || 1;
  const paginatedPayouts = React.useMemo(() => {
    return payouts.slice(
      (currentPage - 1) * ITEMS_PER_PAGE,
      currentPage * ITEMS_PER_PAGE
    );
  }, [payouts, currentPage]);

  // Fetch Vendor Payout Overview Widgets
  const { data: overview, isLoading: loadingOverview } = useSWR(
    vendorId ? `${API_URL}/api/vendor/payouts/vendor-overview/${vendorId}` : null,
    fetcher
  );

  const getStatusColor = (statusVal: string) => {
    switch (statusVal) {
      case 'SETTLED':
      case 'COMPLETED':
        return 'bg-[#DCFCE7] text-[#15803D] border-[#BBF7D0]';
      case 'PROCESSING':
        return 'bg-[#DBEAFE] text-[#2563EB] border-[#BFDBFE]';
      case 'PENDING':
        return 'bg-[#FEF3C7] text-[#B45309] border-[#FDE68A]';
      case 'FAILED':
        return 'bg-[#FEE2E2] text-[#DC2626] border-[#FECACA]';
      case 'ON_HOLD':
        return 'bg-[#F3F4F6] text-[#4B5563] border-[#E5E7EB]';
      default:
        return 'bg-[#F3F4F6] text-[#6B7280] border-[#E5E7EB]';
    }
  };

  if (!vendorId) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <AlertCircle className="h-16 w-16 text-[#F59E0B] mb-4" />
        <h3 className="text-lg font-black text-[#111827] uppercase tracking-widest">Access Restricted</h3>
        <p className="text-[#6B7280] text-xs mt-2 max-w-md font-bold uppercase tracking-wider">Please ensure your account is registered as a store partner.</p>
      </div>
    );
  }

  // Invoice / Payout report generator
  const handleDownloadInvoice = (payout: any) => {
    const headers = ["Payout ID", "Period Start", "Period End", "Total Orders", "Gross Revenue", "Commission Charged", "Refund Deductions", "Net Payable Amount", "Reference UTR", "Status"];
    
    const escapeCSV = (val: any) => {
      if (val === null || val === undefined) return '';
      const str = String(val);
      if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const row = [
      `PAY-${payout.id}`,
      payout.payoutWeekStart ? new Date(payout.payoutWeekStart).toLocaleDateString() : 'N/A',
      payout.payoutWeekEnd ? new Date(payout.payoutWeekEnd).toLocaleDateString() : 'N/A',
      payout.totalOrders,
      payout.grossAmount,
      payout.commission,
      payout.refundAmount,
      payout.payableAmount,
      payout.transactionRef ? `="${payout.transactionRef}"` : 'N/A',
      payout.status
    ].map(escapeCSV);

    const csvContent = headers.join(',') + '\n' + row.join(',');
    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `invoice_PAY_${payout.id}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-10 pb-16">
      {/* HEADER */}
      <div className="flex flex-col gap-1">
        <h1 className="text-4xl font-black text-[#0F7A4D] tracking-tighter">Finance Hub</h1>
        <p className="text-[#6B7280] font-bold text-[11px] uppercase tracking-widest leading-relaxed">
          Payout Ledger and Financial Statements Overview
        </p>
      </div>

      {/* OVERVIEW STATS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
        <div className="bg-white rounded-[20px] border border-[#E5E7EB] p-8 shadow-[0_4px_12px_rgba(0,0,0,0.05)] relative overflow-hidden group hover:-translate-y-0.5 transition-transform">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-50 rounded-full translate-x-8 -translate-y-8" />
          <div className="relative z-10 space-y-4">
            <div className="h-12 w-12 rounded-2xl bg-amber-50 text-[#F59E0B] flex items-center justify-center">
              <Clock size={22} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-[#6B7280]">Pending Settlement</p>
              <h3 className="text-3xl font-black text-[#111827] mt-1">
                ₹{loadingOverview ? '...' : (overview?.pendingPayout || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </h3>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-[20px] border border-[#E5E7EB] p-8 shadow-[0_4px_12px_rgba(0,0,0,0.05)] relative overflow-hidden group hover:-translate-y-0.5 transition-transform">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-full translate-x-8 -translate-y-8" />
          <div className="relative z-10 space-y-4">
            <div className="h-12 w-12 rounded-2xl bg-emerald-50 text-[#0F7A4D] flex items-center justify-center">
              <DollarSign size={22} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-[#6B7280]">Last Settled Amount</p>
              <h3 className="text-3xl font-black text-[#111827] mt-1">
                ₹{loadingOverview ? '...' : (overview?.lastPayoutAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </h3>
              <p className="text-[9px] font-black uppercase tracking-widest text-[#0F7A4D] mt-2">
                {overview?.lastPayoutDate ? new Date(overview.lastPayoutDate).toLocaleDateString() : 'No payments yet'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-[20px] border border-[#E5E7EB] p-8 shadow-[0_4px_12px_rgba(0,0,0,0.05)] relative overflow-hidden group hover:-translate-y-0.5 transition-transform">
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50 rounded-full translate-x-8 -translate-y-8" />
          <div className="relative z-10 space-y-4">
            <div className="h-12 w-12 rounded-2xl bg-indigo-50 text-indigo-500 flex items-center justify-center">
              <CheckCircle2 size={22} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-[#6B7280]">Total Earnings</p>
              <h3 className="text-3xl font-black text-[#111827] mt-1">
                ₹{loadingOverview ? '...' : (overview?.totalEarnings || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </h3>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-[20px] border border-[#E5E7EB] p-8 shadow-[0_4px_12px_rgba(0,0,0,0.05)] relative overflow-hidden group hover:-translate-y-0.5 transition-transform">
          <div className="absolute top-0 right-0 w-24 h-24 bg-sky-50 rounded-full translate-x-8 -translate-y-8" />
          <div className="relative z-10 space-y-4">
            <div className="h-12 w-12 rounded-2xl bg-sky-50 text-sky-500 flex items-center justify-center">
              <TrendingUp size={22} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-[#6B7280]">Current Week Revenue</p>
              <h3 className="text-3xl font-black text-[#111827] mt-1">
                ₹{loadingOverview ? '...' : (overview?.thisWeekRevenue || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </h3>
            </div>
          </div>
        </div>
      </div>



      {/* PAYOUT HISTORY TABLE */}
      <div className="bg-white rounded-[20px] border border-[#E5E7EB] shadow-[0_4px_12px_rgba(0,0,0,0.05)] overflow-hidden p-8 space-y-6">
        <div>
          <h3 className="text-xl font-black text-[#0F7A4D] tracking-tight font-sans">Payment Statements</h3>
          <p className="text-[10px] font-bold text-[#6B7280] uppercase tracking-widest mt-1">Detailed history of weekly settlements</p>
        </div>

        <div className="hidden lg:block overflow-x-auto min-h-[280px]">
          <table className="w-full text-left border-collapse min-w-[1000px] admin-data-table">
            <thead>
              <tr className="border-b border-[#E5E7EB] bg-[#F8FAF7]">
                <th className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-[#6B7280]">Statement ID</th>
                <th className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-[#6B7280]">Week Period</th>
                <th className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-[#6B7280] text-center">Fulfill Orders</th>
                <th className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-[#6B7280] text-right">Gross Revenue</th>
                <th className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-[#6B7280] text-right">Commission Charged</th>
                <th className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-[#6B7280] text-right">Refund Adjustment</th>
                <th className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-[#6B7280] text-right">Net Payable</th>
                <th className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-[#6B7280] text-center">Status</th>
                <th className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-[#6B7280]">Reference / UTR</th>
                <th className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-[#6B7280] text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loadingPayouts ? (
                <tr>
                  <td colSpan={10} className="py-16 text-center">
                    <div className="h-8 w-8 border-4 border-[#E5E7EB] border-t-[#0F7A4D] rounded-full animate-spin mx-auto"></div>
                  </td>
                </tr>
              ) : payouts?.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-16 text-center">
                    <Landmark className="h-12 w-12 text-[#D1D5DB] mx-auto mb-3" />
                    <p className="text-xs font-black text-[#6B7280] uppercase tracking-widest">No statement logs yet</p>
                  </td>
                </tr>
              ) : (
                paginatedPayouts?.map((p: any) => (
                  <tr key={p.id} className="border-b border-[#F3F4F6] hover:bg-[#F9FAFB] transition-colors">
                    <td className="py-4 px-6">
                      <span className="text-xs font-black text-[#111827]">#PAY-{p.id}</span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-1.5 text-xs text-[#6B7280] font-semibold">
                        <Calendar size={13} className="text-[#9CA3AF]" />
                        <span>
                          {p.payoutWeekStart ? new Date(p.payoutWeekStart).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : ''}
                          {' - '}
                          {p.payoutWeekEnd ? new Date(p.payoutWeekEnd).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : ''}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className="text-xs font-bold text-[#111827]">
                        {p.totalOrders} <span className="text-[#9CA3AF]">({p.deliveredOrders})</span>
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right font-semibold text-[#111827] text-xs">
                      ₹{Number(p.grossAmount).toFixed(2)}
                    </td>
                    <td className="py-4 px-6 text-right font-semibold text-[#111827] text-xs">
                      -₹{Number(p.commission).toFixed(2)}
                    </td>
                    <td className="py-4 px-6 text-right font-semibold text-[#DC2626] text-xs">
                      -₹{Number(p.refundAmount || 0).toFixed(2)}
                    </td>
                    <td className="py-4 px-6 text-right font-black text-[#0F7A4D] text-xs">
                      ₹{Number(p.payableAmount).toFixed(2)}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className={`inline-flex px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border ${getStatusColor(p.status)}`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      {p.transactionRef ? (
                        <div className="flex flex-col">
                          <span className="text-xs font-mono font-bold text-[#111827] truncate max-w-[100px]">{p.transactionRef}</span>
                          <span className="text-[8px] font-black uppercase tracking-widest text-[#9CA3AF] mt-0.5">{p.paymentReference || 'Bank Transfer'}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-[#9CA3AF] font-bold">—</span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleDownloadInvoice(p)}
                          className="h-8 w-8 rounded-lg border border-[#E5E7EB] text-[#6B7280] hover:text-[#0F7A4D] hover:border-[#0F7A4D]/30 flex items-center justify-center transition-colors bg-white shadow-sm"
                          title="Download Statement"
                        >
                          <Download size={14} />
                        </button>

                        {p.receiptUrl && (
                          <a
                            href={p.receiptUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="h-8 w-8 rounded-lg border border-[#E5E7EB] text-[#6B7280] hover:text-[#0F7A4D] hover:border-[#0F7A4D]/30 flex items-center justify-center transition-colors bg-white shadow-sm"
                            title="View Transfer Proof"
                          >
                            <FileText size={14} />
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile View (Cards) */}
        <div className="lg:hidden space-y-4">
          {loadingPayouts ? (
            [1, 2, 3].map(i => (
              <div key={i} className="bg-[#F8FAF7] border border-[#E5E7EB] rounded-[20px] p-5 animate-pulse space-y-3">
                <div className="flex justify-between">
                  <div className="h-4 bg-[#E5E7EB] rounded w-1/3" />
                  <div className="h-4 bg-[#E5E7EB] rounded w-1/4" />
                </div>
                <div className="h-3 bg-[#E5E7EB] rounded w-1/2" />
                <div className="border-t border-[#E5E7EB] pt-3 flex justify-between">
                  <div className="h-5 bg-[#E5E7EB] rounded w-1/4" />
                  <div className="h-5 bg-[#E5E7EB] rounded w-1/4" />
                </div>
              </div>
            ))
          ) : payouts?.length === 0 ? (
            <div className="py-12 text-center">
              <Landmark className="h-12 w-12 text-[#D1D5DB] mx-auto mb-3" />
              <p className="text-xs font-black text-[#6B7280] uppercase tracking-widest">No statement logs yet</p>
            </div>
          ) : (
            paginatedPayouts?.map((p: any) => (
              <div key={p.id} className="bg-white border border-[#E5E7EB] rounded-[20px] p-5 space-y-4 shadow-[0_4px_12px_rgba(0,0,0,0.05)]">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-black text-[#111827]">#PAY-{p.id}</span>
                  <span className={`inline-flex px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border ${getStatusColor(p.status)}`}>
                    {p.status}
                  </span>
                </div>

                <div className="text-xs text-[#6B7280] font-semibold flex items-center gap-1.5">
                  <Calendar size={13} className="text-[#9CA3AF]" />
                  <span>
                    {p.payoutWeekStart ? new Date(p.payoutWeekStart).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : ''}
                    {' - '}
                    {p.payoutWeekEnd ? new Date(p.payoutWeekEnd).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : ''}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 border-t border-b border-[#E5E7EB] py-3 text-left">
                  <div>
                    <span className="text-[8px] font-black uppercase tracking-widest text-[#6B7280] block mb-1">Gross Revenue</span>
                    <span className="text-xs font-semibold text-[#111827]">₹{Number(p.grossAmount).toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-[8px] font-black uppercase tracking-widest text-[#6B7280] block mb-1">Commission</span>
                    <span className="text-xs font-semibold text-[#111827]">-₹{Number(p.commission).toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-[8px] font-black uppercase tracking-widest text-[#6B7280] block mb-1">Refund Adjust.</span>
                    <span className="text-xs font-semibold text-[#DC2626]">-₹{Number(p.refundAmount || 0).toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-[8px] font-black uppercase tracking-widest text-[#6B7280] block mb-1">Net Payable</span>
                    <span className="text-sm font-black text-[#0F7A4D]">₹{Number(p.payableAmount).toFixed(2)}</span>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-1">
                  <div className="text-left">
                    <span className="text-[8px] font-black uppercase tracking-widest text-[#6B7280] block mb-1">Reference / UTR</span>
                    {p.transactionRef ? (
                      <span className="text-[10px] font-mono font-bold text-[#111827]">{p.transactionRef}</span>
                    ) : (
                      <span className="text-xs text-[#9CA3AF] font-bold">—</span>
                    )}
                  </div>
                  <button
                    onClick={() => handleDownloadInvoice(p)}
                    className="h-10 px-4 rounded-[14px] border border-[#E5E7EB] text-[10px] font-black uppercase tracking-widest text-[#6B7280] hover:text-[#0F7A4D] flex items-center justify-center gap-1.5 bg-white shadow-sm active:scale-95 transition-all"
                  >
                    <Download size={13} />
                    Statement
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-[#E5E7EB] pt-6 mt-6 px-2 animate-in fade-in duration-500">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#6B7280]">
              Page {currentPage} of {totalPages}
            </span>
            <div className="flex items-center gap-1.5">
              <button
                disabled={currentPage === 1}
                onClick={() => { setCurrentPage(currentPage - 1); }}
                className="h-9 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all bg-[#F8FAF7] border border-[#E5E7EB] text-[#6B7280] hover:bg-[#F3F4F6] disabled:opacity-50 disabled:pointer-events-none active:scale-95 flex items-center gap-1"
              >
                Prev
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => {
                if (page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1) {
                  return (
                    <button
                      key={page}
                      onClick={() => { setCurrentPage(page); }}
                      className={`h-9 w-9 rounded-xl text-xs font-black transition-all active:scale-95 flex items-center justify-center border ${currentPage === page
                        ? 'bg-[#0F7A4D] border-[#0F7A4D] text-white shadow-md shadow-[#0F7A4D]/20'
                        : 'bg-white border-[#E5E7EB] text-[#6B7280] hover:bg-[#F8FAF7]'
                        }`}
                    >
                      {page}
                    </button>
                  );
                }
                if (page === 2 || page === totalPages - 1) {
                  return <span key={page} className="text-[#D1D5DB] text-xs px-1 select-none font-bold">...</span>;
                }
                return null;
              })}
              <button
                disabled={currentPage === totalPages}
                onClick={() => { setCurrentPage(currentPage + 1); }}
                className="h-9 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all bg-[#F8FAF7] border border-[#E5E7EB] text-[#6B7280] hover:bg-[#F3F4F6] disabled:opacity-50 disabled:pointer-events-none active:scale-95 flex items-center gap-1"
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
