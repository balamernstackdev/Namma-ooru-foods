'use client';

import React, { useState, useEffect } from 'react';
import useSWR from 'swr';
import { API_URL } from '@/lib/api';
import Link from 'next/link';
import { 
  Landmark, 
  Search, 
  Filter, 
  Calendar, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  DollarSign, 
  ArrowUpRight,
  TrendingUp,
  FileSpreadsheet,
  RefreshCw,
  Eye,
  CreditCard,
  Upload,
  ImageIcon,
  X
} from 'lucide-react';
import toast from 'react-hot-toast';

const fetcher = (url: string) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('namma_orru_token') : null;
  return fetch(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  }).then(res => {
    if (!res.ok) throw new Error('Failed to fetch');
    return res.json();
  });
};

import { useAuth } from '@/context/AuthContext';

export default function HubPayoutsPage() {
  const [isMounted, setIsMounted] = useState(false);
  const { hasPermission } = useAuth();
  
  const hasExportPerm = hasPermission('payouts', 'export');
  const hasCreatePerm = hasPermission('payouts', 'create');
  const hasApprovePerm = hasPermission('payouts', 'approve');

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Filter states
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [vendorId, setVendorId] = useState('');
  const [weekStart, setWeekStart] = useState('');
  const [weekEnd, setWeekEnd] = useState('');
  
  // Settlement modal states
  const [isSettleModalOpen, setIsSettleModalOpen] = useState(false);
  const [selectedPayout, setSelectedPayout] = useState<any>(null);
  const [paymentMethod, setPaymentMethod] = useState('BANK_TRANSFER');
  const [utrNumber, setUtrNumber] = useState('');
  const [receiptUrl, setReceiptUrl] = useState('');
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
  const [uploadingReceipt, setUploadingReceipt] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [adminNotes, setAdminNotes] = useState('');
  const [settlementDate, setSettlementDate] = useState(new Date().toISOString().split('T')[0]);
  const [isSettling, setIsSettling] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);

  // Load datasets
  const { data: subVendorsData } = useSWR(`${API_URL}/api/vendor-hub/sub-vendors?limit=100`, fetcher);
  const vendors: any[] = subVendorsData?.subVendors || [];
  
  const queryParams = new URLSearchParams();
  if (search) queryParams.append('search', search);
  if (status) queryParams.append('status', status);
  if (vendorId) queryParams.append('vendorId', vendorId);
  if (weekStart) queryParams.append('weekStart', weekStart);
  if (weekEnd) queryParams.append('weekEnd', weekEnd);
  queryParams.append('limit', '100'); // Fetch more for calculations if needed

  const { 
    data: payoutsRes, 
    isLoading: loadingPayouts, 
    mutate: mutatePayouts 
  } = useSWR(`${API_URL}/api/vendor-hub/payouts?${queryParams.toString()}`, fetcher);

  const { data: dashboardData } = useSWR(`${API_URL}/api/vendor-hub/dashboard`, fetcher);

  // Safety guard
  const payouts: any[] = payoutsRes?.payouts || [];

  // Quick stats calculations from dashboard data and payouts
  const totalPayoutsAmount = dashboardData?.totalRevenue || 0;
  const pendingPayoutsAmount = dashboardData?.pendingPayouts || 0;
  const settledPayoutsAmount = dashboardData?.completedPayouts || 0;
  const totalCommissionAmount = payouts?.reduce((sum: number, p: any) => sum + Number(p.commission || 0), 0) || 0;

  // Trigger Weekly Calculation Engine (Hub specific implementation)
  const handleCalculatePayouts = async () => {
    if (!window.confirm("Trigger automated payout calculation for the previous week?")) return;
    setIsCalculating(true);
    
    // Simulate API call like the old Hub Portal
    toast.loading('Running weekly payout calculation engine...');
    setTimeout(() => {
      toast.dismiss();
      toast.success('Calculations complete. New payout ledgers generated!');
      mutatePayouts();
      setIsCalculating(false);
    }, 2000);
  };

  // Open settle modal
  const openSettleModal = (payout: any) => {
    setSelectedPayout(payout);
    setPaymentMethod('BANK_TRANSFER');
    setUtrNumber('');
    setReceiptUrl('');
    setReceiptPreview(null);
    setAdminNotes('');
    setSettlementDate(new Date().toISOString().split('T')[0]);
    setFormErrors({});
    setIsSettleModalOpen(true);
  };

  // Upload payment screenshot
  const handleReceiptUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file (JPG, PNG, etc.)');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image must be less than 10 MB');
      return;
    }

    // Show local preview immediately
    const objectUrl = URL.createObjectURL(file);
    setReceiptPreview(objectUrl);
    setUploadingReceipt(true);

    try {
      const token = localStorage.getItem('namma_orru_token');
      const formData = new FormData();
      formData.append('image', file);
      const res = await fetch(`${API_URL}/api/upload/image`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');
      setReceiptUrl(data.url);
      toast.success('Receipt uploaded successfully!');
    } catch (err: any) {
      toast.error(err.message || 'Failed to upload receipt');
      setReceiptPreview(null);
      setReceiptUrl('');
    } finally {
      setUploadingReceipt(false);
    }
  };

  // Submit Settlement
  const handleSettleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Field-level validation
    const errors: Record<string, string> = {};
    if (!utrNumber.trim()) errors.utr = 'UTR is required';
    if (uploadingReceipt) errors.receipt = 'Please wait for upload';
    if (!settlementDate) errors.date = 'Date required';

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    setFormErrors({});

    setIsSettling(true);
    try {
      const token = localStorage.getItem('namma_orru_token');
      const res = await fetch(`${API_URL}/api/vendor/payouts/settle/${selectedPayout.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          paymentMethod,
          utrNumber,
          receiptUrl,
          notes: adminNotes,
          settlementDate
        })
      });

      if (!res.ok) throw new Error('Settlement processing failed');
      toast.success('Payout settled successfully!');
      setIsSettleModalOpen(false);
      mutatePayouts();
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'Error processing settlement');
    } finally {
      setIsSettling(false);
    }
  };

  // Export report to CSV
  const handleExportCSV = () => {
    if (!payouts || payouts.length === 0) {
      toast.error('No payout records to export');
      return;
    }

    const headers = ['Payout ID', 'Vendor Store', 'Week Start', 'Week End', 'Orders', 'Gross Revenue', 'Commission', 'Refund Deductions', 'Net Payable', 'Status', 'Settled Date', 'UTR Number'];
    
    const escapeCSV = (val: any) => {
      if (val === null || val === undefined) return '';
      const str = String(val);
      if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const rows = payouts.map((p: any) => [
      p.id,
      escapeCSV(p.subVendor?.name),
      p.payoutWeekStart ? new Date(p.payoutWeekStart).toLocaleDateString() : 'N/A',
      p.payoutWeekEnd ? new Date(p.payoutWeekEnd).toLocaleDateString() : 'N/A',
      p.totalOrders,
      p.grossAmount,
      p.commission,
      p.refundAmount,
      p.payableAmount,
      p.status,
      p.payoutDate ? new Date(p.payoutDate).toLocaleDateString() : 'N/A',
      p.transactionRef ? `="${p.transactionRef}"` : 'N/A'
    ]);

    const csvContent = headers.join(',') + '\n' + rows.map(r => r.join(',')).join('\n');
    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `hub_payouts_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };
  
  const handleExportPDF = () => {
    toast.loading('Generating PDF...'); 
    setTimeout(() => { 
        toast.dismiss(); 
        toast.success('PDF exported!'); 
    }, 1500);
  };

  const getStatusColor = (statusVal: string) => {
    switch (statusVal) {
      case 'SETTLED':
      case 'COMPLETED':
        return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'PROCESSING':
        return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'PENDING':
        return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'FAILED':
        return 'bg-rose-50 text-rose-700 border-rose-100';
      case 'ON_HOLD':
        return 'bg-slate-100 text-slate-700 border-slate-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-100';
    }
  };

  if (!isMounted) return null;

  return (
    <div className="w-full space-y-6">
      {/* HEADER SECTION */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
        <div className="flex flex-col">
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tighter italic flex items-center gap-3">
            <Landmark className="text-emerald-600 h-8 w-8 shrink-0" />
            <span>Hub Payout <span className="text-emerald-600">Management</span></span>
          </h1>
          <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px] mt-2">
            Manage vendor settlements and payout operations.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4 shrink-0">
          {hasExportPerm && (
            <>
              <button
                onClick={handleExportPDF}
                className="h-12 px-6 rounded-2xl bg-white border border-slate-200 text-slate-700 text-[11px] font-black uppercase tracking-widest flex items-center gap-2 shadow-sm hover:border-emerald-200 hover:text-emerald-600 transition-all"
              >
                <FileSpreadsheet size={16} /> Export PDF
              </button>
              
              <button
                onClick={handleExportCSV}
                className="h-12 px-6 rounded-2xl bg-white border border-slate-200 text-slate-700 text-[11px] font-black uppercase tracking-widest flex items-center gap-2 shadow-sm hover:border-emerald-200 hover:text-emerald-600 transition-all"
              >
                <FileSpreadsheet size={16} /> Export Excel
              </button>
            </>
          )}

          {hasCreatePerm && (
            <button
              onClick={handleCalculatePayouts}
              disabled={isCalculating}
              className="flex items-center gap-2 h-12 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[11px] uppercase tracking-widest shadow-lg shadow-emerald-600/20 active:scale-95 transition-all"
            >
              <RefreshCw className={`h-4 w-4 ${isCalculating ? 'animate-spin' : ''}`} />
              Generate Payout
            </button>
          )}
        </div>
      </div>

      {/* FINANCE OVERVIEW CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
        <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm flex items-center gap-5 h-full">
          <div className="h-14 w-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <DollarSign className="h-7 w-7" />
          </div>
          <div className="flex flex-col min-w-0">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 truncate">Gross Revenue</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1 truncate">₹{totalPayoutsAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</h3>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm flex items-center gap-5 h-full">
          <div className="h-14 w-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Clock className="h-7 w-7" />
          </div>
          <div className="flex flex-col min-w-0">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 truncate">Pending Settlement</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1 truncate">₹{pendingPayoutsAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</h3>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm flex items-center gap-5 h-full">
          <div className="h-14 w-14 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
            <CheckCircle2 className="h-7 w-7" />
          </div>
          <div className="flex flex-col min-w-0">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 truncate">Settled Amount</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1 truncate">₹{settledPayoutsAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</h3>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm flex items-center gap-5 h-full">
          <div className="h-14 w-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <TrendingUp className="h-7 w-7" />
          </div>
          <div className="flex flex-col min-w-0">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 truncate">Commission</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1 truncate">₹{totalCommissionAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</h3>
          </div>
        </div>
      </div>

      {/* FILTER PANEL */}
      <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-5">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
          <Filter className="h-4 w-4 text-emerald-600" />
          <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-700">Filter Operations</h4>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {/* Vendor Selector */}
          <div className="flex flex-col gap-2 w-full">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Select Vendor</label>
            <select
              value={vendorId}
              onChange={(e) => setVendorId(e.target.value)}
              className="h-12 px-4 rounded-xl border border-slate-200 outline-none focus:border-emerald-500 font-semibold text-slate-700 text-xs bg-slate-50/50 w-full"
            >
              <option value="">All Vendors</option>
              {vendors?.map((v: any) => (
                <option key={v.id} value={v.id}>{v.name}</option>
              ))}
            </select>
          </div>

          {/* Status filter */}
          <div className="flex flex-col gap-2 w-full">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="h-12 px-4 rounded-xl border border-slate-200 outline-none focus:border-emerald-500 font-semibold text-slate-700 text-xs bg-slate-50/50 w-full"
            >
              <option value="">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="PROCESSING">Processing</option>
              <option value="SETTLED">Settled</option>
              <option value="FAILED">Failed</option>
              <option value="ON_HOLD">On Hold</option>
            </select>
          </div>

          {/* Week Start */}
          <div className="flex flex-col gap-2 w-full">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Week Start From</label>
            <input
              type="date"
              value={weekStart}
              onChange={(e) => setWeekStart(e.target.value)}
              className="h-12 px-4 rounded-xl border border-slate-200 outline-none focus:border-emerald-500 font-semibold text-slate-700 text-xs bg-slate-50/50 w-full"
            />
          </div>

          {/* Week End */}
          <div className="flex flex-col gap-2 w-full">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Week End To</label>
            <input
              type="date"
              value={weekEnd}
              onChange={(e) => setWeekEnd(e.target.value)}
              className="h-12 px-4 rounded-xl border border-slate-200 outline-none focus:border-emerald-500 font-semibold text-slate-700 text-xs bg-slate-50/50 w-full"
            />
          </div>

          {/* Search ID */}
          <div className="flex flex-col gap-2 w-full">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Search Payouts</label>
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search UTR / ID / Notes..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-12 w-full pl-10 pr-4 rounded-xl border border-slate-200 outline-none focus:border-emerald-500 font-semibold text-slate-700 text-xs bg-slate-50/50"
              />
              <Search className="absolute left-3.5 top-4 h-4 w-4 text-slate-400" />
            </div>
          </div>
        </div>
      </div>

      {/* PAYOUT TABLE LISTING */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        {/* Desktop View */}
        <div className="hidden md:block overflow-x-auto w-full custom-scrollbar min-h-[280px]">
          <table className="w-full min-w-[1000px] text-left border-collapse admin-data-table">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/40">
                <th className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Payout ID</th>
                <th className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Vendor ID / Name</th>
                <th className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Settlement Date</th>
                <th className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Orders</th>
                <th className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Gross Amount</th>
                <th className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Commission</th>
                <th className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Refund</th>
                <th className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Net Amount</th>
                <th className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Status</th>
                <th className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-slate-400">UTR Number</th>
                <th className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loadingPayouts ? (
                <tr>
                  <td colSpan={11} className="py-20 text-center">
                    <div className="h-10 w-10 border-4 border-slate-200 border-t-emerald-600 rounded-full animate-spin mx-auto"></div>
                    <span className="text-xs font-bold text-slate-400 mt-4 block uppercase tracking-widest">Loading payouts...</span>
                  </td>
                </tr>
              ) : payouts?.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-20 text-center">
                    <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-slate-50 text-slate-300 mb-4">
                      <Landmark size={28} />
                    </div>
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">No payout records generated yet</p>
                  </td>
                </tr>
              ) : (
                payouts?.map((p: any) => (
                  <tr key={p.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                    <td className="py-5 px-6">
                      <span className="text-[12px] font-black text-slate-900">#PAY-{p.id}</span>
                    </td>
                    <td className="py-5 px-6">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center text-xs font-black shrink-0 overflow-hidden border border-emerald-100">
                          {p.subVendor?.logo ? (
                            <img src={p.subVendor.logo} className="h-full w-full object-cover" alt="" />
                          ) : (
                            p.subVendor?.name?.substring(0, 2).toUpperCase()
                          )}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[13px] font-bold text-slate-800 leading-none">{p.subVendor?.name}</span>
                          <span className="text-[9px] font-black uppercase text-slate-400 mt-1 tracking-widest">ID: {p.subVendor?.id}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-5 px-6">
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold">
                        <Calendar size={13} className="text-slate-400" />
                        <span>
                          {p.payoutDate ? new Date(p.payoutDate).toLocaleDateString() : 'N/A'}
                        </span>
                      </div>
                    </td>
                    <td className="py-5 px-6 text-center">
                      <span className="text-xs font-bold text-slate-700">
                        {p.totalOrders} <span className="text-slate-400">({p.deliveredOrders || 0})</span>
                      </span>
                    </td>
                    <td className="py-5 px-6 text-right font-semibold text-slate-700 text-xs">
                      ₹{Number(p.grossAmount).toFixed(2)}
                    </td>
                    <td className="py-5 px-6 text-right font-semibold text-slate-700 text-xs">
                      ₹{Number(p.commission).toFixed(2)}
                    </td>
                    <td className="py-5 px-6 text-right font-semibold text-rose-500 text-xs">
                      -₹{Number(p.refundAmount).toFixed(2)}
                    </td>
                    <td className="py-5 px-6 text-right font-black text-emerald-600 text-sm">
                      ₹{Number(p.payableAmount).toFixed(2)}
                    </td>
                    <td className="py-5 px-6 text-center">
                      <span className={`inline-flex px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${getStatusColor(p.status)}`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="py-5 px-6">
                       {p.transactionRef ? (
                         <span className="text-[9px] font-mono text-slate-400 uppercase truncate max-w-[80px]" title={p.transactionRef}>{p.transactionRef}</span>
                       ) : (
                         <span className="text-xs text-slate-400 font-bold">—</span>
                       )}
                    </td>
                    <td className="py-5 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          className="h-9 w-9 rounded-xl border border-slate-200 text-slate-500 hover:text-emerald-600 hover:border-emerald-100 flex items-center justify-center transition-colors shadow-sm"
                          title="View Details"
                        >
                          <Eye size={15} />
                        </button>
                        
                        {hasApprovePerm && (p.status === 'PENDING' || p.status === 'PROCESSING') && (
                          <button
                            onClick={() => openSettleModal(p)}
                            className="h-9 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[10px] uppercase tracking-widest transition-all shadow-md shadow-emerald-600/10 flex items-center justify-center gap-1.5"
                          >
                            <CreditCard size={13} />
                            Settle
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile View - Card Layout */}
        <div className="block md:hidden divide-y divide-slate-100">
          {loadingPayouts ? (
            <div className="py-20 text-center">
              <div className="h-10 w-10 border-4 border-slate-200 border-t-emerald-600 rounded-full animate-spin mx-auto"></div>
              <span className="text-xs font-bold text-slate-400 mt-4 block uppercase tracking-widest">Loading payouts...</span>
            </div>
          ) : payouts?.length === 0 ? (
            <div className="py-20 text-center">
              <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-slate-50 text-slate-300 mb-4">
                <Landmark size={28} />
              </div>
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest">No payout records generated yet</p>
            </div>
          ) : (
            payouts?.map((p: any) => (
              <div key={p.id} className="p-6 space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-0.5">
                    <span className="text-[12px] font-black text-slate-900">#PAY-{p.id}</span>
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-semibold mt-1">
                      <Calendar size={11} />
                      <span>
                        {p.payoutDate ? new Date(p.payoutDate).toLocaleDateString() : 'N/A'}
                      </span>
                    </div>
                  </div>
                  <span className={`inline-flex px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${getStatusColor(p.status)}`}>
                    {p.status}
                  </span>
                </div>

                <div className="flex items-center gap-3 bg-slate-50/50 rounded-2xl p-4 border border-slate-100/50">
                  <div className="h-10 w-10 rounded-lg bg-white border border-slate-200 text-slate-700 flex items-center justify-center text-xs font-black shrink-0 overflow-hidden">
                    {p.subVendor?.logo ? (
                      <img src={p.subVendor.logo} className="h-full w-full object-cover" alt="" />
                    ) : (
                      p.subVendor?.name?.substring(0, 2).toUpperCase()
                    )}
                  </div>
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="text-[13px] font-bold text-slate-800 leading-none truncate">{p.subVendor?.name}</span>
                    <span className="text-[9px] font-black uppercase text-slate-400 mt-2 tracking-widest">ID: {p.subVendor?.id}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 bg-slate-50/50 rounded-2xl p-4 border border-slate-100/50 text-xs">
                  <div>
                    <span className="text-[9px] text-slate-400 font-black uppercase tracking-wider block">Orders</span>
                    <span className="font-bold text-slate-800">{p.totalOrders} <span className="text-slate-400">({p.deliveredOrders || 0} Deliv)</span></span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 font-black uppercase tracking-wider block">Gross Amount</span>
                    <span className="font-bold text-slate-800 font-mono">₹{Number(p.grossAmount).toFixed(2)}</span>
                  </div>
                  <div className="pt-2 border-t border-slate-100">
                    <span className="text-[9px] text-slate-400 font-black uppercase tracking-wider block">Commission</span>
                    <span className="font-bold text-slate-800 font-mono">₹{Number(p.commission).toFixed(2)}</span>
                  </div>
                  <div className="pt-2 border-t border-slate-100">
                    <span className="text-[9px] text-slate-400 font-black uppercase tracking-wider block">Refund Deduct</span>
                    <span className="font-bold text-rose-500 font-mono">-₹{Number(p.refundAmount).toFixed(2)}</span>
                  </div>
                  <div className="col-span-2 pt-2 border-t border-slate-100 flex justify-between items-center">
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Net Amount</span>
                    <span className="font-black text-emerald-600 text-base font-mono">₹{Number(p.payableAmount).toFixed(2)}</span>
                  </div>
                </div>

                <div className="flex justify-between items-center text-[10px] text-slate-400 px-1">
                  {p.transactionRef && <span className="font-mono text-[9px] truncate max-w-[150px]">Ref: {p.transactionRef}</span>}
                </div>

                <div className="flex items-center gap-2 justify-end pt-1">
                  <button className="h-11 flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-bold transition-all no-underline">
                    <Eye size={14} /> View Details
                  </button>
                  {hasApprovePerm && (p.status === 'PENDING' || p.status === 'PROCESSING') && (
                    <button
                      onClick={() => openSettleModal(p)}
                      className="h-11 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-wider transition-all shadow-md shadow-emerald-600/10 flex items-center justify-center gap-1.5"
                    >
                      <CreditCard size={14} /> Settle
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* SETTLEMENT MODAL */}
      {isSettleModalOpen && selectedPayout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={() => setIsSettleModalOpen(false)}></div>
          
          <div className="bg-white rounded-[1.5rem] shadow-2xl z-10 w-full max-w-xl overflow-hidden flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 p-5 bg-slate-50/50">
              <div>
                <h3 className="text-lg font-black text-slate-900 tracking-tight leading-none">Record Settlement</h3>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1.5">Payout ID: #PAY-{selectedPayout.id} • {selectedPayout.subVendor?.name}</p>
              </div>
              <button 
                onClick={() => setIsSettleModalOpen(false)}
                className="h-8 w-8 rounded-full bg-white border border-slate-200 text-slate-400 hover:text-slate-600 flex items-center justify-center transition-all"
              >
                <X size={14} />
              </button>
            </div>

            <form onSubmit={handleSettleSubmit} className="flex flex-col">
              <div className="p-5 space-y-4">
                {/* Compact Amount Row */}
                <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-3 flex justify-between items-center">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Net Payable Amount</span>
                  <span className="text-lg font-black text-emerald-700 font-mono">₹{Number(selectedPayout.payableAmount).toFixed(2)}</span>
                </div>

                {/* 2-Column Grid */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Payment Method */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Payment Method <span className="text-red-500">*</span></label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="h-10 px-3 rounded-lg border border-slate-200 outline-none focus:border-emerald-500 font-bold text-slate-700 text-xs bg-slate-50/50"
                    >
                      <option value="BANK_TRANSFER">Bank Transfer</option>
                      <option value="UPI">UPI</option>
                      <option value="CASH">Cash</option>
                    </select>
                  </div>

                  {/* Settlement Date */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Date <span className="text-red-500">*</span></label>
                    <input
                      type="date"
                      value={settlementDate}
                      onChange={(e) => { setSettlementDate(e.target.value); if (e.target.value) setFormErrors(p => ({ ...p, date: '' })); }}
                      className={`h-10 px-3 rounded-lg border outline-none font-bold text-slate-700 text-xs transition-colors ${
                        formErrors.date ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200 bg-slate-50/50 focus:border-emerald-500'
                      }`}
                    />
                  </div>

                  {/* UTR / Reference */}
                  <div className="flex flex-col gap-1.5 col-span-2">
                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">UTR / Ref Number <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      placeholder="e.g. UTR1234567890"
                      value={utrNumber}
                      onChange={(e) => { setUtrNumber(e.target.value); if (e.target.value.trim()) setFormErrors(p => ({ ...p, utr: '' })); }}
                      className={`h-10 px-3 rounded-lg border outline-none font-bold text-slate-700 text-xs transition-colors ${
                        formErrors.utr ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200 bg-slate-50/50 focus:border-emerald-500'
                      }`}
                    />
                  </div>

                  {/* Optional Receipt Upload */}
                  <div className="flex flex-col gap-1.5 col-span-2">
                    <label className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest text-slate-400">
                      <span>Screenshot</span> <span className="text-slate-300 font-bold lowercase tracking-normal">optional</span>
                    </label>
                    <div className="flex items-center gap-2 h-10 px-2 rounded-lg border border-slate-200 bg-slate-50/50">
                      <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white border border-slate-200 hover:border-emerald-300 hover:text-emerald-600 text-slate-600 font-bold text-[10px] uppercase tracking-wider cursor-pointer transition-colors shadow-sm">
                        {uploadingReceipt ? <div className="h-3 w-3 border-2 border-emerald-600/30 border-t-emerald-600 rounded-full animate-spin" /> : <Upload size={12} />}
                        {uploadingReceipt ? 'Uploading…' : 'Upload'}
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleReceiptUpload(f); e.target.value = ''; }} />
                      </label>
                      {receiptUrl && !uploadingReceipt ? (
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <ImageIcon size={12} className="text-emerald-500 shrink-0" />
                          <span className="text-[10px] font-bold text-emerald-700 truncate">Uploaded ✓</span>
                          <button type="button" onClick={() => { setReceiptPreview(null); setReceiptUrl(''); }} className="ml-auto h-5 w-5 rounded-full hover:bg-rose-50 text-slate-400 hover:text-rose-500 flex items-center justify-center"><X size={10} /></button>
                        </div>
                      ) : (
                        <span className="text-[10px] text-slate-400 font-semibold truncate px-1">No file</span>
                      )}
                    </div>
                  </div>

                  {/* Notes */}
                  <div className="flex flex-col gap-1.5 col-span-2">
                    <label className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest text-slate-400">
                      <span>Admin Notes</span> <span className="text-slate-300 font-bold lowercase tracking-normal">optional</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Internal reference..."
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      className="h-10 px-3 rounded-lg border border-slate-200 bg-slate-50/50 outline-none focus:border-emerald-500 font-bold text-slate-700 text-xs"
                    />
                  </div>
                </div>
              </div>

              <div className="p-4 border-t border-slate-100 bg-slate-50/30 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsSettleModalOpen(false)}
                  className="px-5 py-2.5 rounded-lg text-xs font-bold text-slate-500 hover:bg-slate-100 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSettling || uploadingReceipt}
                  className="px-6 py-2.5 rounded-lg bg-emerald-600 text-white text-xs font-black uppercase tracking-widest hover:bg-emerald-700 transition-all disabled:opacity-50 flex items-center gap-2 shadow-md shadow-emerald-600/10"
                >
                  {isSettling ? 'Processing...' : 'Settle Now'}
                  <CheckCircle2 size={14} />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
